package httpapi

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"webrat-go-api/internal/cryptopay"
)

func (s *Server) handleTGProfile(w http.ResponseWriter, r *http.Request) {
	uid := getTelegramUserID(r)
	if uid == 0 {
		jsonReply(w, 401, map[string]string{"error": "unauthorized"})
		return
	}

	balance, totalPaid, ordersCount, createdAt, err := s.db.GetBotProfile(uid)
	if err != nil {
		log.Printf("tg profile error: %v", err)
	}

	login := getTelegramUsername(r)
	if login != "" {
		login = "@" + login
	} else {
		login = "-"
	}

	reg := "-"
	if !createdAt.IsZero() {
		reg = createdAt.Format("2006-01-02 15:04")
	}

	jsonReply(w, 200, map[string]any{
		"telegramId":  uid,
		"login":       login,
		"registeredAt": reg,
		"balance":     balance,
		"totalPaid":   totalPaid,
		"ordersCount": ordersCount,
	})
}

func (s *Server) handleTGPurchases(w http.ResponseWriter, r *http.Request) {
	uid := getTelegramUserID(r)
	if uid == 0 {
		jsonReply(w, 401, map[string]string{"error": "unauthorized"})
		return
	}

	purchases, err := s.db.GetBotPurchases(uid)
	if err != nil {
		log.Printf("tg purchases error: %v", err)
		jsonReply(w, 500, map[string]string{"error": "internal"})
		return
	}

	type purchaseJSON struct {
		Product       string `json:"product"`
		Price         float64 `json:"price"`
		ActivationKey string `json:"activationKey"`
		CreatedAt     string `json:"createdAt"`
	}

	items := make([]purchaseJSON, 0, len(purchases))
	for _, p := range purchases {
		items = append(items, purchaseJSON{
			Product:       p.Product,
			Price:         p.Price,
			ActivationKey: p.ActivationKey,
			CreatedAt:     p.CreatedAt.Format("2006-01-02 15:04"),
		})
	}

	jsonReply(w, 200, map[string]any{"purchases": items})
}

func (s *Server) handleTGDeposit(w http.ResponseWriter, r *http.Request) {
	uid := getTelegramUserID(r)
	if uid == 0 {
		jsonReply(w, 401, map[string]string{"error": "unauthorized"})
		return
	}

	var body struct {
		Amount int64 `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonReply(w, 400, map[string]string{"error": "invalid body"})
		return
	}
	if body.Amount < 50 || body.Amount > 1000000 {
		jsonReply(w, 400, map[string]string{"error": "amount must be 50-1000000"})
		return
	}

	cpTok := strings.TrimSpace(os.Getenv("CRYPTOBOT_TOKEN"))
	if cpTok == "" {
		jsonReply(w, 500, map[string]string{"error": "payments not configured"})
		return
	}

	hc := &http.Client{Timeout: 15 * time.Second}
	invoiceID, link, err := cryptopay.CreateInvoice(hc, cpTok, float64(body.Amount), "deposit")
	if err != nil {
		log.Printf("tg deposit cryptopay error: %v", err)
		jsonReply(w, 500, map[string]string{"error": "payment error"})
		return
	}

	if err := s.db.CreateBotOrder(uid, invoiceID, float64(body.Amount), "RUB", "cryptopay"); err != nil {
		log.Printf("tg CreateBotOrder error: %v", err)
	}

	jsonReply(w, 200, map[string]any{
		"invoiceId": invoiceID,
		"payUrl":    link,
		"amount":    body.Amount,
	})
}

func (s *Server) handleTGBuy(w http.ResponseWriter, r *http.Request) {
	uid := getTelegramUserID(r)
	if uid == 0 {
		jsonReply(w, 401, map[string]string{"error": "unauthorized"})
		return
	}

	var body struct {
		Plan string `json:"plan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonReply(w, 400, map[string]string{"error": "invalid body"})
		return
	}

	var price float64
	var productName string

	switch strings.TrimSpace(body.Plan) {
	case "month":
		price = 299
		productName = "💎 WebCrystal на месяц 💎"
	case "year":
		price = 599
		productName = "💎 WebCrystal на год 💎"
	case "forever":
		price = 1299
		productName = "💎 WebCrystal навсегда 💎"
	default:
		jsonReply(w, 400, map[string]string{"error": "invalid plan"})
		return
	}

	if err := s.db.DeductBotBalance(uid, price); err != nil {
		jsonReply(w, 402, map[string]string{"error": "insufficient funds"})
		return
	}

	key, err := s.db.CreateSubscriptionKey(body.Plan)
	if err != nil {
		log.Printf("tg CreateSubscriptionKey error: %v", err)
		jsonReply(w, 500, map[string]string{"error": "key generation failed"})
		return
	}

	if err := s.db.AddBotPurchase(uid, productName, price, key); err != nil {
		log.Printf("tg AddBotPurchase error: %v", err)
	}

	jsonReply(w, 200, map[string]any{
		"success":       true,
		"product":       productName,
		"price":         price,
		"activationKey": key,
	})
}
