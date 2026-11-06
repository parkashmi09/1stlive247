import pg from "pg";
import { config } from "../config.ts";
import { logger } from "../logger.ts";

export const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 10 });
pool.on("error", (err) => logger.error({ err }, "idle postgres client error"));

/** Run fn inside a transaction; rolls back on throw. */
export async function tx<T>(fn: (c: pg.PoolClient) => Promise<T>, mode = ""): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN ${mode}`);
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Consistent multi-query read: every query sees the same committed snapshot. */
export const snapshot = <T>(fn: (c: pg.PoolClient) => Promise<T>) => tx(fn, "ISOLATION LEVEL REPEATABLE READ READ ONLY");
