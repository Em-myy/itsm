package main

import (
	"fmt"
	"itsm/database"
	"itsm/routes"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on system environment variable")
	}

	pool, err := database.Connect()
	if err != nil {
		log.Fatal("Database connection failed: ", err)
	}
	defer pool.Close()

	fmt.Println("Connected to Postgres database")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ITSM backend is running")
	})

	router := routes.SetupRouter(pool)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server is running on port: %s\n", port)

	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal(err)
	}
}
