package handlers

import (
	"log"

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

	appBtn := tgbotapi.NewInlineKeyboardButtonURL("🚀 Открыть Mini App", "https://webcrystal.sbs/tg-app")
	appMsg := tgbotapi.NewMessage(msg.Chat.ID, "Или откройте приложение:")
	appMsg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(appBtn),
	)
	if _, err := b.TelegramAPI().Send(appMsg); err != nil {
		log.Printf("send mini app button error: %v", err)
	}
}