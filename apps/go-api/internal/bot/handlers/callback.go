package handlers

import (
	"log"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/storage"
)

func HandleCallback(b BotContext, db *storage.DB, cq *tgbotapi.CallbackQuery) {
	if cq == nil || cq.Message == nil || cq.From == nil {
		return
	}

	if _, err := b.TelegramAPI().Request(tgbotapi.NewCallback(cq.ID, "")); err != nil {
		log.Printf("send callback answer error: %v", err)
	}
}