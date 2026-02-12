package buildergen

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
)

const xorKeyLen = 32
const xorChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

func escapeGoString(s string) string {
	if s == "" {
		return ""
	}
	replacer := strings.NewReplacer(
		"\\", "\\\\",
		"\"", "\\\"",
		"\r", "\\r",
		"\n", "\\n",
	)
	return replacer.Replace(s)
}

func generateXorKey() string {
	buf := make([]byte, xorKeyLen)
	if _, err := rand.Read(buf); err != nil {
		return hex.EncodeToString(buf)[:xorKeyLen]
	}

	var out strings.Builder
	out.Grow(xorKeyLen)
	for i := 0; i < xorKeyLen; i++ {
		out.WriteByte(xorChars[int(buf[i])%len(xorChars)])
	}
	return out.String()
}

func xorWithKey(s, key string) string {
	if s == "" || key == "" {
		return ""
	}
	parts := make([]string, 0, len(s))
	for i := 0; i < len(s); i++ {
		k := key[i%len(key)]
		b := s[i] ^ k
		parts = append(parts, "0x"+hex.EncodeToString([]byte{b}))
	}
	return strings.Join(parts, ", ")
}

func xorListWithKey(items []string, key string) string {
	joined := strings.Join(items, "\x00")
	return xorWithKey(joined, key)
}