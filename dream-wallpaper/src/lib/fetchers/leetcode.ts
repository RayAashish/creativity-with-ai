import { ContributionDay, PlatformStats } from '@/types/wallpaper';
import { calculateStreakStats, generateMockCalendar } from '@/lib/streaks';

interface LeetCodeGraphQLResponse {
  data?: {
    matchedUser?: {
      username?: string;
      profile?: {
        realName?: string;
        userAvatar?: string;
      };
      userCalendar?: {
        activeYears?: number[];
        streak?: number;
        totalActiveDays?: number;
        submissionCalendar?: string;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function fetchLeetCodeStats(username: string): Promise<PlatformStats> {
  const cleanUsername = username.trim();

  if (!cleanUsername) {
    throw new Error('LeetCode username is required');
  }

  try {
    const query = `
      query userCalendarAndProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
          }
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }
    `;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      next: { revalidate: 14400 }, // 4 hours Next.js cache
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        Referer: 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { username: cleanUsername },
      }),
    });

    if (res.ok) {
      const json: LeetCodeGraphQLResponse = await res.json();
      const user = json.data?.matchedUser;

      if (user && user.userCalendar) {
        const rawCalendarStr = user.userCalendar.submissionCalendar || '{}';
        let submissionMap: Record<string, number> = {};
        try {
          submissionMap = JSON.parse(rawCalendarStr);
        } catch {
          submissionMap = {};
        }

        // Map timestamp (seconds) to YYYY-MM-DD
        const dateCountMap = new Map<string, number>();
        for (const [timestampStr, count] of Object.entries(submissionMap)) {
          const ts = parseInt(timestampStr, 10);
          if (!isNaN(ts)) {
            const dateStr = new Date(ts * 1000).toISOString().split('T')[0];
            dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + (count as number));
          }
        }

        // Generate past 365 days aligned chronologically
        const now = new Date();
        const calendar: ContributionDay[] = [];
        const daysCount = 365;

        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const count = dateCountMap.get(dateStr) || 0;

          let level: 0 | 1 | 2 | 3 | 4 = 0;
          if (count > 0) {
            if (count <= 2) level = 1;
            else if (count <= 5) level = 2;
            else if (count <= 9) level = 3;
            else level = 4;
          }

          calendar.push({
            date: dateStr,
            count,
            level,
          });
        }

        const stats = calculateStreakStats(calendar);

        // Prefer LeetCode's official streak if provided and non-zero
        const currentStreak = user.userCalendar.streak && user.userCalendar.streak > stats.currentStreak
          ? user.userCalendar.streak
          : stats.currentStreak;

        const totalActiveDays = user.userCalendar.totalActiveDays && user.userCalendar.totalActiveDays > stats.totalActiveDays
          ? user.userCalendar.totalActiveDays
          : stats.totalActiveDays;

        return {
          platform: 'leetcode',
          username: cleanUsername,
          displayName: user.profile?.realName || cleanUsername,
          avatarUrl: user.profile?.userAvatar,
          currentStreak,
          longestStreak: Math.max(stats.longestStreak, currentStreak),
          totalContributions: stats.totalContributions,
          totalActiveDays,
          calendar,
          isMock: false,
        };
      }
    }
  } catch (err) {
    console.warn(`[LeetCode Fetcher] Error for ${cleanUsername}:`, (err as Error).message);
  }

  // Graceful fallback for mock or invalid user
  console.warn(`[LeetCode] Using mock fallback for ${cleanUsername}`);
  const mockCalendar = generateMockCalendar(`leetcode-${cleanUsername}`, 365);
  const mockStats = calculateStreakStats(mockCalendar);

  return {
    platform: 'leetcode',
    username: cleanUsername,
    displayName: cleanUsername,
    avatarUrl: undefined,
    currentStreak: mockStats.currentStreak,
    longestStreak: mockStats.longestStreak,
    totalContributions: mockStats.totalContributions,
    totalActiveDays: mockStats.totalActiveDays,
    calendar: mockCalendar,
    isMock: true,
  };
}
