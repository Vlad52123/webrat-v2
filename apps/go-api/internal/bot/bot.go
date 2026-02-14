package bot

import (
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/storage"
)

type Bot struct {
	api *tgbotapi.BotAPI
	db  *storage.DB
}

func (b *Bot) TelegramAPI() *tgbotapi.BotAPI { return b.api }
func (b *Bot) DB() *storage.DB               { return b.db }