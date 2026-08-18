package worker

import (
	"context"
	"fmt"
	"log"
	"net/smtp"
	"sync"
	"time"

	"github.com/kaushaljoshi15/crewsync-backend/internal/config"
)

// EmailJob encapsulates an email payload to be sent asynchronously
type EmailJob struct {
	To       string
	Subject  string
	BodyText string
}

// EmailWorkerPool manages a pool of concurrent Goroutines processing email dispatch jobs
type EmailWorkerPool struct {
	cfg        *config.Config
	jobs       chan EmailJob
	wg         sync.WaitGroup
	ctx        context.Context
	cancelFunc context.CancelFunc
}

// NewEmailWorkerPool creates and starts a worker pool with numWorkers concurrent goroutines
func NewEmailWorkerPool(cfg *config.Config, numWorkers int, bufferSize int) *EmailWorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	pool := &EmailWorkerPool{
		cfg:        cfg,
		jobs:       make(chan EmailJob, bufferSize),
		ctx:        ctx,
		cancelFunc: cancel,
	}

	log.Printf("🚀 Starting Email Worker Pool with %d concurrent Go workers (buffer: %d)...", numWorkers, bufferSize)
	for i := 1; i <= numWorkers; i++ {
		pool.wg.Add(1)
		go pool.worker(i)
	}

	return pool
}

// Dispatch queues a new email job without blocking the HTTP request handler
func (p *EmailWorkerPool) Dispatch(job EmailJob) {
	select {
	case p.jobs <- job:
		// Job successfully queued
	case <-time.After(100 * time.Millisecond):
		log.Printf("⚠️ Warning: Email worker pool buffer full! Dropping job to %s", job.To)
	}
}

// worker is a long-running goroutine pulling jobs from the channel
func (p *EmailWorkerPool) worker(id int) {
	defer p.wg.Done()
	for {
		select {
		case <-p.ctx.Done():
			log.Printf("Worker #%d shutting down gracefully...", id)
			return
		case job, ok := <-p.jobs:
			if !ok {
				return
			}
			p.sendEmail(id, job)
		}
	}
}

func (p *EmailWorkerPool) sendEmail(workerID int, job EmailJob) {
	if p.cfg.SMTPUser == "" || p.cfg.SMTPPass == "" {
		// Development Mode: Log clearly to console
		log.Printf("[DEV EMAIL WORKER #%d] 📧 To: %s | Subject: %s\nBody:\n%s\n-----------------------------------",
			workerID, job.To, job.Subject, job.BodyText)
		return
	}

	// Production Mode: Send via SMTP
	auth := smtp.PlainAuth("", p.cfg.SMTPUser, p.cfg.SMTPPass, p.cfg.SMTPHost)
	msg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\n\r\n%s", job.To, job.Subject, job.BodyText))
	addr := fmt.Sprintf("%s:%s", p.cfg.SMTPHost, p.cfg.SMTPPort)

	err := smtp.SendMail(addr, auth, p.cfg.SMTPFrom, []string{job.To}, msg)
	if err != nil {
		log.Printf("[WORKER #%d] ❌ Failed to send email to %s: %v", workerID, job.To, err)
		return
	}
	log.Printf("[WORKER #%d] ✅ Successfully sent email to %s", workerID, job.To)
}

// Stop gracefully waits for existing jobs to finish before shutting down
func (p *EmailWorkerPool) Stop() {
	p.cancelFunc()
	close(p.jobs)
	p.wg.Wait()
	log.Println("All email workers stopped cleanly")
}
