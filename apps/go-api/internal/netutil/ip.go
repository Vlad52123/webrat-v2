package netutil

import (
	"net"
	"net/http"
	"os"
	"strings"
)

func GetClientIP(r *http.Request) string {
	if r == nil {
		return ""
	}

	parseIP := func(raw string) string {
		s := strings.TrimSpace(raw)
		if s == "" {
			return ""
		}
		s = strings.Trim(s, "[]")
		if h, _, err := net.SplitHostPort(s); err == nil {
			s = strings.TrimSpace(h)
			s = strings.Trim(s, "[]")
		}
		ip := net.ParseIP(s)
		if ip == nil {
			return ""
		}
		return ip.String()
	}

	trustProxy := strings.TrimSpace(os.Getenv("WEBRAT_TRUST_PROXY")) == "1"
	if trustProxy {
		if cfip := parseIP(r.Header.Get("CF-Connecting-IP")); cfip != "" {
			return cfip
		}
		if xff := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); xff != "" {
			parts := strings.Split(xff, ",")
			if len(parts) > 0 {
				if ip := parseIP(parts[0]); ip != "" {
					return ip
				}
			}
		}
		if xri := parseIP(r.Header.Get("X-Real-IP")); xri != "" {
			return xri
		}
	}

	if h, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr)); err == nil {
		if ip := parseIP(h); ip != "" {
			return ip
		}
	}
	if ip := parseIP(r.RemoteAddr); ip != "" {
		return ip
	}
	return ""
}