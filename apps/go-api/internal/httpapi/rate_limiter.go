package httpapi

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type rateLimiter struct {
	mu         sync.RWMutex
	userLimits map[string][]time.Time
	ipLimits   map[string][]time.Time 
}

var globalLimiter = &rateLimiter{
	userLimits: make(map[string][]time.Time),
	ipLimits:   make(map[string][]time.Time),
}

func (rl *rateLimiter) cleanup(key string, isUser bool) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	var m map[string][]time.Time
	if isUser {
		m = rl.userLimits
	} else {
		m = rl.ipLimits
	}

	if times, exists := m[key]; exists {
		now := time.Now()
		var valid []time.Time
		for _, t := range times {
			if now.Sub(t) < time.Minute*10 {
				valid = append(valid, t)
			}
		}
		m[key] = valid
	}
}

func (rl *rateLimiter) allow(key string, isUser bool, maxRequests int, window time.Duration) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	var m map[string][]time.Time
	if isUser {
		m = rl.userLimits
	} else {
		m = rl.ipLimits
	}

	now := time.Now()
	times := m[key]

	var valid []time.Time
	for _, t := range times {
		if now.Sub(t) < window {
			valid = append(valid, t)
		}
	}

	if len(valid) >= maxRequests {
		return false
	}

	valid = append(valid, now)
	m[key] = valid

	return true
}

func (s *Server) checkBuildRateLimit(login, clientIP string) error {
	if !globalLimiter.allow(login, true, 1, time.Minute) {
		return fmt.Errorf("build rate limit exceeded for user")
	}

	if !globalLimiter.allow(clientIP, false, 1, time.Minute*10) {
		return fmt.Errorf("build rate limit exceeded for IP")
	}

	globalLimiter.cleanup(login, true)
	rl := globalLimiter
	rl.mu.RLock()
	times := rl.userLimits[login]
	rl.mu.RUnlock()

	if len(times) > 0 {
		last := times[len(times)-1]
		if time.Since(last) < time.Second*40 {
			return fmt.Errorf("build cooldown active")
		}
	}

	return nil
}

func (s *Server) checkCompileConfigRateLimit(login, clientIP string) error {
	if !globalLimiter.allow(login, true, 10, time.Minute) {
		return fmt.Errorf("compile config rate limit exceeded for user")
	}

	if !globalLimiter.allow(clientIP, false, 50, time.Minute*10) {
		return fmt.Errorf("compile config rate limit exceeded for IP")
	}

	globalLimiter.cleanup(login, true)
	globalLimiter.cleanup(clientIP, false)
	return nil
}

func clientIPFromRequest(r *http.Request) string {
	clientIP := r.RemoteAddr
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		clientIP = strings.TrimSpace(strings.Split(forwarded, ",")[0])
	}
	if clientIP == "" {
		return "unknown"
	}
	if host, _, err := net.SplitHostPort(strings.TrimSpace(clientIP)); err == nil {
		if host != "" {
			return host
		}
	}
	return strings.TrimSpace(clientIP)
}

func (s *Server) requireBuildRateLimit(next handlerFunc) handlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
		if login == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		clientIP := clientIPFromRequest(r)

		if err := s.checkBuildRateLimit(login, clientIP); err != nil {
			s.writeJSON(w, http.StatusTooManyRequests, map[string]string{
				"error": err.Error(),
			})
			return
		}

		next(w, r)
	}
}

func (s *Server) requireCompileConfigRateLimit(next handlerFunc) handlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		login := strings.ToLower(strings.TrimSpace(loginFromContext(r)))
		if login == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		clientIP := clientIPFromRequest(r)
		if err := s.checkCompileConfigRateLimit(login, clientIP); err != nil {
			s.writeJSON(w, http.StatusTooManyRequests, map[string]string{
				"error": err.Error(),
			})
			return
		}

		next(w, r)
	}
}