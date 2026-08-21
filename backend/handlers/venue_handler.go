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

type VenueHandler struct {
	DB *pgxpool.Pool
}

func NewVenueHandler(db *pgxpool.Pool) *VenueHandler {
	return &VenueHandler{DB: db}
}

func (h *VenueHandler) CreateVenue(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		Name       string    `json:"name"`
		Capacity   int       `json:"capacity"`
		Status     string    `json:"status"`
		Equipments []string  `json:"equipments"`
		CreatedAt  time.Time `json:"created_at"`
		UpdatedAt  time.Time `json:"updated_at"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
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
