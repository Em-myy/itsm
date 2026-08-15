package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SyncUserProfile(ctx context.Context, pool *pgxpool.Pool, user models.User) error {
	query := `
		INSERT INTO users (id, username, email, department, role_id)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO UPDATE
		SET department = EXCLUDED.department,
			username = EXCLUDED.username,
			updated_at = CURRENT_TIMESTAMP
		`
	_, err := pool.Exec(ctx,
		query,
		user.ID,
		user.Username,
		user.Email,
		user.Department,
		user.RoleId)
	if err != nil {
		return fmt.Errorf("Failed to sync user profile: %w", err)
	}
	return nil
}
