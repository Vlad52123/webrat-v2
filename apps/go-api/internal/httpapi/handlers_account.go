package httpapi

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"webrat-go-api/internal/storage"
)

func (s *Server) handleChangePassword(w http.ResponseWriter, r *http.Request) {
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

	var body struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}

	oldPw := strings.TrimSpace(body.OldPassword)
	newPw := strings.TrimSpace(body.NewPassword)
	if oldPw == "" || newPw == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if !passwordRe.MatchString(newPw) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	hash, exists, err := s.db.GetUserPassword(login)
	if err != nil {
		http.Error(w, "auth error", http.StatusInternalServerError)
		return
	}
	if !exists {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(oldPw)); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if oldPw == newPw {
		w.WriteHeader(http.StatusConflict)
		return
	}

	if err := s.db.UpdateUserPassword(login, newPw); err != nil {
		http.Error(w, "update error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleDeleteAccount(w http.ResponseWriter, r *http.Request) {
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

	var body struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	pw := strings.TrimSpace(body.Password)
	if pw == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	hash, exists, err := s.db.GetUserPassword(login)
	if err != nil {
		http.Error(w, "auth error", http.StatusInternalServerError)
		return
	}
	if !exists {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if err := s.db.DeleteUserCascade(login); err != nil {
		http.Error(w, "delete error", http.StatusInternalServerError)
		return
	}

	s.auth.ClearSession(w, r)
	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleSetEmail(w http.ResponseWriter, r *http.Request) {
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

	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	email := strings.TrimSpace(body.Email)
	pw := strings.TrimSpace(body.Password)
	if email == "" || pw == "" {
		http.Error(w, "missing fields", http.StatusBadRequest)
		return
	}

	hash, exists, err := s.db.GetUserPassword(login)
	if err != nil {
		http.Error(w, "auth error", http.StatusInternalServerError)
		return
	}
	if !exists || bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)) != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	code := storage.GenerateEmailCode()
	exp := time.Now().Add(10 * time.Minute)
	if err := s.db.SaveEmailVerification(login, email, code, exp); err != nil {
		http.Error(w, "save error", http.StatusInternalServerError)
		return
	}

	bodyText := "Your WebCrystal verification code: " + code + "\nCode is valid for 10 minutes. Please note that the code is 8 characters long."
	if err := storage.SendEmail(email, "WebCrystal email verification", bodyText); err != nil {
		http.Error(w, "mail error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleConfirmEmail(w http.ResponseWriter, r *http.Request) {
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

	var body struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	code := strings.TrimSpace(body.Code)
	if code == "" {
		http.Error(w, "missing code", http.StatusBadRequest)
		return
	}

	email, ok, err := s.db.VerifyEmailCode(login, code)
	if err != nil {
		http.Error(w, "verify error", http.StatusInternalServerError)
		return
	}
	if !ok {
		http.Error(w, "invalid code", http.StatusBadRequest)
		return
	}
	if err := s.db.SetUserEmail(login, email); err != nil {
		http.Error(w, "update error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleGetAccount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	profile, ok, err := s.db.GetUserProfile(login)
	if err != nil {
		http.Error(w, "profile error", http.StatusInternalServerError)
		return
	}
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	resp := struct {
		Login     string    `json:"login"`
		Email     string    `json:"email"`
		CreatedAt time.Time `json:"created_at"`
	}{
		Login:     profile.Login,
		Email:     profile.Email,
		CreatedAt: profile.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}
