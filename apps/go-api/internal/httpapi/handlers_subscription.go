package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"webrat-go-api/internal/storage"
)

func (s *Server) handleGetSubscription(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	status, activatedAt, kind, err := s.db.GetSubscription(login)
	if err != nil {
		http.Error(w, "subscription error", http.StatusInternalServerError)
		return
	}

	resp := struct {
		Status      string `json:"status"`
		ActivatedAt any    `json:"activated_at"`
		Kind        string `json:"kind"`
	}{
		Status:      status,
		ActivatedAt: activatedAt,
		Kind:        kind,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

func (s *Server) handleActivateKey(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if !s.checkCSRF(w, r) {
		s.writeJSON(w, http.StatusForbidden, map[string]string{"error": "security_check_failed"})
		return
	}

	login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
	if login == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var body struct {
		Key string `json:"key"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}

	status, activatedAt, kind, err := s.db.ActivateSubscriptionKey(login, strings.TrimSpace(body.Key))
	if err != nil {
		switch {
		case errors.Is(err, storage.ErrKeyAlreadyActivated):
			http.Error(w, "key already activated", http.StatusConflict)
			return
		case errors.Is(err, storage.ErrKeyNotFound):
			http.Error(w, "invalid key", http.StatusBadRequest)
			return
		case errors.Is(err, storage.ErrAlreadyForever):
			http.Error(w, "subscription already forever", http.StatusLocked)
			return
		default:
			http.Error(w, "activation error", http.StatusInternalServerError)
			return
		}
	}

	resp := struct {
		Status      string `json:"status"`
		ActivatedAt any    `json:"activated_at"`
		Kind        string `json:"kind"`
	}{
		Status:      status,
		ActivatedAt: activatedAt,
		Kind:        kind,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}
