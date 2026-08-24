package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateVenue(ctx context.Context, pool *pgxpool.Pool, venue models.Venue) (int, error) {
	query := `
		INSERT INTO venues (name, capacity, status, equipments)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	var newId int

	err := pool.QueryRow(
		ctx,
		query,
		venue.Name,
		venue.Capacity,
		venue.Status,
		venue.Equipments,
	).Scan(&newId)
	if err != nil {
		return 0, fmt.Errorf("Failed to create new venue: %w", err)
	}
	return newId, nil
}

func GetVenues(ctx context.Context, pool *pgxpool.Pool) ([]models.Venue, error) {
	query := `
		SELECT id, name, capacity, status, equipments, created_at, updated_at
		FROM venues
		ORDER BY created_at ASC
	`
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to query venues: %w", err)
	}
	defer rows.Close()

	var venues []models.Venue
	for rows.Next() {
		var v models.Venue
		err := rows.Scan(
			&v.ID,
			&v.Name,
			&v.Capacity,
			&v.Status,
			&v.Equipments,
			&v.CreatedAt,
			&v.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan venues row: %w", err)
		}
		venues = append(venues, v)
	}
	return venues, nil
}

func UpdateVenueStatus(ctx context.Context, pool *pgxpool.Pool, venueID int, newStatus string) error {
	query := `
		UPDATE venues
		SET status = $1
		WHERE id = $2
	`
	commandTag, err := pool.Exec(ctx, query, newStatus, venueID)
	if err != nil {
		return fmt.Errorf("Failed to update venue status: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No venue found with ID: %d", venueID)
	}

	return nil
}
