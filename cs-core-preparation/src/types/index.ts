export type SubjectId = 'dsa' | 'cn' | 'oops' | 'dbms' | 'os' | 'aptitude';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ExamTag = 'GATE CS' | 'TCS NQT' | 'Campus Placement' | 'Product / MAANG' | 'Fundamentals';

export interface Question {
  id: string;
  subject: SubjectId;
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  examTags: ExamTag[];
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, or 3
  explanation: string;
  keyFormulaOrNote?: string;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
  gradient: string;
  topicsCount: number;
  featuredTopics: string[];
}

export interface LearningTopic {
  id: string;
  subject: SubjectId;
  title: string;
  category: string;
  readTimeMinutes: number;
  summary: string;
  content: {
    coreConcept: string;
    keyPoints: string[];
    diagramOrAscii?: string;
    codeExample?: {
      language: string;
      code: string;
      explanation: string;
    };
    formulasAndRules?: {
      title: string;
      detail: string;
    }[];
    interviewPitfalls: string[];
    gateOrPlacementTip: string;
  };
  quickQuiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface Flashcard {
  id: string;
  subject: SubjectId;
  front: string;
  back: string;
  topic: string;
  difficulty: Difficulty;
}

export type ThemeMode = 'simple' | 'dark' | 'vibrant' | 'emerald' | 'sepia';

export interface TestSettings {
  mode: 'full_mock' | 'subject_mock' | 'tcs_nqt' | 'gate_cs' | 'custom';
  subjectId?: SubjectId;
  difficulty?: 'all' | Difficulty;
  questionCount: number;
  durationMinutes: number;
  hasTimer: boolean;
}

export interface TestQuestionState {
  question: Question;
  selectedAnswer: number | null; // null if unattempted
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}

export interface TestResult {
  id: string;
  date: string;
  testTitle: string;
  settings: TestSettings;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  subjectBreakdown: Record<SubjectId, { total: number; correct: number; incorrect: number; unattempted: number }>;
  difficultyBreakdown: Record<Difficulty, { total: number; correct: number; incorrect: number; unattempted: number }>;
  focusAreas: {
    subject: SubjectId;
    topic: string;
    accuracy: number;
    advice: string;
  }[];
  questionStates: TestQuestionState[];
}

export interface UserProgress {
  streak: number;
  lastActiveDate: string;
  totalQuestionsSolved: number;
  totalCorrect: number;
  bookmarks: string[]; // question ids
  mistakeNotebook: {
    questionId: string;
    addedAt: string;
    wrongAttemptsCount: number;
    lastAttemptedOption: number;
  }[];
  testHistory: TestResult[];
  notes: Record<string, string>; // questionId -> user scratchpad note
}
