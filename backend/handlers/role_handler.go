package handlers

import (
	"encoding/json"
	"itsm/middleware"
	"itsm/repositories"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RoleHandler struct {
	DB *pgxpool.Pool
}

func NewRoleHandler(db *pgxpool.Pool) *RoleHandler {
	return &RoleHandler{DB: db}
}

func (h *RoleHandler) GetRole(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized: No valid user ID found", http.StatusUnauthorized)
		return
	}

	role, err := repositories.GetRole(r.Context(), h.DB, userID)
	if err != nil {
		http.Error(w, "Role not found for user", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(role)
}
