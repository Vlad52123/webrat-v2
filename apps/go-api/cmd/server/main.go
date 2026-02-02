package main

import (
	"log"
	"net/http"
	"os"

	"webrat-go-api/internal/app"
)

func main() {
	addr := os.Getenv("GO_API_ADDR")
	if addr == "" {
		addr = ":8081"
	}

	a, err := app.New()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("go-api listening on", addr)
	log.Fatal(http.ListenAndServe(addr, a.Router()))
}
