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
		RequesterId  string   `json:"requester_id"`
		AssigneeId   *string  `json:"assignee_id"`
		Picture      []string `json:"picture"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ticket := models.Ticket{
		Title:        input.Title,
		Category:     input.Category,
		Department:   input.Department,
		Priority:     input.Priority,
		RelatedAsset: input.RelatedAsset,
		Description:  input.Description,
		RequesterId:  userID,
		AssigneeId:   input.AssigneeId,
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
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tickets, err := repositories.GetTickets(r.Context(), h.DB)
	if err != nil {
		log.Println("Error fetching tickets:", err)
		http.Error(w, "Could not fetch tickets", http.StatusInternalServerError)
		return
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}
