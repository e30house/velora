// In dev, "/api" is relative and handled by the Vite proxy (see
// vite.config.ts) so client and server can run on different ports without
// CORS pain. In production the client (static site) and server (long-running
// host) are deployed separately, so VITE_API_URL must point at the real
// server origin, e.g. https://velora-api.up.railway.app.
export const API_BASE = import.meta.env.VITE_API_URL ?? "";
