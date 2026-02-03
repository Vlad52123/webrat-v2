package cryptopay

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func CreateInvoice(httpClient *http.Client, token string, amount float64, plan string) (invoiceID string, link string, err error) {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 15 * time.Second}
	}

	token = strings.TrimSpace(token)
	if token == "" {
		return "", "", errors.New("cryptopay token is empty")
	}
	if amount <= 0 {
		return "", "", errors.New("invalid amount")
	}

	plan = strings.TrimSpace(plan)
	if plan == "" {
		plan = "invoice"
	}

	body := InvoiceRequest{
		CurrencyType: "fiat",
		Fiat:         "RUB",
		Amount:       fmt.Sprintf("%.0f", amount),
		Description:  "WebCrystal " + plan,
	}

	data, err := json.Marshal(body)
	if err != nil {
		return "", "", err
	}

	req, err := http.NewRequest(http.MethodPost, "https://pay.crypt.bot/api/createInvoice", bytes.NewReader(data))
	if err != nil {
		return "", "", err
	}
	req.Header.Set("Crypto-Pay-API-Token", token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", "", fmt.Errorf("cryptopay http status: %s", resp.Status)
	}

	var cr InvoiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&cr); err != nil {
		return "", "", err
	}
	if !cr.Ok {
		if cr.Error != nil {
			return "", "", fmt.Errorf("cryptopay error: code=%d name=%s", cr.Error.Code, cr.Error.Name)
		}
		return "", "", errors.New("cryptopay response ok=false")
	}
	if cr.Result.InvoiceID == 0 || strings.TrimSpace(cr.Result.BotInvoiceURL) == "" {
		return "", "", fmt.Errorf("invalid cryptopay response: status=%s", cr.Result.Status)
	}

	return strconv.FormatInt(cr.Result.InvoiceID, 10), strings.TrimSpace(cr.Result.BotInvoiceURL), nil
}
