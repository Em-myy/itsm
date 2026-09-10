package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateAsset(ctx context.Context, pool *pgxpool.Pool, asset models.Asset) (int, string, error) {
	query := `
		INSERT INTO assets (asset_type, department, status, last_serviced, notes, assignee_name)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, reference;
	`
	var newID int
	var newRef string

	err := pool.QueryRow(
		ctx,
		query,
		asset.AssetType,
		asset.Department,
		asset.Status,
		asset.LastServiced,
		asset.Notes,
		asset.AssigneeName,
	).Scan(&newID, &newRef)
	if err != nil {
		return 0, "", fmt.Errorf("Failed to create new asset: %w", err)
	}

	return newID, newRef, nil
}

func GetAsset(ctx context.Context, pool *pgxpool.Pool) ([]models.Asset, error) {
	query := `
		SELECT id, reference, asset_type, department, status, last_serviced, notes, assignee_name, created_at, updated_at
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
			&a.AssetType,
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

func UpdateAsset(
	ctx context.Context,
	pool *pgxpool.Pool,
	assetID int,
	assetType *string,
	department *string,
	status *string,
	assigneeName *string,
	lastServiced *string,
	notes *string,
) error {
	query := `
		UPDATE assets
		SET
			asset_type = COALESCE($1, asset_type),
            department = COALESCE($2, department),
            status = COALESCE($3, status),
            assignee_name = COALESCE($4, assignee_name),
			last_serviced = COALESCE($5, last_serviced),
			notes = COALESCE($6, notes),
            updated_at = NOW()
		WHERE id = $7;
	`

	commandTag, err := pool.Exec(
		ctx,
		query,
		assetType,
		department,
		status,
		assigneeName,
		lastServiced,
		notes,
		assetID,
	)

	if err != nil {
		return fmt.Errorf("Failed to update asset: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No asset found with ID: %d", assetID)
	}

	return nil
}

func CancelAsset(ctx context.Context, pool *pgxpool.Pool, assetID int) error {
	query := `
			UPDATE assets
			SET
				status = 'Retired',
				updated_at = NOW()
			WHERE id = $1;
		`

	commandTag, err := pool.Exec(ctx, query, assetID)
	if err != nil {
		return fmt.Errorf("Failed to cancel asset: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("No asset found with ID: %d", assetID)
	}

	return nil
}
