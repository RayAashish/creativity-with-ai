import { ThemeMode, FontSize } from '../types';

export class ThemeService {
  applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-sepia', 'dark');

    if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'sepia') {
      root.classList.add('theme-sepia');
      root.setAttribute('data-theme', 'sepia');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('theme-light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }

  getFontSizeClass(size: FontSize): string {
    switch (size) {
      case 'sm':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-lg leading-loose';
      case 'xl':
        return 'text-xl leading-loose';
      case 'base':
      default:
        return 'text-base leading-relaxed';
    }
  }
}

export const themeService = new ThemeService();
