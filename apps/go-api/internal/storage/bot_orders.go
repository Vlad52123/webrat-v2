package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

func (d *DB) CreateBotOrder(telegramID int64, invoiceID string, amount float64, currency, provider string) error {
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}
	invoiceID = strings.TrimSpace(invoiceID)
	currency = strings.TrimSpace(currency)
	provider = strings.TrimSpace(provider)
	if telegramID == 0 || invoiceID == "" || amount <= 0 || currency == "" || provider == "" {
		return errors.New("invalid order params")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.SQL().ExecContext(ctx, `
		INSERT INTO bot_orders (telegram_id, invoice_id, amount_crypto, currency, status, provider)
		VALUES ($1, $2, $3, $4, 'pending', $5)
	`, telegramID, invoiceID, amount, currency, provider)
	return err
}

func (d *DB) MarkBotOrderPaid(invoiceID string) (int64, float64, error) {
	if d == nil || d.SQL() == nil {
		return 0, 0, errors.New("db is nil")
	}
	invoiceID = strings.TrimSpace(invoiceID)
	if invoiceID == "" {
		return 0, 0, errors.New("empty invoiceID")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tx, err := d.SQL().BeginTx(ctx, nil)
	if err != nil {
		return 0, 0, err
	}
	defer func() { _ = tx.Rollback() }()

	var orderTelegramID int64
	var amountRaw any
	var orderCurrency string

	row := tx.QueryRowContext(ctx, `
		SELECT telegram_id, amount_crypto, currency
		FROM bot_orders
		WHERE invoice_id = $1
		FOR UPDATE
	`, invoiceID)
	if err := row.Scan(&orderTelegramID, &amountRaw, &orderCurrency); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, 0, errors.New("order not found")
		}
		return 0, 0, err
	}

	orderAmount, err := scanNumericFloat(amountRaw)
	if err != nil {
		return 0, 0, err
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO payment_ledger (invoice_id, telegram_id, amount, currency, source, status)
		VALUES ($1, $2, $3, $4, 'cryptobot_webhook', 'pending')
		ON CONFLICT (invoice_id) DO NOTHING
	`, invoiceID, orderTelegramID, orderAmount, strings.TrimSpace(orderCurrency)); err != nil {
		return 0, 0, err
	}

	var telegramID int64
	var appliedAmountRaw any

	applyRow := tx.QueryRowContext(ctx, `
		UPDATE payment_ledger
		SET status = 'applied', applied_at = NOW()
		WHERE invoice_id = $1 AND status <> 'applied'
		RETURNING telegram_id, amount
	`, invoiceID)
	if err := applyRow.Scan(&telegramID, &appliedAmountRaw); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			row := tx.QueryRowContext(ctx, `SELECT telegram_id, amount FROM payment_ledger WHERE invoice_id = $1`, invoiceID)
			if err := row.Scan(&telegramID, &appliedAmountRaw); err != nil {
				return 0, 0, err
			}

			appliedAmount, err := scanNumericFloat(appliedAmountRaw)
			if err != nil {
				return 0, 0, err
			}

			if err := tx.Commit(); err != nil {
				return 0, 0, err
			}
			return telegramID, appliedAmount, nil
		}
		return 0, 0, err
	}

	appliedAmount, err := scanNumericFloat(appliedAmountRaw)
	if err != nil {
		return 0, 0, err
	}

	if _, err := tx.ExecContext(ctx, `
		UPDATE bot_orders
		SET status = 'paid', paid_at = $2
		WHERE invoice_id = $1 AND status <> 'paid'
	`, invoiceID, time.Now().UTC()); err != nil {
		return 0, 0, err
	}

	if _, err := tx.ExecContext(ctx, `
		UPDATE bot_users
		SET balance = balance + $1, total_paid = total_paid + $1
		WHERE telegram_id = $2
	`, appliedAmount, telegramID); err != nil {
		return 0, 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, 0, err
	}

	return telegramID, appliedAmount, nil
}

func (d *DB) AddBotPurchase(telegramID int64, product string, price float64, activationKey string) error {
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}
	product = strings.TrimSpace(product)
	activationKey = strings.TrimSpace(activationKey)
	if telegramID == 0 || product == "" || price <= 0 {
		return errors.New("invalid params")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.SQL().ExecContext(ctx, `
		INSERT INTO bot_purchases (telegram_id, product, price, activation_key)
		VALUES ($1, $2, $3, $4)
	`, telegramID, product, price, activationKey)
	return err
}

type BotPurchase struct {
	Product       string
	Price         float64
	ActivationKey string
	CreatedAt     time.Time
}

func (d *DB) GetBotPurchases(telegramID int64) ([]BotPurchase, error) {
	if d == nil || d.SQL() == nil {
		return nil, errors.New("db is nil")
	}
	if telegramID == 0 {
		return nil, errors.New("empty telegramID")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := d.SQL().QueryContext(ctx, `
		SELECT product, price, activation_key, created_at
		FROM bot_purchases
		WHERE telegram_id = $1
		ORDER BY created_at DESC
		LIMIT 20
	`, telegramID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []BotPurchase
	for rows.Next() {
		var p BotPurchase
		var priceRaw any
		if err := rows.Scan(&p.Product, &priceRaw, &p.ActivationKey, &p.CreatedAt); err != nil {
			return nil, err
		}
		p.Price, err = scanNumericFloat(priceRaw)
		if err != nil {
			return nil, err
		}
		res = append(res, p)
	}

	return res, rows.Err()
}
