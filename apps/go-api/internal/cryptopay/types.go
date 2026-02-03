package cryptopay

type InvoiceRequest struct {
	CurrencyType string `json:"currency_type"`
	Fiat         string `json:"fiat"`
	Amount       string `json:"amount"`
	Description  string `json:"description"`
}

type InvoiceResponse struct {
	Ok     bool       `json:"ok"`
	Result InvoiceData `json:"result"`
	Error  *ErrorObj  `json:"error,omitempty"`
}

type ErrorObj struct {
	Code int    `json:"code"`
	Name string `json:"name"`
}

type InvoiceData struct {
	InvoiceID     int64  `json:"invoice_id"`
	BotInvoiceURL string `json:"bot_invoice_url"`
	Status        string `json:"status"`
}
