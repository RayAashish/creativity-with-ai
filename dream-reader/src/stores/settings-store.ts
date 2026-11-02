import { create } from 'zustand';
import { ThemeMode, FontSize, FontFamily, TargetLanguage, ReaderSettingsRecord, DEFAULT_SETTINGS } from '../types';
import { settingsRepository } from '../storage';
import { themeService } from '../services/theme-service';

interface SettingsState {
  settings: ReaderSettingsRecord;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setFontSize: (fontSize: FontSize) => Promise<void>;
  setFontFamily: (fontFamily: FontFamily) => Promise<void>;
  setTargetLanguage: (language: TargetLanguage) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    try {
      const stored = await settingsRepository.getSettings();
      themeService.applyTheme(stored.theme);
      set({ settings: stored, isLoading: false });
    } catch (err) {
      console.error('Failed to load settings:', err);
      set({ isLoading: false });
    }
  },

  setTheme: async (theme: ThemeMode) => {
    themeService.applyTheme(theme);
    set((state) => ({ settings: { ...state.settings, theme } }));
    await settingsRepository.updateSettings({ theme });
  },

  setFontSize: async (fontSize: FontSize) => {
    set((state) => ({ settings: { ...state.settings, fontSize } }));
    await settingsRepository.updateSettings({ fontSize });
  },

  setFontFamily: async (fontFamily: FontFamily) => {
    set((state) => ({ settings: { ...state.settings, fontFamily } }));
    await settingsRepository.updateSettings({ fontFamily });
  },

  setTargetLanguage: async (targetLanguage: TargetLanguage) => {
    set((state) => ({ settings: { ...state.settings, targetLanguage } }));
    await settingsRepository.updateSettings({ targetLanguage });
  },
}));
