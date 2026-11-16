#!/usr/bin/env node

/**
 * Admin utility for inspecting and resetting live counter data in Upstash Redis.
 * Usage:
 *   node scripts/reset-live-counter.mjs status
 *   node scripts/reset-live-counter.mjs reset
 *   node scripts/reset-live-counter.mjs set-total <number>
 */

import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error('Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set.');
  process.exit(1);
}

const redis = new Redis({ url, token });
const action = process.argv[2] || 'status';

async function main() {
  try {
    if (action === 'status') {
      const now = Date.now();
      const cutoff = now - 60000;
      const [total, unique, active] = await Promise.all([
        redis.get('live:total_visits'),
        redis.pfcount('live:unique_visitors'),
        redis.zcount('live:active', cutoff, '+inf'),
      ]);
      console.log('=== Live Counter Status ===');
      console.log(`Total Visits:     ${total ?? 0}`);
      console.log(`Unique Visitors:  ${unique ?? 0}`);
      console.log(`Active (last 60s): ${active ?? 0}`);
    } else if (action === 'reset') {
      await Promise.all([
        redis.del('live:total_visits'),
        redis.del('live:unique_visitors'),
        redis.del('live:active'),
      ]);
      console.log('Successfully reset all live counter keys (total, unique, active).');
    } else if (action === 'set-total') {
      const val = parseInt(process.argv[3], 10);
      if (isNaN(val)) {
        console.error('Usage: node scripts/reset-live-counter.mjs set-total <number>');
        process.exit(1);
      }
      await redis.set('live:total_visits', val);
      console.log(`Set live:total_visits to ${val}.`);
    } else {
      console.error(`Unknown action: ${action}. Valid actions: status, reset, set-total`);
    }
  } catch (err) {
    console.error('Redis operation failed:', err);
    process.exit(1);
  }
}

main();
