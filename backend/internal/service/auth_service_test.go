package service_test

import (
	"testing"
	"time"

	"github.com/kaushaljoshi15/crewsync-backend/internal/config"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
	"github.com/kaushaljoshi15/crewsync-backend/internal/service"
)

func TestTokenGenerationAndValidation(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key-12345678901234567890",
		JWTExpiresIn: 24,
	}

	authSvc := service.NewAuthService(nil, cfg, nil)

	testUser := &domain.User{
		ID:         101,
		Email:      "engineer@faang.com",
		Role:       domain.RoleAdmin,
		IsVerified: true,
		CreatedAt:  time.Now(),
	}

	token, err := authSvc.GenerateToken(testUser)
	if err != nil {
		t.Fatalf("Expected token generation to succeed, got error: %v", err)
	}

	if token == "" {
		t.Fatal("Expected non-empty token string")
	}

	claims, err := authSvc.ValidateToken(token)
	if err != nil {
		t.Fatalf("Expected token validation to succeed, got error: %v", err)
	}

	if claims.UserID != 101 {
		t.Errorf("Expected UserID 101, got %d", claims.UserID)
	}
	if claims.Email != "engineer@faang.com" {
		t.Errorf("Expected Email 'engineer@faang.com', got '%s'", claims.Email)
	}
	if claims.Role != domain.RoleAdmin {
		t.Errorf("Expected Role 'admin', got '%s'", claims.Role)
	}
}
