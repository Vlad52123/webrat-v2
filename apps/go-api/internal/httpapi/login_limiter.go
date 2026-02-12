package httpapi

import (
	"sync"
	"time"
)

const (
	maxLoginAttempts   = 5
	loginLockoutWindow = 15 * time.Minute
)

type loginAttempt struct {
	count    int
	lastFail time.Time
}

type loginLimiter struct {
	mu       sync.Mutex
	attempts map[string]*loginAttempt
}

func newLoginLimiter() *loginLimiter {
	l := &loginLimiter{attempts: make(map[string]*loginAttempt)}
	go l.cleanup()
	return l
}

func (l *loginLimiter) isLocked(login string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	a, ok := l.attempts[login]
	if !ok {
		return false
	}
	if time.Since(a.lastFail) > loginLockoutWindow {
		delete(l.attempts, login)
		return false
	}
	return a.count >= maxLoginAttempts
}

func (l *loginLimiter) recordFail(login string) {
	l.mu.Lock()
	defer l.mu.Unlock()

	a, ok := l.attempts[login]
	if !ok || time.Since(a.lastFail) > loginLockoutWindow {
		l.attempts[login] = &loginAttempt{count: 1, lastFail: time.Now()}
		return
	}
	a.count++
	a.lastFail = time.Now()
}

func (l *loginLimiter) clearLogin(login string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.attempts, login)
}

func (l *loginLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		l.mu.Lock()
		now := time.Now()
		for k, a := range l.attempts {
			if now.Sub(a.lastFail) > loginLockoutWindow {
				delete(l.attempts, k)
			}
		}
		l.mu.Unlock()
	}
}
