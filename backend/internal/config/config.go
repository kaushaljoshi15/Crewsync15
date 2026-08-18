package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config stores all application configuration loaded from environment variables
type Config struct {
	Port         string
	DatabaseURL  string
	RedisURL     string
	JWTSecret    string
	JWTExpiresIn int // in hours
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPass     string
	SMTPFrom     string
	ClientURL    string
	Environment  string
}

// LoadConfig initializes configuration from .env and environment variables
func LoadConfig() *Config {
	// Attempt to load .env file if it exists (ignore error if running in Docker where env vars are injected)
	if err := godotenv.Load(); err != nil {
		log.Println("Note: No .env file found, using system environment variables")
	}

	jwtHours, err := strconv.Atoi(getEnv("JWT_EXPIRES_IN_HOURS", "72"))
	if err != nil {
		jwtHours = 72
	}

	return &Config{
		Port:         getEnv("PORT", "8080"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/crewsync?sslmode=disable"),
		RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:    getEnv("JWT_SECRET", "super-secret-crewsync-faang-ready-key-change-in-prod"),
		JWTExpiresIn: jwtHours,
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUser:     getEnv("EMAIL_USER", ""),
		SMTPPass:     getEnv("EMAIL_PASS", ""),
		SMTPFrom:     getEnv("EMAIL_FROM", "no-reply@crewsync.dev"),
		ClientURL:    getEnv("CLIENT_URL", "http://localhost:3000"),
		Environment:  getEnv("APP_ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
