package database

import (
	"context"
	"fmt"
	"log"
)

// RunMigrations executes initial DDL schema migrations for PostgreSQL
func (s *Storage) RunMigrations(ctx context.Context) error {
	schema := `
	-- 1. Users Table
	CREATE TABLE IF NOT EXISTS users (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash TEXT,
		google_id VARCHAR(255),
		role VARCHAR(50) DEFAULT 'volunteer' NOT NULL,
		is_verified BOOLEAN DEFAULT FALSE NOT NULL,
		avatar_url TEXT,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

	-- 2. Verification Codes Table (Email OTP)
	CREATE TABLE IF NOT EXISTS verification_codes (
		id BIGSERIAL PRIMARY KEY,
		email VARCHAR(255) NOT NULL,
		code VARCHAR(10) NOT NULL,
		expires_at TIMESTAMPTZ NOT NULL,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_verification_email ON verification_codes(email);

	-- 3. Crews Table (Teams / Projects)
	CREATE TABLE IF NOT EXISTS crews (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		description TEXT DEFAULT '',
		lead_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_crews_lead_id ON crews(lead_id);

	-- 4. Crew Members Junction Table
	CREATE TABLE IF NOT EXISTS crew_members (
		id BIGSERIAL PRIMARY KEY,
		crew_id BIGINT NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		role VARCHAR(50) DEFAULT 'contributor' NOT NULL,
		joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
		UNIQUE(crew_id, user_id)
	);

	CREATE INDEX IF NOT EXISTS idx_crew_members_user ON crew_members(user_id);
	CREATE INDEX IF NOT EXISTS idx_crew_members_crew ON crew_members(crew_id);

	-- 5. Tasks Table (Kanban Board & Real-Time Sync)
	CREATE TABLE IF NOT EXISTS tasks (
		id BIGSERIAL PRIMARY KEY,
		crew_id BIGINT NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT DEFAULT '',
		status VARCHAR(50) DEFAULT 'TODO' NOT NULL,
		priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,
		assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
		creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		due_date TIMESTAMPTZ,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
	);

	CREATE INDEX IF NOT EXISTS idx_tasks_crew_status ON tasks(crew_id, status);
	CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
	`

	_, err := s.DB.Exec(ctx, schema)
	if err != nil {
		return fmt.Errorf("failed to run database migrations: %w", err)
	}

	log.Println("✅ Database schema migrations applied successfully")
	return nil
}
