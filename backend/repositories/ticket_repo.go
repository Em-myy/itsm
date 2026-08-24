package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateTicket(ctx context.Context, pool *pgxpool.Pool, ticket models.Ticket) (int, string, error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	insertQuery := `
		INSERT INTO tickets (title, category, department, priority, related_asset, description, requester_id, picture)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
		`
	var newID int

	err = tx.QueryRow(
		ctx,
		insertQuery,
		ticket.Title,
		ticket.Category,
		ticket.Department,
		ticket.Priority,
		ticket.RelatedAsset,
		ticket.Description,
		ticket.RequesterId,
		ticket.Picture,
	).Scan(&newID)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to create ticket: %w", err)
	}

	updateQuery := `
		UPDATE tickets
		SET reference = 'TKT.' || TO_CHAR(created_at, 'YYYY') || '.' || TO_CHAR(id, 'FM000')
		WHERE id = $1
		RETURNING reference;
	`
	var newRef string

	err = tx.QueryRow(ctx, updateQuery, newID).Scan(&newRef)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to update ticket reference: %w", err)
	}

	if err = tx.Commit(ctx); err != nil {
		return 0, "", fmt.Errorf("Failed to commit transaction: %w", err)
	}

	return newID, newRef, nil
}

func GetTickets(ctx context.Context, pool *pgxpool.Pool) ([]models.Ticket, error) {
	query := `
		SELECT id, reference, title, category, department, priority, related_asset, description, requester_id, assignee_id, picture, created_at, updated_at
		FROM tickets
		ORDER BY created_at DESC;
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
			&t.RelatedAsset,
			&t.Description,
			&t.RequesterId,
			&t.AssigneeId,
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
		SELECT id, reference, title, category, department, priority, related_asset, description, requester_id, assignee_id, picture, created_at, updated_at
		FROM tickets
		WHERE requester_id = $1
		ORDER BY created_at DESC;
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
			&t.RelatedAsset,
			&t.Description,
			&t.RequesterId,
			&t.AssigneeId,
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
