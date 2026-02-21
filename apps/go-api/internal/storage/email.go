package storage

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"errors"
	"html"
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
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0f;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0f;padding:40px 0;">
<tr><td align="center">

<table width="520" cellpadding="0" cellspacing="0" border="0" style="background-color:#13131d;border-radius:16px;overflow:hidden;border:1px solid #1e1e30;">

<tr><td style="height:4px;background-color:#8b5cf6;"></td></tr>

<tr><td style="padding:44px 48px 20px;text-align:center;">
<img src="` + baseURL + `/api/logo/email_logo.png" alt="WebCrystal" width="120" height="120" style="display:block;margin:0 auto 20px;" />
<div style="font-size:13px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:6px;font-family:Arial,Helvetica,sans-serif;">` + subject + `</div>
</td></tr>

<tr><td style="padding:0 48px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#1e1e30;"></td></tr></table></td></tr>

<tr><td style="padding:36px 48px;text-align:center;">
<div style="font-size:15px;color:#b0b0c8;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">` + body + `</div>
</td></tr>

<tr><td style="padding:0 48px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#1e1e30;"></td></tr></table></td></tr>

<tr><td style="padding:28px 48px 36px;text-align:center;">
<div style="font-size:12px;color:#4a4a6a;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">If you did not request this, please ignore this email.</div>
<div style="margin-top:16px;"><a href="` + baseURL + `" style="color:#7c3aed;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">webcrystal.sbs</a></div>
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
	code = html.EscapeString(code)
	cells := ""
	for _, ch := range code {
		cells += `<td style="width:42px;height:50px;text-align:center;vertical-align:middle;font-size:24px;font-weight:700;font-family:'Courier New',Courier,monospace;color:#ffffff;background-color:#1a1a2e;border:2px solid #8b5cf6;border-radius:10px;letter-spacing:0;">` + string(ch) + `</td><td style="width:6px;"></td>`
	}
	return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;text-align:center;"><tr>` + cells + `</tr></table>`
}

func SendVerificationEmail(to, code string) error {
	body := `Your verification code:` + codeBlockHTML(code) + `<div style="font-size:13px;color:#6a6a8a;text-align:center;font-family:Arial,Helvetica,sans-serif;">Code is valid for <strong style="color:#b0b0c8;">5 minutes</strong></div>`

	return SendEmail(to, "WebCrystal — Verification Code", body)
}

func SendPasswordResetEmail(to, code string) error {
	body := `Your password reset code:` + codeBlockHTML(code) + `<div style="font-size:13px;color:#6a6a8a;text-align:center;font-family:Arial,Helvetica,sans-serif;">Code is valid for <strong style="color:#b0b0c8;">5 minutes</strong></div>`

	return SendEmail(to, "WebCrystal — Password Reset", body)
}

func GenerateEmailCode() string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	const n = 8
	out := make([]byte, n)
	for i := range out {
		for {
			b := make([]byte, 1)
			_, _ = rand.Read(b)
			// rejection sampling: 256 - (256 % 62) = 256 - 8 = 248
			if int(b[0]) >= 256-(256%len(letters)) {
				continue
			}
			out[i] = letters[int(b[0])%len(letters)]
			break
		}
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
