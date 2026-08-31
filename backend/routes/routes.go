package routes

import (
	"itsm/handlers"
	"itsm/middleware"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRouter(db *pgxpool.Pool) http.Handler {
	mux := http.NewServeMux()

	ticketHandler := handlers.NewTicketHandler(db)
	userHandler := handlers.NewUserHandler(db)
	roleHandler := handlers.NewRoleHandler(db)
	bookingHandler := handlers.NewBookingHandler(db)
	venueHandler := handlers.NewVenueHandler(db)
	assetHandler := handlers.NewAssetHandler(db)

	supabaseURL := os.Getenv("SUPABASE_URL")
	authMiddleware, err := middleware.SupabaseAuth(supabaseURL, db)
	if err != nil {
		log.Fatalf("Failed to initialize auth middleware: %v", err)
	}

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ITSM backend is working"))
	})

	mux.Handle("POST /api/tickets", authMiddleware(http.HandlerFunc(ticketHandler.CreateTicket)))
	mux.Handle("GET /api/tickets", authMiddleware(http.HandlerFunc(ticketHandler.GetTickets)))
	mux.Handle("GET /api/tickets/mine", authMiddleware(http.HandlerFunc(ticketHandler.GetMyTickets)))
	mux.Handle("GET /api/tickets/recent", authMiddleware(http.HandlerFunc(ticketHandler.GetRecentTickets)))
	mux.Handle("PATCH /api/tickets/claim", authMiddleware(http.HandlerFunc(ticketHandler.ClaimTicket)))
	mux.Handle("PATCH /api/tickets/resolve", authMiddleware(http.HandlerFunc(ticketHandler.ResolveTicket)))

	mux.Handle("PATCH /api/users/profile", authMiddleware(http.HandlerFunc(userHandler.UpdateProfile)))
	mux.Handle("GET /api/role", authMiddleware(http.HandlerFunc(roleHandler.GetRole)))

	mux.Handle("POST /api/bookings", authMiddleware(http.HandlerFunc(bookingHandler.CreateBooking)))
	mux.Handle("GET /api/bookings", authMiddleware(http.HandlerFunc(bookingHandler.GetBookings)))
	mux.Handle("GET /api/bookings/mine", authMiddleware(http.HandlerFunc(bookingHandler.GetMyBooking)))
	mux.Handle("GET /api/bookings/next", authMiddleware(http.HandlerFunc(bookingHandler.GetNextBooking)))
	mux.Handle("PATCH /api/bookings/approve", authMiddleware(http.HandlerFunc(bookingHandler.ApproveBooking)))
	mux.Handle("PATCH /api/bookings/reject", authMiddleware(http.HandlerFunc(bookingHandler.RejectBooking)))

	mux.Handle("POST /api/bookings/check-availability", authMiddleware(http.HandlerFunc(bookingHandler.CheckAvailabilityHandler(db))))

	mux.Handle("POST /api/venues", authMiddleware(http.HandlerFunc(venueHandler.CreateVenue)))
	mux.Handle("GET /api/venues", authMiddleware(http.HandlerFunc(venueHandler.GetVenues)))

	mux.Handle("PATCH /api/venues/status", authMiddleware(http.HandlerFunc(venueHandler.UpdateVenueStatusHandler(db))))

	mux.Handle("POST /api/assets", authMiddleware(http.HandlerFunc(assetHandler.CreateAsset)))
	mux.Handle("GET /api/assets", authMiddleware(http.HandlerFunc(assetHandler.GetAssets)))

	return middleware.CorsMiddleware(mux)
}
