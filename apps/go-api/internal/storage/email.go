package storage

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"errors"
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

	bodyHTML := `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0e;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0e;padding:40px 0;">
<tr><td align="center">
<table width="460" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,rgba(24,24,32,0.98),rgba(16,16,22,0.98));border:1px solid rgba(255,255,255,0.12);border-radius:20px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.06) inset;">
<tr><td style="padding:32px 36px 20px;text-align:center;">
<img src="` + baseURL + `/img/logo/register_logo.ico" alt="WebCrystal" width="72" height="72" style="image-rendering:pixelated;display:block;margin:0 auto 16px;" />
<div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.5px;margin-bottom:4px;">WebCrystal</div>
<div style="font-size:12px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:2px;">Email Verification</div>
</td></tr>
<tr><td style="padding:0 36px;">
<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);"></div>
</td></tr>
<tr><td style="padding:24px 36px;text-align:center;">
<div style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:20px;line-height:1.5;">` + body + `</div>
</td></tr>
<tr><td style="padding:0 36px 32px;text-align:center;">
<div style="font-size:11px;color:rgba(255,255,255,0.25);line-height:1.4;">If you did not request this, please ignore this email.</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

	msg := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n\r\n" +
		bodyHTML + "\r\n"

	return smtp.SendMail(addr, auth, user, []string{to}, []byte(msg))
}

func SendVerificationEmail(to, code string) error {
	codeHTML := ""
	for _, ch := range code {
		codeHTML += `<span style="display:inline-block;width:36px;height:44px;line-height:44px;text-align:center;font-size:22px;font-weight:700;font-family:'Courier New',monospace;color:#fff;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);border-radius:8px;margin:0 2px;letter-spacing:0;">` + string(ch) + `</span>`
	}

	body := `Your verification code:
</div>
<div style="margin:20px 0;text-align:center;line-height:50px;">` + codeHTML + `</div>
<div style="font-size:13px;color:rgba(255,255,255,0.45);text-align:center;">
Code is valid for <strong style="color:rgba(255,255,255,0.7);">5 minutes</strong>`

	return SendEmail(to, "WebCrystal — Verification Code", body)
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

func (d *DB) UnsetUserEmail(login string) error {
	login = strings.TrimSpace(login)
	if login == "" {
		return errors.New("missing login")
	}
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.sql.ExecContext(ctx, `UPDATE users SET email = '', email_verified = FALSE WHERE login = $1`, login)
	return err
}
