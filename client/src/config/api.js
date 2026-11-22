// ==============================================================================
// Client API Configuration (client/src/config/api.js)
// ==============================================================================
// Centralizes the backend API base URL so the frontend runs seamlessly both
// in local development and when deployed to production (e.g. Vercel).

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";
