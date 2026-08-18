# CrewSync 🚀
### High-Performance Real-Time Distributed Team Coordination Platform

[![Go Version](https://img.shields.io/badge/Go-1.23-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![Next.js Version](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

---

## 🌟 Overview

**CrewSync** is a distributed, real-time team coordination and project execution platform built with **Go (Golang)**, **Next.js 15**, **PostgreSQL**, and **Redis**. It is engineered from the ground up for high concurrency, sub-15ms API response times, instant WebSocket synchronization, and containerized deployment with **Docker & Docker Compose**.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend: Next.js 15 App Router             │
│            (TypeScript, Tailwind CSS, Real-Time UI)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST & WebSocket (ws://)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend: Golang (Fiber Engine)              │
│  ├── Middleware: Redis Rate Limiter & JWT RBAC Auth         │
│  ├── Real-time Hub: Goroutines & Channels Broadcast         │
│  ├── Service Layer: Crew & Project Management Logic         │
│  └── Worker Pool: Async Email OTP & Event Queue             │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      PostgreSQL (Database)   │ │       Redis (Cache/Queue)  │
│  ├── Users, Roles, Crews     │ │  ├── OTP & Session Cache   │
│  └── Tasks & Project Events  │ │  └── Rate Limit Tokens     │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 🚀 Key Engineering Highlights (Big-Tech Ready)

- ⚡ **Go Concurrency Hub**: Custom WebSocket hub utilizing **Goroutines and Go Channels** for broadcasting live Kanban board events to connected clients with minimal RAM overhead.
- 🛡️ **Distributed Rate Limiting**: Token-bucket algorithm implemented with **Redis** to safeguard authentication routes against brute-force attacks.
- 📬 **Asynchronous Worker Pool**: Multi-threaded Go worker queue for offloading email OTP delivery and background jobs without blocking HTTP handlers.
- 🗄️ **PostgreSQL Connection Pooling (`pgxpool`)**: Configured with automatic reconnection, migration execution, and indexed relational queries.
- 🐳 **Docker Multi-Stage Builds**: Ultra-compact production containers (< 20MB) with non-root security compliance and full **Docker Compose** multi-container orchestration.
- 🏛️ **Clean Architecture**: Decoupled Domain-Driven Design (`domain` ➔ `repository` ➔ `service` ➔ `handler`).

---

## 🐳 Quickstart with Docker (Recommended)

Run the entire distributed system with a single command:

```bash
docker compose up --build
```

### Services & Endpoints:
- 🌐 **Frontend App:** [http://localhost:3000](http://localhost:3000)
- ⚙️ **Go API Server:** [http://localhost:8080](http://localhost:8080)
- 🩺 **Health & Metrics:** [http://localhost:8080/health](http://localhost:8080/health)
- 🗄️ **PostgreSQL Database:** `localhost:5432`
- ⚡ **Redis Cache:** `localhost:6379`

For complete Docker details, check [DOCKER_GUIDE.md](file:///e:/crew%20sync%20Major%20Project/DOCKER_GUIDE.md).  
For interview explanations and architectural deep-dives, check [ARCHITECTURE.md](file:///e:/crew%20sync%20Major%20Project/ARCHITECTURE.md).

---

## 📁 Repository Structure

```text
crew sync Major Project/
├── backend/                  # High-Performance Golang Microservice
│   ├── cmd/server/main.go    # Server entry point & graceful shutdown
│   ├── internal/
│   │   ├── config/           # Environment & config loader
│   │   ├── database/         # PostgreSQL (pgxpool) & Redis initialization
│   │   ├── domain/           # Core Entities (User, Crew, Task, OTP)
│   │   ├── handler/          # HTTP & WebSocket route controllers
│   │   ├── middleware/       # JWT Auth, Redis Rate Limiter, CORS
│   │   ├── repository/       # Data Access Layer (SQL queries)
│   │   ├── service/          # Business logic & event dispatchers
│   │   ├── websocket/        # Real-time Goroutine Concurrency Hub
│   │   └── worker/           # Asynchronous Email & Event Worker Pool
│   ├── Dockerfile            # Multi-stage production container (< 20MB)
│   └── go.mod
├── lib/
│   ├── api.ts                # TypeScript client library for Go API
│   └── useWebSocket.ts       # React hook for real-time live synchronization
├── docker-compose.yml        # Multi-container production stack
├── docker-compose.dev.yml    # Development compose stack
├── Dockerfile.frontend       # Next.js production container
├── DOCKER_GUIDE.md           # Beginner guide for Docker & commands
├── ARCHITECTURE.md           # FAANG system design & interview talking points
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
