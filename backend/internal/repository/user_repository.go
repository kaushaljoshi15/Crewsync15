package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, u *domain.User) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByID(ctx context.Context, id int64) (*domain.User, error)
	Update(ctx context.Context, u *domain.User) error
	SetVerified(ctx context.Context, email string) error
	SaveOTP(ctx context.Context, email, code string, expiresAt time.Time) error
	VerifyOTP(ctx context.Context, email, code string) (bool, error)
}

type pgUserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return &pgUserRepository{db: db}
}

func (r *pgUserRepository) Create(ctx context.Context, u *domain.User) (*domain.User, error) {
	query := `
		INSERT INTO users (name, email, password_hash, google_id, role, is_verified, avatar_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, name, email, role, is_verified, avatar_url, created_at, updated_at
	`
	created := &domain.User{}
	err := r.db.QueryRow(ctx, query,
		u.Name, u.Email, u.PasswordHash, u.GoogleID, u.Role, u.IsVerified, u.AvatarURL,
	).Scan(
		&created.ID, &created.Name, &created.Email, &created.Role,
		&created.IsVerified, &created.AvatarURL, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}
	return created, nil
}

func (r *pgUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, name, email, password_hash, google_id, role, is_verified, avatar_url, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	u := &domain.User{}
	var pwdHash *string
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Name, &u.Email, &pwdHash, &u.GoogleID,
		&u.Role, &u.IsVerified, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to query user by email: %w", err)
	}
	if pwdHash != nil {
		u.PasswordHash = *pwdHash
	}
	return u, nil
}

func (r *pgUserRepository) GetByID(ctx context.Context, id int64) (*domain.User, error) {
	query := `
		SELECT id, name, email, google_id, role, is_verified, avatar_url, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	u := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.GoogleID,
		&u.Role, &u.IsVerified, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to query user by id: %w", err)
	}
	return u, nil
}

func (r *pgUserRepository) Update(ctx context.Context, u *domain.User) error {
	query := `
		UPDATE users
		SET name = $1, avatar_url = $2, role = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, u.Name, u.AvatarURL, u.Role, u.ID)
	return err
}

func (r *pgUserRepository) SetVerified(ctx context.Context, email string) error {
	query := `UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE email = $1`
	_, err := r.db.Exec(ctx, query, email)
	return err
}

func (r *pgUserRepository) SaveOTP(ctx context.Context, email, code string, expiresAt time.Time) error {
	// Remove any older OTP for this email
	_, _ = r.db.Exec(ctx, `DELETE FROM verification_codes WHERE email = $1`, email)

	query := `INSERT INTO verification_codes (email, code, expires_at, created_at) VALUES ($1, $2, $3, NOW())`
	_, err := r.db.Exec(ctx, query, email, code, expiresAt)
	return err
}

func (r *pgUserRepository) VerifyOTP(ctx context.Context, email, code string) (bool, error) {
	query := `
		SELECT id FROM verification_codes 
		WHERE email = $1 AND code = $2 AND expires_at > NOW()
		ORDER BY created_at DESC LIMIT 1
	`
	var id int64
	err := r.db.QueryRow(ctx, query, email, code).Scan(&id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil
		}
		return false, err
	}

	// Delete used code
	_, _ = r.db.Exec(ctx, `DELETE FROM verification_codes WHERE email = $1`, email)
	return true, nil
}
