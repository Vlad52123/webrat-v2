package handlers

import (
	"log"
	"os"
	"strings"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func HandleStart(b BotContext, msg *tgbotapi.Message) {
	text := "Добро пожаловать в 💎WebCrystal💎\n\nЧтобы продолжить, откройте приложение 👇"

	resp := tgbotapi.NewMessage(msg.Chat.ID, text)
	resp.ReplyMarkup = tgbotapi.NewRemoveKeyboard(false)
	if _, err := b.TelegramAPI().Send(resp); err != nil {
		log.Printf("send start error: %v", err)
	}

	token := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
	if token != "" {
		if err := sendWebAppButton(token, msg.Chat.ID, "👇 Нажмите кнопку ниже:", "🚀 Открыть Mini App", "https://webcrystal.sbs/tg-app"); err != nil {
			log.Printf("send mini app button error: %v", err)
		}
	}
}