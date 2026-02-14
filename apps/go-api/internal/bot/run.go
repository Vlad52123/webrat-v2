package bot

import (
	"errors"
	"os"
	"strings"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/bot/handlers"
	"webrat-go-api/internal/storage"
)

func Run(db *storage.DB) error {
	tgTok := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
	if tgTok == "" {
		return errors.New("TELEGRAM_BOT_TOKEN is empty")
	}

	api, err := tgbotapi.NewBotAPI(tgTok)
	if err != nil {
		return err
	}

	b := &Bot{
		api: api,
		db:  db,
	}

	updCfg := tgbotapi.NewUpdate(0)
	updCfg.Timeout = 60
	updates := api.GetUpdatesChan(updCfg)

	for upd := range updates {
		if upd.Message != nil {
			msg := upd.Message
			if msg.From != nil && b.db != nil {
				_ = b.db.UpsertBotUser(msg.From.ID, msg.From.UserName)
			}
			if msg.IsCommand() && msg.Command() == "start" {
				handlers.HandleStart(b, msg)
				continue
			}
			if msg.Text != "" {
				handlers.HandleText(b, b.db, msg)
			}
			continue
		}

		if upd.CallbackQuery != nil {
			cq := upd.CallbackQuery
			if cq.From != nil && b.db != nil {
				_ = b.db.UpsertBotUser(cq.From.ID, cq.From.UserName)
			}
			handlers.HandleCallback(b, b.db, cq)
			continue
		}
	}

	return errors.New("updates channel closed")
}