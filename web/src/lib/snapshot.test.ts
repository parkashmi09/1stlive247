import assert from "node:assert/strict";
import { test } from "node:test";
import { snapshotGet } from "./snapshot.ts";

test("snapshot answers api paths like the backend", async () => {
  const all = (await snapshotGet("/matches")) as { id: string; status: string }[];
  assert.ok(all.length > 0);
  const live = (await snapshotGet("/matches?status=live")) as { status: string }[];
  assert.ok(live.every((m) => m.status === "live"));
  const one = (await snapshotGet(`/matches/${encodeURIComponent(all[0].id)}`)) as { id: string };
  assert.equal(one.id, all[0].id);
  assert.equal(await snapshotGet("/matches/nope-not-there"), undefined);
  assert.equal(await snapshotGet("/matches/..%2Findex"), undefined); // no path escape
});
