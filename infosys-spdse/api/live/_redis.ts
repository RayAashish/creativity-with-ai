import { Redis } from '@upstash/redis';

// Keys per data model spec
export const KEYS = {
  TOTAL_VISITS: 'live:total_visits',
  UNIQUE_VISITORS: 'live:unique_visitors',
  ACTIVE_SET: 'live:active',
  RATE_PREFIX: 'live:rate:',
} as const;

export const ACTIVE_WINDOW_MS = 60000; // 60 seconds active window
export const RATE_LIMIT_SECONDS = 10;  // 1 write per 10s per id

/**
 * Initializes Redis client using environment variables.
 * Checks both UPSTASH_REDIS_REST_* and KV_REST_API_* conventions.
 * Returns null if credentials are not configured or invalid.
 */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

/**
 * Strict UUID v4 / RFC4122 format validation with 36-character length cap.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidVisitorId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  if (id.length !== 36) return false;
  return UUID_REGEX.test(id);
}

/**
 * Common bot / crawler / spider / automated fetcher detection.
 */
export function isBot(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  const botPattern = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|slackbot|twitterbot|bingbot|googlebot|yandex|duckduckgo|baidu/i;
  return botPattern.test(userAgent);
}
