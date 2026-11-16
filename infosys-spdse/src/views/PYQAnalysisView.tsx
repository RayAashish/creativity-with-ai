import React, { useState } from 'react';
import {
  History,
  Filter,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { pyqDatabase } from '../data/pyqData';
import { patternFrequencyData } from '../data/frequencyData';
import { CodeBlock } from '../components/CodeBlock';
import { PatternFrequencyBarChart, PositionBreakdownChart, TopicHeatmap } from '../components/Charts';
import { PYQQuestion, Language } from '../types';

interface PYQAnalysisViewProps {
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  focusedPYQId?: string;
}

export const PYQAnalysisView: React.FC<PYQAnalysisViewProps> = ({
  selectedLanguage,
  onLanguageChange,
  focusedPYQId
}) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedPattern, setSelectedPattern] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(focusedPYQId || null);
  const [showCharts, setShowCharts] = useState(true);

  // Sync focused id if passed from search modal
  React.useEffect(() => {
    if (focusedPYQId) {
      setExpandedId(focusedPYQId);
    }
  }, [focusedPYQId]);

  // Filtering
  const filteredPYQs = pyqDatabase.filter((q) => {
    if (selectedYear !== 'All' && !q.driveYear.includes(selectedYear)) return false;
    if (selectedRole !== 'All' && !q.role.includes(selectedRole)) return false;
    if (selectedPosition !== 'All' && q.position !== selectedPosition) return false;
    if (selectedPattern !== 'All' && q.pattern !== selectedPattern) return false;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <History size={14} />
          <span>Empirical Archives</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Previous-Year Questions (PYQ) Analysis (n = 42)
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Audited real questions from Infosys Specialist Programmer (SP), Digital Specialist Engineer (DSE), and HackWithInfy drives between 2020 and 2026. Every entry is paraphrased to respect copyright and includes confidence ratings, common wrong attempts, partial-score subtask tactics, and compiled 3-language solutions.
        </p>
      </div>

      {/* Analytics Charts Drawer Toggle */}
      <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-accent dark:text-accent-dark" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Empirical Pattern Frequency & Positional Heatmaps (Sample: n = 42)
            </h3>
          </div>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
          >
            <span>{showCharts ? 'Hide Visualizations' : 'Show Visualizations'}</span>
            {showCharts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {showCharts && (
          <div className="space-y-6 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PatternFrequencyBarChart data={patternFrequencyData} />
              <div className="space-y-6">
                <PositionBreakdownChart data={patternFrequencyData} />
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs text-neutral-500 font-mono mb-2">
                Cross-Tabulation: Topic Occurrence by Problem Position (P1 to P4)
              </div>
              <TopicHeatmap data={patternFrequencyData} />
            </div>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-paper-100/60 dark:bg-neutral-900/60 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-neutral-500 font-mono text-[11px]">
          <Filter size={13} />
          <span>Filter:</span>
        </div>

        {/* Position Filter */}
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-sm px-2 py-1 text-xs font-mono focus:outline-none"
        >
          <option value="All">All Positions (P1–P4)</option>
          <option value="P1">P1 (Easy / 20m)</option>
          <option value="P2">P2 (Medium / 30m)</option>
          <option value="P3">P3 (Hard / 50m)</option>
          <option value="P4">P4 (Complex / 30m)</option>
        </select>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-sm px-2 py-1 text-xs font-mono focus:outline-none"
        >
          <option value="All">All Roles</option>
          <option value="DSE">DSE</option>
          <option value="SP">SP (Specialist Programmer)</option>
        </select>

        {/* Pattern Filter */}
        <select
          value={selectedPattern}
          onChange={(e) => setSelectedPattern(e.target.value)}
          className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-sm px-2 py-1 text-xs font-mono focus:outline-none"
        >
          <option value="All">All 12 Patterns</option>
          <option value="dp">Dynamic Programming</option>
          <option value="sorting_and_greedy">Sorting & Greedy</option>
          <option value="arrays_and_prefix_sums">Arrays & Prefix Sums</option>
          <option value="binary_search">Binary Search on Answer</option>
          <option value="graphs_and_bfs_dfs">Graphs & BFS/DFS</option>
          <option value="two_pointers_and_sliding_window">Two Pointers</option>
          <option value="number_theory_and_math">Number Theory</option>
          <option value="stack_and_monotonic_stack">Monotonic Stack</option>
          <option value="bit_tricks">Bit Manipulation</option>
        </select>

        <span className="text-neutral-400 font-mono ml-auto text-[11px]">
          Showing {filteredPYQs.length} of {pyqDatabase.length} questions
        </span>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredPYQs.map((q) => {
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id}
              className={`rounded-sm border transition-all ${
                isExpanded
                  ? 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-3.5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-accent dark:text-accent-dark">
                      {q.id}
                    </span>

                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {q.title}
                    </h3>

                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-sm ${
                      q.position === 'P1'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : q.position === 'P2'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}>
                      {q.position} · {q.tier}
                    </span>

                    <span className="text-[10px] text-neutral-500 font-mono">
                      {q.patternName}
                    </span>

                    <span className="text-[10px] font-mono text-neutral-400">
                      {q.driveYear}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
                    {q.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {q.confidence}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-neutral-500" /> : <ChevronDown size={16} className="text-neutral-500" />}
                </div>
              </div>

              {/* Expanded Detail Pane */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-4 text-xs">
                  
                  {/* Meta Specs: Constraints & Source */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded bg-paper-100/60 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 font-mono text-[11px]">
                    <div>
                      <span className="text-neutral-400 block">Constraints:</span>
                      <span className="text-neutral-800 dark:text-neutral-200 font-medium">{q.constraints}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Source Citation:</span>
                      <a
                        href={q.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent dark:text-accent-dark hover:underline truncate block"
                      >
                        {q.sourceUrl} ↗
                      </a>
                    </div>
                  </div>

                  {/* Common Wrong Approaches */}
                  <div className="space-y-1.5">
                    <span className="font-bold font-mono text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <AlertCircle size={13} className="text-rose-500" />
                      <span>Candidate Pitfalls & Common Wrong Approaches</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {q.wrongApproaches.map((wa, wIdx) => (
                        <li key={wIdx}>{wa}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Partial Score Strategy */}
                  <div className="p-3 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 leading-relaxed">
                    <span className="font-bold block font-mono text-[11px] mb-1">
                      💡 Partial Score Subtask Tip:
                    </span>
                    {q.partialScoreTips}
                  </div>

                  {/* Multi-Language Verified Solution */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Code2 size={13} className="text-accent dark:text-accent-dark" />
                        <span>Verified Implementation (Java, C++, Python)</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        {q.solutions.complexity}
                      </span>
                    </div>

                    <CodeBlock
                      code={q.solutions}
                      preferredLanguage={selectedLanguage}
                      onLanguageChange={onLanguageChange}
                      verified={q.solutions.verified}
                      testsPassed={q.solutions.testsPassed}
                    />
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
