package main

import (
	"fmt"
	"itsm/database"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env")
	}

	pool, err := database.Connect()

	if err != nil {
		log.Fatal("Database connection failed: ", err)
	}

	defer pool.Close()

	fmt.Println("Connected to postgres database")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ITSM backend is running")
	})

	fmt.Println("Server is running on http://localhost:8080")

	err = http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal(err)
	}
}
