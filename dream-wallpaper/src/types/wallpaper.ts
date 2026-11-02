export type PlatformType = 'github' | 'leetcode';

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface PlatformStats {
  platform: PlatformType;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  totalActiveDays: number;
  calendar: ContributionDay[];
  isMock?: boolean;
  error?: string;
}

export type WallpaperThemeId =
  | 'oled'
  | 'catppuccin'
  | 'nord'
  | 'dracula'
  | 'tokyo-night'
  | 'cyberpunk'
  | 'solarized'
  | 'forest';

export type WallpaperPosition = 'center' | 'bottom-right' | 'top-center' | 'minimal';

export interface ThemeColors {
  id: WallpaperThemeId;
  name: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGlow: string;
  levels: [string, string, string, string, string]; // 0 to 4
  gridColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface WallpaperOptions {
  github?: string;
  leetcode?: string;
  theme?: WallpaperThemeId;
  width?: number;
  height?: number;
  position?: WallpaperPosition;
  showGlow?: boolean;
  showGrid?: boolean;
  showStats?: boolean;
  scale?: number;
  customTitle?: string;
  format?: 'png' | 'webp';
}
