import { 
  Question, 
  Topic, 
  UserProgress, 
  ProblemStatus, 
  RevisionItem, 
  StoredFilters 
} from '../types/dsa';

const STORAGE_KEY = 'dsaspace_user_progress_v1';
const LEGACY_STORAGE_KEY = 'algo_master_user_progress_v1';
const FILTERS_STORAGE_KEY = 'dsaspace_filters_v1';

export const REVISION_INTERVALS = [3, 7, 14];

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function diffDays(d1: string, d2: string): number {
  const [y1, m1, day1] = d1.split('-').map(Number);
  const [y2, m2, day2] = d2.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, day1).getTime();
  const date2 = new Date(y2, m2 - 1, day2).getTime();
  return Math.round((date1 - date2) / (1000 * 60 * 60 * 24));
}

export function getStoredProgress(): UserProgress {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const doneQuestions: Record<string, boolean> = parsed.doneQuestions || {};
      
      // Backfill problemStatuses from doneQuestions if not present
      const problemStatuses: Record<string, ProblemStatus> = parsed.problemStatuses || {};
      Object.keys(doneQuestions).forEach((qid) => {
        if (doneQuestions[qid] && !problemStatuses[qid]) {
          problemStatuses[qid] = 'solved';
        }
      });

      // Activity log backfill
      const activityLog: Record<string, number> = parsed.activityLog || {};
      if (Object.keys(activityLog).length === 0 && Object.keys(doneQuestions).length > 0) {
        activityLog[today] = Object.keys(doneQuestions).length;
      }

      return {
        doneQuestions,
        starredQuestions: parsed.starredQuestions || {},
        notes: parsed.notes || {},
        lastActiveDate: parsed.lastActiveDate || today,
        streak: parsed.streak || 1,
        longestStreak: Math.max(parsed.longestStreak || 1, parsed.streak || 1),
        problemStatuses,
        activityLog,
        revisions: parsed.revisions || {},
        dailyChallengeSolved: parsed.dailyChallengeSolved || {},
        dailyChallengeStreak: parsed.dailyChallengeStreak || 0,
        savedFilters: parsed.savedFilters,
      };
    }
  } catch (e) {
    console.error('Error loading progress from localStorage', e);
  }

  return {
    doneQuestions: {},
    starredQuestions: {},
    notes: {},
    lastActiveDate: today,
    streak: 1,
    longestStreak: 1,
    problemStatuses: {},
    activityLog: { [today]: 0 },
    revisions: {},
    dailyChallengeSolved: {},
    dailyChallengeStreak: 0,
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
 * Returns current status of a problem: 'not_started' | 'solved' | 'revise_later'
 */
export function getProblemStatus(progress: UserProgress, questionId: string): ProblemStatus {
  if (progress.problemStatuses && progress.problemStatuses[questionId]) {
    return progress.problemStatuses[questionId];
  }
  if (progress.doneQuestions[questionId]) {
    return 'solved';
  }
  return 'not_started';
}

/**
 * Updates problem status, updates activity log, streaks, and spaced revision scheduling.
 */
export function setProblemStatus(
  prev: UserProgress, 
  questionId: string, 
  newStatus: ProblemStatus
): UserProgress {
  const today = getTodayString();
  const nextStatuses = { ...(prev.problemStatuses || {}) };
  const nextDone = { ...prev.doneQuestions };
  const nextActivity = { ...(prev.activityLog || {}) };
  const nextRevisions = { ...(prev.revisions || {}) };

  const currentStatus = getProblemStatus(prev, questionId);
  if (currentStatus === newStatus) return prev;

  nextStatuses[questionId] = newStatus;

  // Streak & Activity updates
  let nextStreak = prev.streak || 1;
  let nextLongest = prev.longestStreak || 1;
  const lastActive = prev.lastActiveDate ? prev.lastActiveDate.slice(0, 10) : today;

  if (newStatus === 'solved') {
    nextDone[questionId] = true;
    nextActivity[today] = (nextActivity[today] || 0) + 1;

    // Check streak
    const daysSinceLast = diffDays(today, lastActive);
    if (daysSinceLast === 1) {
      nextStreak = (prev.streak || 0) + 1;
    } else if (daysSinceLast > 1) {
      nextStreak = 1;
    }
    nextLongest = Math.max(nextLongest, nextStreak);

    // If was in revision, advance or complete revision
    if (nextRevisions[questionId]) {
      const rev = nextRevisions[questionId];
      rev.revisedDates = [...(rev.revisedDates || []), today];
      if (rev.stage < REVISION_INTERVALS.length - 1) {
        rev.stage += 1;
        rev.intervalDays = REVISION_INTERVALS[rev.stage];
        rev.dueAt = addDaysToDate(today, rev.intervalDays);
      } else {
        // Completed all 3 revision stages
        delete nextRevisions[questionId];
      }
    }
  } else if (newStatus === 'revise_later') {
    delete nextDone[questionId];
    // Schedule first spaced revision (after 3 days)
    nextRevisions[questionId] = {
      questionId,
      markedAt: new Date().toISOString(),
      intervalDays: REVISION_INTERVALS[0],
      stage: 0,
      dueAt: addDaysToDate(today, REVISION_INTERVALS[0]),
      revisedDates: [],
    };
  } else {
    // 'not_started'
    delete nextDone[questionId];
    delete nextRevisions[questionId];
  }

  return {
    ...prev,
    doneQuestions: nextDone,
    problemStatuses: nextStatuses,
    activityLog: nextActivity,
    revisions: nextRevisions,
    lastActiveDate: today,
    streak: nextStreak,
    longestStreak: nextLongest,
  };
}

/**
 * Spaced Revision Helpers
 */
export function isRevisionDue(item: RevisionItem, todayStr: string = getTodayString()): boolean {
  return item.dueAt <= todayStr;
}

export function getDueRevisions(
  progress: UserProgress, 
  allQuestions: Question[], 
  todayStr: string = getTodayString()
): { question: Question; revision: RevisionItem }[] {
  if (!progress.revisions) return [];
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const dueList: { question: Question; revision: RevisionItem }[] = [];

  Object.values(progress.revisions).forEach(rev => {
    if (isRevisionDue(rev, todayStr)) {
      const q = questionMap.get(rev.questionId);
      if (q) {
        dueList.push({ question: q, revision: rev });
      }
    }
  });

  return dueList;
}

export function advanceSpacedRevision(
  prev: UserProgress,
  questionId: string
): UserProgress {
  const today = getTodayString();
  const nextRevisions = { ...(prev.revisions || {}) };
  const rev = nextRevisions[questionId];
  if (!rev) return prev;

  const revisedDates = [...(rev.revisedDates || []), today];

  if (rev.stage < REVISION_INTERVALS.length - 1) {
    const nextStage = rev.stage + 1;
    const nextInterval = REVISION_INTERVALS[nextStage];
    nextRevisions[questionId] = {
      ...rev,
      stage: nextStage,
      intervalDays: nextInterval,
      dueAt: addDaysToDate(today, nextInterval),
      revisedDates,
    };
  } else {
    // Graduated from spaced revision cycle!
    delete nextRevisions[questionId];
  }

  return {
    ...prev,
    revisions: nextRevisions,
  };
}

/**
 * Deterministic Daily Challenge
 * Hashing the date string produces the identical problem for all users worldwide on that day.
 */
export function getDailyChallenge(
  allQuestions: Question[], 
  dateStr: string = getTodayString()
): { question: Question; dateStr: string; index: number } {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  const cleanHash = Math.abs(hash);
  const index = cleanHash % allQuestions.length;
  return {
    question: allQuestions[index],
    dateStr,
    index,
  };
}

export function markDailyChallengeDone(
  prev: UserProgress, 
  questionId: string, 
  dateStr: string = getTodayString()
): UserProgress {
  const nextDaily = { ...(prev.dailyChallengeSolved || {}) };
  const isAlreadyDone = Boolean(nextDaily[dateStr]);
  nextDaily[dateStr] = !isAlreadyDone;

  // Update daily challenge streak
  let streak = prev.dailyChallengeStreak || 0;
  if (!isAlreadyDone) {
    const yesterday = addDaysToDate(dateStr, -1);
    if (nextDaily[yesterday] || streak === 0) {
      streak += 1;
    } else {
      streak = 1;
    }
  } else {
    streak = Math.max(0, streak - 1);
  }

  // Also update standard problem status
  const updated = setProblemStatus(prev, questionId, isAlreadyDone ? 'not_started' : 'solved');

  return {
    ...updated,
    dailyChallengeSolved: nextDaily,
    dailyChallengeStreak: streak,
  };
}

/**
 * Heatmap Data Generator
 * Generates day-by-day contribution blocks for the past N weeks.
 */
export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0: empty, 1: 1, 2: 2, 3: 3-4, 4: 5+
  dayOfWeek: number; // 0 = Sun, 6 = Sat
}

export function getHeatmapData(
  activityLog: Record<string, number> = {}, 
  totalWeeks: number = 20
): { weeks: HeatmapDay[][]; totalActiveDays: number; totalSolvedPeriod: number } {
  const days: HeatmapDay[] = [];
  const today = new Date();
  
  // Total days to generate = totalWeeks * 7
  const totalDays = totalWeeks * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  let totalActiveDays = 0;
  let totalSolvedPeriod = 0;

  for (let i = 0; i < totalDays; i++) {
    const curr = new Date(startDate);
    curr.setDate(startDate.getDate() + i);

    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const count = activityLog[dateStr] || 0;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 5) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    if (count > 0) {
      totalActiveDays++;
      totalSolvedPeriod += count;
    }

    days.push({
      date: dateStr,
      count,
      level,
      dayOfWeek: curr.getDay(),
    });
  }

  // Group into weeks (columns)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { weeks, totalActiveDays, totalSolvedPeriod };
}

/**
 * Persistent Filters
 */
export function getStoredFilters(): StoredFilters {
  const defaultFilters: StoredFilters = {
    topic: 'arrays',
    difficulty: 'all',
    status: 'all',
    searchQuery: '',
  };
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (raw) {
      return { ...defaultFilters, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading filters from localStorage', e);
  }
  return defaultFilters;
}

export function saveStoredFilters(filters: StoredFilters): void {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch (e) {
    console.error('Error saving filters to localStorage', e);
  }
}

/**
 * Filter questions: strictly excludes any question marked as "Already done"
 * unless includeDone is true.
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
      return false;
    }
    return true;
  });
}

/**
 * Picks a random question from pool.
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
