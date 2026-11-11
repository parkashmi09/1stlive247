// Backend base URL (REST + Socket.IO). Safe for both server and browser bundles.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4247";
// Default: read frozen data from web/snapshot/ with no socket (no backend). NEXT_PUBLIC_DATA_SOURCE=api = live backend.
export const SNAPSHOT = process.env.NEXT_PUBLIC_DATA_SOURCE !== "api";
