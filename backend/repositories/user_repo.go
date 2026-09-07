package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func UpdateUserProfile(
	ctx context.Context,
	pool *pgxpool.Pool,
	userID string,
	username *string,
	department *string,
) error {
	query := `
		UPDATE users 
		SET 
			username = COALESCE($1, username),
			department = COALESCE($2, department)
			updated_at = NOW()
		WHERE id = $3
		`
	commandTag, err := pool.Exec(
		ctx,
		query,
		username,
		department,
		userID,
	)
	if err != nil {
		return fmt.Errorf("Failed to update user profile: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No user found with ID: %s", userID)
	}
	return nil
}

func GetUserProfile(ctx context.Context, pool *pgxpool.Pool, userID string) (*models.User, error) {
	query := `
		SELECT id, username, department, role, created_at, updated_at
		FROM users
		WHERE id = $1;
	`
	var user models.User
	err := pool.QueryRow(ctx, query, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Department,
		&user.RoleId,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("Failed to get user profile: %w", err)
	}

	return &user, nil
}
