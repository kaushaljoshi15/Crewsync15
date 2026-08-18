package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
	"github.com/kaushaljoshi15/crewsync-backend/internal/repository"
	"github.com/kaushaljoshi15/crewsync-backend/internal/websocket"
)

type TaskService interface {
	CreateTask(ctx context.Context, crewID, userID int64, req domain.CreateTaskRequest) (*domain.Task, error)
	GetTask(ctx context.Context, taskID, userID int64) (*domain.Task, error)
	ListTasks(ctx context.Context, crewID, userID int64) ([]domain.Task, error)
	UpdateTask(ctx context.Context, taskID, userID int64, req domain.UpdateTaskRequest) (*domain.Task, error)
	DeleteTask(ctx context.Context, taskID, userID int64) error
}

type taskService struct {
	taskRepo repository.TaskRepository
	crewRepo repository.CrewRepository
	wsHub    *websocket.Hub
}

func NewTaskService(taskRepo repository.TaskRepository, crewRepo repository.CrewRepository, wsHub *websocket.Hub) TaskService {
	return &taskService{
		taskRepo: taskRepo,
		crewRepo: crewRepo,
		wsHub:    wsHub,
	}
}

func (s *taskService) CreateTask(ctx context.Context, crewID, userID int64, req domain.CreateTaskRequest) (*domain.Task, error) {
	// 1. Verify user belongs to the crew
	isMember, err := s.crewRepo.IsMember(ctx, crewID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("unauthorized: you are not a member of this crew")
	}

	priority := req.Priority
	if priority == "" {
		priority = domain.PriorityMedium
	}

	task := &domain.Task{
		CrewID:      crewID,
		Title:       req.Title,
		Description: req.Description,
		Status:      domain.TaskStatusTodo,
		Priority:    priority,
		AssigneeID:  req.AssigneeID,
		CreatorID:   userID,
		DueDate:     req.DueDate,
	}

	created, err := s.taskRepo.Create(ctx, task)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	// 2. Broadcast Live WebSocket Event to all crew members
	s.wsHub.Broadcast(domain.LiveEvent{
		Type:    "TASK_CREATED",
		CrewID:  crewID,
		Payload: created,
	})

	return created, nil
}

func (s *taskService) GetTask(ctx context.Context, taskID, userID int64) (*domain.Task, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil || task == nil {
		return nil, errors.New("task not found")
	}

	isMember, err := s.crewRepo.IsMember(ctx, task.CrewID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: you cannot access this task")
	}

	return task, nil
}

func (s *taskService) ListTasks(ctx context.Context, crewID, userID int64) ([]domain.Task, error) {
	isMember, err := s.crewRepo.IsMember(ctx, crewID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: you are not a member of this crew")
	}

	return s.taskRepo.ListByCrew(ctx, crewID)
}

func (s *taskService) UpdateTask(ctx context.Context, taskID, userID int64, req domain.UpdateTaskRequest) (*domain.Task, error) {
	existing, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil || existing == nil {
		return nil, errors.New("task not found")
	}

	isMember, err := s.crewRepo.IsMember(ctx, existing.CrewID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: you cannot modify this task")
	}

	updated, err := s.taskRepo.Update(ctx, taskID, req)
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	// Broadcast Live WebSocket Event (Instant Kanban UI update)
	s.wsHub.Broadcast(domain.LiveEvent{
		Type:    "TASK_UPDATED",
		CrewID:  existing.CrewID,
		Payload: updated,
	})

	return updated, nil
}

func (s *taskService) DeleteTask(ctx context.Context, taskID, userID int64) error {
	existing, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil || existing == nil {
		return errors.New("task not found")
	}

	isMember, err := s.crewRepo.IsMember(ctx, existing.CrewID, userID)
	if err != nil || !isMember {
		return errors.New("unauthorized: you cannot delete this task")
	}

	if err := s.taskRepo.Delete(ctx, taskID); err != nil {
		return err
	}

	// Broadcast Live WebSocket Event
	s.wsHub.Broadcast(domain.LiveEvent{
		Type:    "TASK_DELETED",
		CrewID:  existing.CrewID,
		Payload: map[string]int64{"id": taskID, "crew_id": existing.CrewID},
	})

	return nil
}
