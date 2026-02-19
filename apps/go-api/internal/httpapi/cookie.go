package httpapi

import (
	"net/http"
	"os"
	"strings"
	"time"
)

func setCookieWithDomain(w http.ResponseWriter, r *http.Request, name, value string, maxAge int, httpOnly bool, sameSite http.SameSite) {
	secure := os.Getenv("WEBRAT_SECURE_COOKIE") == "1" || (r != nil && r.TLS != nil)
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))

	if dom != "" {
		http.SetCookie(w, &http.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			HttpOnly: httpOnly,
			SameSite: sameSite,
			MaxAge:   -1,
			Secure:   secure,
		})
	}

	c := &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		HttpOnly: httpOnly,
		SameSite: sameSite,
		MaxAge:   maxAge,
		Secure:   secure,
	}
	if dom != "" {
		c.Domain = dom
	}
	http.SetCookie(w, c)
}

func deleteCookie(w http.ResponseWriter, r *http.Request, name string, httpOnly bool) {
	secure := os.Getenv("WEBRAT_SECURE_COOKIE") == "1" || (r != nil && r.TLS != nil)
	dom := strings.TrimSpace(os.Getenv("WEBRAT_COOKIE_DOMAIN"))

	if dom != "" {
		http.SetCookie(w, &http.Cookie{
			Name: name, Value: "", Path: "/",
			HttpOnly: httpOnly, SameSite: http.SameSiteStrictMode,
			MaxAge: -1, Domain: dom, Secure: secure,
		})
	}
	http.SetCookie(w, &http.Cookie{
		Name: name, Value: "", Path: "/",
		HttpOnly: httpOnly, SameSite: http.SameSiteStrictMode,
		MaxAge: -1, Secure: secure,
	})
}

const sessionCookieMaxAge = int((12 * time.Hour) / time.Second)
