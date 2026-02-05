package buildergen

import "strings"

func templateWallpaper() string {
	return strings.TrimSpace(`
func setWallpaper(imagePath string) {
	if runtime.GOOS != "windows" {
		return
	}
	absPath, err := filepath.Abs(imagePath)
	if err != nil {
		return
	}
	if absPath == "" {
		return
	}
	utf16Path, err := syscall.UTF16PtrFromString(absPath)
	if err != nil {
		return
	}
	user32 := syscall.NewLazyDLL(getUser32DLL())
	proc := user32.NewProc(getSystemParametersInfoWName())
	const (
		SPI_SETDESKWALLPAPER  = 0x0014
		SPIF_UPDATEINIFILE    = 0x01
		SPIF_SENDWININICHANGE = 0x02
	)
	_, _, _ = proc.Call(
		uintptr(SPI_SETDESKWALLPAPER),
		0,
		uintptr(unsafe.Pointer(utf16Path)),
		uintptr(SPIF_UPDATEINIFILE|SPIF_SENDWININICHANGE),
	)
}
`)
}
