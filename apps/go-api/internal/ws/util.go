package ws

import (
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"

	"webrat-go-api/internal/netutil"
	"webrat-go-api/internal/storage"
)

func strFrom(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return strings.TrimSpace(s)
	}
	return ""
}

func boolFrom(v any) bool {
	if v == nil {
		return false
	}
	if b, ok := v.(bool); ok {
		return b
	}
	return false
}

func isAllowedOrigin(r *http.Request) bool {
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	if origin == "" {
		return true
	}
	u, err := url.Parse(origin)
	if err != nil {
		return false
	}

	normalizeHost := func(raw string) string {
		h := strings.TrimSpace(raw)
		if h == "" {
			return ""
		}
		if hh, _, err := net.SplitHostPort(h); err == nil && strings.TrimSpace(hh) != "" {
			h = strings.TrimSpace(hh)
		} else {
			if i := strings.IndexByte(h, ':'); i > 0 {
				h = strings.TrimSpace(h[:i])
			}
		}
		return strings.TrimSpace(h)
	}

	host := normalizeHost(u.Host)
	if host == "" {
		return false
	}
	reqHost := normalizeHost(r.Host)

	allowed := strings.TrimSpace(os.Getenv("WEBRAT_ALLOWED_ORIGINS"))
	if allowed == "" {
		if strings.EqualFold(host, reqHost) {
			return true
		}
		parts := strings.Split(reqHost, ".")
		if len(parts) >= 2 {
			apex := parts[len(parts)-2] + "." + parts[len(parts)-1]
			if apex != "" {
				reqOk := strings.EqualFold(reqHost, apex) || strings.HasSuffix(strings.ToLower(reqHost), "."+strings.ToLower(apex))
				origOk := strings.EqualFold(host, apex) || strings.HasSuffix(strings.ToLower(host), "."+strings.ToLower(apex))
				return reqOk && origOk
			}
		}
		return false
	}

	matchAllowed := func(pattern, h string) bool {
		p := strings.TrimSpace(pattern)
		if p == "" || strings.TrimSpace(h) == "" {
			return false
		}
		hl := strings.ToLower(strings.TrimSpace(h))
		pl := strings.ToLower(p)
		if strings.EqualFold(pl, hl) {
			return true
		}
		if strings.HasPrefix(pl, "*.") {
			sfx := strings.TrimPrefix(pl, "*.")
			if sfx == "" {
				return false
			}
			return hl == sfx || strings.HasSuffix(hl, "."+sfx)
		}
		return false
	}

	for _, raw := range strings.Split(allowed, ",") {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			continue
		}
		a, err := url.Parse(raw)
		if err == nil && a.Host != "" {
			ah := normalizeHost(a.Host)
			if matchAllowed(ah, host) {
				return true
			}
			continue
		}
		if matchAllowed(raw, host) {
			return true
		}
	}
	return false
}

func getClientIP(r *http.Request) string {
	return netutil.GetClientIP(r)
}

func getPanelLogin(db *storage.DB, r *http.Request) string {
	if r == nil || db == nil {
		return ""
	}
	c, err := r.Cookie("webrat_session")
	if err != nil || c == nil {
		return ""
	}
	sid := strings.TrimSpace(c.Value)
	if sid == "" {
		return ""
	}
	login, ok, err := db.GetUserSessionLogin(sid)
	if err != nil || !ok {
		return ""
	}
	return strings.ToLower(strings.TrimSpace(login))
}
