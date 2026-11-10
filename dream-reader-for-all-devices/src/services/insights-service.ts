import { db } from '../storage/db';
import { ReadingStatsRecord, DEFAULT_STATS } from '../types';

export class InsightsService {
  async getStats(): Promise<ReadingStatsRecord> {
    const found = await db.stats.get('current_stats');
    if (found) return found;

    await db.stats.put(DEFAULT_STATS);
    return DEFAULT_STATS;
  }

  async recordReadingSeconds(seconds: number): Promise<void> {
    const stats = await this.getStats();
    const today = new Date().toISOString().split('T')[0];

    // Update daily history
    const history = [...stats.dailyHistory];
    const todayIndex = history.findIndex((h) => h.date === today);

    if (todayIndex >= 0) {
      history[todayIndex].minutesRead += Math.round(seconds / 60);
    } else {
      history.push({
        date: today,
        minutesRead: Math.round(seconds / 60),
        wordsLearned: 0,
        cardsReviewed: 0,
      });
    }

    // Update streak
    let currentStreak = stats.currentStreakDays;
    const lastActive = stats.lastActiveDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastActive === yesterday) {
      currentStreak += 1;
    } else if (lastActive !== today) {
      currentStreak = 1; // streak reset
    }

    const updated: ReadingStatsRecord = {
      ...stats,
      totalReadingSeconds: stats.totalReadingSeconds + seconds,
      currentStreakDays: currentStreak,
      bestStreakDays: Math.max(stats.bestStreakDays, currentStreak),
      lastActiveDate: today,
      dailyHistory: history.slice(-30), // keep last 30 days
      updatedAt: new Date().toISOString(),
    };

    await db.stats.put(updated);
  }

  async recordWordLearned(): Promise<void> {
    const stats = await this.getStats();
    const today = new Date().toISOString().split('T')[0];

    const history = [...stats.dailyHistory];
    const todayIndex = history.findIndex((h) => h.date === today);

    if (todayIndex >= 0) {
      history[todayIndex].wordsLearned += 1;
    } else {
      history.push({
        date: today,
        minutesRead: 0,
        wordsLearned: 1,
        cardsReviewed: 0,
      });
    }

    await db.stats.put({
      ...stats,
      totalWordsLearned: stats.totalWordsLearned + 1,
      dailyHistory: history.slice(-30),
      updatedAt: new Date().toISOString(),
    });
  }

  async recordCardReviewed(): Promise<void> {
    const stats = await this.getStats();
    const today = new Date().toISOString().split('T')[0];

    const history = [...stats.dailyHistory];
    const todayIndex = history.findIndex((h) => h.date === today);

    if (todayIndex >= 0) {
      history[todayIndex].cardsReviewed += 1;
    } else {
      history.push({
        date: today,
        minutesRead: 0,
        wordsLearned: 0,
        cardsReviewed: 1,
      });
    }

    await db.stats.put({
      ...stats,
      dailyHistory: history.slice(-30),
      updatedAt: new Date().toISOString(),
    });
  }
}

export const insightsService = new InsightsService();
