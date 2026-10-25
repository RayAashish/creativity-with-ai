import React, { useState, useMemo } from 'react';
import { 
  CuratedQuestion, 
  CURATED_VAULT_QUESTIONS 
} from '../../data/curatedVault';
import { QUESTIONS_450 } from '../../data/questions450';
import { PatternRadar } from './PatternRadar';
import { BlitzGauntlet } from './BlitzGauntlet';
import { CodeSandbox } from './CodeSandbox';
import { SolutionModal } from '../sheet/SolutionModal';
import { Question, Topic, Difficulty, UserProgress, ProblemStatus } from '../../types/dsa';
import { getProblemStatus } from '../../utils/storage';
import { 
  Zap, 
  CheckSquare, 
  Layers, 
  Flame, 
  Terminal, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  BookOpen,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface MasterArenaProps {
  progress: UserProgress;
  onToggleDone: (questionId: string) => void;
  onSetProblemStatus: (questionId: string, status: ProblemStatus) => void;
}

export type ArenaSubTab = 'vault' | 'radar' | 'blitz' | 'sandbox';
export type CuratedSheetFilter = 'all' | 'blind75' | 'neetcode150' | 'striver_sde' | 'faang_top';

export const MasterArena: React.FC<MasterArenaProps> = ({
  progress,
  onToggleDone,
  onSetProblemStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ArenaSubTab>('vault');
  const [sheetFilter, setSheetFilter] = useState<CuratedSheetFilter>('all');
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatternFilter, setSelectedPatternFilter] = useState<string | null>(null);

  // Solution Modal State
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState<boolean>(false);

  // Filter logic
  const filteredQuestions = useMemo(() => {
    return CURATED_VAULT_QUESTIONS.filter(q => {
      // Curated sheet filter
      if (sheetFilter !== 'all' && !q.curations.includes(sheetFilter)) {
        return false;
      }
      // Topic filter
      if (topicFilter !== 'all' && q.topic !== topicFilter) {
        return false;
      }
      // Difficulty filter
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) {
        return false;
      }
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
  }, [sheetFilter, topicFilter, difficultyFilter, selectedPatternFilter, searchQuery]);

  // Statistics
  const totalCount = CURATED_VAULT_QUESTIONS.length;
  const blind75Count = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('blind75')).length;
  const neetcodeCount = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('neetcode150')).length;
  const striverCount = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('striver_sde')).length;
  const faangCount = CURATED_VAULT_QUESTIONS.filter(q => q.curations.includes('faang_top')).length;

  const solvedCount = useMemo(() => {
    return CURATED_VAULT_QUESTIONS.filter(q => getProblemStatus(progress, q.id) === 'solved').length;
  }, [progress]);

  const handleOpenSolution = (q: CuratedQuestion) => {
    setSelectedQuestion(q);
    setIsSolutionModalOpen(true);
  };

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Editorial Header */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[var(--text-primary)] text-[var(--text-inverse)]">
                Crazy Arena
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                The Master DSA Nexus
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Curated Sheets, Patterns & Blitz Gauntlet
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Don't just grind 450 in isolation. Access the legendary Blind 75, NeetCode 150, Striver SDE Sheet, and FAANG Hot 50 with multi-language solutions, algorithmic blueprints, and live execution.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] self-start md:self-auto font-mono">
            <div>
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Vault Mastered</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {solvedCount} / {totalCount}
              </div>
            </div>
            <div className="w-12 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <div 
                className="h-full bg-[var(--text-primary)] transition-all duration-500" 
                style={{ width: `${Math.round((solvedCount / totalCount) * 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)] overflow-x-auto scrollbar-none">
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
            <span>Master Vault Catalog</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--badge-bg)] text-[var(--text-secondary)]">
              {filteredQuestions.length}
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
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pattern Radar</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-bold">
              14 Blueprints
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
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>60s Blitz Gauntlet</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 font-bold">
              Reflex
            </span>
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
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Code Sandbox</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold">
              Run
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Master Vault Question Catalog */}
      {activeSubTab === 'vault' && (
        <div className="space-y-4">
          {/* Curated Track Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mr-1">
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

          {/* Search & Secondary Filter Controls */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, number, pattern, or company (e.g. Google, #1, Two Pointers)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-active)]"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Difficulty */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
                className="px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] focus:outline-none"
              >
                <option value="all">Difficulty: All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Topic */}
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value as Topic | 'all')}
                className="px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] focus:outline-none"
              >
                <option value="all">Topic: All</option>
                <option value="arrays">Arrays</option>
                <option value="strings">Strings</option>
                <option value="linked-list">Linked List</option>
                <option value="stacks-queues">Stacks & Queues</option>
                <option value="trees">Trees</option>
                <option value="bst">BST</option>
                <option value="graphs">Graphs</option>
                <option value="dp">Dynamic Programming</option>
                <option value="heaps-hashing">Heaps & Hashing</option>
                <option value="backtracking">Backtracking</option>
                <option value="bit-manipulation">Bit Manipulation</option>
              </select>

              {/* Active Pattern Filter Reset Pill */}
              {selectedPatternFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedPatternFilter(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-1.5 hover:bg-red-500/20 transition"
                >
                  <span>Pattern: {selectedPatternFilter}</span>
                  <span className="font-bold">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Question List Table / Cards */}
          <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-card)] divide-y divide-[var(--border-subtle)]">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => {
                const status = getProblemStatus(progress, q.id);
                const isSolved = status === 'solved';

                return (
                  <div
                    key={q.id}
                    className="p-4 hover:bg-[var(--bg-subtle)] transition flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Solved Checkbox */}
                      <button
                        type="button"
                        onClick={() => onToggleDone(q.id)}
                        className="mt-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                      >
                        {isSolved ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Title & Metadata */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {q.leetcodeNumber && (
                            <span className="text-[11px] font-mono text-[var(--text-muted)] font-bold">
                              #{q.leetcodeNumber}
                            </span>
                          )}
                          <span className={`text-sm font-bold tracking-tight text-[var(--text-primary)] ${
                            isSolved ? 'line-through opacity-70' : ''
                          }`}>
                            {q.title}
                          </span>

                          {/* Difficulty Pill */}
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : q.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {q.difficulty}
                          </span>

                          {/* Pattern Tag */}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                            {q.pattern}
                          </span>
                        </div>

                        {/* Curation Badges & Companies */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {q.curations.map(c => (
                            <span key={c} className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--badge-bg)] text-[var(--text-secondary)]">
                              {c === 'blind75' ? 'Blind 75' : c === 'neetcode150' ? 'NeetCode 150' : c === 'striver_sde' ? 'Striver SDE' : 'FAANG Top'}
                            </span>
                          ))}
                          <span className="text-[10px] font-mono text-[var(--text-muted)] ml-1">
                            {q.companies.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View Solution Modal & Direct LeetCode Jump */}
                    <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenSolution(q)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-active)] text-[var(--text-primary)] transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Solution</span>
                      </button>

                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)]">
                No problems match the current filter criteria. Try resetting search or topic dropdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Algorithmic Pattern Radar */}
      {activeSubTab === 'radar' && (
        <PatternRadar 
          onFilterByPattern={handleFilterByPatternFromRadar}
          onOpenArchetype={handleOpenArchetypeFromRadar}
        />
      )}

      {/* Sub-Tab 3: 60s Blitz Gauntlet */}
      {activeSubTab === 'blitz' && (
        <BlitzGauntlet 
          onOpenArchetype={handleOpenArchetypeFromRadar}
        />
      )}

      {/* Sub-Tab 4: Code Sandbox */}
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
