package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateBooking(ctx context.Context, pool *pgxpool.Pool, booking models.Booking) (int, error) {
	query := `
		INSERT INTO bookings (user_id, purpose, venue_id, start_time, end_time, equipment_needed, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id;
	`
	var newId int

	err := pool.QueryRow(
		ctx,
		query,
		booking.UserId,
		booking.Purpose,
		booking.VenueID,
		booking.StartTime,
		booking.EndTime,
		booking.EquipmentNeeded,
		booking.Status,
	).Scan(&newId)
	if err != nil {
		return 0, fmt.Errorf("Failed to create new booking: %w", err)
	}
	return newId, nil
}

func GetBookings(ctx context.Context, pool *pgxpool.Pool) ([]models.Booking, error) {
	query := `
		SELECT b.id, b.user_id, b.purpose, b.venue_id, v.name as venue_name, b.start_time, b.end_time, b.equipment_needed, b.status, b.created_at, b.updated_at
		FROM bookings b
		JOIN venues v ON b.venue_id = v.id
		ORDER BY b.start_time ASC;
	`
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to query bookings: %w", err)
	}
	defer rows.Close()

	var bookings []models.Booking
	for rows.Next() {
		var b models.Booking
		err := rows.Scan(
			&b.ID,
			&b.UserId,
			&b.Purpose,
			&b.VenueID,
			&b.VenueName,
			&b.StartTime,
			&b.EndTime,
			&b.EquipmentNeeded,
			&b.Status,
			&b.CreatedAt,
			&b.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan bookings row: %w", err)
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

func GetBookingByRequester(ctx context.Context, pool *pgxpool.Pool, userId string) ([]models.Booking, error) {
	query := `
		SELECT b.id, b.user_id, b.purpose, b.venue_id, v.name as venue_name, b.start_time, b.end_time, b.equipment_needed, b.status, b.created_at, b.updated_at
		FROM bookings b
		JOIN venues v ON b.venue_id = v.id
		WHERE b.user_id = $1
		ORDER BY b.start_time ASC;
	`
	rows, err := pool.Query(ctx, query, userId)
	if err != nil {
		return nil, fmt.Errorf("Failed to query user bookings: %w", err)
	}
	defer rows.Close()

	var bookings []models.Booking
	for rows.Next() {
		var b models.Booking
		err := rows.Scan(
			&b.ID,
			&b.UserId,
			&b.Purpose,
			&b.VenueID,
			&b.VenueName,
			&b.StartTime,
			&b.EndTime,
			&b.EquipmentNeeded,
			&b.Status,
			&b.CreatedAt,
			&b.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan bookings row: %w", err)
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}
