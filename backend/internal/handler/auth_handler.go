package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
	"github.com/kaushaljoshi15/crewsync-backend/internal/repository"
	"github.com/kaushaljoshi15/crewsync-backend/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
	userRepo    repository.UserRepository
}

func NewAuthHandler(authService service.AuthService, userRepo repository.UserRepository) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userRepo:    userRepo,
	}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req domain.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	if req.Email == "" || req.Password == "" || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name, email, and password are required",
		})
	}

	user, err := h.authService.Register(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Registration successful! A 6-digit verification code has been sent to your email.",
		"user":    user,
	})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req domain.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	res, err := h.authService.Login(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Set HTTP-only secure cookie as well as returning JSON token
	c.Cookie(&fiber.Cookie{
		Name:     "crewsync_token",
		Value:    res.Token,
		HTTPOnly: true,
		SameSite: "Lax",
		MaxAge:   72 * 3600,
	})

	return c.JSON(res)
}

func (h *AuthHandler) VerifyOTP(c *fiber.Ctx) error {
	var req domain.VerifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	res, err := h.authService.VerifyOTP(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "crewsync_token",
		Value:    res.Token,
		HTTPOnly: true,
		SameSite: "Lax",
		MaxAge:   72 * 3600,
	})

	return c.JSON(fiber.Map{
		"message": "Account verified successfully!",
		"token":   res.Token,
		"user":    res.User,
	})
}

func (h *AuthHandler) ResendOTP(c *fiber.Ctx) error {
	var req domain.ResendOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	if err := h.authService.ResendOTP(c.Context(), req.Email); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "A new verification code has been dispatched to your email.",
	})
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(int64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	user, err := h.userRepo.GetByID(c.Context(), userID)
	if err != nil || user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User profile not found",
		})
	}

	return c.JSON(user)
}
