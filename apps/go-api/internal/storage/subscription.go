package storage

import (
	"database/sql"
	"errors"
	"strings"
	"time"
)

func (d *DB) GetSubscription(login string) (string, time.Time, string, error) {
	login = strings.TrimSpace(login)
	if d == nil || d.sql == nil || login == "" {
		return "none", time.Time{}, "none", nil
	}

	row := d.sql.QueryRow(`SELECT subscription_status, subscription_activated_at FROM users WHERE login = $1`, login)

	var status sql.NullString
	var activatedAt sql.NullTime
	if err := row.Scan(&status, &activatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "none", time.Time{}, "none", nil
		}
		return "none", time.Time{}, "none", err
	}
	if !status.Valid || strings.TrimSpace(status.String) == "" {
		return "none", time.Time{}, "none", nil
	}
	st := strings.ToLower(strings.TrimSpace(status.String))
	if st != "vip" || !activatedAt.Valid {
		return "none", time.Time{}, "none", nil
	}

	kind := "month"
	var lastKey sql.NullString
	row2 := d.sql.QueryRow(`SELECT key FROM subscription_keys WHERE activated_by = $1 ORDER BY activated_at DESC LIMIT 1`, login)
	if err := row2.Scan(&lastKey); err == nil && lastKey.Valid {
		if strings.HasPrefix(lastKey.String, "Y-") {
			kind = "year"
		} else if strings.HasPrefix(lastKey.String, "L-") {
			kind = "forever"
		}
	}

	now := time.Now().UTC()
	var expiry time.Time
	if kind == "forever" {
		expiry = activatedAt.Time.AddDate(100, 0, 0)
	} else {
		if kind == "year" {
			expiry = activatedAt.Time.AddDate(1, 0, 0)
		} else {
			expiry = activatedAt.Time.AddDate(0, 1, 0)
		}
		if now.After(expiry) {
			_, _ = d.sql.Exec(`UPDATE users SET subscription_status = $1, subscription_activated_at = NULL WHERE login = $2`, "none", login)
			return "none", time.Time{}, "none", nil
		}
	}

	return "vip", expiry, kind, nil
}
