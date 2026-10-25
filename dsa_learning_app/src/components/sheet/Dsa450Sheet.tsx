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
  ChevronDown,
  ChevronLeft,
  ChevronRight
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

  // Category Tabs Scrolling
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkTabsScroll = () => {
    if (!tabsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    checkTabsScroll();
    window.addEventListener('resize', checkTabsScroll);
    return () => window.removeEventListener('resize', checkTabsScroll);
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkTabsScroll, 320);
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!tabsRef.current) return;
    if (e.deltaY !== 0) {
      tabsRef.current.scrollLeft += e.deltaY * 1.1;
      checkTabsScroll();
    }
  };

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
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm relative overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-subtle)]">
                Curated Sheet
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                450 Problems across 12 Core Patterns
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
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
              <Sparkles className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Global 450</span>
            </button>
          </div>
        </div>

        {/* Unified Metrics Bar */}
        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] block font-medium">Overall Progress</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-[var(--text-primary)]">{totalDone} / {totalQuestions}</span>
              <span className="text-xs text-[var(--text-secondary)] font-mono font-semibold">
                ({Math.round((totalDone / totalQuestions) * 100)}%)
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-muted)] block font-medium">{currentTopicMeta?.name || 'Category'} Solved</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-[var(--status-green)]">{categoryDone} / {categoryQuestions.length}</span>
              <span className="text-xs text-[var(--status-green)] font-mono font-semibold">
                ({categoryPercentage}%)
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-muted)] block font-medium">Due for Revision</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-[var(--text-primary)]">{dueRevisions.length}</span>
              <span className="text-xs text-[var(--text-muted)]">pending</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-[var(--text-muted)] block font-medium">Starred Questions</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-amber-500 dark:text-amber-400">{Object.values(starredMap).filter(Boolean).length}</span>
              <span className="text-xs text-[var(--text-muted)]">saved</span>
            </div>
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="mt-3.5 pt-2">
          <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="bg-[var(--text-primary)] h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.round((totalDone / totalQuestions) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Category Tabs with Left/Right Arrows & Smooth Mouse-Wheel Scroll */}
      <div className="relative group">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition"
            title="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div 
          ref={tabsRef}
          onScroll={checkTabsScroll}
          onWheel={handleTabsWheel}
          className="category-scroll-container flex items-center gap-1.5 pb-2.5 px-0.5"
        >
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2 flex-shrink-0 ${
              selectedTopic === 'all'
                ? 'btn-solid shadow-sm font-semibold'
                : 'btn-outline text-[var(--text-secondary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Topics</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              selectedTopic === 'all'
                ? 'bg-[var(--text-inverse)]/20 text-[var(--text-inverse)]'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
            }`}>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 flex-shrink-0 ${
                  isSelected
                    ? 'btn-solid shadow-sm font-semibold'
                    : 'btn-outline text-[var(--text-secondary)]'
                }`}
              >
                <span>{topic.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected
                    ? 'bg-[var(--text-inverse)]/20 text-[var(--text-inverse)]'
                    : doneC === count && count > 0 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                }`}>
                  {doneC}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition"
            title="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 5. Minimalist Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg-card)] p-3 sm:p-3.5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter problems by title, company (Google, Amazon...), platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] cursor-pointer font-medium"
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
            className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] cursor-pointer font-medium"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* 6. Clean Problem Table / List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
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

        <div className="divide-y divide-[var(--border-subtle)]">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-muted)]">
              <Award className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-base font-semibold text-[var(--text-primary)]">No matching questions found</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Try clearing your filters or search query.</p>
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
                <div key={q.id} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                  <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleMarkDone(q.id)}
                        title={isDone ? 'Mark as Not Started' : 'Mark as Solved'}
                        className="mt-0.5 sm:mt-0 text-[var(--text-muted)] hover:text-[var(--status-green)] transition active:scale-90"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--status-green)]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[var(--text-muted)] hover:border-[var(--text-secondary)]" />
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
                            isStarred ? 'text-amber-500 fill-amber-500' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
                              isDone ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {q.title}
                          </a>
                          <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] inline flex-shrink-0" />

                          {revision && (
                            <span 
                              className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono ${
                                isRevisionDue(revision)
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold animate-pulse'
                                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
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
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono"
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
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)] border-[var(--border-strong)]'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <option value="not_started">⚪ Not Started</option>
                        <option value="solved">✅ Solved</option>
                        <option value="revise_later">⏰ Revise Later</option>
                      </select>

                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
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
                            ? 'btn-solid'
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
                    <div className="px-6 py-4 bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)] animate-in fade-in duration-200">
                      <div className="max-w-3xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Private Problem Notes
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">Saved locally in browser</span>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Write down tricky edge cases, your approach intuition, time complexity..."
                          value={notesMap[q.id] || ''}
                          onChange={(e) => onSaveNote(q.id, e.target.value)}
                          className="w-full p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] font-mono"
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
