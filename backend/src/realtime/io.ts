import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { z } from "zod";
import { logger } from "../logger.ts";
import type { MatchSource } from "../source.ts";
import type { ClientToServer, ServerToClient } from "../types.ts";

export type Io = Server<ClientToServer, ServerToClient>;
export const LIVE_ROOM = "live";
export const matchRoom = (id: string) => `match:${id}`;

const Sub = z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/) });
const MAX_ROOMS = 20;        // per socket
const RATE = { tokens: 20, refillMs: 1000 }; // ~20 client events/sec

export function createIo(server: HttpServer, origins: string[], source: MatchSource): Io {
  const io: Io = new Server(server, {
    cors: { origin: origins },
    maxHttpBufferSize: 10_000, // clients only send tiny subscribe messages
    // Browsers always send Origin; reject cross-site hijacking. Server-to-server clients send none.
    allowRequest: (req, cb) => cb(null, !req.headers.origin || origins.includes(req.headers.origin)),
  });

  io.on("connection", (socket) => {
    let tokens = RATE.tokens;
    const refill = setInterval(() => { tokens = RATE.tokens; }, RATE.refillMs);
    socket.use((_packet, next) => (tokens-- > 0 ? next() : next(new Error("rate_limited"))));
    socket.on("error", (err) => { if (err.message === "rate_limited") socket.disconnect(true); });

    socket.on("match:subscribe", async (payload, ack) => {
      const p = Sub.safeParse(payload);
      if (!p.success) return ack?.({ ok: false, error: "bad_request" });
      if (socket.rooms.size > MAX_ROOMS) return ack?.({ ok: false, error: "too_many_subscriptions" });
      if (!(await source.get(p.data.id))) return ack?.({ ok: false, error: "not_found" });
      await socket.join(matchRoom(p.data.id));
      ack?.({ ok: true });
    });
    socket.on("match:unsubscribe", (payload) => {
      const p = Sub.safeParse(payload);
      if (p.success) void socket.leave(matchRoom(p.data.id));
    });
    socket.on("live:subscribe", async (ack) => {
      await socket.join(LIVE_ROOM);
      if (typeof ack === "function") ack({ ok: true });
    });
    socket.on("disconnect", () => clearInterval(refill));
  });

  logger.info({ origins }, "socket.io ready");
  return io;
}
