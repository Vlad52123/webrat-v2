package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

func (d *DB) CreateUserSession(sessionID, login, ip, ua string, exp time.Time) error {
	sessionID = strings.TrimSpace(sessionID)
	login = strings.TrimSpace(login)
	if sessionID == "" || login == "" {
		return errors.New("empty sessionID or login")
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.sql.ExecContext(ctx, `
		INSERT INTO user_sessions(id, login, expires_at, ip, ua)
		VALUES ($1,$2,$3,NULLIF($4,''),NULLIF($5,''))
		ON CONFLICT (id) DO UPDATE
			SET login=EXCLUDED.login,
			    expires_at=EXCLUDED.expires_at,
			    ip=EXCLUDED.ip,
			    ua=EXCLUDED.ua
	`, sessionID, login, exp.UTC(), strings.TrimSpace(ip), strings.TrimSpace(ua))
	return err
}

func (d *DB) DeleteUserSession(sessionID string) error {
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return nil
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.sql.ExecContext(ctx, `DELETE FROM user_sessions WHERE id = $1`, sessionID)
	return err
}

func (d *DB) DeleteUserSessionsByLogin(login string) error {
	login = strings.TrimSpace(login)
	if login == "" {
		return nil
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.sql.ExecContext(ctx, `DELETE FROM user_sessions WHERE login = $1`, login)
	return err
}

func (d *DB) GetUserSessionLogin(sessionID string) (string, bool, error) {
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return "", false, nil
	}
	if d == nil || d.sql == nil {
		return "", false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var login string
	var exp time.Time
	row := d.sql.QueryRowContext(ctx, `SELECT login, expires_at FROM user_sessions WHERE id = $1`, sessionID)
	if err := row.Scan(&login, &exp); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", false, nil
		}
		return "", false, err
	}
	if time.Now().After(exp) {
		_ = d.DeleteUserSession(sessionID)
		return "", false, nil
	}
	return strings.TrimSpace(login), true, nil
}
