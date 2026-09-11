package repositories

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"itsm/models"
	"net/http"
	"net/url"
	"os"
	"time"

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
			status = 'Active',
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
		SELECT u.id, u.username, au.email, u.department, u.role_id, r.name, u.status, u.created_at
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
		&user.Status,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("Failed to get user profile: %w", err)
	}

	return &user, nil
}

func GetUsers(ctx context.Context, pool *pgxpool.Pool) ([]models.User, error) {
	query := `
		SELECT u.id, u.username, au.email, u.department, u.role_id, r.name, u.status, u.created_at
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
			&u.Status,
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

func InviteAdmin(ctx context.Context, pool *pgxpool.Pool, email string) error {
	supabaseURL := os.Getenv("SUPABASE_URL")
	secretKey := os.Getenv("SUPABASE_SECRET_KEY")
	frontendURL := os.Getenv("FRONTEND_URL")

	if frontendURL == "" {
		return fmt.Errorf("Server configuration error: Frontend url is not set")
	}

	redirectTo := frontendURL + "/invite"
	endpoint := fmt.Sprintf("%s/auth/v1/invite?redirect_to=%s", supabaseURL, url.QueryEscape(redirectTo))

	payload := map[string]interface{}{
		"email": email,
		"data": map[string]interface{}{
			"department": "IT",
		},
	}
	bodyBytes, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return fmt.Errorf("Failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+secretKey)
	req.Header.Set("apikey", secretKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("Failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	var user struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return fmt.Errorf("Failed to parse supabase response: %w", err)
	}

	query := `
		UPDATE users
		SET
			role_id = 2,
			updated_at = NOW()
		WHERE id = $1;
	`
	commandTag, err := pool.Exec(ctx, query, user.ID)
	if err != nil {
		return fmt.Errorf("Failed to upgrade user role to IT Admin: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("Failed: Could not find any user with ID %s", user.ID)
	}
	return nil
}
