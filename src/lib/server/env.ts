import { z } from 'zod';

const schema = z.object({
  NEWS_API_KEY: z.string().trim().optional(),
  TMDB_API_KEY: z.string().trim().optional(),
  AUTH_SECRET: z.string().trim().optional(),
  MOCK_DELAY_MS: z.coerce.number().int().min(0).max(5000).default(250),
});

export type ServerEnv = z.infer<typeof schema>;

/** Validated lazily so `next build` works with no env at all (mock mode). */
export function getEnv(): ServerEnv {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.warn('[env] invalid environment variables, falling back to defaults');
    return schema.parse({});
  }
  const env = parsed.data;
  return {
    ...env,
    NEWS_API_KEY: env.NEWS_API_KEY || undefined,
    TMDB_API_KEY: env.TMDB_API_KEY || undefined,
    AUTH_SECRET: env.AUTH_SECRET || undefined,
  };
}
