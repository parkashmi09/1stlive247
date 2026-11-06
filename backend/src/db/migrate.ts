// Minimal forward-only SQL migrations: applies migrations/*.sql in order, once each.
// Usage: npm run db:migrate            (apply pending)
//        npm run db:migrate -- --reset (drop public schema first — dev only)
import { readdir, readFile } from "node:fs/promises";
import { config } from "../config.ts";
import { pool, tx } from "./pool.ts";

const dir = new URL("../../migrations/", import.meta.url);

export async function migrate({ reset = false } = {}) {
  if (reset) {
    if (config.NODE_ENV === "production") throw new Error("--reset is not allowed in production");
    await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  }
  await pool.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const done = new Set((await pool.query<{ name: string }>("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const applied: string[] = [];
  for (const f of files.filter((f) => !done.has(f))) {
    const sql = await readFile(new URL(f, dir), "utf8");
    await tx(async (c) => {
      await c.query(sql);
      await c.query("INSERT INTO schema_migrations (name) VALUES ($1)", [f]);
    });
    applied.push(f);
  }
  return applied;
}

if (import.meta.main) {
  const applied = await migrate({ reset: process.argv.includes("--reset") });
  console.log(applied.length ? `applied: ${applied.join(", ")}` : "up to date");
  await pool.end();
}
