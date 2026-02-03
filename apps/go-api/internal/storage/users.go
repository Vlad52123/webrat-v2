package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func (d *DB) GetUserPassword(login string) (hash string, exists bool, err error) {
	login = strings.TrimSpace(login)
	if login == "" {
		return "", false, nil
	}
	if d == nil || d.sql == nil {
		return "", false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	row := d.sql.QueryRowContext(ctx, `SELECT password FROM users WHERE login=$1`, login)
	if err := row.Scan(&hash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", false, nil
		}
		return "", false, err
	}
	return hash, true, nil
}

func (d *DB) CreateUser(login, password string) error {
	login = strings.ToLower(strings.TrimSpace(login))
	if login == "" {
		return errors.New("empty login")
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}
	if password == "" {
		password = "0000"
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = d.sql.ExecContext(ctx, `
		INSERT INTO users(login, password, builder_token, subscription_status)
		VALUES($1,$2,NULL,NULL)
		ON CONFLICT (login) DO NOTHING
	`, login, string(hash))
	return err
}

func (d *DB) GetOrCreateBuilderToken(login string, newToken func() (string, error)) (string, error) {
	login = strings.TrimSpace(login)
	if login == "" {
		return "", errors.New("empty login")
	}
	if d == nil || d.sql == nil {
		return "", errors.New("db is nil")
	}
	if newToken == nil {
		return "", errors.New("newToken is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existing sql.NullString
	row := d.sql.QueryRowContext(ctx, `SELECT builder_token FROM users WHERE login = $1`, login)
	if err := row.Scan(&existing); err == nil {
		if existing.Valid && strings.TrimSpace(existing.String) != "" {
			return strings.TrimSpace(existing.String), nil
		}
	} else if !errors.Is(err, sql.ErrNoRows) {
		return "", err
	}

	tok, err := newToken()
	if err != nil {
		return "", err
	}
	tok = strings.TrimSpace(tok)
	if tok == "" {
		return "", errors.New("empty token")
	}

	_, err = d.sql.ExecContext(ctx, `UPDATE users SET builder_token = $1 WHERE login = $2`, tok, login)
	if err != nil {
		return "", err
	}
	return tok, nil
}
