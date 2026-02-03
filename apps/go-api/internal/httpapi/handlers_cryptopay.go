package httpapi

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"webrat-go-api/internal/bot"
)

func (s *Server) handleCryptoPayWebhook(w http.ResponseWriter, r *http.Request) {
	secret := strings.TrimSpace(os.Getenv("CRYPTOBOT_WEBHOOK_SECRET"))
	if secret != "" {
		if strings.TrimSpace(r.URL.Query().Get("secret")) != secret {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
	}

	if r.Method == http.MethodGet || r.Method == http.MethodHead {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var invoiceID string
	var status string

	if v, ok := payload["payload"].(map[string]any); ok {
		if st, ok := v["status"].(string); ok {
			status = strings.TrimSpace(st)
		}
		if id, ok := v["invoice_id"]; ok {
			switch t := id.(type) {
			case float64:
				invoiceID = fmt.Sprintf("%.0f", t)
			case string:
				invoiceID = strings.TrimSpace(t)
			}
		}
	}
	if invoiceID == "" {
		if id, ok := payload["invoice_id"]; ok {
			switch t := id.(type) {
			case float64:
				invoiceID = fmt.Sprintf("%.0f", t)
			case string:
				invoiceID = strings.TrimSpace(t)
			}
		}
	}
	if status == "" {
		if st, ok := payload["status"].(string); ok {
			status = strings.TrimSpace(st)
		}
	}

	if strings.ToLower(status) != "paid" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if invoiceID == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	telegramID, amount, err := s.db.MarkBotOrderPaid(invoiceID)
	if err != nil {
		log.Println("MarkBotOrderPaid error:", err)
		w.WriteHeader(http.StatusOK)
		return
	}

	text := "✅ Пополнение успешно\n" +
		"➖➖➖➖➖➖➖➖➖➖➖➖➖\n" +
		"💳 Сумма: +" + fmt.Sprintf("%.0f", amount) + " ₽\n" +
		"\n<i>Баланс пополнен автоматически. Открой профиль, чтобы посмотреть.</i>"

	if err := bot.SendDepositReceipt(telegramID, text); err != nil {
		log.Println("send deposit receipt error:", err)
	}

	w.WriteHeader(http.StatusOK)
}