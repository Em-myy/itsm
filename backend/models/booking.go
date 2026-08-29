package models

import "time"

type Booking struct {
	ID              int       `json:"id"`
	Reference       string    `json:"reference"`
	UserId          string    `json:"user_id"`
	Username        *string   `json:"username"`
	Department      *string   `json:"department"`
	Purpose         string    `json:"purpose"`
	VenueID         int       `json:"venue_id"`
	VenueName       string    `json:"venue_name,omitempty"`
	StartTime       time.Time `json:"start_time"`
	EndTime         time.Time `json:"end_time"`
	EquipmentNeeded []string  `json:"equipment_needed"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Venue struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	Reference  string    `json:"reference"`
	Capacity   int       `json:"capacity"`
	Status     string    `json:"status"`
	Equipments []string  `json:"equipments"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
