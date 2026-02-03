package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

type CompileJob struct {
	ID         string    `json:"id"`
	Login      string    `json:"login"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	StartedAt  time.Time `json:"started_at"`
	FinishedAt time.Time `json:"finished_at"`
	Name       string    `json:"name"`
	Password   string    `json:"password"`
	ForceAdmin string    `json:"forceAdmin"`
	Error      string    `json:"error"`
	Filename   string    `json:"filename"`
}

func (d *DB) CreateCompileJob(id, login, code, name, password string, icon []byte, forceAdmin string) error {
	id = strings.TrimSpace(id)
	login = strings.TrimSpace(login)
	if id == "" || login == "" {
		return errors.New("empty id or login")
	}
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.SQL().ExecContext(ctx, `
		INSERT INTO compile_jobs(id, login, status, code, name, password, icon, force_admin)
		VALUES ($1,$2,'pending',$3,$4,$5,$6,$7)
	`, id, login, code, name, password, icon, forceAdmin)
	return err
}

func (d *DB) GetCompileJob(id, login string) (CompileJob, bool, error) {
	id = strings.TrimSpace(id)
	login = strings.TrimSpace(login)
	if id == "" || login == "" {
		return CompileJob{}, false, nil
	}
	if d == nil || d.SQL() == nil {
		return CompileJob{}, false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var j CompileJob
	var started sql.NullTime
	var finished sql.NullTime

	row := d.SQL().QueryRowContext(ctx, `
		SELECT id, login, status, created_at, updated_at, started_at, finished_at,
		COALESCE(name,''), COALESCE(password,''), COALESCE(force_admin,''), COALESCE(error,''), COALESCE(filename,'')
		FROM compile_jobs WHERE id=$1 AND login=$2
	`, id, login)

	if err := row.Scan(&j.ID, &j.Login, &j.Status, &j.CreatedAt, &j.UpdatedAt, &started, &finished, &j.Name, &j.Password, &j.ForceAdmin, &j.Error, &j.Filename); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return CompileJob{}, false, nil
		}
		return CompileJob{}, false, err
	}

	if started.Valid {
		j.StartedAt = started.Time
	}
	if finished.Valid {
		j.FinishedAt = finished.Time
	}
	return j, true, nil
}

func (d *DB) GetCompileArtifact(id, login string) ([]byte, string, bool, error) {
	id = strings.TrimSpace(id)
	login = strings.TrimSpace(login)
	if id == "" || login == "" {
		return nil, "", false, nil
	}
	if d == nil || d.SQL() == nil {
		return nil, "", false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var data []byte
	var filename string
	var status string

	row := d.SQL().QueryRowContext(ctx, `SELECT COALESCE(artifact,'')::bytea, COALESCE(filename,''), status FROM compile_jobs WHERE id=$1 AND login=$2`, id, login)
	if err := row.Scan(&data, &filename, &status); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", false, nil
		}
		return nil, "", false, err
	}

	if status != "done" || len(data) == 0 {
		return nil, "", false, nil
	}
	if filename == "" {
		filename = "build.zip"
	}
	return data, filename, true, nil
}

func (d *DB) HasActiveCompileJob(login string) (bool, error) {
	login = strings.TrimSpace(login)
	if login == "" {
		return false, nil
	}
	if d == nil || d.SQL() == nil {
		return false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var n int
	row := d.SQL().QueryRowContext(ctx, `SELECT COUNT(1) FROM compile_jobs WHERE login=$1 AND status IN ('pending','running')`, login)
	if err := row.Scan(&n); err != nil {
		return false, err
	}
	return n > 0, nil
}

type WorkerJob struct {
	ID         string
	Login      string
	Code       string
	Name       string
	Password   string
	Icon       []byte
	ForceAdmin string
}

func (d *DB) ClaimNextCompileJob() (WorkerJob, bool, error) {
	if d == nil || d.SQL() == nil {
		return WorkerJob{}, false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	tx, err := d.SQL().BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
	if err != nil {
		return WorkerJob{}, false, err
	}
	defer tx.Rollback()

	var j WorkerJob
	row := tx.QueryRowContext(ctx, `
		SELECT id, login, code, COALESCE(name,''), COALESCE(password,''), COALESCE(icon,'')::bytea, COALESCE(force_admin,'')
		FROM compile_jobs
		WHERE status='pending'
		ORDER BY created_at ASC
		FOR UPDATE SKIP LOCKED
		LIMIT 1
	`)
	if err := row.Scan(&j.ID, &j.Login, &j.Code, &j.Name, &j.Password, &j.Icon, &j.ForceAdmin); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return WorkerJob{}, false, tx.Commit()
		}
		return WorkerJob{}, false, err
	}

	if _, err := tx.ExecContext(ctx, `UPDATE compile_jobs SET status='running', started_at=NOW(), updated_at=NOW() WHERE id=$1`, j.ID); err != nil {
		return WorkerJob{}, false, err
	}
	if err := tx.Commit(); err != nil {
		return WorkerJob{}, false, err
	}
	return j, true, nil
}

func (d *DB) FinishCompileJob(id string, artifact []byte, filename string, errText string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("empty id")
	}
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}

	status := "done"
	if strings.TrimSpace(errText) != "" {
		status = "error"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_, err := d.SQL().ExecContext(ctx, `
		UPDATE compile_jobs
		SET status=$2, finished_at=NOW(), updated_at=NOW(), artifact=$3, filename=$4, error=$5
		WHERE id=$1
	`, id, status, artifact, filename, errText)
	return err
}
