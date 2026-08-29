package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateAsset(ctx context.Context, pool *pgxpool.Pool, asset models.Asset) (int, string, error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	insertQuery := `
		INSERT INTO assets (type, department, status, last_serviced, notes, assignee_name)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id;
	`
	var newID int

	err = tx.QueryRow(
		ctx,
		insertQuery,
		asset.Type,
		asset.Department,
		asset.Status,
		asset.LastServiced,
		asset.Notes,
		asset.AssigneeName,
	).Scan(&newID)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to create new asset: %w", err)
	}

	updateQuery := `
		UPDATE assets
		SET reference = 'AST · ' || TO_CHAR(created_at, 'YYYY') || ' · ' || TO_CHAR(id, 'FM000')
		WHERE id = $1
		RETURNING reference;
	`
	var newRef string

	err = tx.QueryRow(ctx, updateQuery, newID).Scan(&newRef)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to update asset reference: %w", err)
	}

	err = tx.Commit(ctx)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to commit transaction: %w", err)
	}

	return newID, newRef, nil
}

func GetAsset(ctx context.Context, pool *pgxpool.Pool) ([]models.Asset, error) {
	query := `
		SELECT id, reference, type, department, status, last_serviced, notes, assignee_name, created_at, updated_at
		FROM assets
		ORDER BY created_at ASC;
	`
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to get assets: %w", err)
	}
	defer rows.Close()

	var assets []models.Asset
	for rows.Next() {
		var a models.Asset
		err := rows.Scan(
			&a.ID,
			&a.Reference,
			&a.Type,
			&a.Department,
			&a.Status,
			&a.LastServiced,
			&a.Notes,
			&a.AssigneeName,
			&a.CreatedAt,
			&a.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to scan asset row: %w", err)
		}
		assets = append(assets, a)
	}

	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("Error iteration over assets: %w", err)
	}

	return assets, nil
}
