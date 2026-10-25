import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CuratedQuestion, 
  CURATED_VAULT_QUESTIONS 
} from '../../data/curatedVault';
import { QUESTIONS_450 } from '../../data/questions450';
import { TOPICS } from '../../data/topics';
import { PatternRadar } from './PatternRadar';
import { BlitzGauntlet } from './BlitzGauntlet';
import { CodeSandbox } from './CodeSandbox';
import { CurationsAnalytics, CuratedTrackKey } from './CurationsAnalytics';
import { SolutionModal } from '../sheet/SolutionModal';
import { Question, Topic, Difficulty, UserProgress, ProblemStatus } from '../../types/dsa';
import { getProblemStatus } from '../../utils/storage';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Layers, 
  Flame, 
  Terminal, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Star,
  FileText,
  Lightbulb,
  BarChart3,
  Check,
  Award,
  SlidersHorizontal,
  FolderTree,
  GitBranch,
  RotateCcw
} from 'lucide-react';

interface MasterArenaProps {
  progress: UserProgress;
  onToggleDone: (questionId: string) => void;
  onSetProblemStatus: (questionId: string, status: ProblemStatus) => void;
  onToggleStar?: (questionId: string) => void;
  onSaveNote?: (questionId: string, note: string) => void;
}

export type ArenaSubTab = 'vault' | 'analytics' | 'radar' | 'blitz' | 'sandbox';
export type CuratedSheetFilter = 'all' | 'striver_sde' | 'neetcode150' | 'blind75' | 'faang_top';
export type ViewGroupMode = 'topic' | 'pattern' | 'flat';

export const MasterArena: React.FC<MasterArenaProps> = ({
  progress,
  onToggleDone,
  onSetProblemStatus,
  onToggleStar,
  onSaveNote,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ArenaSubTab>('vault');
  const [sheetFilter, setSheetFilter] = useState<CuratedSheetFilter>('all');
  const [selectedTopic, setSelectedTopic] = useState<Topic | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'solved' | 'revise_later' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatternFilter, setSelectedPatternFilter] = useState<string | null>(null);
  const [viewGroupMode, setViewGroupMode] = useState<ViewGroupMode>('topic');

  // Solution Modal State
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState<boolean>(false);

  // Notes drawer state
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState<string>('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  // Collapsible Accordion sections state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Category horizontal scroll ref
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll availability for category tabs
  const updateScrollButtons = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [activeSubTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 260;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  // Maps a question's pattern to a canonical family
  const getPatternFamily = (pattern: string): string => {
    const p = pattern.toLowerCase();
    if (p.includes('window')) return 'Sliding Window';
    if (p.includes('two pointer') || p.includes('inward') || p.includes('meet-in-the-middle') || p.includes('sweep')) return 'Two Pointers';
    if (p.includes('fast') || p.includes('slow') || p.includes('tortoise') || p.includes('cycle')) return 'Fast & Slow Pointers';
    if (p.includes('interval') || p.includes('meeting') || p.includes('merge interval')) return 'Merge Intervals & Scheduling';
    if (p.includes('monotonic') || p.includes('stack') || p.includes('histogram') || p.includes('parentheses')) return 'Monotonic Stack & Queues';
    if (p.includes('binary search') || p.includes('monotonic answer') || p.includes('answer range') || p.includes('bounds')) return 'Binary Search & Bounds';
    if (p.includes('bfs') || p.includes('level order') || p.includes('vertical')) return 'Breadth-First Search (BFS)';
    if (p.includes('backtrack') || p.includes('dfs') || p.includes('subset') || p.includes('permutation') || p.includes('maze') || p.includes('combination')) return 'Backtracking & DFS';
    if (p.includes('heap') || p.includes('priority queue') || p.includes('top k') || p.includes('median') || p.includes('combination')) return 'Heaps & Priority Queues';
    if (p.includes('knapsack') || p.includes('dp') || p.includes('subsequence') || p.includes('path sum') || p.includes('mcm') || p.includes('grid unique')) return 'Dynamic Programming';
    if (p.includes('topo') || p.includes('graph') || p.includes('dijkstra') || p.includes('spanning') || p.includes('kosaraju') || p.includes('union') || p.includes('dsu') || p.includes('bipartite')) return 'Graph Algorithms & DSU';
    if (p.includes('trie') || p.includes('prefix tree')) return 'Tries & Prefix Trees';
    if (p.includes('bit') || p.includes('xor') || p.includes('manipulation') || p.includes('math')) return 'Bit Manipulation & Math';
    if (p.includes('hash') || p.includes('complement') || p.includes('frequency') || p.includes('anagram')) return 'Hashing & Frequency Maps';
    if (p.includes('linked list') || p.includes('reverse') || p.includes('merge sorted') || p.includes('node')) return 'Linked List Operations';
    if (p.includes('tree') || p.includes('bst') || p.includes('inorder') || p.includes('ancestor') || p.includes('preorder')) return 'Trees & BST';
    return pattern || 'Algorithmic Blueprints';
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return CURATED_VAULT_QUESTIONS.filter(q => {
      // Curated sheet filter
      if (sheetFilter !== 'all' && !q.curations.includes(sheetFilter)) {
        return false;
      }
      // Topic filter
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) {
        return false;
      }
      // Difficulty filter
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) {
        return false;
      }
      // Status filter
      const status = getProblemStatus(progress, q.id);
      if (statusFilter === 'solved' && status !== 'solved') return false;
      if (statusFilter === 'not_started' && status !== 'not_started') return false;
      if (statusFilter === 'revise_later' && status !== 'revise_later') return false;
      if (statusFilter === 'starred' && !progress.starredQuestions?.[q.id]) return false;

      // Pattern filter
      if (selectedPatternFilter && !q.pattern.toLowerCase().includes(selectedPatternFilter.toLowerCase())) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesDesc = q.description?.toLowerCase().includes(query) || false;
        const matchesPattern = q.pattern.toLowerCase().includes(query);
        const matchesCompany = q.companies.some(c => c.toLowerCase().includes(query));
        const matchesNumber = q.leetcodeNumber ? String(q.leetcodeNumber).includes(query) : false;
        if (!matchesTitle && !matchesDesc && !matchesPattern && !matchesCompany && !matchesNumber) {
          return false;
        }
      }
      return true;
    });
  }, [sheetFilter, selectedTopic, difficultyFilter, statusFilter, selectedPatternFilter, searchQuery, progress]);

  // Statistics
  const totalCount = CURATED_VAULT_QUESTIONS.length;
  const blind75Count = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('blind75')).length;
  const neetcodeCount = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('neetcode150')).length;
  const striverCount = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('striver_sde')).length;
  const faangCount = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('faang_top')).length;

  const currentTrackQuestions = useMemo(() => {
    return CURATED_VAULT_QUESTIONS.filter(q => sheetFilter === 'all' ? true : q.curations.includes(sheetFilter));
  }, [sheetFilter]);

  const currentTrackSolved = useMemo(() => {
    return currentTrackQuestions.filter(q => getProblemStatus(progress, q.id) === 'solved').length;
  }, [currentTrackQuestions, progress]);

  // Open Solution Modal
  const handleOpenSolution = (q: CuratedQuestion) => {
    setSelectedQuestion(q);
    setIsSolutionModalOpen(true);
  };

  // Toggle problem solved
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

  // Open notes drawer
  const handleToggleNotesDrawer = (questionId: string) => {
    if (expandedNotesId === questionId) {
      setExpandedNotesId(null);
    } else {
      setExpandedNotesId(questionId);
      setCurrentNoteText(progress.notes?.[questionId] || '');
      setNoteSavedFeedback(false);
    }
  };

  const handleSaveCurrentNote = (questionId: string) => {
    if (onSaveNote) {
      onSaveNote(questionId, currentNoteText);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2000);
    }
  };

  // Toggle accordion section
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: prev[groupKey] === undefined ? false : !prev[groupKey]
    }));
  };

  const isGroupExpanded = (groupKey: string): boolean => {
    return expandedGroups[groupKey] !== false; // expanded by default
  };

  const expandAllGroups = (keys: string[]) => {
    const next: Record<string, boolean> = {};
    keys.forEach(k => { next[k] = true; });
    setExpandedGroups(next);
  };

  const collapseAllGroups = (keys: string[]) => {
    const next: Record<string, boolean> = {};
    keys.forEach(k => { next[k] = false; });
    setExpandedGroups(next);
  };

  // Grouped questions by Data Structure / Topic
  const topicGrouped = useMemo(() => {
    const map = new Map<Topic, CuratedQuestion[]>();
    TOPICS.forEach(t => map.set(t.id, []));
    filteredQuestions.forEach(q => {
      const list = map.get(q.topic) || [];
      list.push(q);
      map.set(q.topic, list);
    });
    return TOPICS.map(t => ({
      key: t.id,
      name: t.name,
      iconName: t.iconName,
      questions: map.get(t.id) || [],
      solvedCount: (map.get(t.id) || []).filter(q => getProblemStatus(progress, q.id) === 'solved').length
    })).filter(g => g.questions.length > 0);
  }, [filteredQuestions, progress]);

  // Grouped questions by Canonical Pattern
  const patternGrouped = useMemo(() => {
    const map = new Map<string, CuratedQuestion[]>();
    filteredQuestions.forEach(q => {
      const fam = getPatternFamily(q.pattern);
      const list = map.get(fam) || [];
      list.push(q);
      map.set(fam, list);
    });

    const groups: { key: string; name: string; questions: CuratedQuestion[]; solvedCount: number }[] = [];
    map.forEach((questions, key) => {
      groups.push({
        key,
        name: key,
        questions,
        solvedCount: questions.filter(q => getProblemStatus(progress, q.id) === 'solved').length
      });
    });

    return groups.sort((a, b) => b.questions.length - a.questions.length);
  }, [filteredQuestions, progress]);

  const handleFilterByPatternFromRadar = (patternName: string) => {
    setSelectedPatternFilter(patternName);
    setActiveSubTab('vault');
  };

  const handleOpenArchetypeFromRadar = (archetypeId: string) => {
    const found = 
      CURATED_VAULT_QUESTIONS.find(q => q.id === archetypeId) ||
      QUESTIONS_450.find(q => q.id === archetypeId) ||
      CURATED_VAULT_QUESTIONS.find(q => q.id.includes(archetypeId)) ||
      CURATED_VAULT_QUESTIONS.find(q => q.title.toLowerCase().includes(archetypeId.toLowerCase())) ||
      CURATED_VAULT_QUESTIONS[0];
    if (found) {
      setSelectedQuestion(found);
      setIsSolutionModalOpen(true);
    }
  };

  const handleSwitchToPracticeFromAnalytics = (track: CuratedTrackKey) => {
    setSheetFilter(track);
    setActiveSubTab('vault');
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

  // Render an individual problem row with all 450 Sheet options
  const renderProblemRow = (q: CuratedQuestion) => {
    const status = getProblemStatus(progress, q.id);
    const isDone = status === 'solved';
    const isStarred = Boolean(progress.starredQuestions?.[q.id]);
    const isNotesOpen = expandedNotesId === q.id;
    const hasNotes = Boolean(progress.notes?.[q.id]);

    return (
      <div key={q.id} className="transition-colors hover:bg-[var(--bg-card-hover)]">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            {/* Checkbox */}
            <button
              type="button"
              onClick={() => handleMarkDone(q.id)}
              title={isDone ? 'Mark as Not Started' : 'Mark as Solved'}
              className="mt-0.5 sm:mt-0 text-[var(--text-muted)] hover:text-emerald-500 transition active:scale-90 flex-shrink-0"
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
              ) : (
                <Circle className="w-5 h-5 text-[var(--text-muted)] hover:border-[var(--text-secondary)]" />
              )}
            </button>

            {/* Star */}
            <button
              type="button"
              onClick={() => onToggleStar && onToggleStar(q.id)}
              title={isStarred ? 'Unstar problem' : 'Star for revision'}
              className="mt-0.5 sm:mt-0 transition active:scale-90 flex-shrink-0"
            >
              <Star
                className={`w-4 h-4 ${
                  isStarred ? 'text-amber-500 fill-amber-500' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              />
            </button>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {q.leetcodeNumber && (
                  <span className="text-[11px] font-mono text-[var(--text-muted)] font-bold">
                    #{q.leetcodeNumber}
                  </span>
                )}
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-semibold text-sm transition hover:opacity-75 ${
                    isDone ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {q.title}
                </a>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] inline flex-shrink-0" />

                {/* Pattern badge */}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {q.pattern}
                </span>
              </div>

              {/* Companies and Curations */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {q.curations.map((c) => (
                  <span
                    key={c}
                    className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                  >
                    {c === 'blind75' ? 'Blind 75' : c === 'neetcode150' ? 'NeetCode 150' : c === 'striver_sde' ? 'Striver SDE' : 'FAANG Top'}
                  </span>
                ))}
                {q.companies && q.companies.slice(0, 4).map((comp, cIdx) => (
                  <span
                    key={cIdx}
                    className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Action Controls Matching 450 Sheet */}
          <div className="flex items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0 flex-wrap flex-shrink-0">
            {/* Status Selector Pill */}
            <select
              value={status}
              onChange={(e) => onSetProblemStatus(q.id, e.target.value as ProblemStatus)}
              className={`text-xs font-mono font-medium px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none transition ${
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

            {/* Platform pill */}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {q.platform}
            </span>

            {/* Difficulty pill */}
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${getDifficultyBadge(
                q.difficulty
              )}`}
            >
              {q.difficulty}
            </span>

            {/* Solution Trigger */}
            <button
              type="button"
              onClick={() => handleOpenSolution(q)}
              className="btn-outline flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium"
              title="View Intuition, Pseudocode, and Java/C++/Python/JS Solutions"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Solution</span>
            </button>

            {/* Notes Trigger */}
            <button
              type="button"
              onClick={() => handleToggleNotesDrawer(q.id)}
              className={`p-1.5 rounded-xl border transition ${
                hasNotes ? 'btn-solid' : 'btn-outline'
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
                  <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Personal Notes & Intuition for {q.title}</span>
                </span>
                {noteSavedFeedback && (
                  <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
              <textarea
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="Write intuition, edge-cases, key invariants, or time/space trade-offs..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)] font-mono resize-y"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setExpandedNotesId(null)}
                  className="btn-outline px-3 py-1 rounded-lg text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCurrentNote(q.id)}
                  className="btn-solid px-3.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Editorial Header */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[var(--text-primary)] text-[var(--text-inverse)]">
                Master Arena
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Blind 75 • NeetCode 150 • Striver SDE • FAANG Hot Pick
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Curated Sheets, Data Structures & Patterns
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Solve problems separated data-structure wise or pattern wise, track status and personal notes, access multi-language solutions in Java, C++, Python, and JS, or deep dive into per-curation analytics.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] self-start md:self-auto font-mono">
            <div>
              <div className="text-[10px] uppercase text-[var(--text-muted)] font-semibold">
                {sheetFilter === 'all' ? 'Master Vault' : sheetFilter.toUpperCase().replace('_', ' ')} Solved
              </div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {currentTrackSolved} / {currentTrackQuestions.length}
              </div>
            </div>
            <div className="w-14 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <div 
                className="h-full bg-[var(--text-primary)] transition-all duration-500 rounded-full" 
                style={{ width: `${currentTrackQuestions.length > 0 ? Math.round((currentTrackSolved / currentTrackQuestions.length) * 100) : 0}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Arena Primary Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
              activeSubTab === 'vault'
                ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Vault ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
              activeSubTab === 'analytics'
                ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
            <span>Curations Analytics</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-500 font-bold">
              5 Sheets
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('radar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
              activeSubTab === 'radar'
                ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Pattern Radar</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
              16 Blueprints
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('blitz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
              activeSubTab === 'blitz'
                ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>60s Blitz Gauntlet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
              activeSubTab === 'sandbox'
                ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Code Sandbox</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Java / C++ / Py / JS
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Master Vault Question Catalog */}
      {activeSubTab === 'vault' && (
        <div className="space-y-4">
          {/* Curated Track Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mr-1 flex-shrink-0 font-semibold">
              Curations:
            </span>

            <button
              type="button"
              onClick={() => setSheetFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
                sheetFilter === 'all'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold border-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              👑 All Master Vault ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => setSheetFilter('striver_sde')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
                sheetFilter === 'striver_sde'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold border-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              💎 Striver SDE ({striverCount})
            </button>

            <button
              type="button"
              onClick={() => setSheetFilter('neetcode150')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
                sheetFilter === 'neetcode150'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold border-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              ⚡ NeetCode 150 ({neetcodeCount})
            </button>

            <button
              type="button"
              onClick={() => setSheetFilter('blind75')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
                sheetFilter === 'blind75'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold border-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🔥 Blind 75 ({blind75Count})
            </button>

            <button
              type="button"
              onClick={() => setSheetFilter('faang_top')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap border ${
                sheetFilter === 'faang_top'
                  ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold border-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🎯 FAANG Hot Pick ({faangCount})
            </button>
          </div>

          {/* Category Tabs with Left/Right Scroll Arrows */}
          <div className="relative group">
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
              ref={tabsContainerRef}
              onScroll={updateScrollButtons}
              className="flex items-center gap-1.5 overflow-x-auto px-1 py-1 scrollbar-none scroll-smooth"
            >
              {/* All Topics Tab */}
              <button
                type="button"
                onClick={() => setSelectedTopic('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition flex-shrink-0 border ${
                  selectedTopic === 'all'
                    ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] border-[var(--text-primary)] shadow-sm'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>All Topics</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  selectedTopic === 'all'
                    ? 'bg-[var(--text-inverse)]/20 text-[var(--text-inverse)]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                }`}>
                  {currentTrackQuestions.length}
                </span>
              </button>

              {/* Individual Topic Tabs */}
              {TOPICS.map((topic) => {
                const isSelected = selectedTopic === topic.id;
                const topicQuestions = currentTrackQuestions.filter(q => q.topic === topic.id);
                const count = topicQuestions.length;
                if (count === 0 && sheetFilter !== 'all') return null;

                const doneC = topicQuestions.filter(q => getProblemStatus(progress, q.id) === 'solved').length;
                const isDone = doneC === count && count > 0;

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition flex-shrink-0 border ${
                      isSelected
                        ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] border-[var(--text-primary)] shadow-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{topic.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-[var(--text-inverse)]/20 text-[var(--text-inverse)]'
                        : isDone
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                    }`}>
                      {doneC}/{count}
                    </span>
                  </button>
                );
              })}
            </div>

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

          {/* Search, Filter & View Mode Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by problem title, leetcode #, pattern, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">⚪ Not Started</option>
                <option value="solved">✅ Solved Only</option>
                <option value="revise_later">⏰ Revise Later</option>
                <option value="starred">⭐ Starred for Revision</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
                className="px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* View Group Mode Toggle */}
              <div className="flex items-center p-0.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setViewGroupMode('topic')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                    viewGroupMode === 'topic'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold shadow-xs border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Group by Data Structure / Topic"
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Data Structure</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewGroupMode('pattern')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                    viewGroupMode === 'pattern'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold shadow-xs border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Group by Algorithmic Pattern"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pattern Wise</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewGroupMode('flat')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                    viewGroupMode === 'flat'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold shadow-xs border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Flat Problem Table"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flat List</span>
                </button>
              </div>

              {/* Active Pattern Filter Reset Pill */}
              {selectedPatternFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedPatternFilter(null)}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono flex items-center gap-1.5 hover:bg-red-500/20 transition"
                >
                  <span>Pattern: {selectedPatternFilter}</span>
                  <span className="font-bold">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Problem Display: Grouped by Topic, Pattern, or Flat List */}
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <Award className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-base font-semibold text-[var(--text-primary)]">
                No matching questions found
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Try clearing your search query or selecting a different curation/topic.
              </p>
            </div>
          ) : viewGroupMode === 'topic' ? (
            /* Mode 1: Grouped Data Structure Wise */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1 font-mono">
                <span>{topicGrouped.length} Data Structure Sections ({filteredQuestions.length} Problems)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => expandAllGroups(topicGrouped.map(g => g.key))}
                    className="hover:text-[var(--text-primary)] transition"
                  >
                    Expand All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => collapseAllGroups(topicGrouped.map(g => g.key))}
                    className="hover:text-[var(--text-primary)] transition"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {topicGrouped.map((group) => {
                const expanded = isGroupExpanded(group.key);
                const pct = Math.round((group.solvedCount / group.questions.length) * 100);

                return (
                  <div
                    key={group.key}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shadow-xs transition"
                  >
                    {/* Accordion Section Header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="w-full p-4 flex items-center justify-between bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] transition border-b border-[var(--border-subtle)]"
                    >
                      <div className="flex items-center gap-3">
                        <FolderTree className="w-4 h-4 text-[var(--text-secondary)]" />
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">
                          {group.name}
                        </h2>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          {group.questions.length} problems
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
                          <span className={group.solvedCount === group.questions.length ? 'text-emerald-500 font-bold' : 'text-[var(--text-secondary)]'}>
                            {group.solvedCount} / {group.questions.length} solved ({pct}%)
                          </span>
                          <div className="w-16 bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                            <div
                              className="bg-[var(--text-primary)] h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                    </button>

                    {/* Problem Rows Inside Accordion */}
                    {expanded && (
                      <div className="divide-y divide-[var(--border-subtle)]">
                        {group.questions.map((q) => renderProblemRow(q))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : viewGroupMode === 'pattern' ? (
            /* Mode 2: Grouped Pattern Wise */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1 font-mono">
                <span>{patternGrouped.length} Algorithmic Pattern Sections ({filteredQuestions.length} Problems)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => expandAllGroups(patternGrouped.map(g => g.key))}
                    className="hover:text-[var(--text-primary)] transition"
                  >
                    Expand All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => collapseAllGroups(patternGrouped.map(g => g.key))}
                    className="hover:text-[var(--text-primary)] transition"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {patternGrouped.map((group) => {
                const expanded = isGroupExpanded(group.key);
                const pct = Math.round((group.solvedCount / group.questions.length) * 100);

                return (
                  <div
                    key={group.key}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shadow-xs transition"
                  >
                    {/* Section Header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="w-full p-4 flex items-center justify-between bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] transition border-b border-[var(--border-subtle)]"
                    >
                      <div className="flex items-center gap-3">
                        <GitBranch className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">
                          {group.name}
                        </h2>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          {group.questions.length} problems
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
                          <span className={group.solvedCount === group.questions.length ? 'text-emerald-500 font-bold' : 'text-[var(--text-secondary)]'}>
                            {group.solvedCount} / {group.questions.length} solved ({pct}%)
                          </span>
                          <div className="w-16 bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                            <div
                              className="bg-[var(--text-primary)] h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                    </button>

                    {/* Problem Rows Inside Accordion */}
                    {expanded && (
                      <div className="divide-y divide-[var(--border-subtle)]">
                        {group.questions.map((q) => renderProblemRow(q))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Mode 3: Unified Flat List */
            <div className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-card)] divide-y divide-[var(--border-subtle)] shadow-xs">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                <div className="flex items-center gap-4">
                  <span>Status</span>
                  <span>Problem Title & Pattern</span>
                </div>
                <div className="hidden sm:flex items-center gap-8">
                  <span>Platform</span>
                  <span>Difficulty</span>
                  <span>Actions</span>
                </div>
              </div>
              {filteredQuestions.map((q) => renderProblemRow(q))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Deep Curation Analytics */}
      {activeSubTab === 'analytics' && (
        <CurationsAnalytics
          progress={progress}
          onSelectTrackForPractice={handleSwitchToPracticeFromAnalytics}
        />
      )}

      {/* Sub-Tab 3: Algorithmic Pattern Radar */}
      {activeSubTab === 'radar' && (
        <PatternRadar 
          onFilterByPattern={handleFilterByPatternFromRadar}
          onOpenArchetype={handleOpenArchetypeFromRadar}
        />
      )}

      {/* Sub-Tab 4: 60s Blitz Gauntlet */}
      {activeSubTab === 'blitz' && (
        <BlitzGauntlet 
          onOpenArchetype={handleOpenArchetypeFromRadar}
        />
      )}

      {/* Sub-Tab 5: Code Sandbox */}
      {activeSubTab === 'sandbox' && (
        <CodeSandbox />
      )}

      {/* Full-Featured Multi-Tier Solution Modal */}
      {selectedQuestion && (
        <SolutionModal
          isOpen={isSolutionModalOpen}
          onClose={() => setIsSolutionModalOpen(false)}
          question={selectedQuestion}
          isDone={getProblemStatus(progress, selectedQuestion.id) === 'solved'}
          onToggleDone={onToggleDone}
        />
      )}
    </div>
  );
};
