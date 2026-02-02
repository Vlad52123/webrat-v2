package app

import (
	"net/http"

	"webrat-go-api/internal/storage"
)

type App struct {
	db *storage.DB
}

func New() (*App, error) {
	db, err := storage.OpenFromEnv()
	if err != nil {
		return nil, err
	}
	if err := db.InitSchema(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return &App{db: db}, nil
}

func (a *App) Router() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	return mux
}
