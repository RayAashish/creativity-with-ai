import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Dice5, 
  FileText, 
  Layers, 
  Award,
  Lightbulb,
  Clock,
  RotateCcw,
  Check,
  ChevronDown
} from 'lucide-react';
import { 
  Question, 
  Topic, 
  Difficulty, 
  UserProgress, 
  ProblemStatus, 
  StoredFilters 
} from '../../types/dsa';
import { TOPICS } from '../../data/topics';
import { QUESTIONS_450 } from '../../data/questions450';
import { RandomQuestionModal } from './RandomQuestionModal';
import { SolutionModal } from './SolutionModal';
import { DailyChallengeCard } from './DailyChallengeCard';
import { SpacedRevisionSection } from './SpacedRevisionSection';
import { 
  pickRandomQuestion, 
  getProblemStatus, 
  getDailyChallenge, 
  getDueRevisions, 
  getStoredFilters, 
  saveStoredFilters,
  isRevisionDue
} from '../../utils/storage';
import confetti from 'canvas-confetti';

interface Dsa450SheetProps {
  progress: UserProgress;
  doneMap: Record<string, boolean>;
  starredMap: Record<string, boolean>;
  notesMap: Record<string, string>;
  onToggleDone: (questionId: string) => void;
  onSetProblemStatus: (questionId: string, status: ProblemStatus) => void;
  onToggleStar: (questionId: string) => void;
  onSaveNote: (questionId: string, note: string) => void;
  onAdvanceRevision: (questionId: string) => void;
  onToggleDailyChallenge: (questionId: string) => void;
}

export const Dsa450Sheet: React.FC<Dsa450SheetProps> = ({
  progress,
  doneMap,
  starredMap,
  notesMap,
  onToggleDone,
  onSetProblemStatus,
  onToggleStar,
  onSaveNote,
  onAdvanceRevision,
  onToggleDailyChallenge,
}) => {
  // Load initial persistent filters
  const initialFilters = useMemo(() => getStoredFilters(), []);

  const [selectedTopic, setSelectedTopic] = useState<Topic | 'all'>(initialFilters.topic);
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.searchQuery);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>(initialFilters.difficulty);
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'solved' | 'revise_later' | 'due_revision' | 'starred'>(
    initialFilters.status as any || 'all'
  );

  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [selectedSolutionQuestion, setSelectedSolutionQuestion] = useState<Question | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [randomQuestionData, setRandomQuestionData] = useState<{
    question: Question | null;
    totalRemaining: number;
    totalInPool: number;
  }>({ question: null, totalRemaining: 0, totalInPool: 0 });
  const [modalTopic, setModalTopic] = useState<Topic | 'all'>('arrays');

  // Persist filter changes
  useEffect(() => {
    const filters: StoredFilters = {
      topic: selectedTopic,
      difficulty: difficultyFilter,
      status: statusFilter === 'starred' ? 'all' : statusFilter,
      searchQuery,
    };
    saveStoredFilters(filters);
  }, [selectedTopic, difficultyFilter, statusFilter, searchQuery]);

  // Daily Challenge data
  const daily = useMemo(() => {
    return getDailyChallenge(QUESTIONS_450);
  }, []);

  const isDailyDone = useMemo(() => {
    return Boolean(progress.dailyChallengeSolved?.[daily.dateStr]) || Boolean(doneMap[daily.question.id]);
  }, [progress.dailyChallengeSolved, daily.dateStr, daily.question.id, doneMap]);

  // Spaced revisions due today
  const dueRevisions = useMemo(() => {
    return getDueRevisions(progress, QUESTIONS_450);
  }, [progress, progress.revisions]);

  // Filtering questions
  const filteredQuestions = useMemo(() => {
    return QUESTIONS_450.filter((q) => {
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) {
        return false;
      }
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) {
        return false;
      }
      const qStatus = getProblemStatus(progress, q.id);
      if (statusFilter === 'not_started' && qStatus !== 'not_started') {
        return false;
      }
      if (statusFilter === 'solved' && qStatus !== 'solved') {
        return false;
      }
      if (statusFilter === 'revise_later' && qStatus !== 'revise_later') {
        return false;
      }
      if (statusFilter === 'due_revision') {
        const rev = progress.revisions?.[q.id];
        if (!rev || !isRevisionDue(rev)) return false;
      }
      if (statusFilter === 'starred' && !starredMap[q.id]) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesCompany = q.companies.some(c => c.toLowerCase().includes(query));
        const matchesPlatform = q.platform.toLowerCase().includes(query);
        return matchesTitle || matchesCompany || matchesPlatform;
      }
      return true;
    });
  }, [selectedTopic, difficultyFilter, statusFilter, searchQuery, progress, starredMap]);

  // Progress metrics
  const totalQuestions = QUESTIONS_450.length;
  const totalDone = useMemo(() => {
    return QUESTIONS_450.filter(q => getProblemStatus(progress, q.id) === 'solved').length;
  }, [progress]);

  const categoryQuestions = useMemo(() => {
    if (selectedTopic === 'all') return QUESTIONS_450;
    return QUESTIONS_450.filter(q => q.topic === selectedTopic);
  }, [selectedTopic]);

  const categoryDone = useMemo(() => {
    return categoryQuestions.filter(q => getProblemStatus(progress, q.id) === 'solved').length;
  }, [categoryQuestions, progress]);

  const categoryPercentage = categoryQuestions.length > 0 
    ? Math.round((categoryDone / categoryQuestions.length) * 100) 
    : 0;

  const triggerRandomPicker = (topicToRoll: Topic | 'all', includeDone: boolean = false) => {
    setModalTopic(topicToRoll);
    const result = pickRandomQuestion(QUESTIONS_450, doneMap, topicToRoll, includeDone);
    setRandomQuestionData(result);
    setIsModalOpen(true);
  };

  const handleMarkDone = (id: string) => {
    const current = getProblemStatus(progress, id);
    const nextStatus: ProblemStatus = current === 'solved' ? 'not_started' : 'solved';
    onSetProblemStatus(id, nextStatus);
    if (nextStatus === 'solved') {
      try {
        confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
  };

  const currentTopicMeta = TOPICS.find(t => t.id === selectedTopic);

  return (
    <div className="space-y-6">
      {/* 1. Deterministic Daily Challenge Card (Compact & Focused) */}
      <DailyChallengeCard
        question={daily.question}
        dateStr={daily.dateStr}
        isDone={isDailyDone}
        dailyStreak={progress.dailyChallengeStreak || 0}
        onToggleDone={onToggleDailyChallenge}
        onViewSolution={(q) => setSelectedSolutionQuestion(q)}
      />

      {/* 2. Spaced Revision Due Banner (resurfacing after 3, 7, and 14 days) */}
      <SpacedRevisionSection
        dueList={dueRevisions}
        onAdvanceRevision={onAdvanceRevision}
        onViewSolution={(q) => setSelectedSolutionQuestion(q)}
        onToggleDone={handleMarkDone}
        isQuestionDone={(qid) => getProblemStatus(progress, qid) === 'solved'}
      />

      {/* 3. Streamlined Command & Progress Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#131417] p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Curated Sheet
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                450 Problems across 12 Core Patterns
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              450 DSA Sheet
            </h1>
          </div>

          {/* Quick Roulette Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => triggerRandomPicker(selectedTopic)}
              className="btn-solid flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <Dice5 className="w-4 h-4" />
              <span>
                Random {selectedTopic === 'all' ? 'Problem' : currentTopicMeta?.name.split(' ')[0]}
              </span>
            </button>

            <button
              onClick={() => triggerRandomPicker('all')}
              className="btn-outline flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Global 450</span>
            </button>
          </div>
        </div>

        {/* Unified Metrics Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">Overall Progress</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{totalDone} / {totalQuestions}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-semibold">
                ({Math.round((totalDone / totalQuestions) * 100)}%)
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">{currentTopicMeta?.name || 'Category'} Solved</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{categoryDone} / {categoryQuestions.length}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                ({categoryPercentage}%)
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">Due for Revision</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{dueRevisions.length}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">pending</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">Starred Questions</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-amber-500 dark:text-amber-400">{Object.values(starredMap).filter(Boolean).length}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">saved</span>
            </div>
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="mt-3.5 pt-2">
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.round((totalDone / totalQuestions) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${
            selectedTopic === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-sm font-semibold'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Topics</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {totalDone}/{totalQuestions}
          </span>
        </button>

        {TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          const count = QUESTIONS_450.filter(q => q.topic === topic.id).length;
          const doneC = QUESTIONS_450.filter(q => q.topic === topic.id && getProblemStatus(progress, q.id) === 'solved').length;

          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-sm font-semibold'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <span>{topic.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                doneC === count && count > 0 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}>
                {doneC}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Minimalist Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#131417] p-3 sm:p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter problems by title, company (Google, Amazon...), platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">⚪ Not Started</option>
            <option value="solved">✅ Solved Only</option>
            <option value="revise_later">⏰ Revise Later</option>
            <option value="due_revision">⚡ Due for Revision Today ({dueRevisions.length})</option>
            <option value="starred">⭐ Starred for Revision</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer font-medium"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* 6. Clean Problem Table / List */}
      <div className="bg-white dark:bg-[#131417] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
          <div className="flex items-center gap-4">
            <span>Status</span>
            <span>Problem Title</span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <span>Platform</span>
            <span>Difficulty</span>
            <span>Actions</span>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <Award className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No matching questions found</p>
              <p className="text-xs text-zinc-500 mt-1">Try clearing your filters or search query.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const status = getProblemStatus(progress, q.id);
              const isDone = status === 'solved';
              const isStarred = Boolean(starredMap[q.id]);
              const isNotesOpen = expandedNotesId === q.id;
              const hasNotes = Boolean(notesMap[q.id]);
              const revision = progress.revisions?.[q.id];

              return (
                <div key={q.id} className="transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
                  <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleMarkDone(q.id)}
                        title={isDone ? 'Mark as Not Started' : 'Mark as Solved'}
                        className="mt-0.5 sm:mt-0 text-zinc-400 hover:text-emerald-500 transition active:scale-90"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-400 hover:border-zinc-500" />
                        )}
                      </button>

                      {/* Star */}
                      <button
                        onClick={() => onToggleStar(q.id)}
                        title={isStarred ? 'Unstar problem' : 'Star for revision'}
                        className="mt-0.5 sm:mt-0 transition active:scale-90"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'text-amber-500 fill-amber-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                          }`}
                        />
                      </button>

                      {/* Title & Tags */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={q.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-medium text-sm transition hover:opacity-75 ${
                              isDone ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {q.title}
                          </a>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 inline flex-shrink-0" />

                          {revision && (
                            <span 
                              className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono ${
                                isRevisionDue(revision)
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold animate-pulse'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                              }`}
                              title={isRevisionDue(revision) ? 'Revision due today!' : `Revision due on ${revision.dueAt}`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{isRevisionDue(revision) ? 'Due Today' : `Due: ${revision.dueAt.slice(5)}`}</span>
                            </span>
                          )}
                        </div>

                        {q.companies && q.companies.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {q.companies.map((comp, cIdx) => (
                              <span
                                key={cIdx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Action Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0 flex-wrap flex-shrink-0">
                      {/* Status Selector Pill */}
                      <select
                        value={status}
                        onChange={(e) => onSetProblemStatus(q.id, e.target.value as ProblemStatus)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none transition ${
                          status === 'solved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : status === 'revise_later'
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        <option value="not_started">⚪ Not Started</option>
                        <option value="solved">✅ Solved</option>
                        <option value="revise_later">⏰ Revise Later</option>
                      </select>

                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {q.platform}
                      </span>

                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${getDifficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>

                      {/* Solution Trigger */}
                      <button
                        onClick={() => setSelectedSolutionQuestion(q)}
                        className="btn-outline flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium"
                        title="View Intuition, Pseudocode, and C++/Java/Python/JS Solutions"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Solution</span>
                      </button>

                      {/* Notes Trigger */}
                      <button
                        onClick={() => setExpandedNotesId(isNotesOpen ? null : q.id)}
                        className={`p-1.5 rounded-xl border transition ${
                          hasNotes
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                            : 'btn-outline'
                        }`}
                        title="Add/View Problem Notes"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct Solve Link */}
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-solid flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold"
                      >
                        <span>Solve</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Notes Drawer */}
                  {isNotesOpen && (
                    <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200">
                      <div className="max-w-3xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-zinc-500" /> Private Problem Notes
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">Saved locally in browser</span>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Write down tricky edge cases, your approach intuition, time complexity..."
                          value={notesMap[q.id] || ''}
                          onChange={(e) => onSaveNote(q.id, e.target.value)}
                          className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Random Question Roulette Modal */}
      <RandomQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={randomQuestionData.question}
        totalRemaining={randomQuestionData.totalRemaining}
        totalInPool={randomQuestionData.totalInPool}
        currentTopic={modalTopic}
        onRollNew={(topic, includeDone) => {
          const res = pickRandomQuestion(QUESTIONS_450, doneMap, topic, includeDone);
          setRandomQuestionData(res);
        }}
        onToggleDone={handleMarkDone}
        isDone={randomQuestionData.question ? Boolean(doneMap[randomQuestionData.question.id]) : false}
        onSelectTopic={(topic) => setModalTopic(topic)}
      />

      {/* Solutions & Code Inspection Modal */}
      {selectedSolutionQuestion && (
        <SolutionModal
          question={selectedSolutionQuestion}
          isOpen={Boolean(selectedSolutionQuestion)}
          onClose={() => setSelectedSolutionQuestion(null)}
          isDone={getProblemStatus(progress, selectedSolutionQuestion.id) === 'solved'}
          onToggleDone={handleMarkDone}
        />
      )}
    </div>
  );
};
