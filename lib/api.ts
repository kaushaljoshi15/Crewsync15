// API Client for communicating with the Go High-Performance Microservice

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

export { API_BASE_URL, WS_BASE_URL };

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Crew {
  id: number;
  name: string;
  description: string;
  lead_id: number;
  lead_name?: string;
  task_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: number;
  crew_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role: string;
  joined_at: string;
}

export interface Task {
  id: number;
  crew_id: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignee_id?: number;
  assignee_name?: string;
  creator_id: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Token helper
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crewsync_token");
};

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("crewsync_token", token);
  }
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("crewsync_token");
  }
};

// Common HTTP Fetch Wrapper with Authorization
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "An unexpected error occurred");
  }

  return data as T;
}
