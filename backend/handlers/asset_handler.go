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

type AssetHandler struct {
	DB *pgxpool.Pool
}

func NewAssetHandler(db *pgxpool.Pool) *AssetHandler {
	return &AssetHandler{DB: db}
}

func (h *AssetHandler) CreateAsset(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can view all asset", http.StatusForbidden)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		Type         string     `json:"type"`
		Department   string     `json:"department"`
		Status       string     `json:"status"`
		LastServiced *time.Time `json:"last_serviced"`
		Notes        *string    `json:"notes"`
		AssigneeName string     `json:"assignee_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Type == "" || input.Department == "" {
		http.Error(w, "Type and department are required fields", http.StatusBadRequest)
		return
	}

	if input.Status == "" {
		input.Status = "Active"
	}

	if input.AssigneeName == "" {
		input.AssigneeName = "Shared"
	}

	asset := models.Asset{
		Type:         input.Type,
		Department:   input.Department,
		Status:       input.Status,
		LastServiced: input.LastServiced,
		Notes:        input.Notes,
		AssigneeName: input.AssigneeName,
	}

	id, ref, err := repositories.CreateAsset(r.Context(), h.DB, asset)
	if err != nil {
		log.Println("Error creating asset:", err)
		http.Error(w, "Could not create asset", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Asset created successfully",
		"asset_id":  id,
		"reference": ref,
	})
}

func (h *AssetHandler) GetAssets(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can view all assets", http.StatusForbidden)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	assets, err := repositories.GetAsset(r.Context(), h.DB)
	if err != nil {
		log.Println("Error fetching asset:", err)
		http.Error(w, "Could not fetch asset", http.StatusInternalServerError)
		return
	}

	if assets == nil {
		assets = []models.Asset{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assets)
}
