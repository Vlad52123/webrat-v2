package handlers

import (
	"fmt"
	"log"
	"strconv"
	"strings"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/storage"
)

func HandleText(b BotContext, db *storage.DB, msg *tgbotapi.Message) {
	if msg.From != nil && db != nil {
		_ = db.UpsertBotUser(msg.From.ID, msg.From.UserName)
	}

	if msg.From != nil && b.State().IsAwaitingDepositAmount(msg.From.ID) {
		text := strings.TrimSpace(msg.Text)
		switch text {
		case "/start", "start", "📱 Профиль", "💎 Купить WebCrystal 💎", "⬅ Назад":
			b.State().SetAwaitingDepositAmount(msg.From.ID, false)
			b.State().ClearPendingProvider(msg.From.ID)
		default:
		}
	}

	if msg.From != nil && b.State().IsAwaitingDepositAmount(msg.From.ID) {
		prov, ok := b.State().GetPendingProvider(msg.From.ID)
		if ok && prov == "cryptopay" {
			s := strings.TrimSpace(msg.Text)
			s = strings.ReplaceAll(s, " ", "")
			amt, err := strconv.ParseInt(s, 10, 64)
			if err != nil {
				return
			}
			if amt < 50 || amt > 1000000 {
				reply := tgbotapi.NewMessage(msg.Chat.ID, "Сумма должна быть от 50₽ до 1000000 ₽")
				if _, err := b.TelegramAPI().Send(reply); err != nil {
					log.Printf("send deposit range msg: %v", err)
				}
				return
			}

			b.State().SetAwaitingDepositAmount(msg.From.ID, false)
			b.State().ClearPendingProvider(msg.From.ID)

			btnCreate := tgbotapi.NewInlineKeyboardButtonData("✅ Создать", "deposit_create:"+fmt.Sprintf("%d", amt))
			btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "profile_deposit_cryptopay")
			reply := tgbotapi.NewMessage(msg.Chat.ID, "Создать чек?")
			reply.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
				tgbotapi.NewInlineKeyboardRow(btnCreate, btnBack),
			)
			if _, err := b.TelegramAPI().Send(reply); err != nil {
				log.Printf("send deposit confirm msg error: %v", err)
			}
			return
		}
	}

	switch msg.Text {
	case "💎 Купить WebCrystal 💎":
		text := "💎 Выберите нужный вам товар:"
		btnCat := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal 💎", "cat_webrat")
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "back_start")

		inlineKb := tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btnCat),
			tgbotapi.NewInlineKeyboardRow(btnBack),
		)
		resp := tgbotapi.NewMessage(msg.Chat.ID, text)
		resp.ReplyMarkup = inlineKb
		if _, err := b.TelegramAPI().Send(resp); err != nil {
			log.Printf("send choose category error: %v", err)
		}

	case "💎 WebCrystal 💎":
		text := "💎 Выберите нужный вам товар:"
		btn1 := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal на месяц 💎 | 299 ₽", "prod_month")
		btn2 := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal на год 💎 | 599 ₽", "prod_year")
		btn3 := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal навсегда 💎 | 1299 ₽", "prod_forever")
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "back_cat")

		inlineKb := tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btn1),
			tgbotapi.NewInlineKeyboardRow(btn2),
			tgbotapi.NewInlineKeyboardRow(btn3),
			tgbotapi.NewInlineKeyboardRow(btnBack),
		)

		resp := tgbotapi.NewMessage(msg.Chat.ID, text)
		resp.ReplyMarkup = inlineKb
		if _, err := b.TelegramAPI().Send(resp); err != nil {
			log.Printf("send products error: %v", err)
		}

	case "📚 Информация":
		text := "📚 <b>Информация</b>\n" +
			"───────────────\n" +
			"Наш сайт:\n" +
			"<code>https://webcrystal.sbs/</code>\n" +
			"\n" +
			"Официальный бот покупок ключей:\n" +
			"<code>https://t.me/WebCrystalbot</code>"

		resp := tgbotapi.NewMessage(msg.Chat.ID, text)
		resp.ParseMode = "HTML"
		if _, err := b.TelegramAPI().Send(resp); err != nil {
			log.Printf("send info stub error: %v", err)
		}

	case "📱 Профиль":
		userID := int64(0)
		if msg.From != nil {
			userID = msg.From.ID
		}
		if db == nil {
			return
		}

		balance, totalPaid, ordersCount, createdAt, err := db.GetBotProfile(userID)
		if err != nil {
			log.Printf("GetBotProfile error: %v", err)
		}

		login := "-"
		if msg.From != nil {
			login = strings.TrimSpace(msg.From.UserName)
			if login != "" {
				login = "@" + login
			} else {
				login = "-"
			}
		}

		reg := "-"
		if !createdAt.IsZero() {
			reg = createdAt.Local().Format("2006-01-02 15:04:05")
		}

		text := "📱 <b>Ваш профиль</b>\n" +
			"───────────────\n" +
			"🔑 Мой ID: <code>" + fmt.Sprintf("%d", userID) + "</code>\n" +
			"👤 Логин: <code>" + login + "</code>\n" +
			"🕜 Регистрация: <code>" + reg + "</code>\n" +
			"───────────────\n" +
			"💳 Баланс: " + fmt.Sprintf("%.0f", balance) + "₽\n" +
			"💵 Всего пополнено: " + fmt.Sprintf("%.0f", totalPaid) + "₽\n" +
			"🎁 Куплено товаров: " + fmt.Sprintf("%d", ordersCount) + " шт."

		btnDeposit := tgbotapi.NewInlineKeyboardButtonData("💳 Пополнить", "profile_deposit")
		btnPurch := tgbotapi.NewInlineKeyboardButtonData("🧾 Мои покупки", "profile_purchases")

		resp := tgbotapi.NewMessage(msg.Chat.ID, text)
		resp.ParseMode = "HTML"
		resp.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btnDeposit, btnPurch),
		)
		if _, err := b.TelegramAPI().Send(resp); err != nil {
			log.Printf("send profile msg error: %v", err)
		}
	}
}
