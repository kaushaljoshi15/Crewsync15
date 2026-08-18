package handler

import (
	"context"
	"runtime"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/kaushaljoshi15/crewsync-backend/internal/database"
)

var startTime = time.Now()

type HealthHandler struct {
	storage *database.Storage
}

func NewHealthHandler(storage *database.Storage) *HealthHandler {
	return &HealthHandler{storage: storage}
}

func (h *HealthHandler) HealthCheck(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()

	dbStatus := "healthy"
	if err := h.storage.DB.Ping(ctx); err != nil {
		dbStatus = "unhealthy: " + err.Error()
	}

	redisStatus := "healthy"
	if h.storage.Redis != nil {
		if err := h.storage.Redis.Ping(ctx).Err(); err != nil {
			redisStatus = "degraded (in-memory fallback active)"
		}
	} else {
		redisStatus = "disabled"
	}

	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	return c.JSON(fiber.Map{
		"status":      "online",
		"service":     "CrewSync Go Microservice",
		"uptime":      time.Since(startTime).String(),
		"environment": "production",
		"database":    dbStatus,
		"redis":       redisStatus,
		"goroutines":  runtime.NumGoroutine(),
		"memory_alloc_mb": float64(m.Alloc) / 1024 / 1024,
	})
}
