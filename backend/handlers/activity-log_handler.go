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

type ActivityHandler struct {
	DB *pgxpool.Pool
}

func NewActivityHandler(db *pgxpool.Pool) *ActivityHandler {
	return &ActivityHandler{DB: db}
}

func (h *ActivityHandler) GetActivityFeed(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can read activity logs", http.StatusForbidden)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	logs, err := repositories.GetRecentActivity(r.Context(), h.DB)
	if err != nil {
		log.Println("Error fetching activity feed:", err)
		http.Error(w, "Failed to fetch activity feed", http.StatusInternalServerError)
		return
	}

	if logs == nil {
		logs = []models.ActivityLog{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}
