package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateTicket(ctx context.Context, pool *pgxpool.Pool, ticket models.Ticket) (int, string, error) {
	query := `
		INSERT INTO tickets (title, category, department, priority, status, related_asset, description, requester_id, picture)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, reference;
		`
	var newID int
	var newRef string

	err := pool.QueryRow(
		ctx,
		query,
		ticket.Title,
		ticket.Category,
		ticket.Department,
		ticket.Priority,
		ticket.Status,
		ticket.RelatedAsset,
		ticket.Description,
		ticket.RequesterId,
		ticket.Picture,
	).Scan(&newID, &newRef)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to create ticket: %w", err)
	}

	return newID, newRef, nil
}

func GetTickets(ctx context.Context, pool *pgxpool.Pool) ([]models.Ticket, error) {
	query := `
		SELECT t.id, t.reference, t.title, t.category, t.department, t.priority, t.status, t.related_asset, t.description, t.requester_id, t.assignee_id, COALESCE(u.username, 'Unassigned') as assignee_name, t.picture, t.created_at, t.updated_at
		FROM tickets t
		LEFT JOIN users u ON t.assignee_id = u.id
		ORDER BY t.created_at ASC;
		`
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to query tickets: %w", err)
	}
	defer rows.Close()

	var tickets []models.Ticket
	for rows.Next() {
		var t models.Ticket
		err := rows.Scan(
			&t.ID,
			&t.Reference,
			&t.Title,
			&t.Category,
			&t.Department,
			&t.Priority,
			&t.Status,
			&t.RelatedAsset,
			&t.Description,
			&t.RequesterId,
			&t.AssigneeId,
			&t.AssigneeName,
			&t.Picture,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan ticket row, %w", err)
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func GetTicketsByRequester(ctx context.Context, pool *pgxpool.Pool, requesterID string) ([]models.Ticket, error) {
	query := `
		SELECT id, reference, title, category, department, priority, status, related_asset, description, requester_id, picture, created_at, updated_at
		FROM tickets
		WHERE requester_id = $1
		ORDER BY created_at ASC;
		`
	rows, err := pool.Query(ctx, query, requesterID)
	if err != nil {
		return nil, fmt.Errorf("Failed to query user tickets: %w", err)
	}
	defer rows.Close()

	var tickets []models.Ticket
	for rows.Next() {
		var t models.Ticket
		err := rows.Scan(
			&t.ID,
			&t.Reference,
			&t.Title,
			&t.Category,
			&t.Department,
			&t.Priority,
			&t.Status,
			&t.RelatedAsset,
			&t.Description,
			&t.RequesterId,
			&t.Picture,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan ticket row, %w", err)
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func GetRecentTickets(ctx context.Context, pool *pgxpool.Pool, requesterID string) ([]models.Ticket, error) {
	query := `
		SELECT id, reference, title, category, department, priority, status, related_asset, description, requester_id, picture, created_at, updated_at
		FROM tickets
		WHERE requester_id = $1
		ORDER BY created_at DESC
		LIMIT 3;
		`
	rows, err := pool.Query(ctx, query, requesterID)
	if err != nil {
		return nil, fmt.Errorf("Failed to query user recent tickets: %w", err)
	}
	defer rows.Close()

	var tickets []models.Ticket
	for rows.Next() {
		var t models.Ticket
		err := rows.Scan(
			&t.ID,
			&t.Reference,
			&t.Title,
			&t.Category,
			&t.Department,
			&t.Priority,
			&t.Status,
			&t.RelatedAsset,
			&t.Description,
			&t.RequesterId,
			&t.Picture,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan ticket row, %w", err)
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func ClaimTickets(ctx context.Context, pool *pgxpool.Pool, ticketID int, userID string) error {
	query := `
		UPDATE tickets
		SET assignee_id = $1,
			updated_at = CURRENT_TIMESTAMP,
			status = 'In Progress'
		WHERE id = $2;
	`
	commandTag, err := pool.Exec(ctx, query, userID, ticketID)
	if err != nil {
		return fmt.Errorf("Failed to claim ticket: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No ticket found with ID: %d", ticketID)
	}

	return nil
}

func ResolveTickets(ctx context.Context, pool *pgxpool.Pool, ticketID int) error {
	query := `
		UPDATE tickets
		SET status = 'Resolved'
		WHERE id = $1;
	`
	commandTag, err := pool.Exec(ctx, query, ticketID)
	if err != nil {
		return fmt.Errorf("Failed to resolve ticket: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No ticket found with ID: %d", ticketID)
	}

	return nil
}
