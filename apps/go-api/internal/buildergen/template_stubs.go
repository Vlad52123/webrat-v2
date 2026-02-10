package buildergen

import "strings"

func templateStubs() string {
	return strings.TrimSpace(`
func addSelfToExclusions(path string) {
	// TODO: port full implementation
	_ = path
}
`)
}