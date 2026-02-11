package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func (s *Server) handleCaptchaImages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	captchaDir := strings.TrimSpace(os.Getenv("WEBRAT_CAPTCHA_DIR"))
	if captchaDir == "" {
		captchaDir = filepath.Join("static", "captcha")
	}

	entries, err := os.ReadDir(captchaDir)
	if err != nil {
		s.writeJSON(w, http.StatusOK, []string{})
		return
	}

	var images []string
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		lower := strings.ToLower(name)
		if strings.HasSuffix(lower, ".png") || strings.HasSuffix(lower, ".jpg") ||
			strings.HasSuffix(lower, ".jpeg") || strings.HasSuffix(lower, ".webp") {
			images = append(images, "/captcha/"+name)
		}
	}

	b := make([]byte, 16)
	_, _ = rand.Read(b)
	csrf := hex.EncodeToString(b)

	secure := os.Getenv("WEBRAT_SECURE_COOKIE") == "1" || (r != nil && r.TLS != nil)
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))

	c := &http.Cookie{
		Name:     csrfCookieName,
		Value:    csrf,
		Path:     "/",
		HttpOnly: false,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   2 * 60,
		Secure:   secure,
	}
	if dom != "" {
		c.Domain = dom
	}
	http.SetCookie(w, c)

	if images == nil {
		images = []string{}
	}
	s.writeJSON(w, http.StatusOK, images)
}

func (s *Server) handleCaptchaVerify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	csrfHeader := strings.TrimSpace(r.Header.Get("X-CSRF-Token"))
	csrfCookie := ""
	if c, err := r.Cookie(csrfCookieName); err == nil && c != nil {
		csrfCookie = strings.TrimSpace(c.Value)
	}

	if csrfCookie == "" {
		s.writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "captcha_expired"})
		return
	}
	if csrfHeader == "" || csrfHeader != csrfCookie {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "captcha_verification_failed"})
		return
	}

	secure := os.Getenv("WEBRAT_SECURE_COOKIE") == "1" || (r != nil && r.TLS != nil)
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))

	captchaCookie := &http.Cookie{
		Name:     "webrat_captcha",
		Value:    "1",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   2 * 60,
		Secure:   secure,
	}
	if dom != "" {
		captchaCookie.Domain = dom
	}
	http.SetCookie(w, captchaCookie)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}

func (s *Server) handleCaptchaStatic(captchaDir string) http.Handler {
	if captchaDir == "" {
		captchaDir = filepath.Join("static", "captcha")
	}
	_ = os.MkdirAll(captchaDir, 0o755)

	fs := http.StripPrefix("/captcha/", http.FileServer(http.Dir(captchaDir)))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=86400")
		w.Header().Set("Expires", time.Now().Add(24*time.Hour).UTC().Format(http.TimeFormat))
		fs.ServeHTTP(w, r)
	})
}