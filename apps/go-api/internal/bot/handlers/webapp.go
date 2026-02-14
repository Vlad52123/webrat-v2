package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// sendWebAppButton sends an inline keyboard with a web_app button
// via raw Telegram Bot API, bypassing the Go library which lacks WebApp types.
func sendWebAppButton(token string, chatID int64, text, buttonText, webAppURL string) error {
	payload := map[string]any{
		"chat_id": chatID,
		"text":    text,
		"reply_markup": map[string]any{
			"inline_keyboard": [][]map[string]any{
				{
					{
						"text":    buttonText,
						"web_app": map[string]string{"url": webAppURL},
					},
				},
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("telegram API status: %s", resp.Status)
	}
	return nil
}
