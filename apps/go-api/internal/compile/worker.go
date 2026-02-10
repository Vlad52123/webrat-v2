package compile

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"webrat-go-api/internal/compiler"
	"webrat-go-api/internal/storage"
)

func findGoModDir(start string, maxParents int) (string, bool) {
	if strings.TrimSpace(start) == "" {
		return "", false
	}

	dir := filepath.Clean(start)
	for i := 0; i <= maxParents; i++ {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir, true
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "", false
}

func ensureWorkerEnv() {
	base := strings.TrimSpace(os.Getenv("HOME"))
	if base == "" {
		base = filepath.Join(os.TempDir(), "webrat-worker")
		_ = os.Setenv("HOME", base)
	}

	cacheRoot := strings.TrimSpace(os.Getenv("XDG_CACHE_HOME"))
	if cacheRoot == "" {
		cacheRoot = filepath.Join(base, ".cache")
		_ = os.Setenv("XDG_CACHE_HOME", cacheRoot)
	}

	goCache := strings.TrimSpace(os.Getenv("GOCACHE"))
	if goCache == "" {
		goCache = filepath.Join(cacheRoot, "go-build")
		_ = os.Setenv("GOCACHE", goCache)
	}

	_ = os.MkdirAll(base, 0o700)
	_ = os.MkdirAll(cacheRoot, 0o700)
	_ = os.MkdirAll(goCache, 0o700)
}

func findBaseDir() (string, error) {
	if v := strings.TrimSpace(os.Getenv("WEBRAT_COMPILER_BASEDIR")); v != "" {
		v = filepath.Clean(v)
		if dir, ok := findGoModDir(v, 0); ok {
			return dir, nil
		}
		return "", fmt.Errorf("WEBRAT_COMPILER_BASEDIR=%s but go.mod not found", v)
	}

	if exe, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exe)
		if dir, ok := findGoModDir(exeDir, 10); ok {
			return dir, nil
		}
	}

	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	if dir, ok := findGoModDir(wd, 10); ok {
		return dir, nil
	}

	return "", fmt.Errorf("go.mod not found; set WEBRAT_COMPILER_BASEDIR to the folder that contains go.mod")
}

func StartWorker(db *storage.DB) error {
	if db == nil {
		return fmt.Errorf("db is nil")
	}

	log.SetOutput(io.Discard)
	log.SetFlags(0)

	ensureWorkerEnv()

	baseDir, err := findBaseDir()
	if err != nil {
		return err
	}

	go func() {
		for {
			job, ok, err := db.ClaimNextCompileJob()
			if err != nil {
				time.Sleep(2 * time.Second)
				continue
			}
			if !ok {
				time.Sleep(700 * time.Millisecond)
				continue
			}

			ctx, cancel := context.WithTimeout(context.Background(), 12*time.Minute)

			data, filename, cErr := compiler.CompileZip(ctx, baseDir, compiler.Request{
				Code:       job.Code,
				Name:       job.Name,
				Password:   job.Password,
				Icon:       job.Icon,
				ForceAdmin: job.ForceAdmin,
			}, func(p int) {
				_ = db.SetCompileJobProgress(job.ID, p)
			})

			cancel()

			errText := ""
			if cErr != nil {
				errText = cErr.Error()
				data = nil
				filename = ""
			}

			_ = db.FinishCompileJob(job.ID, data, filename, errText)
		}
	}()

	return nil
}
