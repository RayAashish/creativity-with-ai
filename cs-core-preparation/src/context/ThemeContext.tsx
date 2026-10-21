import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  availableThemes: { id: ThemeMode; label: string; icon: string; previewClass: string; desc: string }[];
}

const THEMES: { id: ThemeMode; label: string; icon: string; previewClass: string; desc: string }[] = [
  {
    id: 'simple',
    label: 'Clean Minimal',
    icon: '☀️',
    previewClass: 'bg-white text-slate-800 border-slate-300',
    desc: 'Crisp, distraction-free daylight reading'
  },
  {
    id: 'dark',
    label: 'Midnight Dark',
    icon: '🌙',
    previewClass: 'bg-slate-900 text-slate-100 border-slate-700',
    desc: 'Deep OLED dark with soft indigo glow'
  },
  {
    id: 'vibrant',
    label: 'Electric Neon',
    icon: '⚡',
    previewClass: 'bg-[#12072b] text-fuchsia-200 border-fuchsia-600',
    desc: 'High-energy cyberpunk purple & fuchsia'
  },
  {
    id: 'emerald',
    label: 'Terminal Matrix',
    icon: '💻',
    previewClass: 'bg-[#05160e] text-emerald-300 border-emerald-600',
    desc: 'Obsidian & hacker mint terminal vibe'
  },
  {
    id: 'sepia',
    label: 'Warm Parchment',
    icon: '📜',
    previewClass: 'bg-[#fbf7ee] text-amber-950 border-amber-300',
    desc: 'Cozy, anti-fatigue warm paper for long sessions'
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('cs_prep_theme') as ThemeMode;
    if (saved && THEMES.some(t => t.id === saved)) return saved;
    return 'dark'; // default to stylish dark
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark' || theme === 'vibrant' || theme === 'emerald') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cs_prep_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
