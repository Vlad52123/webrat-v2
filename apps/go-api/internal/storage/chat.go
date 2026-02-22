package storage

import (
	"context"
	"errors"
	"strings"
	"time"
)

type ChatMessage struct {
	ID                 int       `json:"id"`
	Login              string    `json:"login"`
	Message            string    `json:"message"`
	ImageURL           string    `json:"image_url"`
	CreatedAt          time.Time `json:"created_at"`
	AvatarURL          string    `json:"avatar_url"`
	SubscriptionStatus string    `json:"subscription_status"`
	UserCreatedAt      time.Time `json:"user_created_at"`
}

func (d *DB) InsertChatMessage(login, message, imageURL string) error {
	login = strings.TrimSpace(login)
	message = strings.TrimSpace(message)
	if login == "" || message == "" {
		return errors.New("missing fields")
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.sql.ExecContext(ctx,
		`INSERT INTO chat_messages(login, message, image_url) VALUES($1, $2, $3)`,
		login, message, strings.TrimSpace(imageURL))
	return err
}

func (d *DB) ListChatMessages(limit, offset int) ([]ChatMessage, error) {
	if d == nil || d.sql == nil {
		return nil, errors.New("db is nil")
	}
	if limit <= 0 {
		limit = 100
	}
	if limit > 200 {
		limit = 200
	}
	if offset < 0 {
		offset = 0
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := d.sql.QueryContext(ctx, `
		SELECT
			cm.id, cm.login, cm.message, cm.image_url, cm.created_at,
			COALESCE(u.avatar_url, ''), COALESCE(u.subscription_status, ''), COALESCE(u.created_at, NOW())
		FROM chat_messages cm
		LEFT JOIN users u ON u.login = cm.login
		ORDER BY cm.created_at ASC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []ChatMessage
	for rows.Next() {
		var m ChatMessage
		if err := rows.Scan(&m.ID, &m.Login, &m.Message, &m.ImageURL, &m.CreatedAt,
			&m.AvatarURL, &m.SubscriptionStatus, &m.UserCreatedAt); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}
