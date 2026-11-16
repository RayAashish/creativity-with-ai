import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, BookOpen, Layers, Sparkles, HelpCircle, History } from 'lucide-react';
import { CodeforcesProblem, PYQQuestion, PredictedSet, OralInterviewQA } from '../types';
import { pseudocodeAndConceptQuestions } from '../data/pseudocodeData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: CodeforcesProblem[];
  pyqs: PYQQuestion[];
  predictedSets: PredictedSet[];
  interviewQA: OralInterviewQA[];
  onSelectResult: (view: string, itemId?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  problems,
  pyqs,
  predictedSets,
  interviewQA,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global shortcut handler (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  // Search results
  const matchedPYQs = cleanQ ? pyqs.filter(p => 
    p.title.toLowerCase().includes(cleanQ) || 
    p.patternName.toLowerCase().includes(cleanQ) ||
    p.summary.toLowerCase().includes(cleanQ)
  ).slice(0, 4) : [];

  const matchedProblems = cleanQ ? problems.filter(p =>
    p.title.toLowerCase().includes(cleanQ) ||
    p.patternName.toLowerCase().includes(cleanQ) ||
    p.tags.some(t => t.toLowerCase().includes(cleanQ))
  ).slice(0, 5) : [];

  const matchedSets = cleanQ ? predictedSets.filter(s =>
    s.title.toLowerCase().includes(cleanQ) ||
    s.targetRole.toLowerCase().includes(cleanQ) ||
    s.problems.some(p => p.problem.patternName.toLowerCase().includes(cleanQ))
  ).slice(0, 3) : [];

  const matchedQA = cleanQ ? interviewQA.filter(q =>
    q.question.toLowerCase().includes(cleanQ) ||
    q.category.toLowerCase().includes(cleanQ)
  ).slice(0, 3) : [];

  const matchedConcepts = cleanQ ? pseudocodeAndConceptQuestions.filter(c =>
    c.title.toLowerCase().includes(cleanQ) ||
    c.question.toLowerCase().includes(cleanQ) ||
    c.category.toLowerCase().includes(cleanQ)
  ).slice(0, 3) : [];

  const totalMatches = matchedPYQs.length + matchedProblems.length + matchedSets.length + matchedQA.length + matchedConcepts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-paper-50 dark:bg-paper-900 border border-neutral-300 dark:border-neutral-700 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 py-3 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, patterns, PYQs, predicted sets, interview questions..."
            className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          
          {cleanQ === '' && (
            <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Type keywords like <span className="font-mono text-neutral-700 dark:text-neutral-300">"Knapsack"</span>, <span className="font-mono text-neutral-700 dark:text-neutral-300">"Binary Search"</span>, <span className="font-mono text-neutral-700 dark:text-neutral-300">"Monster"</span>, or <span className="font-mono text-neutral-700 dark:text-neutral-300">"SQL"</span>.
            </div>
          )}

          {cleanQ !== '' && totalMatches === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              No matching items found for "{query}".
            </div>
          )}

          {/* Previous Year Questions Section */}
          {matchedPYQs.length > 0 && (
            <div className="pt-2">
              <div className="px-2 pb-1 text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-1.5">
                <History size={11} />
                <span>Previous Year Questions (PYQs)</span>
              </div>
              <div className="space-y-0.5">
                {matchedPYQs.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectResult('pyq', p.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-dark">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {p.position} · {p.patternName} · {p.driveYear}
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Benchmark Codeforces Problems Section */}
          {matchedProblems.length > 0 && (
            <div className="pt-2">
              <div className="px-2 pb-1 text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-1.5">
                <Layers size={11} />
                <span>Codeforces Practice Bank</span>
              </div>
              <div className="space-y-0.5">
                {matchedProblems.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectResult('patterns', p.pattern); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-dark">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {p.tier} · Rating {p.rating} · {p.patternName}
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Predicted Sets Section */}
          {matchedSets.length > 0 && (
            <div className="pt-2">
              <div className="px-2 pb-1 text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-1.5">
                <Sparkles size={11} />
                <span>Predicted Exam Sets</span>
              </div>
              <div className="space-y-0.5">
                {matchedSets.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onSelectResult('predicted-sets', s.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-dark">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Target: {s.targetRole} · {s.problemCount} Problems · {s.totalMarks} Marks
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Oral Interview Q&A Section */}
          {matchedQA.length > 0 && (
            <div className="pt-2">
              <div className="px-2 pb-1 text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-1.5">
                <HelpCircle size={11} />
                <span>Interview Module Q&A</span>
              </div>
              <div className="space-y-0.5">
                {matchedQA.map(q => (
                  <button
                    key={q.id}
                    onClick={() => { onSelectResult('interview', q.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-dark truncate max-w-lg">
                        {q.question}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {q.category}
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pseudocode & Concept Questions Section */}
          {matchedConcepts.length > 0 && (
            <div className="pt-2">
              <div className="px-2 pb-1 text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase flex items-center gap-1.5">
                <BookOpen size={11} />
                <span>Pseudocode Drills & Core CS Concepts</span>
              </div>
              <div className="space-y-0.5">
                {matchedConcepts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onSelectResult('interview', c.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-accent dark:group-hover:text-accent-dark truncate max-w-lg">
                        {c.title}: {c.question}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {c.category} · {c.type === 'pseudocode' ? 'Pseudocode Drill' : 'Concept MCQ'}
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Key Navigation */}
        <div className="px-3.5 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/40 text-[11px] text-neutral-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white dark:bg-neutral-800 border px-1 py-0.2 rounded text-[10px]">ESC</kbd> to close</span>
          </div>
          <span>Total verified catalog: 327 problems, 42 PYQs</span>
        </div>

      </div>
    </div>
  );
};
