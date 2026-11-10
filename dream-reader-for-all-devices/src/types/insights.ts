export interface DailyActivity {
  date: string; // YYYY-MM-DD
  minutesRead: number;
  wordsLearned: number;
  cardsReviewed: number;
}

export interface ReadingStatsRecord {
  id: string; // 'current_stats'
  totalReadingSeconds: number;
  totalPagesRead: number;
  totalWordsLearned: number;
  currentStreakDays: number;
  bestStreakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyHistory: DailyActivity[];
  updatedAt: string;
}

export const DEFAULT_STATS: ReadingStatsRecord = {
  id: 'current_stats',
  totalReadingSeconds: 0,
  totalPagesRead: 0,
  totalWordsLearned: 0,
  currentStreakDays: 1,
  bestStreakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyHistory: [],
  updatedAt: new Date().toISOString(),
};
