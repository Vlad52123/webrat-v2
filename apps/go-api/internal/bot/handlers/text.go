package handlers

import (
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/storage"
)

func HandleText(b BotContext, db *storage.DB, msg *tgbotapi.Message) {
	HandleStart(b, msg)
}