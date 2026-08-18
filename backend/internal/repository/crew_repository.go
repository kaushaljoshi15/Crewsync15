package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
)

type CrewRepository interface {
	Create(ctx context.Context, c *domain.Crew) (*domain.Crew, error)
	GetByID(ctx context.Context, id int64) (*domain.Crew, error)
	ListByUser(ctx context.Context, userID int64) ([]domain.Crew, error)
	AddMember(ctx context.Context, crewID, userID int64, role string) error
	GetMembers(ctx context.Context, crewID int64) ([]domain.CrewMember, error)
	IsMember(ctx context.Context, crewID, userID int64) (bool, error)
}

type pgCrewRepository struct {
	db *pgxpool.Pool
}

func NewCrewRepository(db *pgxpool.Pool) CrewRepository {
	return &pgCrewRepository{db: db}
}

func (r *pgCrewRepository) Create(ctx context.Context, c *domain.Crew) (*domain.Crew, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// 1. Insert Crew
	query := `
		INSERT INTO crews (name, description, lead_id, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, name, description, lead_id, created_at, updated_at
	`
	created := &domain.Crew{}
	err = tx.QueryRow(ctx, query, c.Name, c.Description, c.LeadID).Scan(
		&created.ID, &created.Name, &created.Description, &created.LeadID,
		&created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create crew: %w", err)
	}

	// 2. Add Lead as first crew member with 'lead' role
	memberQuery := `
		INSERT INTO crew_members (crew_id, user_id, role, joined_at)
		VALUES ($1, $2, 'lead', NOW())
	`
	_, err = tx.Exec(ctx, memberQuery, created.ID, created.LeadID)
	if err != nil {
		return nil, fmt.Errorf("failed to add lead to crew_members: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return created, nil
}

func (r *pgCrewRepository) GetByID(ctx context.Context, id int64) (*domain.Crew, error) {
	query := `
		SELECT c.id, c.name, c.description, c.lead_id, u.name as lead_name, c.created_at, c.updated_at
		FROM crews c
		JOIN users u ON c.lead_id = u.id
		WHERE c.id = $1
	`
	c := &domain.Crew{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&c.ID, &c.Name, &c.Description, &c.LeadID, &c.LeadName,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return c, nil
}

func (r *pgCrewRepository) ListByUser(ctx context.Context, userID int64) ([]domain.Crew, error) {
	query := `
		SELECT c.id, c.name, c.description, c.lead_id, u.name as lead_name,
		       (SELECT COUNT(*) FROM tasks WHERE crew_id = c.id) as task_count,
		       c.created_at, c.updated_at
		FROM crews c
		JOIN users u ON c.lead_id = u.id
		JOIN crew_members cm ON cm.crew_id = c.id
		WHERE cm.user_id = $1
		ORDER BY c.updated_at DESC
	`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var crews []domain.Crew
	for rows.Next() {
		var c domain.Crew
		if err := rows.Scan(
			&c.ID, &c.Name, &c.Description, &c.LeadID, &c.LeadName,
			&c.TaskCount, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		crews = append(crews, c)
	}
	return crews, nil
}

func (r *pgCrewRepository) AddMember(ctx context.Context, crewID, userID int64, role string) error {
	query := `
		INSERT INTO crew_members (crew_id, user_id, role, joined_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (crew_id, user_id) DO UPDATE SET role = EXCLUDED.role
	`
	_, err := r.db.Exec(ctx, query, crewID, userID, role)
	return err
}

func (r *pgCrewRepository) GetMembers(ctx context.Context, crewID int64) ([]domain.CrewMember, error) {
	query := `
		SELECT cm.id, cm.crew_id, cm.user_id, u.name, u.email, cm.role, cm.joined_at
		FROM crew_members cm
		JOIN users u ON cm.user_id = u.id
		WHERE cm.crew_id = $1
		ORDER BY cm.joined_at ASC
	`
	rows, err := r.db.Query(ctx, query, crewID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []domain.CrewMember
	for rows.Next() {
		var m domain.CrewMember
		if err := rows.Scan(
			&m.ID, &m.CrewID, &m.UserID, &m.UserName, &m.UserEmail,
			&m.Role, &m.JoinedAt,
		); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *pgCrewRepository) IsMember(ctx context.Context, crewID, userID int64) (bool, error) {
	query := `SELECT COUNT(*) FROM crew_members WHERE crew_id = $1 AND user_id = $2`
	var count int
	err := r.db.QueryRow(ctx, query, crewID, userID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
