package models

import "time"

type Asset struct {
	ID           int        `json:"id"`
	Reference    string     `json:"reference"`
	Type         string     `json:"type"`
	Department   string     `json:"department"`
	Status       string     `json:"status"`
	LastServiced *time.Time `json:"last_serviced"`
	Notes        *string    `json:"notes"`
	AssigneeName string     `json:"assignee_name"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
