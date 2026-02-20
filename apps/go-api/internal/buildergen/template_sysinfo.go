package buildergen

import "strings"

func templateSysInfo() string {
	return strings.TrimSpace(`
func getUserName() string {
	if u, err := user.Current(); err == nil && u.Username != "" {
		name := u.Username
		if strings.Contains(name, "\\") {
			parts := strings.Split(name, "\\")
			name = parts[len(parts)-1]
		}
		if strings.HasSuffix(name, "$") {
			if envUser := strings.TrimSpace(os.Getenv("USERNAME")); envUser != "" {
				name = envUser
			}
		}
		if strings.TrimSpace(name) != "" {
			return name
		}
	}

	if envUser := strings.TrimSpace(os.Getenv("USERNAME")); envUser != "" {
		return envUser
	}
	return "unknown"
}

func getPublicIP() string {
	url := getIpifyURL()
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	ip, _ := io.ReadAll(resp.Body)
	return string(ip)
}

func getCountryByIP(ip string) string {
	scheme := "http"
	host := getIpApiHost()
	path := getIpApiPath()
	query := getIpApiQuery()
	url := scheme + "://" + host + path + ip + query
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return getCountryFallback()
	}
	defer resp.Body.Close()
	var data map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&data)
	if cc, ok := data["countryCode"].(string); ok {
		cc = strings.TrimSpace(cc)
		if cc != "" {
			return cc
		}
	}
	return getCountryFallback()
}
`)
}
