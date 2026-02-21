package buildergen

import "strings"

func templateZoneCleanup() string {
	return strings.TrimSpace(`
func removeZoneIdentifier(path string) {
	if runtime.GOOS != "windows" {
		return
	}
	if strings.TrimSpace(path) == "" {
		return
	}
	adsPath := path + ":Zone.Identifier"
	ptr, err := syscall.UTF16PtrFromString(adsPath)
	if err != nil {
		return
	}
	_ = syscall.DeleteFile(ptr)
}
`)
}
