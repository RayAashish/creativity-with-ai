import React, { useState, useEffect } from 'react';
import { TestResult, SubjectId } from '../../types';
import { SUBJECTS } from '../../data/subjects';
import { useProgress } from '../../context/ProgressContext';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface TestAnalyticsProps {
  result: TestResult;
  onRetake: () => void;
  onGoToDashboard: () => void;
  onStudyTopic: (subjectId: SubjectId) => void;
}

export const TestAnalytics: React.FC<TestAnalyticsProps> = ({
  result,
  onRetake,
  onGoToDashboard,
  onStudyTopic
}) => {
  const { saveTestResult, toggleBookmark, isBookmarked } = useProgress();
  const [filterReview, setFilterReview] = useState<'all' | 'incorrect' | 'correct' | 'marked'>('incorrect');
  const [hasSavedHistory, setHasSavedHistory] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!hasSavedHistory) {
      saveTestResult(result);
      setHasSavedHistory(true);
      if (result.percentage >= 70) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  }, [hasSavedHistory, result, saveTestResult]);

  const toggleExpand = (qId: string) => {
    sounds.playClick();
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const filteredQuestions = result.questionStates.filter(qs => {
    if (filterReview === 'incorrect') {
      return qs.selectedAnswer !== null && qs.selectedAnswer !== qs.question.correctAnswer;
    }
    if (filterReview === 'correct') {
      return qs.selectedAnswer === qs.question.correctAnswer;
    }
    if (filterReview === 'marked') {
      return qs.isMarkedForReview;
    }
    return true;
  });

  const avgSecondsPerQ = result.attempted > 0
    ? Math.round(result.timeTakenSeconds / result.attempted)
    : 0;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Top Banner / Scorecard */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 border border-indigo-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-pink-300 border border-white/20 mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>Test Performance Diagnostic</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {result.testTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Completed on {new Date(result.date).toLocaleDateString()} at {new Date(result.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Big Score Radial / Pill */}
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 self-start md:self-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300">
                {result.score} / {result.maxScore}
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                Raw Score
              </div>
            </div>

            <div className="h-12 w-px bg-white/20" />

            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-black text-emerald-400">
                {result.percentage}%
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                Accuracy
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Ribbon */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div>
            <div className="text-xl font-bold text-emerald-400">{result.correct} Correct</div>
            <div className="text-slate-400 mt-0.5">+{result.correct} Marks</div>
          </div>
          <div>
            <div className="text-xl font-bold text-rose-400">{result.incorrect} Incorrect</div>
            <div className="text-slate-400 mt-0.5">Need Revision</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-300">{result.unattempted} Skipped</div>
            <div className="text-slate-400 mt-0.5">Unanswered</div>
          </div>
          <div>
            <div className="text-xl font-bold text-cyan-400">{Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</div>
            <div className="text-slate-400 mt-0.5">~{avgSecondsPerQ}s / question</div>
          </div>
        </div>
      </div>

      {/* CORE REQUIREMENT: FOCUS AREAS & WEAKNESSES ADVISOR */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Areas You Need to Focus On (Targeted Diagnostics)
            </h2>
            <p className="text-xs text-slate-500">
              Personalized guidance based on your questions missed in this test session.
            </p>
          </div>
        </div>

        {result.focusAreas.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
              Outstanding Mastery! No critical weak areas detected.
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              You scored above 60% across all tested subjects and topics in this mock. Maintain this consistency!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {result.focusAreas.map((fa, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/60 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                      {fa.subject.toUpperCase()} • {fa.topic}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {fa.accuracy}% Accuracy
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {fa.advice}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onStudyTopic(fa.subject);
                  }}
                  className="self-start flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Review {fa.subject.toUpperCase()} Notes Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subject & Difficulty Breakdown Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Breakdown Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Subject-by-Subject Scorecard</span>
          </h3>

          <div className="space-y-3">
            {SUBJECTS.map(s => {
              const stat = result.subjectBreakdown[s.id];
              if (!stat || stat.total === 0) return null;
              const subjAcc = Math.round((stat.correct / stat.total) * 100);

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className={subjAcc >= 70 ? 'text-emerald-500 font-bold' : subjAcc >= 40 ? 'text-amber-500 font-bold' : 'text-rose-500 font-bold'}>
                      {stat.correct} / {stat.total} ({subjAcc}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      style={{ width: `${subjAcc}%` }}
                      className={`h-full ${subjAcc >= 70 ? 'bg-emerald-500' : subjAcc >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty Breakdown Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-500" />
            <span>Difficulty Breakdown</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as const).map(diff => {
              const stat = result.difficultyBreakdown[diff];
              const diffAcc = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div key={diff} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 capitalize mb-1">
                    {diff === 'hard' ? 'GATE Hard' : diff === 'medium' ? 'Medium NQT' : 'Easy Concept'}
                  </div>
                  <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    {diffAcc}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {stat ? `${stat.correct}/${stat.total}` : '0/0'} Correct
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-indigo-800 dark:text-indigo-300">
            💡 <strong>Observation:</strong> Hard GATE-level questions test edge-cases and exact numerical derivations. Focus on formula precision for GATE.
          </div>
        </div>
      </section>

      {/* Question-by-Question Detailed Review */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Complete Question-by-Question Review
            </h2>
            <p className="text-xs text-slate-500">
              Inspect your answers, correct options, and comprehensive step-by-step logic.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto pb-1">
            <button
              onClick={() => setFilterReview('incorrect')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterReview === 'incorrect'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Incorrect ({result.incorrect})
            </button>
            <button
              onClick={() => setFilterReview('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterReview === 'all'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({result.totalQuestions})
            </button>
            <button
              onClick={() => setFilterReview('correct')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterReview === 'correct'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Correct ({result.correct})
            </button>
            <button
              onClick={() => setFilterReview('marked')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterReview === 'marked'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Marked ({result.questionStates.filter(q => q.isMarkedForReview).length})
            </button>
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No questions found for filter: {filterReview}
            </div>
          ) : (
            filteredQuestions.map((qs, idx) => {
              const q = qs.question;
              const isCorrect = qs.selectedAnswer === q.correctAnswer;
              const isExpanded = expandedQuestions[q.id] !== false; // default open
              const bookmarked = isBookmarked(q.id);

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : qs.selectedAnswer === null
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30'
                      : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                        isCorrect
                          ? 'bg-emerald-500 text-white'
                          : qs.selectedAnswer === null
                          ? 'bg-slate-400 text-white'
                          : 'bg-rose-500 text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                        {q.subject.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {q.topic}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full capitalize bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          toggleBookmark(q.id);
                        }}
                        className={`p-1.5 rounded-lg border transition ${
                          bookmarked
                            ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 border-pink-200'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => toggleExpand(q.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {q.question}
                  </p>

                  {isExpanded && (
                    <div className="space-y-3 pt-2">
                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isOptCorrect = optIdx === q.correctAnswer;
                          const isOptChosen = optIdx === qs.selectedAnswer;

                          let style = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                          if (isOptCorrect) {
                            style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold';
                          } else if (isOptChosen) {
                            style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-bold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${style}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isOptCorrect && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">CORRECT</span>}
                              {!isOptCorrect && isOptChosen && <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">YOUR CHOICE</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                          💡 Step-by-Step Explanation:
                        </span>
                        <p>{q.explanation}</p>
                        {q.keyFormulaOrNote && (
                          <div className="mt-1 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 p-1.5 rounded">
                            📌 {q.keyFormulaOrNote}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <button
          onClick={() => {
            sounds.playClick();
            onGoToDashboard();
          }}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Return to Dashboard
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onRetake();
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Another Mock Test</span>
        </button>
      </div>
    </div>
  );
};
