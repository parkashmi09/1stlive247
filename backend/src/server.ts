import { createServer } from "node:http";
import { config } from "./config.ts";
import { migrate } from "./db/migrate.ts";
import { pool } from "./db/pool.ts";
import { isConfigured } from "./feed/sports-api.ts";
import { createCricketFeed, type CricketFeed } from "./feed/cricbuzz.ts";
import { createLogoIndex, type LogoIndex } from "./feed/logos.ts";
import { createFeedStore, fetchStats, type FeedStore } from "./feed/store.ts";
import { createApp } from "./http/app.ts";
import { createEngine } from "./live/engine.ts";
import { createMockProvider } from "./live/mock-provider.ts";
import type { LiveProvider } from "./live/provider.ts";
import { logger } from "./logger.ts";
import { LIVE_ROOM, createIo, matchRoom, type Io } from "./realtime/io.ts";
import { dbSource, feedSource, type MatchSource } from "./source.ts";
import type { Match } from "./types.ts";

export async function startServer(port = config.PORT) {
  // apply pending migrations (forward-only, never resets) so code and schema can't drift apart
  const applied = await migrate();
  if (applied.length) logger.info({ applied }, "migrations applied");

  let io: Io | undefined;
  let store: FeedStore | undefined;
  let cricket: CricketFeed | undefined;
  let logos: LogoIndex | undefined;
  let source: MatchSource = dbSource;
  const pushMatch = (m: Match) => io?.to([LIVE_ROOM, matchRoom(m.id)]).emit("match:update", m);

  if (config.LIVE_PROVIDER === "sportsapi") {
    if (!isConfigured()) throw new Error("LIVE_PROVIDER=sportsapi needs PROVIDER_BASE_URL and PROVIDER_API_KEY");
    store = createFeedStore(pushMatch, (sb) => { if (sb.sport === "cricket") void logos?.ingest([sb]).catch(() => {}); });
    if (config.CRICBUZZ_API_KEY) {
      logos = createLogoIndex("cricket"); // logos from Flashscore, scores from Cricbuzz
      cricket = createCricketFeed({
        logoOf: (name) => logos?.lookup(name),
        onMatch: pushMatch,
        onCentre: (id, c, fresh) => {
          const { commentary: _, ...core } = c;
          io?.to(matchRoom(id)).emit("centre:update", core);
          if (fresh.length) io?.to(matchRoom(id)).emit("commentary:new", { matchId: id, entries: fresh });
        },
        // heavy parts (scorecard, commentary) are only fetched while someone has the match open
        isWatched: (id) => (io?.sockets.adapter.rooms.get(matchRoom(id))?.size ?? 0) > 0,
      });
    }
    source = feedSource(store, cricket);
  }

  const server = createServer(createApp(source, store ? { stats: fetchStats } : {}));
  io = createIo(server, config.CORS_ORIGINS, source);
  const handle = createEngine(io);
  const provider: LiveProvider | undefined = config.LIVE_PROVIDER === "mock" ? createMockProvider(config.MOCK_TICK_MS) : undefined;

  await logos?.start(); // before cricket so the first list already has logos
  await Promise.all([store?.start(), cricket?.start()]);
  provider?.start(handle);
  await new Promise<void>((r) => server.listen(port, r));
  logger.info({ port: (server.address() as { port: number }).port, provider: config.LIVE_PROVIDER }, "1stLive247 backend listening");

  const close = async () => {
    provider?.stop();
    store?.stop();
    cricket?.stop();
    logos?.stop();
    await io!.close(); // also closes the http server
    await pool.end();
  };
  return { server, io, handle, close };
}

if (import.meta.main) {
  const app = await startServer();
  for (const sig of ["SIGINT", "SIGTERM"] as const)
    process.once(sig, async () => {
      logger.info({ sig }, "shutting down");
      await app.close();
      process.exit(0);
    });
}
