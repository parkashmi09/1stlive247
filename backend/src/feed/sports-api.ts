// Client for the in-house Sports API (Flashscore-backed). Server-to-server only: the key never reaches the browser.
// Endpoints come from the hub's /flashscore/panel/endpoints listing.
import { config } from "../config.ts";

export const ENDPOINTS = {
  sports: () => "/sports",
  live: (sport: string) => `/live/${enc(sport)}`,
  upcoming: (sport: string) => `/upcoming/${enc(sport)}`,
  scoreboard: (id: string) => `/event/${enc(id)}/scoreboard`,
  timer: (id: string) => `/event/${enc(id)}/timer`,
  logos: (id: string) => `/event/${enc(id)}/logos`,
  slice: (id: string, part: Slice) => `/event/${enc(id)}/slice/${part}`,
} as const;

export const SLICES = ["core", "periods", "incidents", "commentary", "stats", "pbp", "lineups", "player_stats", "momentum", "odds", "h2h"] as const;
export type Slice = (typeof SLICES)[number];

const enc = encodeURIComponent;

export class SportsApiError extends Error {
  status: number;
  path: string;
  constructor(status: number, path: string, detail: string) {
    super(`Sports API ${status} on ${path}: ${detail}`);
    this.status = status;
    this.path = path;
  }
}

export function isConfigured() {
  return Boolean(config.PROVIDER_BASE_URL && config.PROVIDER_API_KEY);
}

/** GET a JSON path. Retries once on network errors / 5xx; 4xx are surfaced (bad key, IP not allowed…). */
export async function sportsApi<T = unknown>(path: string, { timeoutMs = 8000 } = {}): Promise<T> {
  if (!isConfigured()) throw new Error("PROVIDER_BASE_URL and PROVIDER_API_KEY must be set");
  const url = config.PROVIDER_BASE_URL!.replace(/\/$/, "") + path;
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { "X-API-Key": config.PROVIDER_API_KEY!, accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
      const body = await r.json().catch(() => null) as { error?: string; detail?: string; ok?: boolean } | null;
      if (r.ok && body?.ok !== false) return body as T;
      const detail = body?.error ?? body?.detail ?? r.statusText;
      if (r.status >= 500 && attempt === 0) continue;
      throw new SportsApiError(r.status === 200 ? 403 : r.status, path, detail);
    } catch (err) {
      if (err instanceof SportsApiError || attempt > 0) throw err;
    }
  }
}
