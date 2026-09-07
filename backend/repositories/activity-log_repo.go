package repositories

import (
	"context"
	"fmt"
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetRecentActivity(ctx context.Context, pool *pgxpool.Pool) ([]models.ActivityLog, error) {
	query := `
		SELECT id, action_message, created_at
		FROM activity_logs
		ORDER BY created_at DESC
		LIMIT 5;
	`
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to get activity logs: %w", err)
	}
	defer rows.Close()

	var logs []models.ActivityLog
	for rows.Next() {
		var log models.ActivityLog
		if err := rows.Scan(&log.ID, &log.ActionMessage, &log.CreatedAt); err != nil {
			return nil, fmt.Errorf("Failed to scan activity log: %w", err)
		}
		logs = append(logs, log)
	}
	return logs, nil
}
