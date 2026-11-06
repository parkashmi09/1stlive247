import { z } from "zod";

// Validate env once at boot; fail fast with a readable message instead of undefined at runtime.
const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4247),
  DATABASE_URL: z.string().url(),
  CORS_ORIGINS: z.string().default("http://localhost:3247").transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean)),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  LIVE_PROVIDER: z.enum(["mock", "sportsapi", "none"]).default("mock"),
  MOCK_TICK_MS: z.coerce.number().int().min(250).default(4000),
  PROVIDER_API_KEY: z.string().optional(),
  PROVIDER_BASE_URL: z.string().optional(),
  // Cricket comes from the in-house Cricbuzz API when this key is set (other sports stay on the Sports API)
  CRICBUZZ_API_KEY: z.string().optional(),
  CRICBUZZ_BASE_URL: z.string().default("http://187.53.141.8:9228"),
});

const parsed = Env.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
