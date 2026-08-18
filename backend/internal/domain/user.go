package domain

import (
	"time"
)

// User Roles
const (
	RoleAdmin       = "admin"
	RoleCoordinator = "coordinator"
	RoleVolunteer   = "volunteer"
)

// User represents the core user entity in the system
type User struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Never expose password hash in JSON output
	GoogleID     *string   `json:"google_id,omitempty"`
	Role         string    `json:"role"`
	IsVerified   bool      `json:"is_verified"`
	AvatarURL    *string   `json:"avatar_url,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// DTOs (Data Transfer Objects) for Authentication

type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=100"`
	Role     string `json:"role"` // default: volunteer
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type GoogleAuthRequest struct {
	Credential string `json:"credential" validate:"required"`
}

type VerifyOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
	Code  string `json:"code" validate:"required,len=6"`
}

type ResendOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
