package storage

import (
	"context"
	"crypto/rand"
	"database/sql"
	"errors"
	"strings"
	"time"
)

var (
	ErrKeyNotFound         = errors.New("key not found")
	ErrKeyAlreadyActivated = errors.New("key already activated")
	ErrAlreadyForever      = errors.New("subscription already forever")
)

func (d *DB) CreateSubscriptionKey(kind string) (string, error) {
	if d == nil || d.sql == nil {
		return "", errors.New("db is nil")
	}

	for i := 0; i < 5; i++ {
		buf := make([]byte, 32)
		if _, err := rand.Read(buf); err != nil {
			return "", err
		}
		alphabet := []byte("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
		out := make([]byte, 19)
		pos := 0
		for _, b := range buf {
			if pos == 7 {
				out[pos] = '-'
				pos++
			}
			out[pos] = alphabet[int(b)%len(alphabet)]
			pos++
			if pos >= len(out) {
				break
			}
		}
		key := string(out)
		if strings.EqualFold(kind, "year") {
			key = "Y-" + key
		} else if strings.EqualFold(kind, "forever") {
			key = "L-" + key
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		_, err := d.sql.ExecContext(ctx, `INSERT INTO subscription_keys (key) VALUES ($1)`, key)
		cancel()
		if err == nil {
			return key, nil
		}
	}

	return "", errors.New("failed to generate unique subscription key")
}

func (d *DB) ActivateSubscriptionKey(login, key string) (string, time.Time, string, error) {
	login = strings.ToLower(strings.TrimSpace(login))
	key = strings.TrimSpace(key)
	if d == nil || d.sql == nil {
		return "none", time.Time{}, "none", errors.New("db is nil")
	}
	if login == "" || key == "" {
		return "none", time.Time{}, "none", errors.New("empty login or key")
	}

	kind := "month"
	if strings.HasPrefix(key, "Y-") {
		kind = "year"
	} else if strings.HasPrefix(key, "L-") {
		kind = "forever"
	}

	if kind != "forever" {
		status, _, existingKind, err := d.GetSubscription(login)
		if err != nil {
			return "none", time.Time{}, "none", err
		}
		if status == "vip" && existingKind == "forever" {
			return "vip", time.Time{}, "forever", ErrAlreadyForever
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var activatedBy sql.NullString
	var activatedAt sql.NullTime
	row := d.sql.QueryRowContext(ctx, `SELECT activated_by, activated_at FROM subscription_keys WHERE key = $1`, key)
	if err := row.Scan(&activatedBy, &activatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "none", time.Time{}, "none", ErrKeyNotFound
		}
		return "none", time.Time{}, "none", err
	}
	if activatedBy.Valid && strings.TrimSpace(activatedBy.String) != "" {
		return "none", time.Time{}, "none", ErrKeyAlreadyActivated
	}

	now := time.Now().UTC()
	base := now
	if kind != "forever" {
		status, expiry, _, err := d.GetSubscription(login)
		if err != nil {
			return "none", time.Time{}, "none", err
		}
		if status == "vip" && expiry.After(now) {
			base = expiry
		}
	}

	tx, err := d.sql.BeginTx(ctx, nil)
	if err != nil {
		return "none", time.Time{}, "none", err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `UPDATE subscription_keys SET activated_by = $1, activated_at = $2 WHERE key = $3`, login, now, key); err != nil {
		return "none", time.Time{}, "none", err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE users SET subscription_status = $1, subscription_activated_at = $2 WHERE login = $3`, "vip", base, login); err != nil {
		return "none", time.Time{}, "none", err
	}
	if err := tx.Commit(); err != nil {
		return "none", time.Time{}, "none", err
	}

	var expiry time.Time
	if kind == "forever" {
		expiry = base.AddDate(100, 0, 0)
	} else if kind == "year" {
		expiry = base.AddDate(1, 0, 0)
	} else {
		expiry = base.AddDate(0, 1, 0)
	}

	return "vip", expiry, kind, nil
}
