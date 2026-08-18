# 🏛️ CrewSync Distributed System Architecture & FAANG Guide

This document breaks down the deep architectural decisions, concurrency patterns, and distributed systems concepts implemented in **CrewSync** to help you explain every single layer during technical interviews at Google, Amazon, Microsoft, and PayPal.

---

## 🏗️ 1. Clean Architecture (Domain-Driven Design)

The Go backend is structured using **Clean Architecture** (Hexagonal / Onion Architecture). This ensures that business logic is completely decoupled from databases, HTTP frameworks, and external third-party libraries:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│    `internal/handler/` (Fiber HTTP Controllers & WS)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Calls Interface
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│   `internal/service/` (Auth, Crew, Task Business Logic)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Calls Interface
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Repository Layer                        │
│   `internal/repository/` (PostgreSQL CRUD Queries)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Maps to
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                          │
│  `internal/domain/` (Core Structs: User, Crew, Task, OTP)   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ 2. Concurrency & Real-Time Synchronization (Goroutines & Channels)

### ❓ Interview Question: *"How does CrewSync handle real-time collaboration at scale?"*

**Your Answer:**
> *"Instead of using heavy threads or polling the database every few seconds, we implemented a custom, thread-safe WebSocket Hub in Go using Goroutines and Go channels. Each connected user connection runs two lightweight Go routines: a ReadPump and a WritePump. When a task is created or updated on the Kanban board, the service layer dispatches a `LiveEvent` across an event channel. The Hub's central event loop selects the message and non-blockingly broadcasts it to all active client channels in that specific crew room."*

```go
// Event Loop in internal/websocket/hub.go
select {
case client := <-h.register:
    // Thread-safe map insertion protected by sync.RWMutex
case event := <-h.broadcast:
    for client := range h.crews[event.CrewID] {
        select {
        case client.Send <- data:
        default:
            close(client.Send)
            delete(h.crews[event.CrewID], client)
        }
    }
}
```

---

## 🛡️ 3. Distributed Rate Limiting (Token-Bucket with Redis)

### ❓ Interview Question: *"How do you prevent brute-force attacks and DDoS on authentication endpoints?"*

**Your Answer:**
> *"We implemented a distributed rate limiter middleware in Go backed by Redis using the Token-Bucket algorithm. For critical authentication endpoints (`/register`, `/login`), each client IP is tracked in Redis with a TTL sliding window. If a user exceeds 10 requests per minute, the server responds with an HTTP `429 Too Many Requests` along with a `Retry-After` header. If the Redis instance temporarily experiences downtime, the middleware gracefully falls back to an in-memory concurrent sync.Map token bucket."*

---

## 📬 4. Asynchronous Background Worker Queue

### ❓ Interview Question: *"How do you ensure sub-15ms API response times even when sending emails or generating reports?"*

**Your Answer:**
> *"Sending emails over SMTP involves network latency (often 1-3 seconds). To prevent blocking the user's HTTP request cycle, we built an in-process concurrent Worker Pool in Go. When a user registers, the HTTP handler generates the OTP, inserts the record in PostgreSQL, enqueues an `EmailJob` into a buffered Go channel (`chan EmailJob`), and immediately returns HTTP 201 Created (< 10ms). A pool of 5 long-running background worker Goroutines consumes jobs from the channel and handles SMTP delivery."*

---

## 🗄️ 5. PostgreSQL Optimization & Connection Pooling

- **Connection Pool (`pgxpool`)**: Configured with `MaxConns=25` and `MinConns=5` with connection recycling (`MaxConnLifetime=1h`) to eliminate TCP connection overhead for every HTTP request.
- **B-Tree Indexing**: Created indexes on `users(email)`, `users(role)`, `verification_codes(email)`, `tasks(crew_id, status)`, and `crew_members(crew_id, user_id)` to keep search complexity at $O(\log N)$.
- **Database Transactions (`tx.Begin`)**: Used in multi-step mutations (such as creating a crew and atomically enrolling the creator as the lead member) to maintain ACID consistency.
