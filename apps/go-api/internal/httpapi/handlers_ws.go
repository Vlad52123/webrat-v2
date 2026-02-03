package httpapi

import (
	"net/http"

	"webrat-go-api/internal/ws"
)

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	if s == nil || s.wsHub == nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}
	s.wsHub.HandleHTTP(w, r)
}

func wrapWS(h *ws.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h == nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		h.HandleHTTP(w, r)
	}
}
