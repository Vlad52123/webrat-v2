package auth

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"strings"
	"time"

	"webrat-go-api/internal/netutil"
	"webrat-go-api/internal/storage"
)

const sessionCookie = "webrat_session"

type Service struct {
	db *storage.DB
}

func New(db *storage.DB) *Service {
	return &Service{db: db}
}

func NewSessionID() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (s *Service) GetSession(r *http.Request) (string, bool) {
	if r == nil {
		return "", false
	}
	c, err := r.Cookie(sessionCookie)
	if err != nil || c == nil {
		return "", false
	}
	sid := strings.TrimSpace(c.Value)
	if sid == "" {
		return "", false
	}
	login, ok, err := s.db.GetUserSessionLogin(sid)
	if err != nil {
		return "", false
	}
	if !ok {
		return "", false
	}
	login = strings.ToLower(strings.TrimSpace(login))
	if login == "" {
		return "", false
	}
	return login, true
}

func (s *Service) SetSession(w http.ResponseWriter, r *http.Request, login string) error {
	login = strings.ToLower(strings.TrimSpace(login))
	if login == "" {
		return nil
	}

	id, err := NewSessionID()
	if err != nil {
		return err
	}

	exp := time.Now().Add(12 * time.Hour)
	_ = s.db.DeleteUserSessionsByLogin(login)

	ip := netutil.GetClientIP(r)
	ua := ""
	if r != nil {
		ua = strings.TrimSpace(r.UserAgent())
	}
	if err := s.db.CreateUserSession(id, login, ip, ua, exp); err != nil {
		return err
	}

	secure := os.Getenv("WEBRAT_SECURE_COOKIE") == "1" || (r != nil && r.TLS != nil)
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))
	maxAge := int((12 * time.Hour) / time.Second)

	if dom != "" {
		http.SetCookie(w, &http.Cookie{
			Name:     sessionCookie,
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteStrictMode,
			MaxAge:   -1,
			Secure:   secure,
		})
	}

	cookie := &http.Cookie{
		Name:     sessionCookie,
		Value:    id,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   maxAge,
		Secure:   secure,
	}
	if dom != "" {
		cookie.Domain = dom
	}
	http.SetCookie(w, cookie)
	return nil
}

func (s *Service) ClearSession(w http.ResponseWriter, r *http.Request) {
	if r != nil {
		if c, err := r.Cookie(sessionCookie); err == nil && c != nil && strings.TrimSpace(c.Value) != "" {
			_ = s.db.DeleteUserSession(strings.TrimSpace(c.Value))
		}
	}

	secure := os.Getenv("WEBRAT_SECURE_COOKIE") == "1" || (r != nil && r.TLS != nil)
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))

	if dom != "" {
		http.SetCookie(w, &http.Cookie{
			Name:     sessionCookie,
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteStrictMode,
			MaxAge:   -1,
			Domain:   dom,
			Secure:   secure,
		})
	}
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookie,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
		Secure:   secure,
	})
}