package buildergen

import "strings"

func GenerateStub(cfg Config) (string, error) {
	_ = cfg

	return strings.TrimSpace(`package main

func main() {
}
`) + "\n", nil
}
