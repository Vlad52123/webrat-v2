package buildergen

import (
	"fmt"
	"strings"
)

func templateInstall(cfg Config) string {
	buildID := escapeGoString(strings.TrimSpace(cfg.BuildID))
	return strings.TrimSpace(fmt.Sprintf(`
func getAggressiveMarkerPath() string {
	dir := filepath.Join(os.Getenv(getProgramDataEnvName()), getWindowsUpdateDirName())
	if "%s" == "" {
		return filepath.Join(dir, "webrat_installed.flag")
	}
	return filepath.Join(dir, fmt.Sprintf("webrat_installed_%%s.flag", "%s"))
}

func isAggressiveAlreadyInstalled() bool {
	path := getAggressiveMarkerPath()
	if path == "" {
		return false
	}
	_, err := os.Stat(path)
	return err == nil
}

func markAggressiveInstalled() {
	path := getAggressiveMarkerPath()
	if path == "" {
		return
	}
	_ = os.MkdirAll(filepath.Dir(path), 0755)
	_ = os.WriteFile(path, []byte("ok"), 0644)
}
`, buildID, buildID))
}