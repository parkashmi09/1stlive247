import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { z } from "zod";
import { config } from "../config.ts";
import { pool } from "../db/pool.ts";
import { logger } from "../logger.ts";
import { getNews, listNews, listSports } from "../repo/read.ts";
import { pickFeatured } from "../featured.ts";
import type { MatchSource } from "../source.ts";
import type { MatchInsights } from "../types.ts";

const Slug = z.string().regex(/^[a-z0-9-]{1,80}$/);
// feed ids are mixed-case (e.g. "08oviIGO"); same charset the Sports API accepts
const EventId = z.string().regex(/^[A-Za-z0-9_-]{1,80}$/);
const SportId = z.enum(["cricket", "football", "tennis", "kabaddi", "basketball", "racing", "f1"]);
const MatchQuery = z.object({ status: z.enum(["live", "upcoming", "finished"]).optional(), sport: SportId.optional() });
const NewsQuery = z.object({ sport: SportId.optional(), limit: z.coerce.number().int().min(1).max(100).optional() });

class NotFound extends Error {}
const found = <T>(v: T | undefined): T => { if (v === undefined) throw new NotFound(); return v; };

export function createApp(source: MatchSource, opts: { insights?: (id: string) => Promise<MatchInsights> } = {}) {
  // insights change slowly: cache each match's for 10s so many viewers cost one upstream call
  const insightsCache = new Map<string, { at: number; data: Promise<MatchInsights> }>();
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGINS }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => { res.json({ ok: true }); });
  app.get("/ready", async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  });

  const v1 = express.Router();
  v1.get("/sports", async (_req, res) => { res.json({ data: await listSports() }); });
  v1.get("/featured", async (_req, res) => { res.json({ data: pickFeatured(await source.list({ status: "upcoming" })) }); });
  v1.get("/matches", async (req, res) => { res.json({ data: await source.list(MatchQuery.parse(req.query)) }); });
  v1.get("/matches/:id", async (req, res) => { res.json({ data: found(await source.get(EventId.parse(req.params.id))) }); });
  const insights = async (id: string) => {
    if (!opts.insights) throw new NotFound();
    let hit = insightsCache.get(id);
    if (!hit || Date.now() - hit.at > 10_000) {
      hit = { at: Date.now(), data: opts.insights(id).catch((err) => { insightsCache.delete(id); throw err; }) };
      insightsCache.set(id, hit);
      if (insightsCache.size > 500) insightsCache.delete(insightsCache.keys().next().value!);
    }
    try { return await hit.data; }
    catch (err) { if ((err as { status?: number }).status === 404) throw new NotFound(); throw err; }
  };
  v1.get("/matches/:id/insights", async (req, res) => { res.json({ data: await insights(EventId.parse(req.params.id)) }); });
  // older clients: just the full-match stat groups
  v1.get("/matches/:id/stats", async (req, res) => { res.json({ data: (await insights(EventId.parse(req.params.id))).periods[0]?.groups ?? [] }); });
  v1.get("/matches/:id/centre", async (req, res) => { res.json({ data: found(await source.centre(EventId.parse(req.params.id))) }); });
  v1.get("/news", async (req, res) => { res.json({ data: await listNews(NewsQuery.parse(req.query)) }); });
  v1.get("/news/:slug", async (req, res) => { res.json({ data: found(await getNews(Slug.parse(req.params.slug))) }); });
  app.use("/api/v1", (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); }, v1);

  app.use((_req, res) => { res.status(404).json({ error: "not_found" }); });

  const onError: ErrorRequestHandler = (err, req, res, _next) => {
    if (err instanceof NotFound) return void res.status(404).json({ error: "not_found" });
    if (err instanceof z.ZodError) return void res.status(400).json({ error: "bad_request", issues: z.flattenError(err) });
    logger.error({ err, path: req.path }, "request failed");
    res.status(500).json({ error: "internal" });
  };
  app.use(onError);
  return app;
}
