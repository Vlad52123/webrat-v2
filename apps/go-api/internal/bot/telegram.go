package bot

import (
	"errors"
	"os"
	"strings"
	"sync"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

var (
	tgOnce    sync.Once
	tgAPI     *tgbotapi.BotAPI
	tgInitErr error
)

func getTelegram() (*tgbotapi.BotAPI, error) {
	tgOnce.Do(func() {
		tok := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
		if tok == "" {
			tgInitErr = errors.New("TELEGRAM_BOT_TOKEN is empty")
			return
		}
		api, err := tgbotapi.NewBotAPI(tok)
		if err != nil {
			tgInitErr = err
			return
		}
		tgAPI = api
	})
	return tgAPI, tgInitErr
}

func SendDepositReceipt(telegramID int64, text string) error {
	api, err := getTelegram()
	if err != nil {
		return err
	}
	msg := tgbotapi.NewMessage(telegramID, text)
	msg.ParseMode = "HTML"
	_, err = api.Send(msg)
	return err
}
