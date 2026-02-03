package handlers

import (
	"net/http"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/bot/state"
)

type BotContext interface {
	TelegramAPI() *tgbotapi.BotAPI
	CryptoPayToken() string
	HTTPClient() *http.Client
	State() *state.Store
}
