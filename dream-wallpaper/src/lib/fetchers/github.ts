import { ContributionDay, PlatformStats } from '@/types/wallpaper';
import { calculateStreakStats, generateMockCalendar } from '@/lib/streaks';

interface JoggruberContribution {
  date: string;
  count: number;
  level: number;
}

interface JoggruberResponse {
  total: Record<string, number>;
  contributions: JoggruberContribution[];
  error?: string;
}

export async function fetchGitHubStats(username: string): Promise<PlatformStats> {
  const cleanUsername = username.trim().replace(/^@/, '');

  if (!cleanUsername) {
    throw new Error('GitHub username is required');
  }

  // 1. Try GitHub GraphQL API if GITHUB_TOKEN is provided in environment
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const graphQLStats = await fetchViaGraphQL(cleanUsername, token);
      if (graphQLStats) {
        return graphQLStats;
      }
    } catch (e) {
      console.warn(`[GitHub GraphQL] Failed for ${cleanUsername}, falling back to public API:`, (e as Error).message);
    }
  }

  // 2. Try the public GitHub contributions aggregator API
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${cleanUsername}?y=last`, {
      next: { revalidate: 14400 }, // 4 hours Next.js cache
      headers: {
        'User-Agent': 'StreakPaper-Wallpaper-Generator/1.0',
      },
    });

    if (res.ok) {
      const data: JoggruberResponse = await res.json();
      if (data && Array.isArray(data.contributions) && data.contributions.length > 0) {
        const calendar: ContributionDay[] = data.contributions.map((c) => ({
          date: c.date,
          count: c.count,
          level: Math.min(4, Math.max(0, c.level)) as 0 | 1 | 2 | 3 | 4,
        }));

        const stats = calculateStreakStats(calendar);
        return {
          platform: 'github',
          username: cleanUsername,
          displayName: cleanUsername,
          avatarUrl: `https://github.com/${cleanUsername}.png`,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          totalContributions: stats.totalContributions,
          totalActiveDays: stats.totalActiveDays,
          calendar,
          isMock: false,
        };
      }
    }
  } catch (err) {
    console.warn(`[GitHub Public API] Error for ${cleanUsername}:`, (err as Error).message);
  }

  // 3. Fallback: Query GitHub public user contributions HTML snippet
  try {
    const htmlStats = await fetchViaContributionsHtml(cleanUsername);
    if (htmlStats) {
      return htmlStats;
    }
  } catch (err) {
    console.warn(`[GitHub HTML Scraping] Error for ${cleanUsername}:`, (err as Error).message);
  }

  // 4. Graceful Fallback: Deterministic mock calendar with mock indicator
  console.warn(`[GitHub] Using mock fallback for ${cleanUsername}`);
  const mockCalendar = generateMockCalendar(`github-${cleanUsername}`, 365);
  const mockStats = calculateStreakStats(mockCalendar);

  return {
    platform: 'github',
    username: cleanUsername,
    displayName: cleanUsername,
    avatarUrl: `https://github.com/${cleanUsername}.png`,
    currentStreak: mockStats.currentStreak,
    longestStreak: mockStats.longestStreak,
    totalContributions: mockStats.totalContributions,
    totalActiveDays: mockStats.totalActiveDays,
    calendar: mockCalendar,
    isMock: true,
  };
}

/**
 * Fetch contribution calendar via official GitHub GraphQL API
 */
async function fetchViaGraphQL(username: string, token: string): Promise<PlatformStats | null> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        name
        avatarUrl
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                date
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'StreakPaper/1.0',
    },
    body: JSON.stringify({
      query,
      variables: { login: username },
    }),
  });

  if (!response.ok) return null;
  const json = await response.json();
  const user = json.data?.user;
  if (!user) return null;

  const weeks = user.contributionsCollection?.contributionCalendar?.weeks || [];
  const calendar: ContributionDay[] = [];

  const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };

  for (const week of weeks) {
    for (const day of week.contributionDays || []) {
      calendar.push({
        date: day.date,
        count: day.contributionCount,
        level: levelMap[day.contributionLevel] ?? (day.contributionCount > 0 ? 1 : 0),
      });
    }
  }

  if (calendar.length === 0) return null;

  const stats = calculateStreakStats(calendar);
  return {
    platform: 'github',
    username,
    displayName: user.name || username,
    avatarUrl: user.avatarUrl,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalContributions: user.contributionsCollection?.contributionCalendar?.totalContributions ?? stats.totalContributions,
    totalActiveDays: stats.totalActiveDays,
    calendar,
    isMock: false,
  };
}

/**
 * Scrapes GitHub's public contribution HTML table
 */
async function fetchViaContributionsHtml(username: string): Promise<PlatformStats | null> {
  const url = `https://github.com/users/${username}/contributions`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!res.ok) return null;
  const html = await res.text();

  // Parse table cells: data-date="YYYY-MM-DD" data-level="0..4"
  // Example: <td ... data-date="2024-05-10" data-level="2" id="contribution-day-component-0-1">
  const cellRegex = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"[^>]*>([\s\S]*?)<\/td>/g;
  const countRegex = /(\d+)\s+contribution/;

  const calendar: ContributionDay[] = [];
  let match;

  while ((match = cellRegex.exec(html)) !== null) {
    const date = match[1];
    const levelNum = parseInt(match[2], 10);
    const innerHtml = match[3];

    let count = 0;
    const countMatch = countRegex.exec(innerHtml);
    if (countMatch) {
      count = parseInt(countMatch[1], 10);
    } else if (levelNum > 0) {
      count = levelNum; // Estimate if count text not parsed
    }

    calendar.push({
      date,
      count,
      level: Math.min(4, Math.max(0, levelNum)) as 0 | 1 | 2 | 3 | 4,
    });
  }

  if (calendar.length === 0) return null;

  // Sort chronologically
  calendar.sort((a, b) => a.date.localeCompare(b.date));

  const stats = calculateStreakStats(calendar);
  return {
    platform: 'github',
    username,
    displayName: username,
    avatarUrl: `https://github.com/${username}.png`,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalContributions: stats.totalContributions,
    totalActiveDays: stats.totalActiveDays,
    calendar,
    isMock: false,
  };
}
