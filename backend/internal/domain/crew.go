package domain

import (
	"time"
)

// Crew represents a collaborative team / project crew
type Crew struct {
	ID          int64        `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	LeadID      int64        `json:"lead_id"`
	LeadName    string       `json:"lead_name,omitempty"`
	Members     []CrewMember `json:"members,omitempty"`
	TaskCount   int          `json:"task_count,omitempty"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

// CrewMember represents user membership within a crew
type CrewMember struct {
	ID        int64     `json:"id"`
	CrewID    int64     `json:"crew_id"`
	UserID    int64     `json:"user_id"`
	UserName  string    `json:"user_name"`
	UserEmail string    `json:"user_email"`
	Role      string    `json:"role"` // lead, contributor, observer
	JoinedAt  time.Time `json:"joined_at"`
}

// DTOs for Crew Operations
type CreateCrewRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description"`
}

type AddMemberRequest struct {
	UserEmail string `json:"user_email" validate:"required,email"`
	Role      string `json:"role"` // contributor, observer
}
