package buildergen

import "strings"

func templateAdmin() string {
	return strings.TrimSpace(`
func isAdmin() bool {
	if runtime.GOOS != "windows" {
		return false
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	openProcessToken := advapi32.NewProc(getOpenProcessTokenName())
	getTokenInformation := advapi32.NewProc(getGetTokenInformationName())
	closeHandle := kernel32.NewProc(getCloseHandleName())

	const (
		tokenQuery          = 0x0008
		tokenElevationClass = 20
	)

	type tokenElevation struct {
		TokenIsElevated uint32
	}

	var hToken syscall.Handle
	currentProcess, _ := syscall.GetCurrentProcess()

	r1, _, _ := openProcessToken.Call(
		uintptr(currentProcess),
		uintptr(tokenQuery),
		uintptr(unsafe.Pointer(&hToken)),
	)
	if r1 == 0 {
		return false
	}
	defer closeHandle.Call(uintptr(hToken))

	var elevation tokenElevation
	var outLen uint32

	r1, _, _ = getTokenInformation.Call(
		uintptr(hToken),
		uintptr(tokenElevationClass),
		uintptr(unsafe.Pointer(&elevation)),
		uintptr(unsafe.Sizeof(elevation)),
		uintptr(unsafe.Pointer(&outLen)),
	)
	if r1 == 0 {
		return false
	}

	return elevation.TokenIsElevated != 0
}
`)
}