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

func (d *DB) SQL() *sql.DB {
	if d == nil {
		return nil
	}
	return d.sql
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