package models

import "time"

type Ticket struct {
	ID           int       `json:"id"`
	Reference    string    `json:"reference"`
	Title        string    `json:"title"`
	Category     string    `json:"category"`
	Department   string    `json:"department"`
	Priority     string    `json:"priority"`
	Status       string    `json:"status"`
	RelatedAsset string    `json:"related_asset"`
	Description  string    `json:"description"`
	RequesterId  string    `json:"requester_id"`
	AssigneeId   *string   `json:"assignee_id"`
	AssigneeName string    `json:"assignee_name"`
	Picture      []string  `json:"picture"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
