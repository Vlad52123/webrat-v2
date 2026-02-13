package storage

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"errors"
	"log"
	"net/smtp"
	"os"
	"strings"
	"time"
)

func SendEmail(to, subject, body string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	from := os.Getenv("SMTP_FROM")

	log.Printf("[smtp] host=%q port=%q user=%q passLen=%d from=%q", host, port, user, len(pass), from)
	if host == "" || port == "" || user == "" || pass == "" {
		return errors.New("SMTP is not configured")
	}
	if from == "" {
		from = user
	}

	addr := host + ":" + port
	auth := smtp.PlainAuth("", user, pass, host)

	baseURL := strings.TrimRight(strings.TrimSpace(os.Getenv("WEBRAT_BASE_URL")), "/")
	if baseURL == "" {
		baseURL = "https://webcrystal.sbs"
	}

	bodyHTML := "<html><body style=\"font-family: sans-serif; background:#111; color:#eee; padding:16px;\">" +
		"<div style=\"text-align:center; margin-bottom:16px;\">" +
		"<img src=\"" + baseURL + "/img/logo/register_logo.ico\" alt=\"WebCrystal\" style=\"width:96px;height:96px;image-rendering:pixelated;\"/>" +
		"</div>" +
		"<div style=\"text-align:center; font-size:16px; margin-bottom:12px;\">" + body + "</div>" +
		"</body></html>"

	msg := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n\r\n" +
		bodyHTML + "\r\n"

	return smtp.SendMail(addr, auth, user, []string{to}, []byte(msg))
}

func GenerateEmailCode() string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	buf := make([]byte, 8)
	_, _ = rand.Read(buf)
	out := make([]byte, 8)
	for i := range out {
		out[i] = letters[int(buf[i])%len(letters)]
	}
	return string(out)
}

func (d *DB) SaveEmailVerification(login, email, code string, expiresAt time.Time) error {
	login = strings.TrimSpace(login)
	email = strings.TrimSpace(email)
	code = strings.TrimSpace(code)
	if login == "" || email == "" || code == "" {
		return errors.New("missing fields")
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.sql.ExecContext(ctx, `
		INSERT INTO email_verifications (login, email, code, expires_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (login) DO UPDATE SET
			email = EXCLUDED.email,
			code = EXCLUDED.code,
			expires_at = EXCLUDED.expires_at
	`, login, email, code, expiresAt.UTC())
	return err
}

func (d *DB) VerifyEmailCode(login, code string) (string, bool, error) {
	login = strings.TrimSpace(login)
	code = strings.TrimSpace(code)
	if login == "" || code == "" {
		return "", false, nil
	}
	if d == nil || d.sql == nil {
		return "", false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	row := d.sql.QueryRowContext(ctx, `SELECT email, code, expires_at FROM email_verifications WHERE login = $1`, login)
	var email, storedCode string
	var exp time.Time
	if err := row.Scan(&email, &storedCode, &exp); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", false, nil
		}
		return "", false, err
	}

	if time.Now().After(exp) || storedCode == "" || subtle.ConstantTimeCompare([]byte(storedCode), []byte(code)) != 1 {
		return "", false, nil
	}
	return strings.TrimSpace(email), true, nil
}

func (d *DB) SetUserEmail(login, email string) error {
	login = strings.TrimSpace(login)
	email = strings.TrimSpace(email)
	if login == "" || email == "" {
		return errors.New("missing fields")
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tx, err := d.sql.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `UPDATE users SET email = $1, email_verified = TRUE WHERE login = $2`, email, login); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, `DELETE FROM email_verifications WHERE login = $1`, login); err != nil {
		return err
	}
	return tx.Commit()
}
