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
}

export interface UserProgress {
  doneQuestions: Record<string, boolean>;
  starredQuestions: Record<string, boolean>;
  notes: Record<string, string>;
  lastActiveDate: string;
  streak: number;
}

export interface TopicInfo {
  id: Topic;
  name: string;
  iconName: string;
  description: string;
  color: string;
  badgeColor: string;
}
