import { getRedis, KEYS, ACTIVE_WINDOW_MS } from './_redis.js';

export default async function handler(req: any, res: any) {
  // Never cache live stats endpoint
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const redis = getRedis();
    if (!redis) {
      // Fail silent: database unconfigured / unreachable
      return res.status(200).json({ ok: false });
    }

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
  } catch {
    // Fail silent on any database / operational error
    return res.status(200).json({ ok: false });
  }
}
