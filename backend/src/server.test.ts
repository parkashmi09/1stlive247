// End-to-end: REST + Socket.IO + live engine against the real database (re-seeded first).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { io as connect, type Socket } from "socket.io-client";
import { migrate } from "./db/migrate.ts";
import { seed } from "./db/seed.ts";
import { startServer } from "./server.ts";
import type { ClientToServer, Match, ServerToClient } from "./types.ts";

let app: Awaited<ReturnType<typeof startServer>>;
let base = "";
let client: Socket<ServerToClient, ClientToServer>;

before(async () => {
  assert.match(process.env.DATABASE_URL ?? "", /_test$/, "tests must run against a *_test database");
  await migrate({ reset: true });
  await seed();
  app = await startServer(0);
  base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
  client = connect(base, { transports: ["websocket"] });
  await new Promise<void>((r) => client.once("connect", r));
});
after(async () => { client.close(); await app.close(); });

const get = async (p: string) => { const r = await fetch(base + p); return { status: r.status, body: await r.json() as { data: unknown } }; };

test("REST: lists live cricket and returns 404/400 properly", async () => {
  const live = await get("/api/v1/matches?status=live&sport=cricket");
  assert.equal(live.status, 200);
  assert.deepEqual((live.body.data as Match[]).map((m) => m.id), ["ind-aus-odi-2"]);
  assert.equal((await get("/api/v1/matches/nope")).status, 404);
  assert.equal((await get("/api/v1/matches?status=bogus")).status, 400);
  const centre = await get("/api/v1/matches/ind-aus-odi-2/centre");
  assert.equal((centre.body.data as { total: string }).total, "186/4 (17.2)");
});

test("socket: subscribe rejects unknown match", async () => {
  const r = await client.emitWithAck("match:subscribe", { id: "nope" });
  assert.deepEqual(r, { ok: false, error: "not_found" });
});

test("socket: a ball is persisted and pushed to match subscribers", async () => {
  assert.deepEqual(await client.emitWithAck("match:subscribe", { id: "ind-aus-odi-2" }), { ok: true });
  const update = new Promise<Match>((r) => client.once("match:update", r));
  const commentary = new Promise<{ entries: { type: string }[] }>((r) => client.once("commentary:new", r));
  await app.handle({ type: "cricket:ball", matchId: "ind-aus-odi-2", outcome: { kind: "four", runs: 4 } });

  const m = await update;
  assert.equal(m.home.score, "190/4");
  assert.equal(m.home.detail, "(17.3)");
  assert.equal((await commentary).entries[0]?.type, "ball");
  const centre = await get("/api/v1/matches/ind-aus-odi-2/centre");
  assert.match(JSON.stringify(centre.body.data), /"r":56/); // Iyer was on strike: 52 + 4
});

test("engine: concurrent events are broadcast in order", async () => {
  const seen: string[] = [];
  const on = (e: { entries: { type: string; over?: string }[] }) => { for (const x of e.entries) if (x.type === "ball") seen.push(x.over!); };
  client.on("commentary:new", on);
  await Promise.all([1, 2, 3, 4].map(() => app.handle({ type: "cricket:ball", matchId: "ind-aus-odi-2", outcome: { kind: "run", runs: 1 } })));
  // wait for delivery instead of a fixed sleep (the disk on this machine can be very slow)
  for (let t = 0; seen.length < 4 && t < 150; t++) await new Promise((r) => setTimeout(r, 100));
  client.off("commentary:new", on);
  assert.deepEqual(seen, ["17.4", "17.5", "17.6", "18.1"]);
});
