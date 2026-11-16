export type Language = 'java' | 'cpp' | 'python';

export type Tier = 'P1 Easy' | 'P2 Medium' | 'P3 Hard' | 'P4 Complex';

export type PatternId = 
  | 'arrays_and_prefix_sums'
  | 'two_pointers_and_sliding_window'
  | 'hashing'
  | 'sorting_and_greedy'
  | 'binary_search'
  | 'dp'
  | 'graphs_and_bfs_dfs'
  | 'number_theory_and_math'
  | 'stack_and_monotonic_stack'
  | 'strings'
  | 'bit_tricks'
  | 'simulation_and_implementation';

export interface ProblemSolutions {
  java: string;
  cpp: string;
  python: string;
  idea: string;
  complexity: string;
  pitfalls: string[];
  verified: boolean;
  testsPassed: number;
}

export interface CodeforcesProblem {
  id: string;
  contestId: number;
  index: string;
  title: string;
  url: string;
  rating: number;
  tier: Tier;
  pattern: PatternId;
  patternName: string;
  tags: string[];
  storyDisguise: string;
  paraphrase: string;
  constraints: string;
  solutions?: ProblemSolutions;
}

export interface PYQQuestion {
  id: string;
  title: string;
  driveYear: string;
  role: string;
  position: 'P1' | 'P2' | 'P3' | 'P4';
  tier: 'Easy' | 'Medium' | 'Hard' | 'Complex';
  pattern: PatternId;
  patternName: string;
  summary: string;
  constraints: string;
  confidence: 'Confirmed by 2+ sources' | 'Single source' | 'Reconstructed';
  sourceUrl: string;
  wrongApproaches: string[];
  partialScoreTips: string;
  solutions: ProblemSolutions;
}

export interface PredictedProblemItem {
  position: 'P1' | 'P2' | 'P3' | 'P4';
  marks: number;
  problem: CodeforcesProblem;
  storyDisguise: string;
  hint: string;
}

export interface PredictedSet {
  id: string;
  title: string;
  targetRole: 'DSE' | 'SP L1' | 'SP L2' | 'SP L3';
  timeLimitMinutes: number;
  passCriteria: string;
  problemCount: number;
  totalMarks: number;
  problems: PredictedProblemItem[];
}

export interface RoleConfig {
  id: string;
  name: string;
  shortName: string;
  ctc: string;
  baseSalary: string;
  variableSalary: string;
  minSolvedThreshold: {
    fullProblems: number;
    partialPercentage: number;
    description: string;
  };
  targetMarks: number;
  recommendedTimeBudget: {
    P1: number;
    P2: number;
    P3_partial?: number;
    P3_fallback?: number;
    P3?: number;
    buffer: number;
  };
  ladderTiers: string[];
  requiredProblemCount: number;
  estimatedPrepHours: number;
  description: string;
}

export interface PatternDrill {
  id: string;
  scenario: string;
  correctPattern: string;
  correctSlug: PatternId;
  options: string[];
  keyInsight: string;
  constraintClue: string;
  explanation: string;
}

export interface OralInterviewQA {
  id: string;
  category: string;
  question: string;
  modelAnswer: string;
  dryRunWalkthrough: string;
  complexityFollowUp: string;
}

export interface MistakeItem {
  id: string;
  problemTitle: string;
  pattern: string;
  mistakeReason: string;
  correctiveInsight: string;
  addedAt: string;
  nextReviewAt: string;
  intervalDays: 1 | 3 | 7;
  reviewedCount: number;
}

export interface PseudocodeTraceStep {
  step: number;
  state: string;
  action: string;
}

export interface PseudocodeMCQ {
  id: string;
  type: 'pseudocode' | 'concept';
  category: string;
  title: string;
  code?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  trace?: PseudocodeTraceStep[];
  explanation: string;
}

