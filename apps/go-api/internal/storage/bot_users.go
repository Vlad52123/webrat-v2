package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

func (d *DB) UpsertBotUser(telegramID int64, username string) error {
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}
	if telegramID == 0 {
		return errors.New("empty telegramID")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.SQL().ExecContext(ctx, `
		INSERT INTO bot_users (telegram_id, username)
		VALUES ($1, $2)
		ON CONFLICT (telegram_id) DO UPDATE SET username = EXCLUDED.username
	`, telegramID, strings.TrimSpace(username))
	return err
}

func (d *DB) GetBotProfile(telegramID int64) (balance float64, totalPaid float64, ordersCount int64, createdAt time.Time, err error) {
	if d == nil || d.SQL() == nil {
		return 0, 0, 0, time.Time{}, errors.New("db is nil")
	}
	if telegramID == 0 {
		return 0, 0, 0, time.Time{}, errors.New("empty telegramID")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var balanceRaw any
	var totalPaidRaw any
	row := d.SQL().QueryRowContext(ctx, `SELECT balance, total_paid, created_at FROM bot_users WHERE telegram_id = $1`, telegramID)
	if err := row.Scan(&balanceRaw, &totalPaidRaw, &createdAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, 0, 0, time.Time{}, nil
		}
		return 0, 0, 0, time.Time{}, err
	}

	balance, err = scanNumericFloat(balanceRaw)
	if err != nil {
		return 0, 0, 0, createdAt, err
	}
	totalPaid, err = scanNumericFloat(totalPaidRaw)
	if err != nil {
		return balance, 0, 0, createdAt, err
	}

	row2 := d.SQL().QueryRowContext(ctx, `SELECT COUNT(*) FROM bot_purchases WHERE telegram_id = $1`, telegramID)
	if err := row2.Scan(&ordersCount); err != nil {
		return balance, totalPaid, 0, createdAt, err
	}

	return balance, totalPaid, ordersCount, createdAt, nil
}

func (d *DB) DeductBotBalance(telegramID int64, amount float64) error {
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}
	if telegramID == 0 || amount <= 0 {
		return errors.New("invalid params")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tx, err := d.SQL().BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var balanceRaw any
	row := tx.QueryRowContext(ctx, `SELECT balance FROM bot_users WHERE telegram_id = $1 FOR UPDATE`, telegramID)
	if err := row.Scan(&balanceRaw); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("user not found")
		}
		return err
	}
	balance, err := scanNumericFloat(balanceRaw)
	if err != nil {
		return err
	}
	if balance < amount {
		return errors.New("insufficient_balance")
	}
	if _, err := tx.ExecContext(ctx, `UPDATE bot_users SET balance = balance - $1 WHERE telegram_id = $2`, amount, telegramID); err != nil {
		return err
	}
	return tx.Commit()
}
