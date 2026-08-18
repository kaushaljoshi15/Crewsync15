package handler

import (
	"log"
	"strconv"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	wsPkg "github.com/kaushaljoshi15/crewsync-backend/internal/websocket"
	"github.com/kaushaljoshi15/crewsync-backend/internal/repository"
	"github.com/kaushaljoshi15/crewsync-backend/internal/service"
)

type WSHandler struct {
	hub         *wsPkg.Hub
	authService service.AuthService
	crewRepo    repository.CrewRepository
}

func NewWSHandler(hub *wsPkg.Hub, authService service.AuthService, crewRepo repository.CrewRepository) *WSHandler {
	return &WSHandler{
		hub:         hub,
		authService: authService,
		crewRepo:    crewRepo,
	}
}

// UpgradeMiddleware validates auth before upgrading connection to WebSocket
func (h *WSHandler) UpgradeMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			tokenStr := c.Query("token")
			if tokenStr == "" {
				tokenStr = c.Cookies("crewsync_token")
			}

			if tokenStr == "" {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "Missing WebSocket authentication token",
				})
			}

			claims, err := h.authService.ValidateToken(tokenStr)
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "Invalid token for WebSocket upgrade",
				})
			}

			crewID, err := strconv.ParseInt(c.Params("crewId"), 10, 64)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Invalid crew ID",
				})
			}

			// Verify membership
			isMember, err := h.crewRepo.IsMember(c.Context(), crewID, claims.UserID)
			if err != nil || !isMember {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": "You do not belong to this crew",
				})
			}

			c.Locals("wsUserID", claims.UserID)
			c.Locals("wsCrewID", crewID)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	}
}

// HandleWS connects the client and pumps messages
func (h *WSHandler) HandleWS() fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		userID := c.Locals("wsUserID").(int64)
		crewID := c.Locals("wsCrewID").(int64)

		client := &wsPkg.Client{
			Hub:     h.hub,
			Conn:    c,
			UserID:  userID,
			CrewID:  crewID,
			Send:    make(chan []byte, 256),
			IsAlive: true,
		}

		h.hub.Register(client)

		// Start write pump in a separate goroutine
		go client.WritePump()

		// Read pump runs on the current routine and blocks until disconnect
		client.ReadPump()
		log.Printf("WS connection closed for UserID=%d on CrewID=%d", userID, crewID)
	})
}
