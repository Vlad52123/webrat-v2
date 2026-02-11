package storage

import (
	"strings"
	"time"
)

type victimScanner interface {
	Scan(dest ...any) error
}

func scanVictimRow(sc victimScanner) (*Victim, error) {
	var v Victim
	var lastActive int64

	if err := sc.Scan(
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

	return &v, nil
}

const victimColumns = `
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
`
