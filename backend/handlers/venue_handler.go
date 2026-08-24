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
	role, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can create venues", http.StatusForbidden)
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

	venue := models.Venue{
		Name:       input.Name,
		Capacity:   input.Capacity,
		Status:     input.Status,
		Equipments: input.Equipments,
	}

	id, err := repositories.CreateVenue(r.Context(), h.DB, venue)
	if err != nil {
		log.Println("Error creating venue:", err)
		http.Error(w, "Could not create venue", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Venue created successfully",
		"venue_id": id,
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

func (h *VenueHandler) UpdateVenueStatusHandler(pool *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPatch {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		role, ok := r.Context().Value(middleware.UserRoleKey).(string)
		if !ok || role != "Admin" {
			http.Error(w, "Forbidden: Only admins can update venue status", http.StatusForbidden)
			return
		}

		var req UpdateVenueStatusRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		if req.Status == "" || req.VenueID == 0 {
			http.Error(w, "Missing venue_id or status", http.StatusBadRequest)
			return
		}

		err := repositories.UpdateVenueStatus(r.Context(), pool, req.VenueID, req.Status)
		if err != nil {
			http.Error(w, "Failed to update venue status", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Venue status updated successfully",
			"status":  req.Status,
		})
	}
}
