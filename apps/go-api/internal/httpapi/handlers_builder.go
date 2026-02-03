package httpapi

import (
	"net/http"
	"strings"

	"webrat-go-api/internal/auth"
)

func (s *Server) handleBuilderToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	tok, err := s.db.GetOrCreateBuilderToken(login, auth.NewSessionID)
	if err != nil {
		http.Error(w, "token error", http.StatusInternalServerError)
		return
	}

	s.writeJSON(w, http.StatusOK, map[string]string{"token": tok})
}
