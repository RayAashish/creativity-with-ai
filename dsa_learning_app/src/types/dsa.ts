export type Topic = 
  | 'arrays'
  | 'strings'
  | 'linked-list'
  | 'stacks-queues'
  | 'trees'
  | 'bst'
  | 'graphs'
  | 'dp'
  | 'heaps-hashing'
  | 'greedy'
  | 'backtracking'
  | 'bit-manipulation';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Platform = 'LeetCode' | 'GeeksforGeeks' | 'CodeStudio' | 'HackerRank';

export type SupportedLanguage = 'cpp' | 'java' | 'python' | 'javascript';

export type ProblemStatus = 'not_started' | 'solved' | 'revise_later';

export interface RevisionItem {
  questionId: string;
  markedAt: string; // ISO date string
  intervalDays: number; // 3, 7, or 14
  stage: number; // 0 (3 days), 1 (7 days), 2 (14 days), 3 (graduated)
  dueAt: string; // YYYY-MM-DD
  revisedDates: string[]; // history of revision dates
}

export interface StoredFilters {
  topic: Topic | 'all';
  difficulty: Difficulty | 'all';
  status: 'all' | 'not_started' | 'solved' | 'revise_later' | 'due_revision';
  searchQuery: string;
}

export interface ProblemSolution {
  questionId: string;
  pattern: string;
  intuition: string[];
  pseudocode: string[];
  timeComplexity: string;
  spaceComplexity: string;
  complexityExplanation: string;
  edgeCases: string[];
  code: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
  };
  interviewProTips?: string[];
}

export interface Question {
  id: string;
  title: string;
  topic: Topic;
  difficulty: Difficulty;
  platform: Platform;
  url: string;
  companies: string[];
  description?: string;
  hint?: string;
  solution?: ProblemSolution;
}

export interface UserProgress {
  doneQuestions: Record<string, boolean>;
  starredQuestions: Record<string, boolean>;
  notes: Record<string, string>;
  lastActiveDate: string;
  streak: number;
  longestStreak?: number;
  problemStatuses?: Record<string, ProblemStatus>; // questionId -> 'not_started' | 'solved' | 'revise_later'
  activityLog?: Record<string, number>; // "YYYY-MM-DD" -> count of questions solved on that date
  revisions?: Record<string, RevisionItem>; // questionId -> RevisionItem
  dailyChallengeSolved?: Record<string, boolean>; // "YYYY-MM-DD" -> true
  dailyChallengeStreak?: number;
  savedFilters?: StoredFilters;
}

export interface TopicInfo {
  id: Topic;
  name: string;
  iconName: string;
  description: string;
  color: string;
  badgeColor: string;
}
