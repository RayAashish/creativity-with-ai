# Global Live Visitor Counter (Upstash Redis)

A privacy-preserving, production-grade visitor counter for **SPDSE.Prep** deployed on Vercel.

---

## 1. How It Works

- **Total Visits (`live:total_visits`)**:
  A plain Redis counter key incremented using `INCR`. A visit is recorded only once per browser session via a client `sessionStorage` flag (`live_session_counted`). Page reloads and internal navigation within the same tab session do not inflate this count.
- **Active Visitors (`live:active`)**:
  A Redis sorted set (`ZADD`) where the member is an anonymous browser UUID (`live_visitor_id` in `localStorage`) and the score is the last-seen Unix epoch timestamp in milliseconds.
  - A visitor is considered active if seen within the last **60 seconds** (`now - 60000`).
  - Read with `ZCOUNT live:active (now - 60000) +inf`.
  - Stale entries older than 60 seconds are automatically pruned on each ping using `ZREMRANGEBYSCORE live:active 0 (now - 60000)`.
- **Unique Visitors (`live:unique_visitors`)**:
  A HyperLogLog structure tracking cardinality using `PFADD` with the anonymous browser ID and read with `PFCOUNT`.
- **Abuse Protection & Rate Limiting**:
  Writes are rate-limited per visitor ID using `live:rate:<id>` with a 10-second expiration (`SET EX 10 NX`). Rapid refreshes cannot spam the database or increment visit counts.
- **Bot Filtering**:
  Requests from automated web crawlers, headless browsers, preview bots, and Lighthouse are filtered via user-agent detection and do not increment visits.
- **Fail Silent**:
  If the Upstash Redis environment variables are missing or if Redis becomes unreachable, the server returns `{ ok: false }` with status 200. The client hides the counter silently with zero console errors or render blocking.

---

## 2. Environment Variables

Add these to your Vercel Project Settings (`Settings -> Environment Variables`) and locally in `.env.local`:

```env
# Upstash Redis REST Credentials (from Vercel Marketplace / Upstash Console)
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxx...

# Or Vercel KV naming (if connected via Vercel KV):
KV_REST_API_URL=https://xxxx.upstash.io
KV_REST_API_TOKEN=AXxxxxxxx...

# Feature flag (optional, defaults to 'on'):
VITE_LIVE_COUNTER=on
NEXT_PUBLIC_LIVE_COUNTER=on
```

---

## 3. How to Turn It Off Without Code Changes

Set either of the following environment variables in Vercel to `off`:
```env
VITE_LIVE_COUNTER=off
# or
NEXT_PUBLIC_LIVE_COUNTER=off
```
When set to `off`, the client component returns `null` immediately and never issues any `/api/live/*` network requests.

---

## 4. Admin Management & Resetting Counters

Never expose counter reset functions over public endpoints. Use the following Redis commands via Upstash CLI, Upstash Web Console, or the included script:

### Direct Redis Commands

To view current counts:
```redis
GET live:total_visits
PFCOUNT live:unique_visitors
ZCARD live:active
```

To reset all live counter data:
```redis
DEL live:total_visits
DEL live:unique_visitors
DEL live:active
```

To set a custom starting total:
```redis
SET live:total_visits 1284
```

### Node Admin Script

Run the helper script with your credentials:
```bash
# View current status
UPSTASH_REDIS_REST_URL="<url>" UPSTASH_REDIS_REST_TOKEN="<token>" node scripts/reset-live-counter.mjs status

# Reset all counts to zero
UPSTASH_REDIS_REST_URL="<url>" UPSTASH_REDIS_REST_TOKEN="<token>" node scripts/reset-live-counter.mjs reset

# Set a specific baseline total
UPSTASH_REDIS_REST_URL="<url>" UPSTASH_REDIS_REST_TOKEN="<token>" node scripts/reset-live-counter.mjs set-total 1500
```
