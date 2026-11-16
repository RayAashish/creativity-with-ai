import React, { useState } from 'react';
import { X, ExternalLink, CheckCircle2, Code2, AlertTriangle, Terminal, Zap, ShieldCheck } from 'lucide-react';
import { CodeforcesProblem, Language } from '../types';
import { codeforcesProblems } from '../data/problemsData';
import { CodeBlock } from './CodeBlock';
import { TestRunner } from './TestRunner';

interface ProblemModalProps {
  problem: CodeforcesProblem | null;
  onClose: () => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isSolved: boolean;
  onToggleSolved: (id: string) => void;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  problem,
  onClose,
  selectedLanguage,
  onLanguageChange,
  isSolved,
  onToggleSolved
}) => {
  if (!problem) return null;

  const [activeModalTab, setActiveModalTab] = useState<'solution' | 'testrunner'>('solution');

  // Look up full verified solutions from problem or problem database
  const activeSolutions = problem.solutions || codeforcesProblems.find(x => x.id === problem.id)?.solutions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-paper-50 dark:bg-paper-900 border border-neutral-300 dark:border-neutral-700 rounded-sm shadow-2xl max-h-[88vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-3 sticky top-0 bg-paper-50 dark:bg-paper-900 z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 dark:bg-accent/25 text-accent dark:text-accent-dark font-bold">
                {problem.tier} · CF {problem.rating}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                {problem.patternName}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck size={11} />
                <span>Verified Solution</span>
              </span>
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {problem.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700"
              title="Open problem on Codeforces"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          
          {/* Story Narrative */}
          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-neutral-400">
              Infosys Story Disguise & Context:
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed bg-paper-100/70 dark:bg-neutral-800/40 p-3 rounded border border-neutral-200 dark:border-neutral-700/60 font-sans">
              {problem.storyDisguise}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-neutral-400">
              Technical Problem Summary:
            </span>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {problem.paraphrase}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-neutral-400">
              Exam Constraints & Time Limit:
            </span>
            <code className="block p-2 font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800/80 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
              {problem.constraints}
            </code>
          </div>

          {/* View Tab Switcher */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setActiveModalTab('solution')}
                className={`pb-1.5 px-3 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
                  activeModalTab === 'solution'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Code2 size={13} />
                <span>Reference Solution (Java / C++ / Python)</span>
              </button>
              <button
                onClick={() => setActiveModalTab('testrunner')}
                className={`pb-1.5 px-3 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
                  activeModalTab === 'testrunner'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Terminal size={13} />
                <span>Sample Test Playground</span>
              </button>
            </div>

            {activeModalTab === 'solution' ? (
              <div className="space-y-3">
                
                {/* Algorithmic Invariant Idea */}
                {activeSolutions?.idea && (
                  <div className="space-y-1">
                    <span className="font-mono font-bold uppercase text-[10px] text-accent dark:text-accent-dark flex items-center gap-1">
                      <Zap size={11} />
                      <span>Algorithmic Invariant & Approach:</span>
                    </span>
                    <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed bg-paper-100/70 dark:bg-neutral-800/40 p-2.5 rounded border border-neutral-200 dark:border-neutral-700/60 font-sans">
                      {activeSolutions.idea}
                    </p>
                  </div>
                )}

                {/* Complexity Analysis */}
                {activeSolutions?.complexity && (
                  <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                    <strong className="text-neutral-900 dark:text-white">Complexity: </strong>
                    <span>{activeSolutions.complexity}</span>
                  </div>
                )}

                {/* Common Pitfalls */}
                {activeSolutions?.pitfalls && activeSolutions.pitfalls.length > 0 && (
                  <div className="p-2.5 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] space-y-1">
                    <div className="font-bold font-mono uppercase text-[10px] flex items-center gap-1">
                      <AlertTriangle size={11} />
                      <span>Infosys OA Pitfalls & Watch-outs:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed">
                      {activeSolutions.pitfalls.map((pf, idx) => (
                        <li key={idx}>{pf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Full Compilable CodeBlock */}
                {activeSolutions ? (
                  <CodeBlock
                    code={{
                      java: activeSolutions.java,
                      cpp: activeSolutions.cpp,
                      python: activeSolutions.python
                    }}
                    preferredLanguage={selectedLanguage}
                    onLanguageChange={onLanguageChange}
                    verified={activeSolutions.verified}
                    testsPassed={activeSolutions.testsPassed}
                  />
                ) : (
                  <div className="p-4 text-center text-neutral-500 font-mono text-xs">
                    Solution loading...
                  </div>
                )}

              </div>
            ) : (
              <div className="space-y-2">
                <TestRunner problemTitle={problem.title} />
              </div>
            )}
          </div>

          {/* Mark as Solved Button */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <button
              onClick={() => onToggleSolved(problem.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-medium transition-colors ${
                isSolved 
                  ? 'bg-emerald-600 text-white' 
                  : 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>{isSolved ? 'Marked as Solved ✓' : 'Mark Problem as Solved'}</span>
            </button>

            <span className="font-mono text-[10px] text-neutral-400">
              Problem ID: {problem.id}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
