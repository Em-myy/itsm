package models

import "time"

type ActivityLog struct {
	ID            int       `json:"id"`
	ActionMessage string    `json:"action_message"`
	CreatedAt     time.Time `json:"created_at"`
}
