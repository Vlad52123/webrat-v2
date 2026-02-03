package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"webrat-go-api/internal/cryptopay"
	"webrat-go-api/internal/storage"
)

func HandleCallback(b BotContext, db *storage.DB, cq *tgbotapi.CallbackQuery) {
	if cq == nil || cq.Message == nil || cq.From == nil {
		return
	}

	data := cq.Data
	chatID := cq.Message.Chat.ID
	userID := cq.From.ID

	if strings.HasPrefix(data, "deposit_create:") {
		if _, err := b.TelegramAPI().Request(tgbotapi.NewCallback(cq.ID, "")); err != nil {
			log.Printf("send callback answer error: %v", err)
		}

		sAmt := strings.TrimSpace(strings.TrimPrefix(data, "deposit_create:"))
		amt, err := strconv.ParseInt(sAmt, 10, 64)
		if err != nil || amt < 50 || amt > 1000000 {
			msg := tgbotapi.NewMessage(chatID, "Некорректная сумма. Введите сумму от 50 до 1000000 ₽.")
			if _, err2 := b.TelegramAPI().Send(msg); err2 != nil {
				log.Printf("send deposit_create bad amount msg error: %v", err2)
			}
			return
		}

		if b.State().ThrottleDepositAction(userID, 2*time.Second) {
			return
		}

		hc := b.HTTPClient()
		if hc == nil {
			hc = &http.Client{Timeout: 15 * time.Second}
		}
		invoiceID, link, err := cryptopay.CreateInvoice(hc, b.CryptoPayToken(), float64(amt), "deposit")
		if err != nil {
			log.Printf("cryptopay deposit invoice error: %v", err)
			msg := tgbotapi.NewMessage(chatID, "Ошибка создания счёта. Попробуй позже.")
			if _, err2 := b.TelegramAPI().Send(msg); err2 != nil {
				log.Printf("send deposit invoice error msg: %v", err2)
			}
			return
		}

		if db != nil {
			if err := db.CreateBotOrder(userID, invoiceID, float64(amt), "RUB", "cryptopay"); err != nil {
				log.Printf("CreateBotOrder deposit error: %v", err)
			}
		}

		btnPay := tgbotapi.NewInlineKeyboardButtonURL("💰 Выполнить", link)
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "profile_show")
		msg := tgbotapi.NewMessage(chatID, "Оплатите выбранную сумму: <code>"+fmt.Sprintf("%d", amt)+" ₽</code>")
		msg.ParseMode = "HTML"
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btnPay),
			tgbotapi.NewInlineKeyboardRow(btnBack),
		)
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send deposit pay msg error: %v", err)
		}
		return
	}

	b.State().ClearPendingIfCallbackNotDeposit(userID, data)

	if data != "profile_purchases" && !strings.HasPrefix(data, "pay_prod_") {
		if _, err := b.TelegramAPI().Request(tgbotapi.NewCallback(cq.ID, "")); err != nil {
			log.Printf("send callback answer error: %v", err)
		}
	}

	switch data {
	case "back_start":
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
		msg := tgbotapi.NewMessage(chatID, "Добро пожаловать в 💎WebCrystal💎")
		msg.ReplyMarkup = kb
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send back_start error: %v", err)
		}
		return

	case "profile_show":
		if db == nil {
			return
		}
		balance, totalPaid, ordersCount, createdAt, err := db.GetBotProfile(userID)
		if err != nil {
			log.Printf("GetBotProfile error: %v", err)
		}
		login := "-"
		if cq.From != nil {
			login = strings.TrimSpace(cq.From.UserName)
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
		msg := tgbotapi.NewMessage(chatID, text)
		msg.ParseMode = "HTML"
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btnDeposit, btnPurch),
		)
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send profile_show error: %v", err)
		}
		return

	case "profile_purchases":
		if db == nil {
			return
		}
		purchases, err := db.GetBotPurchases(userID)
		if err != nil {
			log.Printf("GetBotPurchases error: %v", err)
		}
		if len(purchases) == 0 {
			cb := tgbotapi.NewCallback(cq.ID, "❌ У вас отсутствуют покупки")
			cb.ShowAlert = false
			if _, err := b.TelegramAPI().Request(cb); err != nil {
				log.Printf("send profile_purchases empty callback error: %v", err)
			}
			return
		}
		if _, err := b.TelegramAPI().Request(tgbotapi.NewCallback(cq.ID, "")); err != nil {
			log.Printf("send callback answer error: %v", err)
		}
		var sb strings.Builder
		sb.WriteString("🧾 <b>Ваши покупки</b>\n───────────────\n")
		for i, p := range purchases {
			if i >= 10 {
				break
			}
			sb.WriteString("• <b>")
			sb.WriteString(p.Product)
			sb.WriteString("</b> — <code>")
			sb.WriteString(fmt.Sprintf("%.0f", p.Price))
			sb.WriteString(" ₽</code>")
			if strings.TrimSpace(p.ActivationKey) != "" {
				sb.WriteString("\n  🔑 <code>")
				sb.WriteString(p.ActivationKey)
				sb.WriteString("</code>")
			}
			sb.WriteString("\n")
		}
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "profile_show")
		msg := tgbotapi.NewMessage(chatID, sb.String())
		msg.ParseMode = "HTML"
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(tgbotapi.NewInlineKeyboardRow(btnBack))
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send profile_purchases error: %v", err)
		}
		return

	case "profile_deposit":
		text := "💳 Пополнение баланса\n───────────────\nВыберите способ оплаты:"
		btnCP := tgbotapi.NewInlineKeyboardButtonData("🪙 CryptoPay", "profile_deposit_cryptopay")
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "profile_show")
		msg := tgbotapi.NewMessage(chatID, text)
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btnCP),
			tgbotapi.NewInlineKeyboardRow(btnBack),
		)
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send profile_deposit error: %v", err)
		}
		return

	case "profile_deposit_cryptopay":
		b.State().SetPendingProvider(userID, "cryptopay")
		b.State().SetAwaitingDepositAmount(userID, true)
		text := "🪙 CryptoPay\n───────────────\nВведите сумму пополнения числом (от 50 ₽ до 1000000 ₽)."
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "profile_deposit")
		msg := tgbotapi.NewMessage(chatID, text)
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(tgbotapi.NewInlineKeyboardRow(btnBack))
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send profile_deposit_cryptopay error: %v", err)
		}
		return

	case "back_cat":
		msg := tgbotapi.NewMessage(chatID, "💎 Выберите нужный вам товар:")
		btnCat := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal 💎", "cat_webrat")
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "back_start")
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btnCat),
			tgbotapi.NewInlineKeyboardRow(btnBack),
		)
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send back_cat error: %v", err)
		}
		return

	case "cat_webrat":
		msg := tgbotapi.NewMessage(chatID, "💎 Выберите нужный вам товар:")
		btn1 := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal на месяц 💎 | 299 ₽", "prod_month")
		btn2 := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal на год 💎 | 599 ₽", "prod_year")
		btn3 := tgbotapi.NewInlineKeyboardButtonData("💎 WebCrystal навсегда 💎 | 1299 ₽", "prod_forever")
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "back_cat")
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btn1),
			tgbotapi.NewInlineKeyboardRow(btn2),
			tgbotapi.NewInlineKeyboardRow(btn3),
			tgbotapi.NewInlineKeyboardRow(btnBack),
		)
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send cat_webrat error: %v", err)
		}
		return
	}

	var (
		kind        string
		price       float64
		productName string
	)
	if strings.HasPrefix(data, "prod_") || strings.HasPrefix(data, "pay_prod_") {
		suffix := strings.TrimPrefix(data, "prod_")
		suffix = strings.TrimPrefix(suffix, "pay_prod_")
		switch suffix {
		case "month":
			kind = "month"
			price = 299
			productName = "💎 WebCrystal на месяц 💎"
		case "year":
			kind = "year"
			price = 599
			productName = "💎 WebCrystal на год 💎"
		case "forever":
			kind = "forever"
			price = 1299
			productName = "💎 WebCrystal навсегда 💎"
		default:
			return
		}
	}

	if strings.HasPrefix(data, "prod_") {
		text := "🎁 <b>Покупка товара</b>:\n" +
			"➖➖➖➖➖➖➖➖➖➖➖➖➖\n" +
			"📜 <b>Категория:</b> 💎 <code>WebCrystal</code> 💎\n" +
			"🏷 <b>Название:</b> <code>" + productName + "</code>\n" +
			"💳 <b>Стоимость:</b> <code>" + fmt.Sprintf("%.0f", price) + " ₽</code>\n" +
			"📜 <b>Описание:</b>\n" +
			"✅ Работает на сайте, без лаунчеров и десктопных панелей.\n" +
			"<i>Не открывается - используйте VPN</i>\n" +
			"✅ Для работы не нужны хостинги и открытые порты, все уже настроено и готово к работе.\n" +
			"✅ Билд написан на языке программирования Go, не требует установленной java или .net framework"

		btnPay := tgbotapi.NewInlineKeyboardButtonData("💰 Оплатить", "pay_prod_"+kind)
		btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "cat_webrat")
		msg := tgbotapi.NewMessage(chatID, text)
		msg.ParseMode = "HTML"
		msg.DisableWebPagePreview = true
		msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(btnPay),
			tgbotapi.NewInlineKeyboardRow(btnBack),
		)
		if _, err := b.TelegramAPI().Send(msg); err != nil {
			log.Printf("send product screen error: %v", err)
		}
		return
	}

	if strings.HasPrefix(data, "pay_prod_") {
		cb := tgbotapi.NewCallback(cq.ID, "⏳ Подождите...")
		cb.ShowAlert = false
		if _, err := b.TelegramAPI().Request(cb); err != nil {
			log.Printf("send pay_prod wait callback error: %v", err)
			return
		}

		messageID := cq.Message.MessageID
		go func(chatID int64, messageID int, userID int64, kind string, price float64, productName string) {
			time.Sleep(2 * time.Second)
			if db == nil {
				return
			}

			if err := db.DeductBotBalance(userID, price); err != nil {
				text := "❌ <b>Недостаточно средств</b>\n" +
					"───────────────\n" +
					"Пополните баланс и попробуйте снова."
				btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "cat_webrat")
				edit := tgbotapi.NewEditMessageText(chatID, messageID, text)
				edit.ParseMode = "HTML"
				edit.ReplyMarkup = &tgbotapi.InlineKeyboardMarkup{InlineKeyboard: [][]tgbotapi.InlineKeyboardButton{
					tgbotapi.NewInlineKeyboardRow(btnBack),
				}}
				if _, err2 := b.TelegramAPI().Send(edit); err2 != nil {
					log.Printf("edit insufficient balance msg error: %v", err2)
				}
				return
			}

			key, err := db.CreateSubscriptionKey(kind)
			if err != nil {
				log.Printf("CreateSubscriptionKey error: %v", err)
				text := "❌ <b>Ошибка</b>\n" +
					"───────────────\n" +
					"Ошибка генерации ключа. Попробуйте позже."
				btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "cat_webrat")
				edit := tgbotapi.NewEditMessageText(chatID, messageID, text)
				edit.ParseMode = "HTML"
				edit.ReplyMarkup = &tgbotapi.InlineKeyboardMarkup{InlineKeyboard: [][]tgbotapi.InlineKeyboardButton{
					tgbotapi.NewInlineKeyboardRow(btnBack),
				}}
				if _, err2 := b.TelegramAPI().Send(edit); err2 != nil {
					log.Printf("edit key generation error msg: %v", err2)
				}
				return
			}

			if err := db.AddBotPurchase(userID, productName, price, key); err != nil {
				log.Printf("AddBotPurchase error: %v", err)
			}

			text := "✅ <b>Оплата прошла успешно</b>\n" +
				"───────────────\n" +
				"🏷 <b>Товар:</b> " + productName + "\n" +
				"🔑 <b>Ключ активации:</b> <code>" + key + "</code>\n" +
				"💎 <b>Сайт:</b> <a href=\"https://webcrystal.sbs/\">WebCrystal</a>"

			btnBack := tgbotapi.NewInlineKeyboardButtonData("⬅ Назад", "back_start")
			edit := tgbotapi.NewEditMessageText(chatID, messageID, text)
			edit.ParseMode = "HTML"
			edit.DisableWebPagePreview = true
			edit.ReplyMarkup = &tgbotapi.InlineKeyboardMarkup{InlineKeyboard: [][]tgbotapi.InlineKeyboardButton{
				tgbotapi.NewInlineKeyboardRow(btnBack),
			}}
			if _, err := b.TelegramAPI().Send(edit); err != nil {
				log.Printf("edit paid success msg error: %v", err)
			}
		}(chatID, messageID, userID, kind, price, productName)
	}
}
