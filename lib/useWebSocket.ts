"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE_URL, getToken } from "./api";

export interface LiveEvent<T = any> {
  type: "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED" | "MEMBER_JOINED";
  crew_id: number;
  payload: T;
  timestamp: string;
}

export function useWebSocket(crewId: number | null, onEvent?: (event: LiveEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!crewId) return;
    const token = getToken();
    if (!token) return;

    const wsUrl = `${WS_BASE_URL}/crews/${crewId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`⚡ Connected to CrewSync Real-Time Hub for Crew #${crewId}`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: LiveEvent = JSON.parse(event.data);
        if (onEvent) {
          onEvent(parsed);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket connection closed. Reconnecting in 3s...");
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close();
    };
  }, [crewId, onEvent]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
