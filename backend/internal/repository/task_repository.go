package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
)

type TaskRepository interface {
	Create(ctx context.Context, t *domain.Task) (*domain.Task, error)
	GetByID(ctx context.Context, id int64) (*domain.Task, error)
	ListByCrew(ctx context.Context, crewID int64) ([]domain.Task, error)
	Update(ctx context.Context, id int64, req domain.UpdateTaskRequest) (*domain.Task, error)
	Delete(ctx context.Context, id int64) error
}

type pgTaskRepository struct {
	db *pgxpool.Pool
}

func NewTaskRepository(db *pgxpool.Pool) TaskRepository {
	return &pgTaskRepository{db: db}
}

func (r *pgTaskRepository) Create(ctx context.Context, t *domain.Task) (*domain.Task, error) {
	query := `
		INSERT INTO tasks (crew_id, title, description, status, priority, assignee_id, creator_id, due_date, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		RETURNING id, crew_id, title, description, status, priority, assignee_id, creator_id, due_date, created_at, updated_at
	`
	created := &domain.Task{}
	err := r.db.QueryRow(ctx, query,
		t.CrewID, t.Title, t.Description, t.Status, t.Priority,
		t.AssigneeID, t.CreatorID, t.DueDate,
	).Scan(
		&created.ID, &created.CrewID, &created.Title, &created.Description,
		&created.Status, &created.Priority, &created.AssigneeID, &created.CreatorID,
		&created.DueDate, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	// Fetch Assignee Name if exists
	if created.AssigneeID != nil {
		var name string
		_ = r.db.QueryRow(ctx, `SELECT name FROM users WHERE id = $1`, *created.AssigneeID).Scan(&name)
		created.AssigneeName = &name
	}

	return created, nil
}

func (r *pgTaskRepository) GetByID(ctx context.Context, id int64) (*domain.Task, error) {
	query := `
		SELECT t.id, t.crew_id, t.title, t.description, t.status, t.priority,
		       t.assignee_id, u.name as assignee_name, t.creator_id, t.due_date,
		       t.created_at, t.updated_at
		FROM tasks t
		LEFT JOIN users u ON t.assignee_id = u.id
		WHERE t.id = $1
	`
	t := &domain.Task{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&t.ID, &t.CrewID, &t.Title, &t.Description, &t.Status, &t.Priority,
		&t.AssigneeID, &t.AssigneeName, &t.CreatorID, &t.DueDate,
		&t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return t, nil
}

func (r *pgTaskRepository) ListByCrew(ctx context.Context, crewID int64) ([]domain.Task, error) {
	query := `
		SELECT t.id, t.crew_id, t.title, t.description, t.status, t.priority,
		       t.assignee_id, u.name as assignee_name, t.creator_id, t.due_date,
		       t.created_at, t.updated_at
		FROM tasks t
		LEFT JOIN users u ON t.assignee_id = u.id
		WHERE t.crew_id = $1
		ORDER BY 
			CASE t.status
				WHEN 'TODO' THEN 1
				WHEN 'IN_PROGRESS' THEN 2
				WHEN 'REVIEW' THEN 3
				WHEN 'DONE' THEN 4
				ELSE 5
			END,
			t.created_at DESC
	`
	rows, err := r.db.Query(ctx, query, crewID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []domain.Task
	for rows.Next() {
		var t domain.Task
		if err := rows.Scan(
			&t.ID, &t.CrewID, &t.Title, &t.Description, &t.Status, &t.Priority,
			&t.AssigneeID, &t.AssigneeName, &t.CreatorID, &t.DueDate,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

func (r *pgTaskRepository) Update(ctx context.Context, id int64, req domain.UpdateTaskRequest) (*domain.Task, error) {
	existing, err := r.GetByID(ctx, id)
	if err != nil || existing == nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}

	if req.Title != nil {
		existing.Title = *req.Title
	}
	if req.Description != nil {
		existing.Description = *req.Description
	}
	if req.Status != nil {
		existing.Status = *req.Status
	}
	if req.Priority != nil {
		existing.Priority = *req.Priority
	}
	if req.AssigneeID != nil {
		existing.AssigneeID = req.AssigneeID
	}
	if req.DueDate != nil {
		existing.DueDate = req.DueDate
	}

	query := `
		UPDATE tasks
		SET title = $1, description = $2, status = $3, priority = $4, assignee_id = $5, due_date = $6, updated_at = NOW()
		WHERE id = $7
		RETURNING updated_at
	`
	err = r.db.QueryRow(ctx, query,
		existing.Title, existing.Description, existing.Status, existing.Priority,
		existing.AssigneeID, existing.DueDate, id,
	).Scan(&existing.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Refetch full task with fresh assignee name
	return r.GetByID(ctx, id)
}

func (r *pgTaskRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM tasks WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
