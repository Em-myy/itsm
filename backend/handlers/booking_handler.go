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

type AvailabilityRequest struct {
	VenueID   int       `json:"venue_id"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
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

	if input.Purpose == "" || input.VenueID == 0 {
		http.Error(w, "Purpose and venue are required", http.StatusBadRequest)
		return
	}

	if !input.StartTime.Before(input.EndTime) {
		http.Error(w, "End time must be after start time", http.StatusBadRequest)
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
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can view all bookings", http.StatusForbidden)
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

func (h *BookingHandler) CheckAvailabilityHandler(pool *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req AvailabilityRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		isAvailable, err := repositories.CheckVenueAvailability(r.Context(), pool, req.VenueID, req.StartTime, req.EndTime)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{
			"available": isAvailable,
		})
	}
}
