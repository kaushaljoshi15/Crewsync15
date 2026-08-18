package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// Storage wraps the PostgreSQL connection pool and Redis client
type Storage struct {
	DB    *pgxpool.Pool
	Redis *redis.Client
}

// NewStorage initializes PostgreSQL with pgxpool and Redis client
func NewStorage(dbURL, redisURL string) (*Storage, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Configure PostgreSQL Connection Pool (pgxpool)
	pgConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse PostgreSQL config: %w", err)
	}

	// Performance tuning for high-throughput concurrency
	pgConfig.MaxConns = 25
	pgConfig.MinConns = 5
	pgConfig.MaxConnIdleTime = 5 * time.Minute
	pgConfig.MaxConnLifetime = 1 * time.Hour

	pool, err := pgxpool.NewWithConfig(ctx, pgConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("PostgreSQL ping failed: %w", err)
	}
	log.Println("✅ PostgreSQL connection pool established successfully")

	// 2. Configure Redis Client
	redisOpt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("⚠️ Warning: Failed to parse Redis URL (%v), falling back to localhost:6379", err)
		redisOpt = &redis.Options{Addr: "localhost:6379"}
	}

	redisClient := redis.NewClient(redisOpt)
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️ Warning: Redis ping failed (%v). Caching & Rate limiting will run in memory fallback.", err)
	} else {
		log.Println("✅ Redis connection established successfully")
	}

	storage := &Storage{
		DB:    pool,
		Redis: redisClient,
	}

	// 3. Run automated schema migrations
	if err := storage.RunMigrations(ctx); err != nil {
		log.Printf("⚠️ Migration warning: %v", err)
	}

	return storage, nil
}

// Close gracefully closes all database connections
func (s *Storage) Close() {
	if s.DB != nil {
		s.DB.Close()
		log.Println("PostgreSQL connection pool closed")
	}
	if s.Redis != nil {
		_ = s.Redis.Close()
		log.Println("Redis client closed")
	}
}
