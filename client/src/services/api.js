import axios from "axios";

// Use env var in production, fallback to localhost for local dev
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
});

export function fetchEmissions(params = {}) {
  return api.get("/api/data", { params });
}

export function sendChat(question, contextData) {
  return api.post("/api/chat", { question, contextData });
}

export function fetchRealtime() {
  return api.get("/api/realtime");
}