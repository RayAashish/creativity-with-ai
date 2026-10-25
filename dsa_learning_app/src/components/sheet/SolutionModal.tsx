import React, { useState } from 'react';
import { 
  X, 
  Lightbulb, 
  Code2, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Database, 
  Sparkles, 
  AlertCircle, 
  ChevronRight,
  Terminal,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Question, ProblemSolution, SolutionTier, SolutionApproach } from '../../types/dsa';
import { getSolutionForQuestion } from '../../data/solutions';
import { IdeCodeBlock } from '../code/IdeCodeBlock';

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  isDone: boolean;
  onToggleDone: (questionId: string) => void;
}

export const SolutionModal: React.FC<SolutionModalProps> = ({
  isOpen,
  onClose,
  question,
  isDone,
  onToggleDone,
}) => {
  const [activeTier, setActiveTier] = useState<SolutionTier>('optimal');
  const [activeTab, setActiveTab] = useState<'all' | 'intuition' | 'code' | 'complexity'>('all');

  if (!isOpen || !question) return null;

  const solution: ProblemSolution = getSolutionForQuestion(question);

  // Fallback approaches in case any tier is missing
  const approaches = solution.approaches || {
    brute: {
      name: 'Brute Force (Exhaustive)',
      tier: 'brute' as SolutionTier,
      badge: '🥉 Brute Force',
      intuition: solution.intuition,
      pseudocode: solution.pseudocode,
      timeComplexity: 'O(N²)',
      spaceComplexity: 'O(1)',
      complexityExplanation: 'Evaluates candidate combinations directly with nested loops or recursion.',
      code: solution.code
    },
    better: {
      name: 'Better (Intermediate)',
      tier: 'better' as SolutionTier,
      badge: '🥈 Better',
      intuition: solution.intuition,
      pseudocode: solution.pseudocode,
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      complexityExplanation: 'Improves execution time by sorting or using auxiliary Hash Map storage.',
      code: solution.code
    },
    optimal: {
      name: solution.pattern ? `Optimal (${solution.pattern})` : 'Optimal (Target)',
      tier: 'optimal' as SolutionTier,
      badge: '🥇 Optimal',
      intuition: solution.intuition,
      pseudocode: solution.pseudocode,
      timeComplexity: solution.timeComplexity,
      spaceComplexity: solution.spaceComplexity,
      complexityExplanation: solution.complexityExplanation,
      code: solution.code
    }
  };

  const activeApproach: SolutionApproach = approaches[activeTier] || approaches.optimal;

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#131417] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 relative z-10 flex items-start justify-between gap-4 bg-white dark:bg-[#131417]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${getDifficultyBadge(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {question.platform}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                {question.topic}
              </span>
              {isDone && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Solved
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <span>{question.title}</span>
            </h2>

            {/* Pattern Badge */}
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span>Core Pattern:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{solution.pattern}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition flex-shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Navigation Tabs */}
        <div className="px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center justify-between gap-3 overflow-x-auto relative z-10 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
              }`}
            >
              Full Reference Guide
            </button>
            <button
              onClick={() => setActiveTab('intuition')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'intuition'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Intuition & Pseudocode
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              IDE Code (4 Languages)
            </button>
            <button
              onClick={() => setActiveTab('complexity')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'complexity'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Complexity & Tips
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative z-10 custom-scrollbar">

          {/* Approach Tier Switcher Bar: 🥉 Brute vs 🥈 Better vs 🥇 Optimal */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 sm:p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span>Interview Progression Tiers:</span>
              </div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono font-medium">
                Active: {activeApproach.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* Brute Force */}
              <button
                onClick={() => setActiveTier('brute')}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                  activeTier === 'brute'
                    ? 'bg-white dark:bg-zinc-800 border-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-base">🥉</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold">
                    {approaches.brute?.timeComplexity || 'O(N²)'}
                  </span>
                </div>
                <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {approaches.brute?.name || 'Brute Force'}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-between font-mono">
                  <span>Space: {approaches.brute?.spaceComplexity || 'O(1)'}</span>
                  <span className="text-[9px] uppercase font-sans">Baseline</span>
                </div>
              </button>

              {/* Better */}
              <button
                onClick={() => setActiveTier('better')}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                  activeTier === 'better'
                    ? 'bg-white dark:bg-zinc-800 border-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-base">🥈</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold">
                    {approaches.better?.timeComplexity || 'O(N log N)'}
                  </span>
                </div>
                <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {approaches.better?.name || 'Better / Auxiliary'}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-between font-mono">
                  <span>Space: {approaches.better?.spaceComplexity || 'O(N)'}</span>
                  <span className="text-[9px] uppercase font-sans">Trade-off</span>
                </div>
              </button>

              {/* Optimal */}
              <button
                onClick={() => setActiveTier('optimal')}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                  activeTier === 'optimal'
                    ? 'bg-white dark:bg-zinc-800 border-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-base">🥇</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                    {approaches.optimal?.timeComplexity || 'O(N)'}
                  </span>
                </div>
                <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {approaches.optimal?.name || 'Optimal Solution'}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-between font-mono">
                  <span>Space: {approaches.optimal?.spaceComplexity || 'O(1)'}</span>
                  <span className="text-[9px] uppercase font-sans font-bold text-emerald-600 dark:text-emerald-400">Target</span>
                </div>
              </button>
            </div>

            {/* Micro Progression Breadcrumb */}
            <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <span className={activeTier === 'brute' ? 'text-zinc-900 dark:text-zinc-100 font-bold' : ''}>
                🥉 {approaches.brute?.timeComplexity || 'O(N²)'}
              </span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
              <span className={activeTier === 'better' ? 'text-zinc-900 dark:text-zinc-100 font-bold' : ''}>
                🥈 {approaches.better?.timeComplexity || 'O(N log N)'}
              </span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
              <span className={activeTier === 'optimal' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                🥇 {approaches.optimal?.timeComplexity || 'O(N)'} (Optimal)
              </span>
            </div>
          </div>
          
          {/* Section 1: Intuition & Mental Model */}
          {(activeTab === 'all' || activeTab === 'intuition') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>1. {activeApproach.name} — Intuition & Flow</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-zinc-700">
                  {activeApproach.timeComplexity}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {activeApproach.intuition.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              {/* Whiteboard Pseudocode */}
              {activeApproach.pseudocode && activeApproach.pseudocode.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Whiteboard Pseudocode ({activeApproach.badge})</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Language-Agnostic</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-200 leading-relaxed overflow-x-auto">
                    {activeApproach.pseudocode.map((line, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="text-zinc-600 select-none text-right w-6 flex-shrink-0">{idx + 1}</span>
                        <span className={line.startsWith('FUNCTION') || line.startsWith('CLASS') ? 'text-zinc-100 font-bold' : line.includes('//') ? 'text-zinc-500 italic' : 'text-zinc-300'}>
                          {line}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Multi-Language Code Implementations with IDE Highlighting */}
          {(activeTab === 'all' || activeTab === 'code') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <Code2 className="w-4 h-4 text-zinc-500" />
                  <span>2. Production Solutions — {activeApproach.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>IDE Syntax Highlighting</span>
                </div>
              </div>

              {/* IDE Code Block with Syntax Highlighting, Line Numbers, Tabs */}
              <IdeCodeBlock
                title={`${question.title.replace(/\s+/g, '_')}_${activeTier}`}
                codeMap={activeApproach.code}
                defaultLanguage="java"
                showLanguageTabs={true}
              />
            </div>
          )}

          {/* Section 3: Complexity Analysis & Edge Cases */}
          {(activeTab === 'all' || activeTab === 'complexity') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>3. Complexity Analysis & Technical Trade-offs ({activeApproach.badge})</span>
              </div>

              {/* Complexity Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold uppercase tracking-wider">Time Complexity</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mb-1">
                    {activeApproach.timeComplexity}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {activeApproach.complexityExplanation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <Database className="w-4 h-4 text-zinc-500" />
                    <span className="font-semibold uppercase tracking-wider">Space Complexity</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200 mb-1">
                    {activeApproach.spaceComplexity}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Auxiliary memory overhead utilized during runtime execution for this tier.
                  </p>
                </div>
              </div>

              {/* Edge Cases Card */}
              {((activeApproach.edgeCases && activeApproach.edgeCases.length > 0) || (solution.edgeCases && solution.edgeCases.length > 0)) && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Crucial Edge Cases to Mention in Interviews</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {(activeApproach.edgeCases || solution.edgeCases).map((edge, eIdx) => (
                      <li key={eIdx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>{edge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FAANG Interview Pro-Tips */}
              {solution.interviewProTips && solution.interviewProTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                    <span>Interview Pro-Tips</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {solution.interviewProTips.map((tip, tIdx) => (
                      <li key={tIdx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#131417] relative z-10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onToggleDone(question.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition ${
              isDone
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'btn-outline'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <span>{isDone ? 'Marked as Done' : 'Mark as Already Done'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn-outline px-4 py-2 rounded-xl text-xs sm:text-sm font-medium"
            >
              Close
            </button>
            <a
              href={question.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <span>Solve on {question.platform}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
