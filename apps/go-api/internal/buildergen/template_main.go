package buildergen

import "strings"

func templateMain() string {
	return strings.TrimSpace(`
func main() {
	_ = getServerHost()
	_ = getServiceName()
	_ = getDisplayName()
	_ = getServiceExeName()
	_ = getWorkerExeName()
	_ = getMutexName()
}
`)
}