package repositories

import (
	"context"
	"fmt"
	"itsm/models"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateBooking(ctx context.Context, pool *pgxpool.Pool, booking models.Booking) (int, string, error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	insertQuery := `
		INSERT INTO bookings (user_id, purpose, venue_id, start_time, end_time, equipment_needed, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id;
	`
	var newID int

	err = tx.QueryRow(
		ctx,
		insertQuery,
		booking.UserId,
		booking.Purpose,
		booking.VenueID,
		booking.StartTime,
		booking.EndTime,
		booking.EquipmentNeeded,
		booking.Status,
	).Scan(&newID)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to create new booking: %w", err)
	}

	updateQuery := `
		UPDATE bookings
		SET reference = 'BKG · ' || TO_CHAR(created_at, 'YYYY') || ' · ' || TO_CHAR(id, 'FM000')
		WHERE id = $1
		RETURNING reference;
	`
	var newRef string

	err = tx.QueryRow(ctx, updateQuery, newID).Scan(&newRef)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to update booking reference: %w", err)
	}

	if err = tx.Commit(ctx); err != nil {
		return 0, "", fmt.Errorf("Failed to commit transaction: %w", err)
	}

	return newID, newRef, nil
}

func GetBookings(ctx context.Context, pool *pgxpool.Pool) ([]models.Booking, error) {
	query := `
		SELECT 
			b.id, b.reference, b.user_id, 
			u.username, u.department,
			b.purpose, b.venue_id, v.name as venue_name, 
			b.start_time, b.end_time, b.equipment_needed, b.status, 
			b.created_at, b.updated_at
		FROM bookings b
		JOIN venues v ON b.venue_id = v.id
		LEFT JOIN users u ON b.user_id = u.id 
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
			&b.Reference,
			&b.UserId,
			&b.Username,
			&b.Department,
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
		SELECT b.id, b.reference, b.user_id, b.purpose, b.venue_id, v.name as venue_name, b.start_time, b.end_time, b.equipment_needed, b.status, b.created_at, b.updated_at
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
			&b.Reference,
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

func GetNextBooking(ctx context.Context, pool *pgxpool.Pool, userId string) (*models.Booking, error) {
	query := `
		SELECT b.id, b.reference, b.user_id, b.purpose, b.venue_id, v.name as venue_name, b.start_time, b.end_time, b.equipment_needed, b.status, b.created_at, b.updated_at
		FROM bookings b
		JOIN venues v ON b.venue_id = v.id
		WHERE b.user_id = $1 AND b.start_time >= NOW()
		ORDER BY b.start_time ASC
		LIMIT 1;
	`

	var booking models.Booking

	err := pool.QueryRow(ctx, query, userId).Scan(
		&booking.ID,
		&booking.Reference,
		&booking.UserId,
		&booking.Purpose,
		&booking.VenueID,
		&booking.VenueName,
		&booking.StartTime,
		&booking.EndTime,
		&booking.EquipmentNeeded,
		&booking.Status,
		&booking.CreatedAt,
		&booking.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("Failed to get next booking: %w", err)
	}

	return &booking, nil
}

func CheckVenueAvailability(ctx context.Context, pool *pgxpool.Pool, venueID int, startTime time.Time, endTime time.Time) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1 FROM bookings
			WHERE venue_iD = $1
			AND status != 'Cancelled'
			AND start_time < $3
			AND end_time > $2
		);
	`
	var hasConflict bool

	err := pool.QueryRow(ctx, query, venueID, startTime, endTime).Scan(&hasConflict)
	if err != nil {
		return false, fmt.Errorf("Failed to check availability: %w", err)
	}

	return !hasConflict, nil
}
