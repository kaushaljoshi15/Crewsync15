package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/kaushaljoshi15/crewsync-backend/internal/config"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
	"github.com/kaushaljoshi15/crewsync-backend/internal/repository"
	"github.com/kaushaljoshi15/crewsync-backend/internal/worker"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(ctx context.Context, req domain.RegisterRequest) (*domain.User, error)
	Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error)
	VerifyOTP(ctx context.Context, req domain.VerifyOTPRequest) (*domain.AuthResponse, error)
	ResendOTP(ctx context.Context, email string) error
	GenerateToken(user *domain.User) (string, error)
	ValidateToken(tokenStr string) (*CustomClaims, error)
}

type CustomClaims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type authService struct {
	userRepo  repository.UserRepository
	cfg       *config.Config
	emailPool *worker.EmailWorkerPool
}

func NewAuthService(userRepo repository.UserRepository, cfg *config.Config, emailPool *worker.EmailWorkerPool) AuthService {
	return &authService{
		userRepo:  userRepo,
		cfg:       cfg,
		emailPool: emailPool,
	}
}

func (s *authService) Register(ctx context.Context, req domain.RegisterRequest) (*domain.User, error) {
	// 1. Check if user already exists
	existing, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("a user with this email already exists")
	}

	// 2. Hash Password using Bcrypt (cost 10)
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	role := req.Role
	if role == "" {
		role = domain.RoleVolunteer
	}

	// 3. Create User record
	newUser := &domain.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedBytes),
		Role:         role,
		IsVerified:   false,
	}

	createdUser, err := s.userRepo.Create(ctx, newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	// 4. Generate 6-digit Secure OTP
	otp := generateSecureOTP(6)
	expiresAt := time.Now().Add(10 * time.Minute)
	_ = s.userRepo.SaveOTP(ctx, req.Email, otp, expiresAt)

	// 5. Asynchronously dispatch OTP Email via Worker Pool (Non-blocking!)
	s.emailPool.Dispatch(worker.EmailJob{
		To:       req.Email,
		Subject:  "CrewSync - Verify your Account (OTP: " + otp + ")",
		BodyText: fmt.Sprintf("Welcome to CrewSync, %s!\n\nYour 6-digit verification code is: %s\n\nThis code will expire in 10 minutes.", req.Name, otp),
	})

	return createdUser, nil
}

func (s *authService) Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	// Verify Bcrypt Password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !user.IsVerified {
		return nil, errors.New("email is not verified. Please verify your OTP.")
	}

	// Generate JWT Token
	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate auth token: %w", err)
	}

	return &domain.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *authService) VerifyOTP(ctx context.Context, req domain.VerifyOTPRequest) (*domain.AuthResponse, error) {
	valid, err := s.userRepo.VerifyOTP(ctx, req.Email, req.Code)
	if err != nil {
		return nil, err
	}
	if !valid {
		return nil, errors.New("invalid or expired verification code")
	}

	// Mark user as verified
	if err := s.userRepo.SetVerified(ctx, req.Email); err != nil {
		return nil, err
	}

	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil || user == nil {
		return nil, errors.New("user not found after verification")
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *authService) ResendOTP(ctx context.Context, email string) error {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil || user == nil {
		return errors.New("no account found with this email")
	}

	otp := generateSecureOTP(6)
	expiresAt := time.Now().Add(10 * time.Minute)
	if err := s.userRepo.SaveOTP(ctx, email, otp, expiresAt); err != nil {
		return err
	}

	s.emailPool.Dispatch(worker.EmailJob{
		To:       email,
		Subject:  "CrewSync - New Verification Code (" + otp + ")",
		BodyText: fmt.Sprintf("Hello %s,\n\nYour new verification code is: %s\n\nExpires in 10 minutes.", user.Name, otp),
	})

	return nil
}

func (s *authService) GenerateToken(user *domain.User) (string, error) {
	expiration := time.Now().Add(time.Duration(s.cfg.JWTExpiresIn) * time.Hour)
	claims := &CustomClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "crewsync-backend",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *authService) ValidateToken(tokenStr string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &CustomClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid or expired token")
}

func generateSecureOTP(length int) string {
	digits := "0123456789"
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		result[i] = digits[num.Int64()]
	}
	return string(result)
}
