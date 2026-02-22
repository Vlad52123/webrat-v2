package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *Server) handleListChat(w http.ResponseWriter, r *http.Request) {
	msgs, err := s.db.ListChatMessages(100, 0)
	if err != nil {
		log.Printf("[chat] list error: %v", err)
		http.Error(w, "list error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if msgs == nil {
		_, _ = w.Write([]byte("[]"))
		return
	}
	_ = json.NewEncoder(w).Encode(msgs)
}

func countWords(s string) int {
	fields := strings.Fields(s)
	return len(fields)
}

func (s *Server) handleSendChat(w http.ResponseWriter, r *http.Request) {
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

	profile, ok, err := s.db.GetUserProfile(login)
	if err != nil || !ok {
		http.Error(w, "profile error", http.StatusInternalServerError)
		return
	}
	if strings.TrimSpace(profile.Email) == "" {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "email_required"})
		return
	}

	var body struct {
		Message  string `json:"message"`
		ImageURL string `json:"image_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	msg := strings.TrimSpace(body.Message)
	if msg == "" {
		http.Error(w, "empty message", http.StatusBadRequest)
		return
	}
	if countWords(msg) > 255 {
		s.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "message_too_long"})
		return
	}

	imgURL := strings.TrimSpace(body.ImageURL)

	if err := s.db.InsertChatMessage(login, msg, imgURL); err != nil {
		log.Printf("[chat] insert error: %v", err)
		http.Error(w, "insert error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) handleUploadChatImage(w http.ResponseWriter, r *http.Request) {
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

	file, header, err := r.FormFile("image")
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

	dir := "chat_images"
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

	url := "/api/chat-images/" + name
	s.writeJSON(w, http.StatusOK, map[string]string{"url": url})
}
