package models

import "time"

type Role struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type User struct {
	ID         string    `json:"id"`
	Username   string    `json:"username"`
	Department string    `json:"department"`
	RoleId     int       `json:"role_id"`
	RoleName   string    `json:"role_name"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
