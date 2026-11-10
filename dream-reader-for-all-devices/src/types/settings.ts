import { TargetLanguage } from './lookup';

export type ThemeMode = 'light' | 'dark' | 'sepia';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type FontFamily = 'sans' | 'serif' | 'mono';

export interface ReaderSettingsRecord {
  id: string; // 'current_settings'
  theme: ThemeMode;
  fontSize: FontSize;
  fontFamily: FontFamily;
  targetLanguage: TargetLanguage;
  neverTranslateTerms: string[];
  autoFlashcardOnSave: boolean;
  bilingualModeEnabled: boolean;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: ReaderSettingsRecord = {
  id: 'current_settings',
  theme: 'light',
  fontSize: 'base',
  fontFamily: 'sans',
  targetLanguage: 'both',
  neverTranslateTerms: ['thread', 'API', 'heap', 'stack', 'pointer', 'callback', 'mutex', 'DOM'],
  autoFlashcardOnSave: true,
  bilingualModeEnabled: false,
  updatedAt: new Date().toISOString(),
};
