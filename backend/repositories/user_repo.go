package repositories

import (
	"itsm/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateUser(pool *pgxpool.Pool, user models.User) error {
	query := `INSERT INTO users (username, email, department, )`
}
