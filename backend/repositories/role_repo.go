package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetRole(ctx context.Context, pool *pgxpool.Pool, userID string) (models.Role, error) {
	query := `
		SELECT r.id, r.name, r.description 
		FROM users u 
		JOIN roles r ON u.role_id = r.id
		WHERE u.id = $1
	`

	var role models.Role
	err := pool.QueryRow(ctx, query, userID).Scan(&role.ID, &role.Name, &role.Description)
	if err != nil {
		return models.Role{}, fmt.Errorf("Failed to fetch user role: %w", err)
	}

	return role, nil
}
