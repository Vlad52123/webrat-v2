package httpapi

import (
	"net/http"
)

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	if s == nil || s.wsHub == nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}
	s.wsHub.HandleHTTP(w, r)
}
