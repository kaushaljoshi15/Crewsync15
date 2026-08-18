package domain

import (
	"time"
)

// Task Status Constants
const (
	TaskStatusTodo       = "TODO"
	TaskStatusInProgress = "IN_PROGRESS"
	TaskStatusReview     = "REVIEW"
	TaskStatusDone       = "DONE"
)

// Task Priority Constants
const (
	PriorityLow    = "LOW"
	PriorityMedium = "MEDIUM"
	PriorityHigh   = "HIGH"
	PriorityUrgent = "URGENT"
)

// Task represents a unit of work assigned to a crew member
type Task struct {
	ID          int64      `json:"id"`
	CrewID      int64      `json:"crew_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`   // TODO, IN_PROGRESS, REVIEW, DONE
	Priority    string     `json:"priority"` // LOW, MEDIUM, HIGH, URGENT
	AssigneeID  *int64     `json:"assignee_id,omitempty"`
	AssigneeName *string   `json:"assignee_name,omitempty"`
	CreatorID   int64      `json:"creator_id"`
	DueDate     *time.Time `json:"due_date,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// DTOs for Task Management
type CreateTaskRequest struct {
	Title       string     `json:"title" validate:"required,min=2,max=150"`
	Description string     `json:"description"`
	Priority    string     `json:"priority"` // LOW, MEDIUM, HIGH, URGENT
	AssigneeID  *int64     `json:"assignee_id"`
	DueDate     *time.Time `json:"due_date"`
}

type UpdateTaskRequest struct {
	Title       *string    `json:"title,omitempty"`
	Description *string    `json:"description,omitempty"`
	Status      *string    `json:"status,omitempty"`
	Priority    *string    `json:"priority,omitempty"`
	AssigneeID  *int64     `json:"assignee_id,omitempty"`
	DueDate     *time.Time `json:"due_date,omitempty"`
}

// LiveEvent for WebSocket broadcast
type LiveEvent struct {
	Type      string      `json:"type"`       // "TASK_CREATED", "TASK_UPDATED", "TASK_DELETED", "MEMBER_JOINED"
	CrewID    int64       `json:"crew_id"`
	Payload   interface{} `json:"payload"`
	Timestamp time.Time   `json:"timestamp"`
}
