package handlers

import (
	"encoding/json"
	"itsm/middleware"
	"itsm/repositories"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserHandler struct {
	DB *pgxpool.Pool
}

func NewUserHandler(db *pgxpool.Pool) *UserHandler {
	return &UserHandler{DB: db}
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	role, _ := r.Context().Value(middleware.UserRoleKey).(string)

	var input struct {
		Username   *string `json:"username"`
		Department *string `json:"department"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if role == "IT Admin" && input.Department != nil {
		http.Error(w, "Admins cannot change their assigned department", http.StatusForbidden)
		return
	}

	err := repositories.UpdateUserProfile(r.Context(), h.DB, userID, input.Username, input.Department)
	if err != nil {
		log.Println("Error updating profile:", err)
		http.Error(w, "Could not update user profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "User profile updated successfully"})
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := repositories.GetUserProfile(r.Context(), h.DB, userID)
	if err != nil {
		log.Println("Error fetching user profile:", err)
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
