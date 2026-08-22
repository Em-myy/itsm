package handlers

import (
	"encoding/json"
	"itsm/middleware"
	"itsm/models"
	"itsm/repositories"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BookingHandler struct {
	DB *pgxpool.Pool
}

func NewBookingHandler(db *pgxpool.Pool) *BookingHandler {
	return &BookingHandler{DB: db}
}

func (h *BookingHandler) CreateBooking(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		UserId          string    `json:"user_id"`
		Purpose         string    `json:"purpose"`
		VenueID         int       `json:"venue_id"`
		StartTime       time.Time `json:"start_time"`
		EndTime         time.Time `json:"end_time"`
		EquipmentNeeded []string  `json:"equipment_needed"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	isAvailable, err := repositories.CheckVenueAvailability(
		r.Context(),
		h.DB,
		input.VenueID,
		input.StartTime,
		input.EndTime,
	)
	if err != nil {
		log.Println("Error checking availability:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if !isAvailable {
		http.Error(w, "This venue is already booked for the selected time.", http.StatusConflict)
		return
	}

	booking := models.Booking{
		UserId:          userID,
		Purpose:         input.Purpose,
		VenueID:         input.VenueID,
		StartTime:       input.StartTime,
		EndTime:         input.EndTime,
		EquipmentNeeded: input.EquipmentNeeded,
		Status:          "Pending",
	}

	id, err := repositories.CreateBooking(r.Context(), h.DB, booking)
	if err != nil {
		log.Println("Error creating booking:", err)
		http.Error(w, "Could not create booking", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Booking created successfully",
		"booking_id": id,
	})
}

func (h *BookingHandler) GetBookings(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	bookings, err := repositories.GetBookings(r.Context(), h.DB)
	if err != nil {
		log.Println("Error fetching booking:", err)
		http.Error(w, "Could not fetch booking", http.StatusInternalServerError)
		return
	}

	if bookings == nil {
		bookings = []models.Booking{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}

func (h *BookingHandler) GetMyBooking(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	bookings, err := repositories.GetBookingByRequester(r.Context(), h.DB, userID)
	if err != nil {
		log.Println("Error fetching booking:", err)
		http.Error(w, "Could not fetch booking", http.StatusInternalServerError)
		return
	}

	if bookings == nil {
		bookings = []models.Booking{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}
