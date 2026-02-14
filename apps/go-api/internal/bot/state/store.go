package state

import (
	"sync"
	"time"
)

type Store struct {
	mu                 sync.Mutex
	lastDepositAction  map[int64]time.Time
	pendingDepositProv map[int64]string
	awaitingDepositAmt map[int64]bool
}

func NewStore() *Store {
	return &Store{
		lastDepositAction:  make(map[int64]time.Time),
		pendingDepositProv: make(map[int64]string),
		awaitingDepositAmt: make(map[int64]bool),
	}
}

func (s *Store) ThrottleDepositAction(userID int64, window time.Duration) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if t, ok := s.lastDepositAction[userID]; ok {
		if time.Since(t) < window {
			return true
		}
	}

	s.lastDepositAction[userID] = time.Now()
	return false
}

func (s *Store) SetPendingProvider(userID int64, prov string) {
	s.mu.Lock()
	s.pendingDepositProv[userID] = prov
	s.mu.Unlock()
}

func (s *Store) GetPendingProvider(userID int64) (string, bool) {
	s.mu.Lock()
	prov, ok := s.pendingDepositProv[userID]
	s.mu.Unlock()
	return prov, ok
}

func (s *Store) ClearPendingProvider(userID int64) {
	s.mu.Lock()
	delete(s.pendingDepositProv, userID)
	s.mu.Unlock()
}

func (s *Store) SetAwaitingDepositAmount(userID int64, v bool) {
	s.mu.Lock()
	if v {
		s.awaitingDepositAmt[userID] = true
	} else {
		delete(s.awaitingDepositAmt, userID)
	}
	s.mu.Unlock()
}

func (s *Store) IsAwaitingDepositAmount(userID int64) bool {
	s.mu.Lock()
	v := s.awaitingDepositAmt[userID]
	s.mu.Unlock()
	return v
}

func (s *Store) ClearPendingIfCallbackNotDeposit(userID int64, callbackData string) {
	if len(callbackData) >= len("deposit_create:") && callbackData[:len("deposit_create:")] == "deposit_create:" {
		return
	}
	s.ClearPendingProvider(userID)
	s.SetAwaitingDepositAmount(userID, false)
}