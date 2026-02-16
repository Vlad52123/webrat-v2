package httpapi

import (
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"webrat-go-api/internal/netutil"
)

type ipLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitorEntry
	rate     rate.Limit
	burst    int
}

type visitorEntry struct {
	lim  *rate.Limiter
	last time.Time
}

func newIPLimiter(r rate.Limit, burst int) *ipLimiter {
	l := &ipLimiter{
		visitors: make(map[string]*visitorEntry),
		rate:     r,
		burst:    burst,
	}
	go l.cleanup()
	return l
}

func (l *ipLimiter) allow(ip string) bool {
	l.mu.Lock()
	v, ok := l.visitors[ip]
	if !ok {
		v = &visitorEntry{lim: rate.NewLimiter(l.rate, l.burst)}
		l.visitors[ip] = v
	}
	v.last = time.Now()
	l.mu.Unlock()
	return v.lim.Allow()
}

func (l *ipLimiter) cleanup() {
	for {
		time.Sleep(3 * time.Minute)
		l.mu.Lock()
		cutoff := time.Now().Add(-5 * time.Minute)
		for ip, v := range l.visitors {
			if v.last.Before(cutoff) {
				delete(l.visitors, ip)
			}
		}
		l.mu.Unlock()
	}
}

func rateLimitMiddleware(lim *ipLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := netutil.GetClientIP(r)
			if !lim.allow(ip) {
				w.Header().Set("Retry-After", "10")
				w.WriteHeader(http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
