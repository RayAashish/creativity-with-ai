import React, { useState } from 'react';
import {
  HelpCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  BookOpen,
  Filter,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  RotateCcw
} from 'lucide-react';
import { oralInterviewQuestions } from '../data/interviewData';
import { pseudocodeAndConceptQuestions } from '../data/pseudocodeData';
import { OralInterviewQA, PseudocodeMCQ } from '../types';

interface InterviewModuleViewProps {
  focusedQuestionId?: string;
}

export const InterviewModuleView: React.FC<InterviewModuleViewProps> = ({
  focusedQuestionId
}) => {
  const [activeTab, setActiveTab] = useState<'oral' | 'pseudocode' | 'concepts'>('oral');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(focusedQuestionId || null);

  // State for interactive MCQs / Pseudocode
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showTrace, setShowTrace] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (focusedQuestionId) {
      if (focusedQuestionId.startsWith('pseudo-')) {
        setActiveTab('pseudocode');
      } else if (focusedQuestionId.startsWith('concept-')) {
        setActiveTab('concepts');
      } else {
        setActiveTab('oral');
      }
      setExpandedId(focusedQuestionId);
    }
  }, [focusedQuestionId]);

  const oralCategories = [
    'All',
    'Array & Two Pointers',
    'Hashing & Strings',
    'Binary Search & Greedy',
    'Dynamic Programming',
    'Trees & Graphs',
    'DBMS & SQL',
    'OOPs & System Design',
    'OS & Concurrency'
  ];

  const filteredOral = oralInterviewQuestions.filter(q => {
    if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
    return true;
  });

  const pseudocodeItems = pseudocodeAndConceptQuestions.filter(q => q.type === 'pseudocode');
  const conceptItems = pseudocodeAndConceptQuestions.filter(q => q.type === 'concept');

  const handleSelectAnswer = (questionId: string, option: string) => {
    if (userAnswers[questionId]) return; // already answered
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleResetAnswer = (questionId: string) => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setShowTrace(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent dark:text-accent-dark uppercase tracking-wider mb-1">
          <HelpCircle size={14} />
          <span>Follow-up Technical Round & Programming Concepts</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Interview & Concepts Module
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Preparing for the surprise pre-interview pen-and-paper round, campus pseudocode screening, and oral technical grilling. Covers algorithmic proofs, step-by-step variable traces, and OOP/DBMS concepts.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => { setActiveTab('oral'); setSelectedCategory('All'); }}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'oral'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <BookOpen size={14} />
          <span>100 Oral DSA & CS Questions</span>
        </button>

        <button
          onClick={() => { setActiveTab('pseudocode'); }}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pseudocode'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Terminal size={14} />
          <span>Pseudocode Tracing Drills ({pseudocodeItems.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('concepts'); }}
          className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'concepts'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Cpu size={14} />
          <span>OOP & Core CS MCQs ({conceptItems.length})</span>
        </button>
      </div>

      {/* TAB 1: ORAL INTERVIEW QUESTIONS */}
      {activeTab === 'oral' && (
        <div className="space-y-4">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800">
            {oralCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white font-medium'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-neutral-500">
            Showing {filteredOral.length} of {oralInterviewQuestions.length} questions
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {filteredOral.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-sm border transition-all ${
                    isExpanded
                      ? 'border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-3.5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent dark:text-accent-dark">
                          {item.id.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-neutral-900 dark:text-white leading-snug">
                        {item.question}
                      </h3>
                    </div>

                    <div className="text-neutral-400 shrink-0 mt-1">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs leading-relaxed">
                      
                      <div className="space-y-1">
                        <div className="font-mono font-bold uppercase text-[10px] text-neutral-400 tracking-wider">
                          Model Technical Answer:
                        </div>
                        <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed bg-paper-100/60 dark:bg-neutral-800/40 p-3 rounded-sm border border-neutral-200 dark:border-neutral-700/60 font-sans">
                          {item.modelAnswer}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="font-mono font-bold uppercase text-[10px] text-accent dark:text-accent-dark tracking-wider flex items-center gap-1.5">
                          <Code2 size={12} />
                          <span>Dry-Run Tracing Exercise:</span>
                        </div>
                        <div className="p-3 rounded-sm bg-neutral-950 text-neutral-200 font-mono text-[11px] leading-relaxed">
                          {item.dryRunWalkthrough}
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px]">
                        <strong>Interviewer Follow-up: </strong>
                        <span>{item.complexityFollowUp}</span>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PSEUDOCODE TRACING DRILSS */}
      {activeTab === 'pseudocode' && (
        <div className="space-y-5">
          <div className="p-3 rounded bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
            <strong>Pseudocode Output Prediction: </strong>
            Step through loops, bitwise masks, and recursion stack frames. Click an answer to verify, then expand the variable trace table to see iteration-by-iteration state changes.
          </div>

          <div className="space-y-6">
            {pseudocodeItems.map((item, idx) => {
              const selected = userAnswers[item.id];
              const isAnswered = !!selected;
              const isCorrect = selected === item.correctAnswer;
              const traceOpen = showTrace[item.id];

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent dark:text-accent-dark">
                        DRILL #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {item.category}
                      </span>
                    </div>
                    {isAnswered && (
                      <button
                        onClick={() => handleResetAnswer(item.id)}
                        className="text-[11px] font-mono text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1"
                      >
                        <RotateCcw size={11} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {item.title}
                  </h3>

                  {/* Code snippet */}
                  {item.code && (
                    <div className="p-3 rounded bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 overflow-x-auto whitespace-pre leading-relaxed">
                      {item.code}
                    </div>
                  )}

                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {item.question}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {item.options.map((opt) => {
                      let btnStyle = 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200';
                      
                      if (isAnswered) {
                        if (opt === item.correctAnswer) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (opt === selected && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-bold';
                        } else {
                          btnStyle = 'opacity-40 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-500';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={isAnswered}
                          onClick={() => handleSelectAnswer(item.id, opt)}
                          className={`p-2.5 rounded-sm border text-xs font-mono text-left transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && opt === item.correctAnswer && (
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          {isAnswered && opt === selected && !isCorrect && (
                            <XCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback & Trace Table */}
                  {isAnswered && (
                    <div className="pt-2 space-y-3">
                      <div className={`p-3 rounded text-xs leading-relaxed border ${
                        isCorrect
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      }`}>
                        <strong>{isCorrect ? '✅ Correct! ' : '❌ Incorrect. '}</strong>
                        <span>{item.explanation}</span>
                      </div>

                      {item.trace && (
                        <div>
                          <button
                            onClick={() => setShowTrace(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="text-xs font-mono text-accent dark:text-accent-dark hover:underline flex items-center gap-1.5 py-1"
                          >
                            <Terminal size={12} />
                            <span>{traceOpen ? 'Hide Trace Table' : 'Inspect Step-by-Step Variable Trace Table'}</span>
                          </button>

                          {traceOpen && (
                            <div className="mt-2 border border-neutral-200 dark:border-neutral-800 rounded overflow-hidden">
                              <table className="w-full text-[11px] font-mono text-left">
                                <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                                  <tr>
                                    <th className="py-1.5 px-2.5 w-12">Step</th>
                                    <th className="py-1.5 px-2.5 w-44">Variable State</th>
                                    <th className="py-1.5 px-2.5">Action & Result</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                                  {item.trace.map(t => (
                                    <tr key={t.step} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                                      <td className="py-1 px-2.5 font-bold text-neutral-400">{t.step}</td>
                                      <td className="py-1 px-2.5 text-accent dark:text-accent-dark">{t.state}</td>
                                      <td className="py-1 px-2.5 text-neutral-700 dark:text-neutral-300">{t.action}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CORE CS & OOP MCQS */}
      {activeTab === 'concepts' && (
        <div className="space-y-5">
          <div className="p-3 rounded bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
            <strong>Core CS & Programming Concepts: </strong>
            High-yield questions on Virtual tables (vtables), JVM string pool & garbage collection, B+ tree indexing, Coffman deadlock conditions, ACID isolation levels, and asymptotic recurrences.
          </div>

          <div className="space-y-6">
            {conceptItems.map((item, idx) => {
              const selected = userAnswers[item.id];
              const isAnswered = !!selected;
              const isCorrect = selected === item.correctAnswer;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent dark:text-accent-dark">
                        CONCEPT #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {item.category}
                      </span>
                    </div>
                    {isAnswered && (
                      <button
                        onClick={() => handleResetAnswer(item.id)}
                        className="text-[11px] font-mono text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1"
                      >
                        <RotateCcw size={11} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {item.title}
                  </h3>

                  {item.code && (
                    <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 overflow-x-auto whitespace-pre leading-relaxed">
                      {item.code}
                    </div>
                  )}

                  <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {item.question}
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {item.options.map((opt) => {
                      let btnStyle = 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200';
                      
                      if (isAnswered) {
                        if (opt === item.correctAnswer) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (opt === selected && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-bold';
                        } else {
                          btnStyle = 'opacity-40 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-500';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={isAnswered}
                          onClick={() => handleSelectAnswer(item.id, opt)}
                          className={`w-full p-2.5 rounded-sm border text-xs font-sans text-left transition-all flex items-start justify-between gap-3 ${btnStyle}`}
                        >
                          <span className="leading-snug">{opt}</span>
                          {isAnswered && opt === item.correctAnswer && (
                            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {isAnswered && opt === selected && !isCorrect && (
                            <XCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {isAnswered && (
                    <div className={`p-3 rounded text-xs leading-relaxed border ${
                      isCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}>
                      <strong>{isCorrect ? '✅ Correct! ' : '❌ Incorrect. '}</strong>
                      <span>{item.explanation}</span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
