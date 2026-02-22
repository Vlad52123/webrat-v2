package httpapi

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func (s *Server) handleUploadAvatar(w http.ResponseWriter, r *http.Request) {
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

	if err := r.ParseMultipartForm(5 << 20); err != nil {
		http.Error(w, "file too large", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("avatar")
	if err != nil {
		http.Error(w, "no file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowed[ext] {
		http.Error(w, "unsupported format", http.StatusBadRequest)
		return
	}

	dir := "avatars"
	_ = os.MkdirAll(dir, 0o755)

	name := fmt.Sprintf("%s_%s%s", login, randomHex(4), ext)
	dst, err := os.Create(filepath.Join(dir, name))
	if err != nil {
		http.Error(w, "save error", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "save error", http.StatusInternalServerError)
		return
	}

	avatarURL := "/api/avatars/" + name
	if err := s.db.SetUserAvatar(login, avatarURL); err != nil {
		http.Error(w, "update error", http.StatusInternalServerError)
		return
	}

	s.writeJSON(w, http.StatusOK, map[string]string{"url": avatarURL})
}

func (s *Server) handleGetUserProfile(w http.ResponseWriter, r *http.Request) {
	loginParam := strings.TrimSpace(r.URL.Query().Get("login"))
	if loginParam == "" {
		http.Error(w, "missing login", http.StatusBadRequest)
		return
	}

	profile, ok, err := s.db.GetUserPublicProfile(loginParam)
	if err != nil {
		http.Error(w, "error", http.StatusInternalServerError)
		return
	}
	if !ok {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	s.writeJSON(w, http.StatusOK, profile)
}
