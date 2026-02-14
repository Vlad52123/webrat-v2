package handlers

import (
	"log"
	"os"
	"strings"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func HandleStart(b BotContext, msg *tgbotapi.Message) {
	text := "Добро пожаловать в 💎WebCrystal💎"
	resp := tgbotapi.NewMessage(msg.Chat.ID, text)

	kb := tgbotapi.NewReplyKeyboard(
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("💎 Купить WebCrystal 💎"),
			tgbotapi.NewKeyboardButton("📱 Профиль"),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("📚 Информация"),
		),
	)
	kb.ResizeKeyboard = true

	resp.ReplyMarkup = kb
	if _, err := b.TelegramAPI().Send(resp); err != nil {
		log.Printf("send start error: %v", err)
	}

	// Send WebApp button via raw API (library doesn't have WebApp structs)
	token := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
	if token != "" {
		if err := sendWebAppButton(token, msg.Chat.ID, "Или откройте приложение:", "🚀 Открыть Mini App", "https://webcrystal.sbs/tg-app"); err != nil {
			log.Printf("send mini app button error: %v", err)
		}
	}
}