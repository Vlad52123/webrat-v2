package ws

import (
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

type tokenBucket struct {
	mu       sync.Mutex
	capacity float64
	tokens   float64
	rate     float64
	last     time.Time
}

func newTokenBucket(ratePerSec, burst float64) *tokenBucket {
	now := time.Now()
	return &tokenBucket{capacity: burst, tokens: burst, rate: ratePerSec, last: now}
}

func (b *tokenBucket) allow(n float64) bool {
	b.mu.Lock()
	defer b.mu.Unlock()
	now := time.Now()
	if !b.last.IsZero() {
		elapsed := now.Sub(b.last).Seconds()
		b.tokens += elapsed * b.rate
		if b.tokens > b.capacity {
			b.tokens = b.capacity
		}
	}
	b.last = now
	if b.tokens < n {
		return false
	}
	b.tokens -= n
	return true
}

type limiter struct {
	mu               sync.Mutex
	activeByIP       map[string]int
	msgBuckets       map[string]*tokenBucket
	registerBuckets  map[string]*tokenBucket
	lastPersistByKey map[string]time.Time
	maxKeys          int
}

func (l *limiter) ensure() {
	if l.activeByIP == nil {
		l.activeByIP = make(map[string]int)
		l.msgBuckets = make(map[string]*tokenBucket)
		l.registerBuckets = make(map[string]*tokenBucket)
		l.lastPersistByKey = make(map[string]time.Time)
		l.maxKeys = 20000
	}
}

func (l *limiter) allowUpgrade(ip string) bool {
	ip = strings.TrimSpace(ip)
	l.mu.Lock()
	defer l.mu.Unlock()
	l.ensure()

	if len(l.msgBuckets) > l.maxKeys {
		for k := range l.msgBuckets {
			delete(l.msgBuckets, k)
			break
		}
	}

	maxConnPerIP := 20
	if v := strings.TrimSpace(os.Getenv("WEBRAT_WS_MAX_CONN_PER_IP")); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			maxConnPerIP = n
		}
	}

	active := l.activeByIP[ip]
	if ip != "" && active >= maxConnPerIP {
		return false
	}
	l.activeByIP[ip]++
	return true
}

func (l *limiter) release(ip string) {
	ip = strings.TrimSpace(ip)
	if ip == "" {
		return
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	l.ensure()
	if l.activeByIP[ip] > 0 {
		l.activeByIP[ip]--
		if l.activeByIP[ip] <= 0 {
			delete(l.activeByIP, ip)
		}
	}
}

func (l *limiter) allowMessage(ip string) bool {
	ip = strings.TrimSpace(ip)
	if ip == "" {
		return true
	}
	l.mu.Lock()
	l.ensure()
	b := l.msgBuckets[ip]
	if b == nil {
		b = newTokenBucket(20.0, 40.0)
		l.msgBuckets[ip] = b
	}
	l.mu.Unlock()
	return b.allow(1)
}

func (l *limiter) allowRegister(ownerLogin, ip string) bool {
	ownerLogin = strings.TrimSpace(ownerLogin)
	if ownerLogin == "" {
		return false
	}
	key := ownerLogin
	if strings.TrimSpace(ip) != "" {
		key += "|" + strings.TrimSpace(ip)
	}

	rate := 0.2
	burst := 6.0
	if v := strings.TrimSpace(os.Getenv("WEBRAT_WS_REGISTER_RATE_PER_SEC")); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil && f > 0 {
			rate = f
		}
	}
	if v := strings.TrimSpace(os.Getenv("WEBRAT_WS_REGISTER_BURST")); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil && f > 0 {
			burst = f
		}
	}

	l.mu.Lock()
	l.ensure()
	if len(l.registerBuckets) > l.maxKeys {
		for k := range l.registerBuckets {
			delete(l.registerBuckets, k)
			break
		}
	}
	b := l.registerBuckets[key]
	if b == nil {
		b = newTokenBucket(rate, burst)
		l.registerBuckets[key] = b
	} else {
		b.capacity = burst
		b.rate = rate
	}
	l.mu.Unlock()

	return b.allow(1)
}

func (l *limiter) shouldPersist(id string, now time.Time) bool {
	id = strings.TrimSpace(id)
	if id == "" {
		return false
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	l.ensure()
	last := l.lastPersistByKey[id]
	if !last.IsZero() && now.Sub(last) < 25*time.Second {
		return false
	}
	l.lastPersistByKey[id] = now
	if len(l.lastPersistByKey) > l.maxKeys {
		for k := range l.lastPersistByKey {
			delete(l.lastPersistByKey, k)
			break
		}
	}
	return true
}
