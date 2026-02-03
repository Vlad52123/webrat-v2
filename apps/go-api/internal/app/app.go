package app

import (
	"net/http"
	"os"

	"webrat-go-api/internal/bot"
	"webrat-go-api/internal/compile"
	"webrat-go-api/internal/httpapi"
	"webrat-go-api/internal/storage"
	"webrat-go-api/internal/ws"
)

type App struct {
	db *storage.DB
	hub *ws.Hub
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
	if err := compile.StartWorker(db); err != nil {
		_ = db.Close()
		return nil, err
	}
	hub, err := ws.NewHub(db)
	if err != nil {
		_ = db.Close()
		return nil, err
	}
	if os.Getenv("BOT_ENABLED") == "1" {
		go func() {
			_ = bot.Run(db)
		}()
	}
	return &App{db: db, hub: hub}, nil
}

func (a *App) Router() http.Handler {
	return httpapi.NewRouter(a.db, a.hub)
}
