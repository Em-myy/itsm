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
		AssetType    string     `json:"asset_type"`
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

	if input.AssetType == "" || input.Department == "" {
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
		AssetType:    input.AssetType,
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

func (h *AssetHandler) UpdateAsset(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value(middleware.UserRoleKey).(string)

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	isAdmin := (role == "IT Admin")

	if !isAdmin {
		http.Error(w, "Forbidden: Only IT Admins can update assets", http.StatusForbidden)
		return
	}

	var input struct {
		AssetID      int     `json:"asset_id"`
		AssetType    *string `json:"asset_type"`
		Department   *string `json:"department"`
		Status       *string `json:"status"`
		LastServiced *string `json:"last_serviced"`
		Notes        *string `json:"notes"`
		AssigneeName *string `json:"assignee_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.AssetID == 0 {
		http.Error(w, "Asset id is required", http.StatusBadRequest)
		return
	}

	if input.AssetType == nil &&
		input.Department == nil &&
		input.Status == nil &&
		input.LastServiced == nil &&
		input.Notes == nil &&
		input.AssigneeName == nil {
		http.Error(w, "No fields provided for update", http.StatusBadRequest)
		return
	}

	if input.AssetType != nil && *input.AssetType == "" {
		http.Error(w, "Asset type cannot be empty", http.StatusBadRequest)
		return
	}

	err := repositories.UpdateAsset(
		r.Context(),
		h.DB,
		input.AssetID,
		userID,
		input.AssetType,
		input.Department,
		input.Status,
		input.AssigneeName,
		input.LastServiced,
		input.Notes,
	)

	if err != nil {
		log.Println("Error updating asset:", err)
		http.Error(w, "Could not update asset", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Asset updated successfully",
	})
}

func (h *AssetHandler) CancelAsset(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value(middleware.UserRoleKey).(string)

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	isAdmin := (role == "IT Admin")
	if !isAdmin {
		http.Error(w, "Forbidden: Only IT Admins can cancel assets", http.StatusForbidden)
		return
	}

	var input struct {
		AssetID int `json:"asset_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.AssetID == 0 {
		http.Error(w, "Asset ID is required", http.StatusBadRequest)
		return
	}

	err := repositories.CancelAsset(r.Context(), h.DB, input.AssetID, userID)
	if err != nil {
		log.Println("Error cancelling asset:", err)
		http.Error(w, "Asset not found or not authorized to cancel", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Asset cancelled successfully",
	})
}
