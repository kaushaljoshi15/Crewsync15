package middleware

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

type memoryLimiter struct {
	mu      sync.Mutex
	buckets map[string]*clientBucket
}

type clientBucket struct {
	tokens     int
	lastRefill time.Time
}

var memLimiter = &memoryLimiter{
	buckets: make(map[string]*clientBucket),
}

// RateLimiter creates a distributed rate limiting middleware with Redis and memory fallback
// maxRequests: allowed requests per window
// window: duration window (e.g. 1 minute)
func RateLimiter(redisClient *redis.Client, maxRequests int, window time.Duration) fiber.Handler {
	return func(c *fiber.Ctx) error {
		clientIP := c.IP()
		key := fmt.Sprintf("ratelimit:%s:%s", c.Path(), clientIP)
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		// Try Redis first
		if redisClient != nil && redisClient.Ping(ctx).Err() == nil {
			count, err := redisClient.Incr(ctx, key).Result()
			if err == nil {
				if count == 1 {
					_ = redisClient.Expire(ctx, key, window)
				}
				if count > int64(maxRequests) {
					c.Set("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
					return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
						"error":       "Rate limit exceeded. Too many requests, please slow down.",
						"retry_after": fmt.Sprintf("%ds", int(window.Seconds())),
					})
				}
				return c.Next()
			}
		}

		// Fallback: In-Memory Token Bucket
		memLimiter.mu.Lock()
		now := time.Now()
		bucket, exists := memLimiter.buckets[key]
		if !exists || now.Sub(bucket.lastRefill) > window {
			memLimiter.buckets[key] = &clientBucket{
				tokens:     maxRequests - 1,
				lastRefill: now,
			}
			memLimiter.mu.Unlock()
			return c.Next()
		}

		if bucket.tokens <= 0 {
			memLimiter.mu.Unlock()
			c.Set("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":       "Rate limit exceeded (Memory fallback). Please slow down.",
				"retry_after": fmt.Sprintf("%ds", int(window.Seconds())),
			})
		}

		bucket.tokens--
		memLimiter.mu.Unlock()
		return c.Next()
	}
}
