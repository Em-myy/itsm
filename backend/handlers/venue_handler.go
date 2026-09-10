package handlers

import (
	"encoding/json"
	"itsm/middleware"
	"itsm/models"
	"itsm/repositories"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type VenueHandler struct {
	DB *pgxpool.Pool
}

type UpdateVenueStatusRequest struct {
	VenueID int    `json:"venue_id"`
	Status  string `json:"status"`
}

func NewVenueHandler(db *pgxpool.Pool) *VenueHandler {
	return &VenueHandler{DB: db}
}

func (h *VenueHandler) CreateVenue(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can view all venues", http.StatusForbidden)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		Name       string   `json:"name"`
		Capacity   int      `json:"capacity"`
		Status     string   `json:"status"`
		Equipments []string `json:"equipments"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	if input.Name == "" || input.Capacity == 0 {
		http.Error(w, "Venue name is required and capacity must be greater than 0", http.StatusBadRequest)
		return
	}

	if input.Status == "" {
		input.Status = "Active"
	}

	venue := models.Venue{
		Name:       input.Name,
		Capacity:   input.Capacity,
		Status:     input.Status,
		Equipments: input.Equipments,
	}

	id, ref, err := repositories.CreateVenue(r.Context(), h.DB, venue)
	if err != nil {
		log.Println("Error creating venue:", err)
		http.Error(w, "Could not create venue", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Venue created successfully",
		"venue_id":  id,
		"reference": ref,
	})
}

func (h *VenueHandler) GetVenues(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	venues, err := repositories.GetVenues(r.Context(), h.DB)
	if err != nil {
		log.Println("Error fetching venue:", err)
		http.Error(w, "Could not fetch venue", http.StatusInternalServerError)
		return
	}

	if venues == nil {
		venues = []models.Venue{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(venues)
}

func (h *VenueHandler) UpdateVenue(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value(middleware.UserRoleKey).(string)

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	isAdmin := (role == "IT Admin")

	if !isAdmin {
		http.Error(w, "Forbidden: Only IT Admins can update venues", http.StatusForbidden)
		return
	}

	var input struct {
		VenueID    int       `json:"venue_id"`
		Name       *string   `json:"name"`
		Capacity   *int      `json:"capacity"`
		Status     *string   `json:"status"`
		Equipments *[]string `json:"equipments"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.VenueID == 0 {
		http.Error(w, "Venue id is required", http.StatusBadRequest)
		return
	}

	if input.Name == nil &&
		input.Capacity == nil &&
		input.Status == nil &&
		input.Equipments == nil {
		http.Error(w, "No fields provided for update", http.StatusBadRequest)
		return
	}

	err := repositories.UpdateVenue(
		r.Context(),
		h.DB,
		input.VenueID,
		input.Name,
		input.Capacity,
		input.Status,
		input.Equipments,
	)

	if err != nil {
		log.Println("Error updating venue:", err)
		http.Error(w, "Could not update venue", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Venue updated successfully",
	})
}

func (h *VenueHandler) CancelVenue(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value(middleware.UserRoleKey).(string)

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	isAdmin := (role == "IT Admin")
	if !isAdmin {
		http.Error(w, "Forbidden: Only IT Admins can cancel venues", http.StatusForbidden)
		return
	}

	var input struct {
		VenueID int `json:"venue_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.VenueID == 0 {
		http.Error(w, "Venue ID is required", http.StatusBadRequest)
		return
	}

	err := repositories.CancelVenue(r.Context(), h.DB, input.VenueID)
	if err != nil {
		log.Println("Error cancelling venue:", err)
		http.Error(w, "Venue not found or not authorized to cancel", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Venue cancelled successfully",
	})
}
