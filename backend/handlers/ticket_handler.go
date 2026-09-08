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

type TicketHandler struct {
	DB *pgxpool.Pool
}

func NewTicketHandler(db *pgxpool.Pool) *TicketHandler {
	return &TicketHandler{DB: db}
}

func (h *TicketHandler) CreateTicket(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		Title        string   `json:"title"`
		Category     string   `json:"category"`
		Department   string   `json:"department"`
		Priority     string   `json:"priority"`
		RelatedAsset string   `json:"related_asset"`
		Description  string   `json:"description"`
		Picture      []string `json:"picture"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Title == "" || input.Description == "" || input.Category == "" {
		http.Error(w, "Title, Category and Description are required", http.StatusBadRequest)
		return
	}

	ticket := models.Ticket{
		Title:        input.Title,
		Category:     input.Category,
		Department:   input.Department,
		Priority:     input.Priority,
		Status:       "Pending",
		RelatedAsset: input.RelatedAsset,
		Description:  input.Description,
		RequesterId:  userID,
		AssigneeId:   nil,
		Picture:      input.Picture,
	}

	id, ref, err := repositories.CreateTicket(r.Context(), h.DB, ticket)
	if err != nil {
		log.Println("Error creating ticket:", err)
		http.Error(w, "Could not create ticket", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Ticket created successfully",
		"ticket_id": id,
		"reference": ref,
	})
}

func (h *TicketHandler) GetTickets(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can view all tickets", http.StatusForbidden)
		return
	}

	tickets, err := repositories.GetTickets(r.Context(), h.DB)
	if err != nil {
		log.Println("Error fetching tickets:", err)
		http.Error(w, "Could not fetch tickets", http.StatusInternalServerError)
		return
	}

	if tickets == nil {
		tickets = []models.Ticket{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func (h *TicketHandler) GetMyTickets(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tickets, err := repositories.GetTicketsByRequester(r.Context(), h.DB, userID)
	if err != nil {
		log.Println("Error fetching tickets:", err)
		http.Error(w, "Could not fetch tickets", http.StatusInternalServerError)
		return
	}

	if tickets == nil {
		tickets = []models.Ticket{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func (h *TicketHandler) GetRecentTickets(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tickets, err := repositories.GetRecentTickets(r.Context(), h.DB, userID)
	if err != nil {
		log.Println("Error fetching recent tickets:", err)
		http.Error(w, "Could not fetch recent tickets", http.StatusInternalServerError)
		return
	}

	if tickets == nil {
		tickets = []models.Ticket{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func (h *TicketHandler) ClaimTicket(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can claim tickets", http.StatusForbidden)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		TicketID int `json:"ticket_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := repositories.ClaimTickets(r.Context(), h.DB, input.TicketID, userID)
	if err != nil {
		log.Println("Error claiming ticket:", err)
		http.Error(w, "Could not claim ticket", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Ticket claimed successfully",
	})
}

func (h *TicketHandler) ResolveTicket(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(string)
	if !ok || role != "IT Admin" {
		http.Error(w, "Forbidden. Only admins can view resolve tickets", http.StatusForbidden)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		TicketID int `json:"ticket_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := repositories.ResolveTickets(r.Context(), h.DB, input.TicketID, userID)
	if err != nil {
		log.Println("Error resolving ticket:", err)
		http.Error(w, "Could not resolve ticket", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Ticket resolved successfully",
	})
}

func (h *TicketHandler) UpdateTicket(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		TicketID     int       `json:"ticket_id"`
		Title        *string   `json:"title"`
		Category     *string   `json:"category"`
		Department   *string   `json:"department"`
		Priority     *string   `json:"priority"`
		RelatedAsset *string   `json:"related_asset"`
		Description  *string   `json:"description"`
		Picture      *[]string `json:"picture"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.TicketID == 0 {
		http.Error(w, "Ticket id is required", http.StatusBadRequest)
		return
	}

	if input.Title == nil &&
		input.Category == nil &&
		input.Department == nil &&
		input.Priority == nil &&
		input.RelatedAsset == nil &&
		input.Description == nil &&
		input.Picture == nil {
		http.Error(w, "No fields provided for update", http.StatusBadRequest)
		return
	}

	if input.Title != nil && *input.Title == "" {
		http.Error(w, "Title cannot be empty", http.StatusBadRequest)
		return
	}

	err := repositories.UpdateTicket(
		r.Context(),
		h.DB,
		input.TicketID,
		userID,
		input.Title,
		input.Category,
		input.Department,
		input.Priority,
		input.RelatedAsset,
		input.Description,
		input.Picture,
	)

	if err != nil {
		log.Println("Error updating ticket:", err)
		http.Error(w, "Could not update ticket", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Ticket updated successfully",
	})
}

func (h *TicketHandler) CancelTicket(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value(middleware.UserRoleKey).(string)

	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	isAdmin := (role == "IT Admin")

	var input struct {
		TicketID int `json:"ticket_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.TicketID == 0 {
		http.Error(w, "Ticket ID is required", http.StatusBadRequest)
		return
	}

	err := repositories.CancelTicket(r.Context(), h.DB, input.TicketID, userID, isAdmin)
	if err != nil {
		log.Println("Error cancelling ticket:", err)
		http.Error(w, "Ticket not found or not authorized to cancel", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Ticket cancelled successfully",
	})
}
