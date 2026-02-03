package storage

import (
	"context"
	"crypto/rand"
	"errors"
	"strings"
	"time"
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
