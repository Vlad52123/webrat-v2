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

var allowedEmailDomains = map[string]bool{
	"gmail.com":       true,
	"googlemail.com":  true,
	"outlook.com":     true,
	"hotmail.com":     true,
	"live.com":        true,
	"msn.com":         true,
	"yahoo.com":       true,
	"yahoo.co.uk":     true,
	"yandex.ru":       true,
	"yandex.com":      true,
	"ya.ru":           true,
	"mail.ru":         true,
	"bk.ru":           true,
	"inbox.ru":        true,
	"list.ru":         true,
	"internet.ru":     true,
	"icloud.com":      true,
	"me.com":          true,
	"mac.com":         true,
	"proton.me":       true,
	"protonmail.com":  true,
	"protonmail.ch":   true,
	"aol.com":         true,
	"zoho.com":        true,
	"rambler.ru":      true,
	"ukr.net":         true,
}

func IsAllowedEmailDomain(email string) bool {
	email = strings.ToLower(strings.TrimSpace(email))
	parts := strings.SplitN(email, "@", 2)
	if len(parts) != 2 || parts[1] == "" {
		return false
	}
	return allowedEmailDomains[parts[1]]
}

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
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#08080c;font-family:'Inter','Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#08080c;padding:48px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#141420 0%,#0e0e18 100%);border:1px solid rgba(168,85,247,0.15);border-radius:24px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.04) inset,0 0 80px rgba(117,61,255,0.06);">
<tr><td style="height:3px;background:linear-gradient(90deg,rgba(108,92,231,0),#a855f7,rgba(108,92,231,0));"></td></tr>
<tr><td style="padding:40px 40px 24px;text-align:center;">
<div style="margin:0 auto 16px;">
<img src="` + baseURL + `/api/logo/email_logo.png" alt="WebCrystal" width="80" height="80" style="display:block;margin:0 auto;" />
</div>
<div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:5px;text-transform:uppercase;font-family:'Inter','Segoe UI',Arial,sans-serif;">WEBCRYSTAL</div>
<div style="font-size:11px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:4px;margin-top:8px;font-family:'Inter','Segoe UI',Arial,sans-serif;">` + subject + `</div>
</td></tr>
<tr><td style="padding:0 40px;">
<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,0.2),transparent);"></div>
</td></tr>
<tr><td style="padding:32px 40px;text-align:center;">
<div style="font-size:15px;color:rgba(255,255,255,0.7);margin-bottom:20px;line-height:1.7;font-family:'Inter','Segoe UI',Arial,sans-serif;">` + body + `</div>
</td></tr>
<tr><td style="padding:0 40px;">
<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);"></div>
</td></tr>
<tr><td style="padding:24px 40px 32px;text-align:center;">
<div style="font-size:11px;color:rgba(255,255,255,0.18);line-height:1.6;font-family:'Inter','Segoe UI',Arial,sans-serif;">If you did not request this, please ignore this email.</div>
<div style="margin-top:14px;font-size:10px;">
<a href="` + baseURL + `" style="color:rgba(168,85,247,0.5);text-decoration:none;letter-spacing:1px;font-family:'Inter','Segoe UI',Arial,sans-serif;">webcrystal.sbs</a>
</div>
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

func codeBlockHTML(code string) string {
	codeHTML := ""
	for _, ch := range code {
		codeHTML += `<span style="display:inline-block;width:38px;height:46px;line-height:46px;text-align:center;font-size:22px;font-weight:700;font-family:'Courier New',monospace;color:#fff;background:rgba(108,92,231,0.08);border:1px solid rgba(168,85,247,0.25);border-radius:10px;margin:0 3px;letter-spacing:0;">` + string(ch) + `</span>`
	}
	return `<div style="margin:20px 0;text-align:center;line-height:50px;">` + codeHTML + `</div>
<div style="margin:0 auto 16px;text-align:center;">
<div style="display:inline-block;padding:8px 20px;border-radius:10px;border:1px solid rgba(168,85,247,0.3);background:rgba(108,92,231,0.12);font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#fff;letter-spacing:6px;user-select:all;-webkit-user-select:all;">` + code + `</div>
</div>
<div style="font-size:11px;color:rgba(255,255,255,0.3);text-align:center;margin-bottom:12px;">tap code above to select &amp; copy</div>`
}

func SendVerificationEmail(to, code string) error {
	body := `Your verification code:
</div>` + codeBlockHTML(code) + `
<div style="font-size:13px;color:rgba(255,255,255,0.45);text-align:center;">
Code is valid for <strong style="color:rgba(255,255,255,0.7);">5 minutes</strong>`

	return SendEmail(to, "WebCrystal — Verification Code", body)
}

func SendPasswordResetEmail(to, code string) error {
	body := `Your password reset code:
</div>` + codeBlockHTML(code) + `
<div style="font-size:13px;color:rgba(255,255,255,0.45);text-align:center;">
Code is valid for <strong style="color:rgba(255,255,255,0.7);">5 minutes</strong>`

	return SendEmail(to, "WebCrystal — Password Reset", body)
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