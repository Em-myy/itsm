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
			department = COALESCE($2, department),
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
		SELECT u.id, u.username, au.email, u.department, u.role_id, r.name, u.created_at
		FROM users u
		JOIN auth.users au ON u.id = au.id
		JOIN roles r ON u.role_id = r.id
		WHERE u.id = $1;
	`
	var user models.User
	err := pool.QueryRow(ctx, query, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Department,
		&user.RoleId,
		&user.RoleName,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("Failed to get user profile: %w", err)
	}

	return &user, nil
}

func GetUsers(ctx context.Context, pool *pgxpool.Pool) ([]models.User, error) {
	query := `
		SELECT u.id, u.username, au.email, u.department, u.role_id, r.name, u.created_at
		FROM users u
		JOIN auth.users au ON u.id = au.id
		JOIN roles r ON u.role_id = r.id
		ORDER BY u.created_at ASC;
	`
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to get users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		err := rows.Scan(
			&u.ID,
			&u.Username,
			&u.Email,
			&u.Department,
			&u.RoleId,
			&u.RoleName,
			&u.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan user row: %w", err)
		}
		users = append(users, u)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("Error iterating over users: %w", err)
	}
	return users, nil
}
