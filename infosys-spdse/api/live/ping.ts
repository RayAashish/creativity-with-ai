import { getRedis, KEYS, ACTIVE_WINDOW_MS, RATE_LIMIT_SECONDS, isValidVisitorId, isBot } from './_redis.js';

export default async function handler(req: any, res: any) {
  // Never cache live ping endpoint
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle CORS preflight if needed
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    // Parse and validate body
    let body = req.body;
    if (typeof body === 'string') {
      if (body.length > 1024) {
        return res.status(400).json({ ok: false, error: 'Body too large' });
      }
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ ok: false, error: 'Missing request body' });
    }

    const { id, newSession } = body;

    // Strict validation of anonymous visitor UUID
    if (!isValidVisitorId(id)) {
      return res.status(400).json({ ok: false, error: 'Invalid visitor id format' });
    }

    const redis = getRedis();
    if (!redis) {
      // Fail silent: database unconfigured / unreachable
      return res.status(200).json({ ok: false });
    }

    // Bot filtering: do not increment counts for automated crawlers
    const userAgent = req.headers['user-agent'] as string | undefined;
    if (isBot(userAgent)) {
      const now = Date.now();
      const cutoff = now - ACTIVE_WINDOW_MS;
      const [total, active] = await Promise.all([
        redis.get<number>(KEYS.TOTAL_VISITS),
        redis.zcount(KEYS.ACTIVE_SET, cutoff, '+inf'),
      ]);
      return res.status(200).json({
        ok: true,
        total: Number(total) || 0,
        active: Number(active) || 0,
      });
    }

    const now = Date.now();
    const cutoff = now - ACTIVE_WINDOW_MS;

    // Abuse protection: rate limit writes to max 1 write per 10 seconds per id
    const rateLimitKey = `${KEYS.RATE_PREFIX}${id}`;
    const acquired = await redis.set(rateLimitKey, '1', {
      ex: RATE_LIMIT_SECONDS,
      nx: true,
    });

    if (!acquired) {
      // Rate limited: skip write, read current stats
      const [total, active] = await Promise.all([
        redis.get<number>(KEYS.TOTAL_VISITS),
        redis.zcount(KEYS.ACTIVE_SET, cutoff, '+inf'),
      ]);
      return res.status(200).json({
        ok: true,
        total: Number(total) || 0,
        active: Math.max(1, Number(active) || 1),
      });
    }

    // Pipeline write operations for minimal round-trips
    const pipeline = redis.pipeline();
    // Prune entries older than active window (60s)
    pipeline.zremrangebyscore(KEYS.ACTIVE_SET, 0, cutoff);
    // Refresh or add visitor timestamp in active sorted set
    pipeline.zadd(KEYS.ACTIVE_SET, { score: now, member: id });

    const isNew = Boolean(newSession);
    if (isNew) {
      pipeline.incr(KEYS.TOTAL_VISITS);
      pipeline.pfadd(KEYS.UNIQUE_VISITORS, id);
    } else {
      pipeline.get<number>(KEYS.TOTAL_VISITS);
    }

    pipeline.zcount(KEYS.ACTIVE_SET, cutoff, '+inf');

    const results = await pipeline.exec();

    let total = 0;
    let active = 1;

    if (isNew) {
      total = Number(results[2]) || 0;
      active = Math.max(1, Number(results[4]) || 1);
    } else {
      total = Number(results[2]) || 0;
      active = Math.max(1, Number(results[3]) || 1);
    }

    return res.status(200).json({
      ok: true,
      total,
      active,
    });
  } catch {
    // Fail silent on any database / operational error
    return res.status(200).json({ ok: false });
  }
}
