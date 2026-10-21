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

      const status = getProblemStatus(progress, q.id);

      if (statusFilter === 'not_started' && status !== 'not_started') {
        return false;
      }
      if (statusFilter === 'solved' && status !== 'solved') {
        return false;
      }
      if (statusFilter === 'revise_later' && status !== 'revise_later') {
        return false;
      }
      if (statusFilter === 'due_revision') {
        const rev = progress.revisions?.[q.id];
        if (!rev || !isRevisionDue(rev)) {
          return false;
        }
      }
      if (statusFilter === 'starred' && !starredMap[q.id]) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesCompany = q.companies?.some((c) => c.toLowerCase().includes(query));
        const matchesPlatform = q.platform.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesPlatform) {
          return false;
        }
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
    const willBeDone = current !== 'solved';
    onToggleDone(id);
    if (willBeDone) {
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const currentTopicMeta = TOPICS.find(t => t.id === selectedTopic);

  return (
    <div className="space-y-6">
      {/* 1. Deterministic Daily Challenge Card */}
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

      {/* 3. Sheet Header & Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> 450 Sheet Tracker & Roulette
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Curated DSA 450 Interview Questions
            </h2>
            <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
              Crack product companies and FAANG interviews. Click any problem to launch directly on LeetCode or GeeksforGeeks. Mark solved problems to permanently filter them out from the Random Problem Roulette!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <button
              onClick={() => triggerRandomPicker(selectedTopic)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <Dice5 className="w-5 h-5" />
              <span>
                🎲 Random {selectedTopic === 'all' ? 'Problem' : currentTopicMeta?.name.split(' ')[0]} Question
              </span>
            </button>

            <button
              onClick={() => triggerRandomPicker('all')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-bold text-sm rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Global 450 Roulette</span>
            </button>
          </div>
        </div>

        {/* Progress Metrics & Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Total 450 Solved</span>
            <span className="text-xl font-black text-white">{totalDone} / {totalQuestions}</span>
            <span className="text-xs text-cyan-400 ml-1 font-mono">
              ({Math.round((totalDone / totalQuestions) * 100)}%)
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">{currentTopicMeta?.name || 'Category'} Solved</span>
            <span className="text-xl font-black text-emerald-400">{categoryDone} / {categoryQuestions.length}</span>
            <span className="text-xs text-emerald-400 ml-1 font-mono">
              ({categoryPercentage}%)
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Due for Revision</span>
            <span className="text-xl font-black text-indigo-400">
              {dueRevisions.length}
            </span>
            <span className="text-xs text-slate-500 ml-1">problems</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Starred / Revisit</span>
            <span className="text-xl font-black text-amber-400">
              {Object.values(starredMap).filter(Boolean).length}
            </span>
            <span className="text-xs text-slate-500 ml-1">saved</span>
          </div>
        </div>

        {/* Topic-Wise Progress Bar in Header */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-slate-400">
              {selectedTopic === 'all' ? 'Overall 450 Sheet Progress' : `${currentTopicMeta?.name} Completion`}
            </span>
            <span className="text-cyan-400 font-mono font-bold">
              {categoryDone} of {categoryQuestions.length} ({categoryPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${categoryPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Category Tabs with Mini Progress Bars */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-start gap-1 border ${
            selectedTopic === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md scale-105'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories (450)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full font-mono">
              {totalDone}/{QUESTIONS_450.length}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-400 h-full transition-all duration-300" 
              style={{ width: `${Math.round((totalDone / QUESTIONS_450.length) * 100)}%` }}
            />
          </div>
        </button>

        {TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          const count = QUESTIONS_450.filter(q => q.topic === topic.id).length;
          const doneC = QUESTIONS_450.filter(q => q.topic === topic.id && getProblemStatus(progress, q.id) === 'solved').length;
          const pct = count > 0 ? Math.round((doneC / count) * 100) : 0;

          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-start gap-1 border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md scale-105'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{topic.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${doneC === count && count > 0 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  {doneC}/{count}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${doneC === count && count > 0 ? 'bg-emerald-400' : 'bg-cyan-400'}`} 
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* 5. Search Bar & Persistent Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems by title, company (Google, Amazon...), platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer font-medium"
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
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer font-medium"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* 6. Questions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span>Status</span>
            <span>Problem Title</span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <span>Workflow Status</span>
            <span>Platform</span>
            <span>Difficulty</span>
            <span>Actions</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-300">No matching questions found</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search query.</p>
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
                <div key={q.id} className="transition-colors hover:bg-slate-800/40">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* 1-Click Done Checkbox */}
                      <button
                        onClick={() => handleMarkDone(q.id)}
                        title={isDone ? 'Mark as Not Started' : 'Mark as Solved'}
                        className="mt-0.5 sm:mt-0 text-slate-500 hover:text-emerald-400 transition transform active:scale-90"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:border-slate-400" />
                        )}
                      </button>

                      {/* Bookmark / Star */}
                      <button
                        onClick={() => onToggleStar(q.id)}
                        title={isStarred ? 'Unstar problem' : 'Star for revision'}
                        className="mt-0.5 sm:mt-0 transition transform active:scale-90"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        />
                      </button>

                      {/* Title & Companies */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={q.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-semibold text-sm hover:underline transition ${
                              isDone ? 'text-slate-400 line-through' : 'text-white hover:text-cyan-400'
                            }`}
                          >
                            {q.title}
                          </a>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 inline flex-shrink-0" />

                          {/* Spaced Revision Indicator Badge */}
                          {revision && (
                            <span 
                              className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono ${
                                isRevisionDue(revision)
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold animate-pulse'
                                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              }`}
                              title={isRevisionDue(revision) ? 'Revision due today!' : `Revision due on ${revision.dueAt}`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{isRevisionDue(revision) ? 'Due Today' : `Due: ${revision.dueAt.slice(5)}`}</span>
                            </span>
                          )}
                        </div>

                        {q.companies && q.companies.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {q.companies.map((comp, cIdx) => (
                              <span
                                key={cIdx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Action Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-8 sm:pl-0 flex-wrap">
                      {/* Status Selector Pill: Not Started / Solved / Revise Later */}
                      <select
                        value={status}
                        onChange={(e) => onSetProblemStatus(q.id, e.target.value as ProblemStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none transition ${
                          status === 'solved'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            : status === 'revise_later'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                        title="Set problem workflow status"
                      >
                        <option value="not_started">⚪ Not Started</option>
                        <option value="solved">✅ Solved</option>
                        <option value="revise_later">⏰ Revise Later</option>
                      </select>

                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {q.platform}
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getDifficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>

                      {/* Solution Modal Trigger */}
                      <button
                        onClick={() => setSelectedSolutionQuestion(q)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition transform active:scale-95 whitespace-nowrap shadow-sm hover:shadow-amber-500/20"
                        title="View Intuition, Whiteboard Pseudocode, and C++/Java/Python/JS Solutions"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Solution</span>
                      </button>

                      {/* Notes Trigger */}
                      <button
                        onClick={() => setExpandedNotesId(isNotesOpen ? null : q.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          hasNotes
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Add/View Problem Notes"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Direct Solve Link */}
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition whitespace-nowrap"
                      >
                        <span>Solve</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Notes Area */}
                  {isNotesOpen && (
                    <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800/60 animate-in fade-in duration-200">
                      <div className="max-w-3xl">
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                          My Notes & Intuition for: <span className="text-cyan-300">{q.title}</span>
                        </label>
                        <textarea
                          rows={3}
                          value={notesMap[q.id] || ''}
                          onChange={(e) => onSaveNote(q.id, e.target.value)}
                          placeholder="Write key intuition, time complexity, edge cases, or code hints here..."
                          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
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

      {/* Roulette Modal */}
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
        onViewSolution={(q) => setSelectedSolutionQuestion(q)}
      />

      {/* Solution Reference Modal */}
      <SolutionModal
        isOpen={Boolean(selectedSolutionQuestion)}
        onClose={() => setSelectedSolutionQuestion(null)}
        question={selectedSolutionQuestion}
        isDone={Boolean(selectedSolutionQuestion && doneMap[selectedSolutionQuestion.id])}
        onToggleDone={handleMarkDone}
      />
    </div>
  );
};
