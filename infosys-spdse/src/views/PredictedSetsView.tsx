import React, { useState } from 'react';
import {
  Sparkles,
  Timer,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { predictedSets } from '../data/predictedSetsData';
import { setCoverageData } from '../data/coverageData';
import { CodeBlock } from '../components/CodeBlock';
import { PredictedSet, Language, CodeforcesProblem } from '../types';

interface PredictedSetsViewProps {
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onLaunchSetInMock: (set: PredictedSet) => void;
  onViewProblemDetails: (problem: CodeforcesProblem) => void;
  focusedSetId?: string;
}

export const PredictedSetsView: React.FC<PredictedSetsViewProps> = ({
  selectedLanguage,
  onLanguageChange,
  onLaunchSetInMock,
  onViewProblemDetails,
  focusedSetId
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [expandedSetId, setExpandedSetId] = useState<string | null>(focusedSetId || 'set-01');
  const [revealedPatterns, setRevealedPatterns] = useState<Record<string, boolean>>({});

  // Sync focusedSetId if changed from search
  React.useEffect(() => {
    if (focusedSetId) {
      setExpandedSetId(focusedSetId);
    }
  }, [focusedSetId]);

  const toggleRevealPattern = (key: string) => {
    setRevealedPatterns((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredSets = predictedSets.filter((s) => {
    if (roleFilter !== 'All' && s.targetRole !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Title & Advisory */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <Sparkles size={14} />
          <span>Curated Exam Simulations</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          52 Predicted Assessment Sets
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Structured to mirror the exact Infosys coding assessment weights: P1 (Easy, 20m), P2 (Medium, 30m), P3 (Hard, 50m), and P4 (Complex). Formulated from real verified Codeforces problems with original story disguises.
        </p>
      </div>

      {/* Prediction Disclaimer Pill */}
      <div className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-accent dark:text-accent-dark shrink-0" />
          <span>
            <strong>Integrity Notice:</strong> These problem sets are predicted mathematically from empirical frequency distributions and candidate reports, not leaked exam papers.
          </span>
        </span>
        <span className="font-mono text-[11px] text-neutral-400 shrink-0 ml-4 hidden sm:inline">
          Max Problem Reuse: {setCoverageData.maxProblemReuse}x
        </span>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-1.5">
          {['All', 'DSE', 'SP L1', 'SP L2', 'SP L3'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors border ${
                roleFilter === role
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-medium'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {role === 'All' ? 'All 52 Sets' : `${role} (${setCoverageData.roleOccurrences[role] || 0} Sets)`}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-neutral-400">
          Showing {filteredSets.length} sets
        </span>
      </div>

      {/* Sets Accordion List */}
      <div className="space-y-4">
        {filteredSets.map((set) => {
          const isExpanded = expandedSetId === set.id;

          return (
            <div
              key={set.id}
              className={`rounded-sm border transition-all ${
                isExpanded
                  ? 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Set Summary Header */}
              <div
                onClick={() => setExpandedSetId(isExpanded ? null : set.id)}
                className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer select-none"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent dark:text-accent-dark">
                      {set.id.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {set.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                      Target: {set.targetRole}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 font-mono mt-1">
                    {set.problemCount} Problems · {set.totalMarks} Marks · Time Limit: {set.timeLimitMinutes} Mins · Pass: {set.passCriteria}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchSetInMock(set);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                  >
                    <Timer size={13} />
                    <span>Launch in Mock Simulator</span>
                  </button>

                  {isExpanded ? <ChevronUp size={16} className="text-neutral-500" /> : <ChevronDown size={16} className="text-neutral-500" />}
                </div>
              </div>

              {/* Set Problems Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                  <div className="space-y-3">
                    {set.problems.map((probItem, pIdx) => {
                      const revealKey = `${set.id}_${probItem.position}`;
                      const isPatternRevealed = !!revealedPatterns[revealKey];
                      const p = probItem.problem;

                      return (
                        <div
                          key={pIdx}
                          className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-paper-50 dark:bg-neutral-900/60 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                  probItem.position === 'P1'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : probItem.position === 'P2'
                                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                }`}>
                                  {probItem.position} · {probItem.marks} Marks
                                </span>

                                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                  {p.title}
                                </span>

                                <span className="text-[10px] font-mono text-neutral-400">
                                  CF Rating {p.rating}
                                </span>
                              </div>

                              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-3xl">
                                <strong>Story Narrative:</strong> {probItem.storyDisguise}
                              </p>

                              <p className="text-xs text-neutral-500 leading-relaxed">
                                {p.paraphrase}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 transition-colors"
                                title="Solve on Codeforces"
                              >
                                <ExternalLink size={13} />
                              </a>
                              <button
                                onClick={() => onViewProblemDetails(p)}
                                className="px-2.5 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                              >
                                View Solution
                              </button>
                            </div>
                          </div>

                          {/* Reveal Pattern Toggle Area */}
                          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRevealPattern(revealKey)}
                                className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700"
                              >
                                {isPatternRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                                <span>{isPatternRevealed ? 'Hide Pattern' : 'Reveal Pattern Recognition'}</span>
                              </button>

                              {isPatternRevealed && (
                                <span className="font-mono text-xs font-bold text-accent dark:text-accent-dark">
                                  Pattern: {p.patternName}
                                </span>
                              )}
                            </div>

                            {isPatternRevealed && (
                              <span className="text-[11px] text-neutral-500 font-mono">
                                {probItem.hint}
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })}
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
