package httpapi

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
)

type ctxKey string

const tgUserIDKey ctxKey = "tgUserID"
const tgUsernameKey ctxKey = "tgUsername"

func validateTelegramInitData(initData, botToken string) (telegramID int64, username string, ok bool) {
	vals, err := url.ParseQuery(initData)
	if err != nil {
		return 0, "", false
	}

	hash := vals.Get("hash")
	if hash == "" {
		return 0, "", false
	}

	pairs := make([]string, 0, len(vals))
	for k := range vals {
		if k == "hash" {
			continue
		}
		pairs = append(pairs, k+"="+vals.Get(k))
	}
	sort.Strings(pairs)
	dataCheckString := strings.Join(pairs, "\n")

	secretKey := hmacSHA256([]byte("WebAppData"), []byte(botToken))
	computed := hmacSHA256(secretKey, []byte(dataCheckString))
	computedHex := hex.EncodeToString(computed)

	if computedHex != hash {
		return 0, "", false
	}

	userJSON := vals.Get("user")
	if userJSON == "" {
		return 0, "", false
	}
	var u struct {
		ID       int64  `json:"id"`
		Username string `json:"username"`
	}
	if err := json.Unmarshal([]byte(userJSON), &u); err != nil || u.ID == 0 {
		return 0, "", false
	}

	return u.ID, u.Username, true
}

func hmacSHA256(key, data []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}

func (s *Server) tgAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		initData := r.Header.Get("X-Telegram-Init-Data")
		if initData == "" {
			initData = r.Header.Get("Authorization")
			initData = strings.TrimPrefix(initData, "tma ")
		}
		if initData == "" {
			http.Error(w, `{"error":"missing init data"}`, http.StatusUnauthorized)
			return
		}

		botToken := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
		if botToken == "" {
			http.Error(w, `{"error":"bot not configured"}`, http.StatusInternalServerError)
			return
		}

		telegramID, username, ok := validateTelegramInitData(initData, botToken)
		if !ok {
			http.Error(w, `{"error":"invalid init data"}`, http.StatusUnauthorized)
			return
		}

		if s.db != nil {
			_ = s.db.UpsertBotUser(telegramID, username)
		}

		ctx := context.WithValue(r.Context(), tgUserIDKey, telegramID)
		ctx = context.WithValue(ctx, tgUsernameKey, username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getTelegramUserID(r *http.Request) int64 {
	id, _ := r.Context().Value(tgUserIDKey).(int64)
	return id
}

func getTelegramUsername(r *http.Request) string {
	u, _ := r.Context().Value(tgUsernameKey).(string)
	return u
}

func jsonReply(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
