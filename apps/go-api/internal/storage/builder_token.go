package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

func (d *DB) GetLoginByBuilderToken(token string) (string, bool, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return "", false, nil
	}
	if d == nil || d.SQL() == nil {
		return "", false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var login string
	err := d.SQL().QueryRowContext(ctx, `SELECT login FROM users WHERE builder_token = $1`, token).Scan(&login)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", false, nil
		}
		return "", false, err
	}
	login = strings.ToLower(strings.TrimSpace(login))
	if login == "" {
		return "", false, nil
	}
	return login, true, nil
}
