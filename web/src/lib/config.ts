// The backend base URL, from web/.env (NEXT_PUBLIC_API_URL). Plain HTTP today, so only the server talks to it directly.
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4247";
// Browser calls go same-origin through the next.config rewrites (/api/v1, /sio): an HTTPS page may not call an
// http:// backend (mixed content), and same-origin needs no CORS.
export const API_URL = typeof window === "undefined" ? BACKEND_URL : "";
// shortcut: NEXT_PUBLIC_DATA_SOURCE=snapshot serves a frozen dump (web/snapshot, `npm run snapshot`) while the hosted backend has no feed access; drop it once the server backend is live.
export const SNAPSHOT = process.env.NEXT_PUBLIC_DATA_SOURCE === "snapshot";
