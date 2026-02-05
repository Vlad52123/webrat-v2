package buildergen

import "strings"

func Generate(cfg Config) (string, error) {
	globals, err := templateGlobals(cfg)
	if err != nil {
		return "", err
	}

	parts := []string{
		templateHeader(),
		"",
		globals,
		"",
		templateHelpers(),
		"",
		templateWS(),
		"",
		templateAdmin(),
		"",
		templateRuntime(),
		"",
		templateProcess(),
		"",
		templateInstall(cfg),
		"",
		templateInstallOps(cfg),
		"",
		templateInstallFlow(),
		"",
		templateConsole(),
		"",
		templateSysInfo(),
		"",
		templateDeviceInfo(),
		"",
		templateWallpaper(),
		"",
		templateDownload(),
		"",
		templateCommands(),
		"",
		templateRemoteDesktop(),
		"",
		templateNet(),
		"",
		templateConnect(),
		"",
		templateMisc(cfg),
		"",
		templateMainFlow(),
	}

	return strings.TrimSpace(strings.Join(parts, "\n")) + "\n", nil
}