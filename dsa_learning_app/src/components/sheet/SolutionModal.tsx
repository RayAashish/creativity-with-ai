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
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Hard':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 relative z-10 flex items-start justify-between gap-4 bg-slate-900/95">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getDifficultyBadge(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {question.platform}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {question.topic.toUpperCase()}
              </span>
              {isDone && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Solved
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{question.title}</span>
            </h2>

            {/* Pattern Badge */}
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Core Pattern:</span>
              <span className="text-white font-bold">{solution.pattern}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex-shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Navigation Tabs */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3 overflow-x-auto relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Full Reference Guide
            </button>
            <button
              onClick={() => setActiveTab('intuition')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'intuition'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Intuition & Pseudocode
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              IDE Code (4 Languages)
            </button>
            <button
              onClick={() => setActiveTab('complexity')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'complexity'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Complexity & Tips
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>ID: {question.id}</span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative z-10 custom-scrollbar">

          {/* Approach Tier Switcher Bar: 🥉 Brute vs 🥈 Better vs 🥇 Optimal */}
          <div className="bg-slate-950/80 p-3 sm:p-3.5 rounded-2xl border border-slate-800/90 shadow-xl">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interview Progression Tiers:</span>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono font-semibold">
                Active: {activeApproach.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* Brute Force */}
              <button
                onClick={() => setActiveTier('brute')}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                  activeTier === 'brute'
                    ? 'bg-gradient-to-br from-amber-500/20 via-orange-950/30 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-base">🥉</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    {approaches.brute?.timeComplexity || 'O(N²)'}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                  {approaches.brute?.name || 'Brute Force'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                  <span>Space: {approaches.brute?.spaceComplexity || 'O(1)'}</span>
                  <span className="text-[9px] text-amber-400 uppercase font-sans">Baseline</span>
                </div>
              </button>

              {/* Better */}
              <button
                onClick={() => setActiveTier('better')}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                  activeTier === 'better'
                    ? 'bg-gradient-to-br from-cyan-500/20 via-blue-950/30 to-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-base">🥈</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                    {approaches.better?.timeComplexity || 'O(N log N)'}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                  {approaches.better?.name || 'Better / Auxiliary'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                  <span>Space: {approaches.better?.spaceComplexity || 'O(N)'}</span>
                  <span className="text-[9px] text-cyan-400 uppercase font-sans">Trade-off</span>
                </div>
              </button>

              {/* Optimal */}
              <button
                onClick={() => setActiveTier('optimal')}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                  activeTier === 'optimal'
                    ? 'bg-gradient-to-br from-emerald-500/20 via-teal-950/30 to-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-base">🥇</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    {approaches.optimal?.timeComplexity || 'O(N)'}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                  {approaches.optimal?.name || 'Optimal Solution'}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center justify-between font-mono">
                  <span>Space: {approaches.optimal?.spaceComplexity || 'O(1)'}</span>
                  <span className="text-[9px] text-emerald-400 uppercase font-sans font-bold">Target</span>
                </div>
              </button>
            </div>

            {/* Micro Progression Breadcrumb */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className={activeTier === 'brute' ? 'text-amber-400 font-bold' : ''}>
                🥉 {approaches.brute?.timeComplexity || 'O(N²)'}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className={activeTier === 'better' ? 'text-cyan-400 font-bold' : ''}>
                🥈 {approaches.better?.timeComplexity || 'O(N log N)'}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className={activeTier === 'optimal' ? 'text-emerald-400 font-bold' : ''}>
                🥇 {approaches.optimal?.timeComplexity || 'O(N)'} (Optimal)
              </span>
            </div>
          </div>
          
          {/* Section 1: Intuition & Mental Model */}
          {(activeTab === 'all' || activeTab === 'intuition') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>1. {activeApproach.name} — Intuition & Flow</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 font-mono border border-slate-700">
                  {activeApproach.timeComplexity}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {activeApproach.intuition.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              {/* Whiteboard Pseudocode */}
              {activeApproach.pseudocode && activeApproach.pseudocode.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Whiteboard Pseudocode ({activeApproach.badge})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Language-Agnostic</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 font-mono text-xs text-indigo-200 leading-relaxed shadow-inner overflow-x-auto">
                    {activeApproach.pseudocode.map((line, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="text-slate-600 select-none text-right w-6 flex-shrink-0">{idx + 1}</span>
                        <span className={line.startsWith('FUNCTION') || line.startsWith('CLASS') ? 'text-cyan-300 font-bold' : line.includes('//') ? 'text-slate-500 italic' : 'text-slate-200'}>
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
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>2. Production Solutions — {activeApproach.name}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>One Dark IDE Syntax Highlighting</span>
                </div>
              </div>

              {/* IDE Code Block with Prism Syntax Highlighting, Line Numbers, Tabs */}
              <IdeCodeBlock
                title={`${question.id}_${activeTier}_solution`}
                codeMap={activeApproach.code}
                defaultLanguage="java"
                showLanguageTabs={true}
              />
            </div>
          )}

          {/* Section 3: Complexity Analysis & Edge Cases */}
          {(activeTab === 'all' || activeTab === 'complexity') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>3. Complexity Analysis & Technical Trade-offs ({activeApproach.badge})</span>
              </div>

              {/* Complexity Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold uppercase tracking-wider">Time Complexity</span>
                  </div>
                  <div className="text-lg font-black font-mono text-emerald-400 mb-1">
                    {activeApproach.timeComplexity}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeApproach.complexityExplanation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold uppercase tracking-wider">Space Complexity</span>
                  </div>
                  <div className="text-lg font-black font-mono text-cyan-400 mb-1">
                    {activeApproach.spaceComplexity}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Auxiliary memory overhead utilized during runtime execution for this tier.
                  </p>
                </div>
              </div>

              {/* Edge Cases Card */}
              {((activeApproach.edgeCases && activeApproach.edgeCases.length > 0) || (solution.edgeCases && solution.edgeCases.length > 0)) && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Crucial Edge Cases to Mention in Interviews</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {(activeApproach.edgeCases || solution.edgeCases).map((edge, eIdx) => (
                      <li key={eIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 mt-1">•</span>
                        <span>{edge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FAANG Interview Pro-Tips */}
              {solution.interviewProTips && solution.interviewProTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>FAANG / Top Tier Interview Pro-Tips</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {solution.interviewProTips.map((tip, tIdx) => (
                      <li key={tIdx} className="text-xs text-indigo-100 flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
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
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/95 relative z-10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onToggleDone(question.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
              isDone
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{isDone ? 'Marked as Done ✅' : 'Mark as Already Done'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              Close
            </button>
            <a
              href={question.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
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
