# 🐳 CrewSync Docker & Containerization Guide

Welcome to the Docker guide for **CrewSync**! If you are a beginner to Docker, this guide explains what containers are, why we use them, and the exact commands to run and manage your distributed system.

---

## 🧠 1. What is Docker & Why Do We Use It?

In traditional development, running this project requires you to manually install and configure:
1. Go (Golang) compiler and runtime
2. PostgreSQL 16 server and create the database
3. Redis 7 server
4. Node.js and Next.js

With **Docker**, every component is packaged into an isolated, self-contained box called a **Container**.
- **Container**: A lightweight running instance of your app + dependencies.
- **Image**: A blueprint/template used to create containers.
- **Docker Compose**: A tool to start and connect all containers together with 1 command.

---

## 🚀 2. Quickstart: Running Everything in 1 Command

Make sure **Docker Desktop** is running on your machine, then open your terminal in the project root:

### Start All Services (Go API + Next.js Frontend + PostgreSQL + Redis):
```bash
docker compose up --build
```

To run in the background (detached mode):
```bash
docker compose up --build -d
```

---

## 🌐 3. Accessible URLs Once Running

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | Next.js 15 Web Application |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Go Fiber REST API |
| **API Health Check** | [http://localhost:8080/health](http://localhost:8080/health) | Live system metrics, memory & DB status |
| **PostgreSQL DB** | `localhost:5432` | Relational database (user: `postgres`, db: `crewsync`) |
| **Redis Cache** | `localhost:6379` | In-memory cache & rate limiter |

---

## 🛠️ 4. Useful Docker Commands for Everyday Use

### View Running Containers & Health Status:
```bash
docker compose ps
```

### View Live Logs (e.g. from Go backend or worker pool):
```bash
docker compose logs -f backend
```

### Stop All Containers:
```bash
docker compose down
```

### Stop All Containers AND Wipe Database Volumes (Fresh Start):
```bash
docker compose down -v
```

---

## 📦 5. Multi-Stage Docker Build Explanation (FAANG Interview Topic)

Take a look at `backend/Dockerfile`. It uses a technique called **Multi-Stage Builds**:

```dockerfile
# Stage 1: Build binary using the full Go SDK (~800MB)
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/server ./cmd/server/main.go

# Stage 2: Copy ONLY the compiled binary into a tiny Alpine image (~15MB)
FROM alpine:3.20 AS runner
COPY --from=builder /app/bin/server /app/server
ENTRYPOINT ["/app/server"]
```

### 💡 Why Interviewers Love This:
1. **Security**: The production container has zero compiler tools or package managers that attackers could exploit.
2. **Speed & Size**: The final container size drops from **850MB ➔ 18MB**, saving cloud bandwidth and accelerating deployment times in Kubernetes/AWS ECS.
