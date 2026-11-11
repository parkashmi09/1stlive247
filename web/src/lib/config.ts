// Backend base URL (REST + Socket.IO). Safe for both server and browser bundles.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4247";
// "snapshot" = read frozen data from web/snapshot/ and skip the socket (no backend needed, e.g. on Vercel)
export const SNAPSHOT = process.env.NEXT_PUBLIC_DATA_SOURCE === "snapshot";
