# =========================================================
# Multi-Stage Dockerfile for Go (Golang) Microservice
# Stage 1: Build & Compile Binary
# Stage 2: Minimal Production Container (< 20MB)
# =========================================================

# Stage 1: Builder
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install ca-certificates and git
RUN apk add --no-cache ca-certificates git

# Copy all source files
COPY . .

# Ensure all dependencies and transitive hashes are tidied and cached
RUN go mod tidy && go mod download

# Compile statically linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/bin/server \
    ./cmd/server/main.go

# Stage 2: Ultra-minimal Alpine Production Image (< 20MB)
FROM alpine:3.20 AS runner

WORKDIR /app

# Create non-root user for security compliance (FAANG best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy CA certs for outbound HTTPS/SMTP calls
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy compiled binary from builder stage
COPY --from=builder /app/bin/server /app/server

# Change ownership to non-root user
USER appuser:appgroup

# Expose Go API Port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the compiled binary
ENTRYPOINT ["/app/server"]
