package domain

import (
	"time"
)

// VerificationCode represents an email OTP record stored in PostgreSQL or Redis
type VerificationCode struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	Code      string    `json:"code"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}
