package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateVenue(ctx context.Context, pool *pgxpool.Pool, venue models.Venue) (int, string, error) {
	query := `
		INSERT INTO venues (name, capacity, status, equipments)
		VALUES ($1, $2, $3, $4)
		RETURNING id, reference;
	`
	var newId int
	var newRef string

	err := pool.QueryRow(
		ctx,
		query,
		venue.Name,
		venue.Capacity,
		venue.Status,
		venue.Equipments,
	).Scan(&newId, &newRef)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to create new venue: %w", err)
	}

	return newId, newRef, nil
}

func GetVenues(ctx context.Context, pool *pgxpool.Pool) ([]models.Venue, error) {
	query := `
		SELECT id, reference, name, capacity, status, equipments, created_at, updated_at
		FROM venues
		ORDER BY created_at ASC
	`
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to get venues: %w", err)
	}
	defer rows.Close()

	var venues []models.Venue
	for rows.Next() {
		var v models.Venue
		err := rows.Scan(
			&v.ID,
			&v.Reference,
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

	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("Error iteration over venues: %w", err)
	}

	return venues, nil
}

func UpdateVenue(
	ctx context.Context,
	pool *pgxpool.Pool,
	venueID int,
	name *string,
	capacity *int,
	status *string,
	equipments *[]string,
) error {
	query := `
		UPDATE venues
		SET
			name = COALESCE($1, name),
            capacity = COALESCE($2, capacity),
            status = COALESCE($3, status),
            equipments = COALESCE($4, equipments),
            updated_at = NOW()
		WHERE id = $5;
	`

	commandTag, err := pool.Exec(
		ctx,
		query,
		name,
		capacity,
		status,
		equipments,
		venueID,
	)

	if err != nil {
		return fmt.Errorf("Failed to update venue: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No venue found with ID: %d", venueID)
	}

	return nil
}

func CancelVenue(ctx context.Context, pool *pgxpool.Pool, venueID int) error {
	query := `
			UPDATE venues
			SET
				status = 'Retired',
				updated_at = NOW()
			WHERE id = $1;
		`

	commandTag, err := pool.Exec(ctx, query, venueID)
	if err != nil {
		return fmt.Errorf("Failed to cancel venue: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No venue found with ID: %d", venueID)
	}

	return nil
}
