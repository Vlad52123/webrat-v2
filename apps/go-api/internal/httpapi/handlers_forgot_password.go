package httpapi

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"webrat-go-api/internal/storage"
)

func (s *Server) handleForgotPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !s.checkCSRF(w, r) {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "security_check_failed"})
		return
	}

	var body struct {
		Login string `json:"login"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}

	login := strings.ToLower(strings.TrimSpace(body.Login))
	email := strings.ToLower(strings.TrimSpace(body.Email))
	if login == "" || email == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if !storage.IsAllowedEmailDomain(email) {
		s.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "unsupported_email_domain"})
		return
	}

	profile, exists, err := s.db.GetUserProfile(login)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	if !exists || strings.ToLower(strings.TrimSpace(profile.Email)) != email {
		s.writeJSON(w, http.StatusNotFound, map[string]string{"error": "account_not_found"})
		return
	}

	code := storage.GenerateEmailCode()
	expiresAt := time.Now().Add(5 * time.Minute)

	if err := s.db.SaveEmailVerification(login, email, code, expiresAt); err != nil {
		log.Printf("[forgot-password] save code error for %s: %v", login, err)
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	if err := storage.SendPasswordResetEmail(email, code); err != nil {
		log.Printf("[forgot-password] send email error for %s: %v", login, err)
		http.Error(w, "email error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !s.checkCSRF(w, r) {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "security_check_failed"})
		return
	}

	var body struct {
		Login       string `json:"login"`
		Code        string `json:"code"`
		NewPassword string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}

	login := strings.ToLower(strings.TrimSpace(body.Login))
	code := strings.TrimSpace(body.Code)
	newPw := strings.TrimSpace(body.NewPassword)

	if login == "" || code == "" || newPw == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if !passwordRe.MatchString(newPw) {
		s.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_password"})
		return
	}

	_, valid, err := s.db.VerifyEmailCode(login, code)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	if !valid {
		s.writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid_code"})
		return
	}

	hash, _, err := s.db.GetUserPassword(login)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(newPw)); err == nil {
		s.writeJSON(w, http.StatusConflict, map[string]string{"error": "password_unchanged"})
		return
	}

	if err := s.db.UpdateUserPassword(login, newPw); err != nil {
		http.Error(w, "update error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
