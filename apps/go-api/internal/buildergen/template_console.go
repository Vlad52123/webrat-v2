package buildergen

import "strings"

func templateConsole() string {
	return strings.TrimSpace(`
func hideConsole() {
	if runtime.GOOS == "windows" {
		getConsoleWindow := syscall.NewLazyDLL(getKernel32DLL()).NewProc(getConsoleWindowName())
		showWindow := syscall.NewLazyDLL(getUser32DLL()).NewProc(getShowWindowName())

		hwnd, _, _ := getConsoleWindow.Call()
		if hwnd != 0 {
			showWindow.Call(hwnd, 0)
		}
	}
}
`)
}
