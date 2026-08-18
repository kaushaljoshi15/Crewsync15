package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
	"github.com/kaushaljoshi15/crewsync-backend/internal/service"
)

type CrewHandler struct {
	crewService service.CrewService
}

func NewCrewHandler(crewService service.CrewService) *CrewHandler {
	return &CrewHandler{crewService: crewService}
}

func (h *CrewHandler) CreateCrew(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	var req domain.CreateCrewRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	crew, err := h.crewService.CreateCrew(c.Context(), userID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(crew)
}

func (h *CrewHandler) GetCrew(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	crewID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid crew ID",
		})
	}

	crew, err := h.crewService.GetCrew(c.Context(), crewID, userID)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(crew)
}

func (h *CrewHandler) ListUserCrews(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	crews, err := h.crewService.ListUserCrews(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if crews == nil {
		crews = []domain.Crew{}
	}

	return c.JSON(crews)
}

func (h *CrewHandler) AddMember(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	crewID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid crew ID",
		})
	}

	var req domain.AddMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	if err := h.crewService.AddMember(c.Context(), crewID, req, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Member added to crew successfully",
	})
}

func (h *CrewHandler) GetMembers(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	crewID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid crew ID",
		})
	}

	members, err := h.crewService.GetMembers(c.Context(), crewID, userID)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if members == nil {
		members = []domain.CrewMember{}
	}

	return c.JSON(members)
}
