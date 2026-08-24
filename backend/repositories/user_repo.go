package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func UpdateUserProfile(ctx context.Context, pool *pgxpool.Pool, user models.User) error {
	query := `
		UPDATE users 
		SET department = $1,
			username = $2,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
		`
	commandTag, err := pool.Exec(
		ctx,
		query,
		user.Department,
		user.Username,
		user.ID)
	if err != nil {
		return fmt.Errorf("Failed to update user profile: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No user found with ID: %s", user.ID)
	}
	return nil
}
