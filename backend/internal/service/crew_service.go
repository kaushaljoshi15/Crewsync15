package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
	"github.com/kaushaljoshi15/crewsync-backend/internal/repository"
	"github.com/kaushaljoshi15/crewsync-backend/internal/websocket"
)

type CrewService interface {
	CreateCrew(ctx context.Context, userID int64, req domain.CreateCrewRequest) (*domain.Crew, error)
	GetCrew(ctx context.Context, crewID, userID int64) (*domain.Crew, error)
	ListUserCrews(ctx context.Context, userID int64) ([]domain.Crew, error)
	AddMember(ctx context.Context, crewID int64, req domain.AddMemberRequest, requesterID int64) error
	GetMembers(ctx context.Context, crewID, userID int64) ([]domain.CrewMember, error)
}

type crewService struct {
	crewRepo repository.CrewRepository
	userRepo repository.UserRepository
	wsHub    *websocket.Hub
}

func NewCrewService(crewRepo repository.CrewRepository, userRepo repository.UserRepository, wsHub *websocket.Hub) CrewService {
	return &crewService{
		crewRepo: crewRepo,
		userRepo: userRepo,
		wsHub:    wsHub,
	}
}

func (s *crewService) CreateCrew(ctx context.Context, userID int64, req domain.CreateCrewRequest) (*domain.Crew, error) {
	crew := &domain.Crew{
		Name:        req.Name,
		Description: req.Description,
		LeadID:      userID,
	}

	created, err := s.crewRepo.Create(ctx, crew)
	if err != nil {
		return nil, fmt.Errorf("failed to create crew: %w", err)
	}

	return created, nil
}

func (s *crewService) GetCrew(ctx context.Context, crewID, userID int64) (*domain.Crew, error) {
	isMember, err := s.crewRepo.IsMember(ctx, crewID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("unauthorized: you are not a member of this crew")
	}

	return s.crewRepo.GetByID(ctx, crewID)
}

func (s *crewService) ListUserCrews(ctx context.Context, userID int64) ([]domain.Crew, error) {
	return s.crewRepo.ListByUser(ctx, userID)
}

func (s *crewService) AddMember(ctx context.Context, crewID int64, req domain.AddMemberRequest, requesterID int64) error {
	// Verify requester is lead
	crew, err := s.crewRepo.GetByID(ctx, crewID)
	if err != nil || crew == nil {
		return errors.New("crew not found")
	}
	if crew.LeadID != requesterID {
		return errors.New("only the crew lead can add members")
	}

	// Find user to add
	user, err := s.userRepo.GetByEmail(ctx, req.UserEmail)
	if err != nil || user == nil {
		return errors.New("user with this email not found")
	}

	role := req.Role
	if role == "" {
		role = "contributor"
	}

	if err := s.crewRepo.AddMember(ctx, crewID, user.ID, role); err != nil {
		return err
	}

	// Broadcast Live Event to WebSocket room
	s.wsHub.Broadcast(domain.LiveEvent{
		Type:   "MEMBER_JOINED",
		CrewID: crewID,
		Payload: domain.CrewMember{
			CrewID:    crewID,
			UserID:    user.ID,
			UserName:  user.Name,
			UserEmail: user.Email,
			Role:      role,
		},
	})

	return nil
}

func (s *crewService) GetMembers(ctx context.Context, crewID, userID int64) ([]domain.CrewMember, error) {
	isMember, err := s.crewRepo.IsMember(ctx, crewID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("unauthorized: you are not a member of this crew")
	}

	return s.crewRepo.GetMembers(ctx, crewID)
}
