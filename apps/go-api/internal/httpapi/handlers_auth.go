package httpapi

import (
	"encoding/json"
	"net/http"
	"os"
	"regexp"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

var (
	loginRe    = regexp.MustCompile(`^[A-Za-z0-9_-]{5,12}$`)
	passwordRe = regexp.MustCompile(`^[A-Za-z0-9_-]{6,24}$`)
)

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if !s.checkCSRF(w, r) {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "security_check_failed"})
		return
	}

	const maxLoginBody = 64 * 1024
	r.Body = http.MaxBytesReader(w, r.Body, maxLoginBody)
	defer r.Body.Close()

	var body struct {
		Login    string `json:"login"`
		Password string `json:"password"`
		CfToken  string `json:"cfToken"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		s.writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad_json"})
		return
	}

	login := strings.ToLower(strings.TrimSpace(body.Login))
	password := strings.TrimSpace(body.Password)
	cfToken := strings.TrimSpace(body.CfToken)

	if !loginRe.MatchString(login) || !passwordRe.MatchString(password) {
		s.writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid_credentials"})
		return
	}

	if s.loginLim.isLocked(login) {
		s.writeJSON(w, http.StatusTooManyRequests, map[string]string{"error": "account_locked"})
		return
	}

	if cfToken == "" {
		if c, err := r.Cookie("webrat_captcha"); err != nil || c == nil || strings.TrimSpace(c.Value) != "1" {
			s.writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "security_check_failed"})
			return
		}
	}

	hash, exists, err := s.db.GetUserPassword(login)
	if err != nil {
		http.Error(w, "auth error", http.StatusInternalServerError)
		return
	}

	if !exists {
		if err := s.db.CreateUser(login, password); err != nil {
			http.Error(w, "auth error", http.StatusInternalServerError)
			return
		}
	} else {
		if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err != nil {
			s.loginLim.recordFail(login)
			s.writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid_credentials"})
			return
		}
	}

	s.loginLim.clearLogin(login)

	if err := s.auth.SetSession(w, r, login); err != nil {
		http.Error(w, "session error", http.StatusInternalServerError)
		return
	}

	s.clearCookie(w, r, "webrat_captcha", true)
	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	s.writeJSON(w, http.StatusOK, map[string]any{
		"user": map[string]any{
			"login": login,
		},
	})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if !s.checkCSRF(w, r) {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "security_check_failed"})
		return
	}

	s.auth.ClearSession(w, r)
	w.WriteHeader(http.StatusOK)
}

func (s *Server) writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func (s *Server) clearCookie(w http.ResponseWriter, r *http.Request, name string, httpOnly bool) {
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))
	secure := strings.TrimSpace(os.Getenv("WEBRAT_SECURE_COOKIE")) == "1" || (r != nil && r.TLS != nil)

	if dom != "" {
		http.SetCookie(w, &http.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			HttpOnly: httpOnly,
			SameSite: http.SameSiteStrictMode,
			MaxAge:   -1,
			Domain:   dom,
			Secure:   secure,
		})
	}

	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		HttpOnly: httpOnly,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
		Secure:   secure,
	})
}
