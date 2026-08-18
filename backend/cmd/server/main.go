package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/kaushaljoshi15/crewsync-backend/internal/config"
	"github.com/kaushaljoshi15/crewsync-backend/internal/database"
	"github.com/kaushaljoshi15/crewsync-backend/internal/handler"
	"github.com/kaushaljoshi15/crewsync-backend/internal/middleware"
	"github.com/kaushaljoshi15/crewsync-backend/internal/repository"
	"github.com/kaushaljoshi15/crewsync-backend/internal/service"
	wsPkg "github.com/kaushaljoshi15/crewsync-backend/internal/websocket"
	"github.com/kaushaljoshi15/crewsync-backend/internal/worker"
)

func main() {
	log.Println("⚡ Starting CrewSync Go High-Performance Microservice...")

	// 1. Load Configurations
	cfg := config.LoadConfig()

	// 2. Initialize Database & Cache
	storage, err := database.NewStorage(cfg.DatabaseURL, cfg.RedisURL)
	if err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}
	defer storage.Close()

	// 3. Initialize Asynchronous Email Worker Pool (5 concurrent workers, buffer of 100)
	emailPool := worker.NewEmailWorkerPool(cfg, 5, 100)
	defer emailPool.Stop()

	// 4. Initialize WebSocket Concurrency Hub
	wsHub := wsPkg.NewHub()
	go wsHub.Run()

	// 5. Initialize Repositories (Data Access Layer)
	userRepo := repository.NewUserRepository(storage.DB)
	crewRepo := repository.NewCrewRepository(storage.DB)
	taskRepo := repository.NewTaskRepository(storage.DB)

	// 6. Initialize Services (Business Logic Layer)
	authService := service.NewAuthService(userRepo, cfg, emailPool)
	crewService := service.NewCrewService(crewRepo, userRepo, wsHub)
	taskService := service.NewTaskService(taskRepo, crewRepo, wsHub)

	// 7. Initialize Handlers (Presentation / HTTP Layer)
	authHandler := handler.NewAuthHandler(authService, userRepo)
	crewHandler := handler.NewCrewHandler(crewService)
	taskHandler := handler.NewTaskHandler(taskService)
	wsHandler := handler.NewWSHandler(wsHub, authService, crewRepo)
	healthHandler := handler.NewHealthHandler(storage)

	// 8. Create Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "CrewSync Real-Time Distributed API",
		ServerHeader: "Fiber-Go",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	})

	// Global Middlewares
	app.Use(recover.New()) // Prevent panics from crashing server
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(middleware.SetupCORS(cfg))

	// Health Check & Root Info
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service":   "CrewSync Distributed Real-Time Go API",
			"status":    "online",
			"health":    "/health",
			"api_docs":  "/api/v1",
			"frontend":  "http://localhost:3000",
		})
	})
	app.Get("/health", healthHandler.HealthCheck)

	// API Routes Group
	api := app.Group("/api/v1")

	// Auth Routes (with strict rate limiting to prevent brute-force attacks)
	authGroup := api.Group("/auth")
	authGroup.Use(middleware.RateLimiter(storage.Redis, 10, 1*time.Minute))
	authGroup.Post("/register", authHandler.Register)
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/verify-otp", authHandler.VerifyOTP)
	authGroup.Post("/resend-otp", authHandler.ResendOTP)

	// Protected User Routes
	api.Get("/auth/me", middleware.JWTAuth(authService), authHandler.GetProfile)

	// Crew Management Routes (Protected)
	crewsGroup := api.Group("/crews", middleware.JWTAuth(authService))
	crewsGroup.Post("/", crewHandler.CreateCrew)
	crewsGroup.Get("/", crewHandler.ListUserCrews)
	crewsGroup.Get("/:id", crewHandler.GetCrew)
	crewsGroup.Post("/:id/members", crewHandler.AddMember)
	crewsGroup.Get("/:id/members", crewHandler.GetMembers)

	// Task & Kanban Management Routes (Protected)
	crewsGroup.Post("/:crewId/tasks", taskHandler.CreateTask)
	crewsGroup.Get("/:crewId/tasks", taskHandler.ListTasks)
	api.Get("/tasks/:id", middleware.JWTAuth(authService), taskHandler.GetTask)
	api.Patch("/tasks/:id", middleware.JWTAuth(authService), taskHandler.UpdateTask)
	api.Delete("/tasks/:id", middleware.JWTAuth(authService), taskHandler.DeleteTask)

	// Real-Time WebSocket Route
	app.Use("/ws/crews/:crewId", wsHandler.UpgradeMiddleware())
	app.Get("/ws/crews/:crewId", wsHandler.HandleWS())

	// 9. Start Server in a separate Goroutine for graceful shutdown
	go func() {
		addr := ":" + cfg.Port
		log.Printf("🚀 Server running on http://localhost:%s", cfg.Port)
		if err := app.Listen(addr); err != nil {
			log.Printf("Fiber server stopped: %v", err)
		}
	}()

	// 10. Graceful Shutdown Listener
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Graceful shutdown initiated...")
	if err := app.ShutdownWithTimeout(5 * time.Second); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}
	log.Println("CrewSync Backend successfully shut down.")
}
