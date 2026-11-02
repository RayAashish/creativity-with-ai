import { ThemeColors, WallpaperThemeId } from '@/types/wallpaper';

export const THEMES: Record<WallpaperThemeId, ThemeColors> = {
  oled: {
    id: 'oled',
    name: 'OLED True Black',
    bg: '#000000',
    cardBg: 'rgba(16, 18, 20, 0.82)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#52525B',
    accent: '#00FFA3',
    accentGlow: 'rgba(0, 255, 163, 0.22)',
    levels: [
      '#161B22', // Level 0: empty
      '#0E4429', // Level 1
      '#006D32', // Level 2
      '#26A641', // Level 3
      '#00FFA3', // Level 4: vibrant neon emerald
    ],
    gridColor: 'rgba(255, 255, 255, 0.03)',
    badgeBg: 'rgba(0, 255, 163, 0.12)',
    badgeText: '#00FFA3',
  },
  catppuccin: {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    bg: '#1e1e2e',
    cardBg: 'rgba(24, 24, 37, 0.85)',
    cardBorder: 'rgba(205, 214, 244, 0.12)',
    textPrimary: '#cdd6f4',
    textSecondary: '#a6adc8',
    textMuted: '#6c7086',
    accent: '#cba6f7',
    accentGlow: 'rgba(203, 166, 247, 0.25)',
    levels: [
      '#313244',
      '#45475a',
      '#89b4fa', // blue
      '#a6e3a1', // green
      '#cba6f7', // mauve
    ],
    gridColor: 'rgba(205, 214, 244, 0.04)',
    badgeBg: 'rgba(203, 166, 247, 0.15)',
    badgeText: '#cba6f7',
  },
  nord: {
    id: 'nord',
    name: 'Nord Frost',
    bg: '#2e3440',
    cardBg: 'rgba(46, 52, 64, 0.88)',
    cardBorder: 'rgba(216, 222, 233, 0.12)',
    textPrimary: '#eceff4',
    textSecondary: '#d8dee9',
    textMuted: '#7b88a1',
    accent: '#88c0d0',
    accentGlow: 'rgba(136, 192, 208, 0.24)',
    levels: [
      '#3b4252',
      '#4c566a',
      '#5e81ac',
      '#81a1c1',
      '#88c0d0',
    ],
    gridColor: 'rgba(216, 222, 233, 0.04)',
    badgeBg: 'rgba(136, 192, 208, 0.15)',
    badgeText: '#88c0d0',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Vampire',
    bg: '#282a36',
    cardBg: 'rgba(33, 34, 44, 0.88)',
    cardBorder: 'rgba(248, 248, 242, 0.12)',
    textPrimary: '#f8f8f2',
    textSecondary: '#bfbfd4',
    textMuted: '#6272a4',
    accent: '#ff79c6',
    accentGlow: 'rgba(255, 121, 198, 0.25)',
    levels: [
      '#383a59',
      '#bd93f9',
      '#ff79c6',
      '#50fa7b',
      '#8be9fd',
    ],
    gridColor: 'rgba(248, 248, 242, 0.04)',
    badgeBg: 'rgba(255, 121, 198, 0.15)',
    badgeText: '#ff79c6',
  },
  'tokyo-night': {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    bg: '#1a1b26',
    cardBg: 'rgba(22, 22, 30, 0.88)',
    cardBorder: 'rgba(169, 177, 214, 0.12)',
    textPrimary: '#c0caf5',
    textSecondary: '#9aa5ce',
    textMuted: '#565f89',
    accent: '#7aa2f7',
    accentGlow: 'rgba(122, 162, 247, 0.25)',
    levels: [
      '#24283b',
      '#3d59a1',
      '#7aa2f7',
      '#7dcfff',
      '#bb9af7',
    ],
    gridColor: 'rgba(169, 177, 214, 0.04)',
    badgeBg: 'rgba(122, 162, 247, 0.15)',
    badgeText: '#7aa2f7',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    bg: '#08080d',
    cardBg: 'rgba(15, 15, 23, 0.92)',
    cardBorder: 'rgba(0, 240, 255, 0.25)',
    textPrimary: '#fcee0a',
    textSecondary: '#ff0055',
    textMuted: '#717182',
    accent: '#00f0ff',
    accentGlow: 'rgba(0, 240, 255, 0.3)',
    levels: [
      '#1b1c28',
      '#ff0055',
      '#9d00ff',
      '#00f0ff',
      '#fcee0a',
    ],
    gridColor: 'rgba(0, 240, 255, 0.05)',
    badgeBg: 'rgba(252, 238, 10, 0.15)',
    badgeText: '#fcee0a',
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized Dark',
    bg: '#002b36',
    cardBg: 'rgba(7, 54, 66, 0.88)',
    cardBorder: 'rgba(147, 161, 161, 0.14)',
    textPrimary: '#93a1a1',
    textSecondary: '#839496',
    textMuted: '#586e75',
    accent: '#2aa198',
    accentGlow: 'rgba(42, 161, 152, 0.25)',
    levels: [
      '#073642',
      '#586e75',
      '#268bd2',
      '#2aa198',
      '#859900',
    ],
    gridColor: 'rgba(147, 161, 161, 0.04)',
    badgeBg: 'rgba(42, 161, 152, 0.15)',
    badgeText: '#2aa198',
  },
  forest: {
    id: 'forest',
    name: 'Forest Minimal',
    bg: '#0d1310',
    cardBg: 'rgba(16, 24, 20, 0.88)',
    cardBorder: 'rgba(82, 183, 136, 0.15)',
    textPrimary: '#e8f5e9',
    textSecondary: '#94b3a1',
    textMuted: '#4d6958',
    accent: '#52b788',
    accentGlow: 'rgba(82, 183, 136, 0.25)',
    levels: [
      '#1a2620',
      '#2d4a3b',
      '#407a5d',
      '#52b788',
      '#74c69d',
    ],
    gridColor: 'rgba(82, 183, 136, 0.04)',
    badgeBg: 'rgba(82, 183, 136, 0.15)',
    badgeText: '#74c69d',
  },
};

export const DEFAULT_THEME_ID: WallpaperThemeId = 'oled';

export function getTheme(id?: string): ThemeColors {
  if (id && id in THEMES) {
    return THEMES[id as WallpaperThemeId];
  }
  return THEMES[DEFAULT_THEME_ID];
}
