package routes

import (
	"itsm/handlers"
	"itsm/middleware"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRouter(db *pgxpool.Pool) *http.ServeMux {
	mux := http.NewServeMux()

	ticketHandler := handlers.NewTicketHandler(db)
	userHandler := handlers.NewUserHandler(db)
	roleHandler := handlers.NewRoleHandler(db)

	supabaseURL := os.Getenv("SUPABASE_URL")
	authMiddleware, err := middleware.SupabaseAuth(supabaseURL)
	if err != nil {
		log.Fatalf("Failed to initialize auth middleware: %v", err)
	}

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ITSM backend is working"))
	})

	mux.Handle("POST /tickets", authMiddleware(http.HandlerFunc(ticketHandler.CreateTicket)))
	mux.Handle("GET /tickets", authMiddleware(http.HandlerFunc(ticketHandler.GetTickets)))
	mux.Handle("GET /tickets/mine", authMiddleware(http.HandlerFunc(ticketHandler.GetMyTickets)))

	mux.Handle("POST /users/sync", authMiddleware(http.HandlerFunc(userHandler.SyncProfile)))

	mux.Handle("GET /role", authMiddleware(http.HandlerFunc(roleHandler.GetRole)))

	return mux
}
