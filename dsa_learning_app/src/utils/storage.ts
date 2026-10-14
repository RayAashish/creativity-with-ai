import { Question, Topic, UserProgress } from '../types/dsa';

const STORAGE_KEY = 'algo_master_user_progress_v1';

export function getStoredProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        doneQuestions: parsed.doneQuestions || {},
        starredQuestions: parsed.starredQuestions || {},
        notes: parsed.notes || {},
        lastActiveDate: parsed.lastActiveDate || new Date().toISOString(),
        streak: parsed.streak || 1,
      };
    }
  } catch (e) {
    console.error('Error loading progress from localStorage', e);
  }
  return {
    doneQuestions: {},
    starredQuestions: {},
    notes: {},
    lastActiveDate: new Date().toISOString(),
    streak: 1,
  };
}

export function saveStoredProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage', e);
  }
}

/**
 * Filter questions: strictly excludes any question marked as "Already done"
 * unless allowDone is true (or if user wants to revise).
 */
export function getAvailableQuestions(
  allQuestions: Question[],
  doneMap: Record<string, boolean>,
  topicFilter?: Topic | 'all',
  includeDone: boolean = false
): Question[] {
  return allQuestions.filter(q => {
    if (topicFilter && topicFilter !== 'all' && q.topic !== topicFilter) {
      return false;
    }
    if (!includeDone && doneMap[q.id]) {
      return false; // Skip already done!
    }
    return true;
  });
}

/**
 * Picks a random question.
 * Returns null if all questions in that category / overall are already done.
 */
export function pickRandomQuestion(
  allQuestions: Question[],
  doneMap: Record<string, boolean>,
  topicFilter?: Topic | 'all',
  includeDone: boolean = false
): { question: Question | null; totalRemaining: number; totalInPool: number } {
  const matchingTopicQuestions = allQuestions.filter(q => 
    !topicFilter || topicFilter === 'all' || q.topic === topicFilter
  );
  
  const pool = getAvailableQuestions(allQuestions, doneMap, topicFilter, includeDone);
  
  if (pool.length === 0) {
    return { question: null, totalRemaining: 0, totalInPool: matchingTopicQuestions.length };
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return {
    question: pool[randomIndex],
    totalRemaining: pool.length,
    totalInPool: matchingTopicQuestions.length
  };
}
