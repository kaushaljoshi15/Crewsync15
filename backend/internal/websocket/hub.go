package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/kaushaljoshi15/crewsync-backend/internal/domain"
)

// Client represents an active WebSocket connection
type Client struct {
	Hub     *Hub
	Conn    *websocket.Conn
	UserID  int64
	CrewID  int64
	Send    chan []byte
	IsAlive bool
}

// Hub maintains the set of active clients and broadcasts messages to rooms
type Hub struct {
	// Registered clients mapped by crewID -> Client
	crews      map[int64]map[*Client]bool
	broadcast  chan domain.LiveEvent
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// NewHub creates a new thread-safe WebSocket Hub
func NewHub() *Hub {
	return &Hub{
		crews:      make(map[int64]map[*Client]bool),
		broadcast:  make(chan domain.LiveEvent, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the event loop handling registration and broadcasting via Goroutine
func (h *Hub) Run() {
	log.Println("⚡ Real-Time WebSocket Hub initialized and listening for events...")
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.crews[client.CrewID] == nil {
				h.crews[client.CrewID] = make(map[*Client]bool)
			}
			h.crews[client.CrewID][client] = true
			h.mu.Unlock()
			log.Printf("🔌 WS Client connected: UserID=%d to CrewID=%d (Active in room: %d)",
				client.UserID, client.CrewID, len(h.crews[client.CrewID]))

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.crews[client.CrewID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.crews, client.CrewID)
					}
					log.Printf("🔌 WS Client disconnected: UserID=%d from CrewID=%d", client.UserID, client.CrewID)
				}
			}
			h.mu.Unlock()

		case event := <-h.broadcast:
			h.mu.RLock()
			clients := h.crews[event.CrewID]
			if len(clients) > 0 {
				event.Timestamp = time.Now()
				data, err := json.Marshal(event)
				if err == nil {
					for client := range clients {
						select {
						case client.Send <- data:
						default:
							// Client buffer full, close and remove
							close(client.Send)
							delete(clients, client)
						}
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast sends a live event to all connected members of a crew
func (h *Hub) Broadcast(event domain.LiveEvent) {
	h.broadcast <- event
}

func (h *Hub) Register(c *Client) {
	h.register <- c
}

func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}
