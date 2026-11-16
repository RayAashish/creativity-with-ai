import React, { useState } from 'react';
import {
  Layers,
  Code2,
  ExternalLink,
  BookOpen,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { patternsContent, PatternInfo } from '../data/patternsContent';
import { codeforcesProblems } from '../data/problemsData';
import { CodeBlock } from '../components/CodeBlock';
import { Language, PatternId, CodeforcesProblem } from '../types';

interface PatternsViewProps {
  initialPattern?: PatternId;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onViewProblemDetails: (problem: CodeforcesProblem) => void;
}

export const PatternsView: React.FC<PatternsViewProps> = ({
  initialPattern = 'arrays_and_prefix_sums',
  selectedLanguage,
  onLanguageChange,
  onViewProblemDetails
}) => {
  const [activePatternId, setActivePatternId] = useState<PatternId>(initialPattern);

  const activePattern = patternsContent.find(p => p.id === activePatternId) || patternsContent[0];

  // Filter problems for this pattern
  const patternProblems = codeforcesProblems.filter(p => p.pattern === activePattern.id);

  const p1Problems = patternProblems.filter(p => p.tier === 'P1 Easy');
  const p2Problems = patternProblems.filter(p => p.tier === 'P2 Medium');
  const p3Problems = patternProblems.filter(p => p.tier === 'P3 Hard');
  const p4Problems = patternProblems.filter(p => p.tier === 'P4 Complex');

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <Layers size={14} />
          <span>Pattern Recognition Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          The 12 Core Algorithmic Patterns
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Infosys problems are story disguises wrapped around standard algorithms. Understand how each pattern hides in narrative text, study tested multi-language templates, and practice on verified Codeforces problems.
        </p>
      </div>

      {/* Pattern Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800">
        {patternsContent.map((p) => {
          const isActive = p.id === activePattern.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePatternId(p.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-semibold shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Active Pattern Card Header */}
      <div className="p-5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {activePattern.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-accent/15 dark:bg-accent/25 text-accent dark:text-accent-dark font-bold">
                {activePattern.frequency}
              </span>
            </div>
            <div className="text-xs text-neutral-500 font-mono mt-0.5">
              Focus: {activePattern.difficultyFocus} · {patternProblems.length} verified practice problems
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
          {activePattern.summary}
        </p>
      </div>

      {/* Section 1: Story Disguises & Cue Words */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white">
          <Lightbulb size={14} className="text-amber-500" />
          <span>How It Hides in a Story (Narrative Disguises & Cue Words)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activePattern.storyDisguises.map((disguise, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2"
            >
              <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                <span>{disguise.title}</span>
                <span className="font-mono text-[10px] text-neutral-400">Disguise #{idx + 1}</span>
              </div>
              
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                "{disguise.scenario}"
              </p>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-1">
                <span className="text-[10px] font-mono text-neutral-400 mr-1 self-center">Cue Words:</span>
                {disguise.cueWords.map((cue, cIdx) => (
                  <span
                    key={cIdx}
                    className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    {cue}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Multi-Language Template Code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white">
            <Code2 size={14} className="text-accent dark:text-accent-dark" />
            <span>Tested Production Template (Fast I/O)</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Switch tabs to inspect Java, C++, Python
          </span>
        </div>

        <CodeBlock
          code={activePattern.templates}
          preferredLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          verified={true}
          testsPassed={15}
        />
      </div>

      {/* Section 3: Partial Score Playbook */}
      <div className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-paper-100/60 dark:bg-neutral-800/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white">
          <Sparkles size={14} className="text-accent dark:text-accent-dark" />
          <span>Partial-Score Playbook for {activePattern.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-neutral-900 dark:text-white">1. Bank Brute Force First (30%–40% Marks):</span>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {activePattern.partialScorePlaybook.bruteForceApproach}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-neutral-900 dark:text-white">2. Optimal Scaling Insight (100% Marks):</span>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {activePattern.partialScorePlaybook.optimizingInsight}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60 text-xs">
          <span className="font-semibold text-neutral-900 dark:text-white block mb-1">Hidden Tests Traps for this Pattern:</span>
          <div className="flex flex-wrap gap-1.5">
            {activePattern.partialScorePlaybook.breakingHiddenTests.map((trap, tIdx) => (
              <span key={tIdx} className="font-mono text-[11px] px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-rose-700 dark:text-rose-300">
                ⚠️ {trap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Practice Problems Grouped by Difficulty */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white">
            <Layers size={14} />
            <span>Practice Problems Grouped by Exam Position & Difficulty</span>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {patternProblems.length} Problems Total
          </span>
        </div>

        {/* Tiers List */}
        {[
          { title: 'P1 Easy (Rating 800–1100)', problems: p1Problems, badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
          { title: 'P2 Medium (Rating 1200–1400)', problems: p2Problems, badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
          { title: 'P3 Hard (Rating 1500–1700)', problems: p3Problems, badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
          { title: 'P4 Complex (Rating 1800–2000)', problems: p4Problems, badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' }
        ].map((grp, gIdx) => {
          if (grp.problems.length === 0) return null;
          return (
            <div key={gIdx} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${grp.badge}`}>
                  {grp.title}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">({grp.problems.length} problems)</span>
              </div>

              <div className="space-y-2">
                {grp.problems.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-3 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {prob.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          CF Rating: {prob.rating}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                        {prob.paraphrase}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {prob.tags.map((t, tIdx) => (
                          <span key={tIdx} className="text-[9px] font-mono px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 transition-colors"
                        title="Solve on Codeforces"
                      >
                        <ExternalLink size={13} />
                      </a>
                      <button
                        onClick={() => onViewProblemDetails(prob)}
                        className="px-2.5 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                      >
                        View Solution
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
