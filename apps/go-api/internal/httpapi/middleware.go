package httpapi

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"strings"
	"time"
)

const csrfCookieName = "webrat_csrf"

type ctxKey string

const ctxLoginKey ctxKey = "webrat_login"

type handlerFunc = func(http.ResponseWriter, *http.Request)

func (s *Server) ensureCSRF(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		_ = s.ensureCSRFToken(w, r)
		next.ServeHTTP(w, r)
	})
}

func (s *Server) ensureCSRFToken(w http.ResponseWriter, r *http.Request) string {
	if r != nil {
		if c, err := r.Cookie(csrfCookieName); err == nil && c != nil {
			if v := strings.TrimSpace(c.Value); v != "" {
				s.ensureCSRFCookie(w, r, v, 12*time.Hour)
				return v
			}
		}
	}

	b := make([]byte, 16)
	_, _ = rand.Read(b)
	tok := hex.EncodeToString(b)
	s.ensureCSRFCookie(w, r, tok, 12*time.Hour)
	return tok
}

func (s *Server) ensureCSRFCookie(w http.ResponseWriter, r *http.Request, value string, ttl time.Duration) {
	secure := os.Getenv("WEBRAT_SECURE_COOKIE") == "1" || (r != nil && r.TLS != nil)
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))
	maxAge := int(ttl / time.Second)

	if dom != "" {
		http.SetCookie(w, &http.Cookie{
			Name:     csrfCookieName,
			Value:    "",
			Path:     "/",
			HttpOnly: false,
			SameSite: http.SameSiteStrictMode,
			MaxAge:   -1,
			Secure:   secure,
		})
	}

	c := &http.Cookie{
		Name:     csrfCookieName,
		Value:    value,
		Path:     "/",
		HttpOnly: false,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   maxAge,
		Secure:   secure,
	}
	if dom != "" {
		c.Domain = dom
	}
	http.SetCookie(w, c)
}

func (s *Server) checkCSRF(w http.ResponseWriter, r *http.Request) bool {
	if r == nil {
		return false
	}
	if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
		return true
	}

	values := make([]string, 0, 2)
	for _, c := range r.Cookies() {
		if c == nil {
			continue
		}
		if c.Name != csrfCookieName {
			continue
		}
		v := strings.TrimSpace(c.Value)
		if v == "" {
			continue
		}
		values = append(values, v)
	}
	if len(values) == 0 {
		return false
	}

	h := strings.TrimSpace(r.Header.Get("X-CSRF-Token"))
	if h == "" {
		return false
	}

	for _, v := range values {
		if h == v {
			return true
		}
	}

	return false
}

func (s *Server) requireAPIAuth(next handlerFunc) handlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		login, ok := s.auth.GetSession(r)
		login = strings.ToLower(strings.TrimSpace(login))
		if !ok || login == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		r = r.WithContext(context.WithValue(r.Context(), ctxLoginKey, login))
		next(w, r)
	}
}

func (s *Server) requireVIP(next handlerFunc) handlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		login, ok := s.auth.GetSession(r)
		login = strings.ToLower(strings.TrimSpace(login))
		if !ok || login == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		status, _, _, err := s.db.GetSubscription(login)
		if err != nil {
			http.Error(w, "subscription error", http.StatusInternalServerError)
			return
		}
		if status != "vip" {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		r = r.WithContext(context.WithValue(r.Context(), ctxLoginKey, login))
		next(w, r)
	}
}

func loginFromContext(r *http.Request) string {
	if r == nil {
		return ""
	}
	v := r.Context().Value(ctxLoginKey)
	if s, ok := v.(string); ok {
		return strings.TrimSpace(s)
	}
	return ""
}
