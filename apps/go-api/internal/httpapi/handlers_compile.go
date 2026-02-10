package httpapi

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"webrat-go-api/internal/auth"
)

type compileRequest struct {
	Code       string `json:"code"`
	Name       string `json:"name"`
	Password   string `json:"password"`
	Icon       string `json:"icon"`
	ForceAdmin string `json:"forceAdmin"`
}

func (s *Server) handleCompileGo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !s.checkCSRF(w, r) {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "security_check_failed"})
		return
	}

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	active, err := s.db.HasActiveCompileJob(login)
	if err == nil && active {
		w.WriteHeader(http.StatusTooManyRequests)
		return
	}

	const maxCompileBody = 2 * 1024 * 1024
	r.Body = http.MaxBytesReader(w, r.Body, maxCompileBody)
	defer r.Body.Close()

	var req compileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Code) == "" {
		http.Error(w, "missing code", http.StatusBadRequest)
		return
	}

	var iconBytes []byte
	if strings.TrimSpace(req.Icon) != "" {
		b, err := base64.StdEncoding.DecodeString(strings.TrimSpace(req.Icon))
		if err != nil {
			http.Error(w, "invalid icon", http.StatusBadRequest)
			return
		}
		const maxIconBytes = 512 * 1024
		if len(b) > maxIconBytes {
			http.Error(w, "icon too large", http.StatusBadRequest)
			return
		}
		iconBytes = b
	}

	jobID, err := auth.NewSessionID()
	if err != nil {
		http.Error(w, "job error", http.StatusInternalServerError)
		return
	}

	if err := s.db.CreateCompileJob(jobID, login, req.Code, req.Name, req.Password, iconBytes, req.ForceAdmin); err != nil {
		http.Error(w, "enqueue error", http.StatusInternalServerError)
		return
	}

	s.writeJSON(w, http.StatusOK, map[string]string{"id": jobID})
}

func (s *Server) handleCompileStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	jobID := strings.TrimSpace(r.URL.Query().Get("id"))
	if jobID == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	j, exists, err := s.db.GetCompileJob(jobID, login)
	if err != nil {
		http.Error(w, "status error", http.StatusInternalServerError)
		return
	}
	if !exists {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	s.writeJSON(w, http.StatusOK, map[string]any{
		"id":       j.ID,
		"status":   j.Status,
		"progress": j.Progress,
		"error":    j.Error,
	})
}

func (s *Server) handleCompileDownload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("X-Content-Type-Options", "nosniff")

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	jobID := strings.TrimSpace(r.URL.Query().Get("id"))
	if jobID == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	data, filename, okArtifact, err := s.db.GetCompileArtifact(jobID, login)
	if err != nil {
		http.Error(w, "download error", http.StatusInternalServerError)
		return
	}
	if !okArtifact {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	if filename == "" {
		filename = "build.zip"
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	_, _ = w.Write(data)
}
