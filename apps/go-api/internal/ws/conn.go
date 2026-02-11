package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

func (h *Hub) getConnMutex(c *websocket.Conn) *sync.Mutex {
	if c == nil {
		return &sync.Mutex{}
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

func (h *Hub) removeConn(ws *websocket.Conn) {
	h.connMu.Lock()
	delete(h.connWrite, ws)
	h.connMu.Unlock()
}