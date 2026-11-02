import { ContributionDay } from '@/types/wallpaper';

/**
 * Calculates current streak, longest streak, total contributions, and active days
 * from a chronologically sorted array of ContributionDay items.
 */
export function calculateStreakStats(days: ContributionDay[]): {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  totalActiveDays: number;
} {
  if (!days || days.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalContributions: 0,
      totalActiveDays: 0,
    };
  }

  let totalContributions = 0;
  let totalActiveDays = 0;
  let longestStreak = 0;
  let currentRun = 0;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    totalContributions += day.count;

    if (day.count > 0) {
      totalActiveDays++;
      currentRun++;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    } else {
      currentRun = 0;
    }
  }

  // Calculate current active streak ending at the most recent days
  let currentStreak = 0;
  const lastIndex = days.length - 1;

  if (lastIndex >= 0) {
    // Check if the most recent day has activity
    if (days[lastIndex].count > 0) {
      for (let i = lastIndex; i >= 0; i--) {
        if (days[i].count > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (lastIndex >= 1 && days[lastIndex - 1].count > 0) {
      // If today has 0 contributions so far, yesterday's streak is still active
      for (let i = lastIndex - 1; i >= 0; i--) {
        if (days[i].count > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalContributions,
    totalActiveDays,
  };
}

/**
 * Generates an aesthetic, deterministic mock contribution calendar (365 days)
 * based on a seed string (e.g. username).
 */
export function generateMockCalendar(seed: string = 'developer', daysCount: number = 365): ContributionDay[] {
  const result: ContributionDay[] = [];
  const now = new Date();

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  // Generate pseudorandom numbers
  function pseudoRandom(i: number): number {
    const x = Math.sin(Math.abs(hash) + i * 17.13) * 10000;
    return x - Math.floor(x);
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const rand = pseudoRandom(i);

    // Give higher activity on weekdays, recent 45 days high streak
    const isRecentStreak = i <= 38;
    let count = 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;

    if (isRecentStreak) {
      // Guaranteed active streak for the last ~38 days
      count = Math.floor(rand * 8) + 1;
    } else if (dayOfWeek !== 0 && dayOfWeek !== 6 && rand > 0.25) {
      // Weekday activity
      count = Math.floor(rand * 12);
    } else if (rand > 0.6) {
      // Weekend activity
      count = Math.floor(rand * 6);
    }

    if (count > 0) {
      if (count <= 2) level = 1;
      else if (count <= 5) level = 2;
      else if (count <= 8) level = 3;
      else level = 4;
    }

    result.push({
      date: dateStr,
      count,
      level,
    });
  }

  return result;
}
