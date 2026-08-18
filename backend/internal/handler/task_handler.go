package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
	"github.com/kaushaljoshi15/crewsync-backend/internal/service"
)

type TaskHandler struct {
	taskService service.TaskService
}

func NewTaskHandler(taskService service.TaskService) *TaskHandler {
	return &TaskHandler{taskService: taskService}
}

func (h *TaskHandler) CreateTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	crewID, err := strconv.ParseInt(c.Params("crewId"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid crew ID",
		})
	}

	var req domain.CreateTaskRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	task, err := h.taskService.CreateTask(c.Context(), crewID, userID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(task)
}

func (h *TaskHandler) ListTasks(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	crewID, err := strconv.ParseInt(c.Params("crewId"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid crew ID",
		})
	}

	tasks, err := h.taskService.ListTasks(c.Context(), crewID, userID)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if tasks == nil {
		tasks = []domain.Task{}
	}

	return c.JSON(tasks)
}

func (h *TaskHandler) GetTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	taskID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	task, err := h.taskService.GetTask(c.Context(), taskID, userID)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(task)
}

func (h *TaskHandler) UpdateTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	taskID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	var req domain.UpdateTaskRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	task, err := h.taskService.UpdateTask(c.Context(), taskID, userID, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(task)
}

func (h *TaskHandler) DeleteTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int64)
	taskID, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	if err := h.taskService.DeleteTask(c.Context(), taskID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Task deleted successfully",
	})
}
