package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"webrat-go-api/internal/app"
)

func main() {
	addr := os.Getenv("GO_API_ADDR")
	if addr == "" {
		addr = ":3001"
	}

	a, err := app.New()
	if err != nil {
		log.Fatal(err)
	}

	srv := &http.Server{
		Addr:         addr,
		Handler:      a.Router(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Println("go-api listening on", addr)
	log.Fatal(srv.ListenAndServe())
}