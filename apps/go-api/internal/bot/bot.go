package bot

import (
	"net/http"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/bot/state"
	"webrat-go-api/internal/storage"
)

type Bot struct {
	api        *tgbotapi.BotAPI
	cryptoTok  string
	httpClient *http.Client
	st         *state.Store
	db         *storage.DB
}

func (b *Bot) TelegramAPI() *tgbotapi.BotAPI { return b.api }
func (b *Bot) CryptoPayToken() string         { return b.cryptoTok }
func (b *Bot) HTTPClient() *http.Client       { return b.httpClient }
func (b *Bot) State() *state.Store            { return b.st }
func (b *Bot) DB() *storage.DB                { return b.db }
