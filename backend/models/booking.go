package models

import "time"

type Booking struct {
	ID              int       `json:"id"`
	UserId          string    `json:"user_id"`
	Purpose         string    `json:"purpose"`
	Venue           string    `json:"Venue"`
	StartTime       time.Time `json:"start_time"`
	EndTime         time.Time `json:"end_time"`
	EquipmentNeeded []string  `json:"equipment_needed"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
