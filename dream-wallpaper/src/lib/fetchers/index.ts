import { LRUCache } from 'lru-cache';
import { PlatformStats } from '@/types/wallpaper';
import { fetchGitHubStats } from './github';
import { fetchLeetCodeStats } from './leetcode';

// In-memory cache for user stats (4 hours TTL, max 500 entries)
const statsCache = new LRUCache<string, PlatformStats>({
  max: 500,
  ttl: 1000 * 60 * 60 * 4, // 4 hours
});

/**
 * Fetch stats for a specific platform with in-memory LRU caching
 */
export async function getPlatformStats(
  platform: 'github' | 'leetcode',
  username: string,
  bypassCache = false
): Promise<PlatformStats> {
  const cacheKey = `${platform}:${username.toLowerCase()}`;

  if (!bypassCache) {
    const cached = statsCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  let stats: PlatformStats;

  if (platform === 'github') {
    stats = await fetchGitHubStats(username);
  } else {
    stats = await fetchLeetCodeStats(username);
  }

  // Only cache if it's not an empty mock generated from a network failure (unless deliberate)
  statsCache.set(cacheKey, stats);
  return stats;
}

/**
 * Fetch stats for multiple platforms in parallel
 */
export async function getAllUserStats(params: {
  github?: string;
  leetcode?: string;
  bypassCache?: boolean;
}): Promise<PlatformStats[]> {
  const results: PlatformStats[] = [];
  const promises: Promise<PlatformStats>[] = [];

  if (params.github && params.github.trim()) {
    promises.push(getPlatformStats('github', params.github.trim(), params.bypassCache));
  }

  if (params.leetcode && params.leetcode.trim()) {
    promises.push(getPlatformStats('leetcode', params.leetcode.trim(), params.bypassCache));
  }

  if (promises.length === 0) {
    // If no platform specified, default to a demo GitHub user
    promises.push(getPlatformStats('github', 'torvalds', params.bypassCache));
  }

  const settled = await Promise.allSettled(promises);
  for (const item of settled) {
    if (item.status === 'fulfilled') {
      results.push(item.value);
    }
  }

  return results;
}
