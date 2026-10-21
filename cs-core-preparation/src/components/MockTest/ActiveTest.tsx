import React, { useState, useEffect, useRef } from 'react';
import {
  TestSettings,
  TestQuestionState,
  TestResult
} from '../../types';
import { calculateTestResult } from '../../utils/analytics';
import { useProgress } from '../../context/ProgressContext';
import {
  Timer as TimerIcon,
  Pause,
  Play,
  Calculator,
  PenTool,
  Bookmark,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ActiveTestProps {
  testTitle: string;
  settings: TestSettings;
  initialQuestionStates: TestQuestionState[];
  onFinishTest: (result: TestResult) => void;
  onExitTest: () => void;
  onOpenCalc: () => void;
  onOpenScratchpad: () => void;
}

export const ActiveTest: React.FC<ActiveTestProps> = ({
  testTitle,
  settings,
  initialQuestionStates,
  onFinishTest,
  onExitTest,
  onOpenCalc,
  onOpenScratchpad
}) => {
  const { toggleBookmark, isBookmarked } = useProgress();
  const [questionStates, setQuestionStates] = useState<TestQuestionState[]>(initialQuestionStates);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Timer states
  const totalSeconds = settings.hasTimer ? settings.durationMinutes * 60 : 0;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQState = questionStates[currentIndex];
  const currentQ = currentQState.question;
  const bookmarked = isBookmarked(currentQ.id);

  // Timer countdown effect
  useEffect(() => {
    if (!settings.hasTimer || isPaused) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleForceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [settings.hasTimer, isPaused]);

  // Track time spent on current question
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setQuestionStates(prev => {
          const updated = [...prev];
          updated[currentIndex] = {
            ...updated[currentIndex],
            timeSpentSeconds: updated[currentIndex].timeSpentSeconds + 1
          };
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  const handleSelectOption = (optIdx: number) => {
    sounds.playClick();
    setQuestionStates(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        selectedAnswer: optIdx
      };
      return updated;
    });
  };

  const handleClearResponse = () => {
    sounds.playClick();
    setQuestionStates(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        selectedAnswer: null
      };
      return updated;
    });
  };

  const handleToggleMarkReview = () => {
    sounds.playClick();
    setQuestionStates(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        isMarkedForReview: !updated[currentIndex].isMarkedForReview
      };
      return updated;
    });
    // Move to next if not at end
    if (currentIndex < questionStates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIndex < questionStates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    sounds.playClick();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleForceSubmit = () => {
    sounds.playFanfare();
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    const result = calculateTestResult(testTitle, settings, questionStates, elapsedSeconds);
    onFinishTest(result);
  };

  // Stats calculation for confirmation modal & palette
  const answeredCount = questionStates.filter(q => q.selectedAnswer !== null).length;
  const markedCount = questionStates.filter(q => q.isMarkedForReview).length;
  const unattemptedCount = questionStates.length - answeredCount;

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = settings.hasTimer && secondsRemaining < 300; // < 5 mins

  return (
    <div className="space-y-6 pb-16">
      {/* Top Test Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">
            {testTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Question {currentIndex + 1} of {questionStates.length}</span>
            <span>•</span>
            <span className="uppercase text-indigo-600 dark:text-indigo-400 font-bold">
              {currentQ.subject}
            </span>
          </div>
        </div>

        {/* Center & Right Controls: Timer, Pause, Tools, Submit */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {settings.hasTimer && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm shadow-inner transition ${
                isLowTime
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <TimerIcon className={`w-4 h-4 ${isLowTime ? 'text-rose-500' : 'text-indigo-500'}`} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          )}

          {settings.hasTimer && (
            <button
              onClick={() => {
                sounds.playClick();
                setIsPaused(!isPaused);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title={isPaused ? 'Resume Test' : 'Pause Timer'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-500" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onOpenCalc();
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Open Scientific Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenScratchpad();
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Open Rough Scratchpad"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowSubmitConfirm(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Question Area + Right Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Active Question */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Question Meta Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                Question #{currentIndex + 1}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 font-medium">
                {currentQ.topic}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className={`font-bold px-2 py-0.5 rounded-full capitalize text-[10px] ${
                currentQ.difficulty === 'hard'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                  : currentQ.difficulty === 'medium'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                toggleBookmark(currentQ.id);
              }}
              className={`p-1.5 rounded-lg border transition ${
                bookmarked
                  ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 border-pink-200'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
              }`}
              title="Bookmark for later review"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Question Statement */}
          <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </div>

          {/* Code Snippet if present */}
          {currentQ.codeSnippet && (
            <pre className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          )}

          {/* 4 Radio Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = currentQState.selectedAnswer === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-snug pt-0.5">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Action Button Bar */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={currentQState.selectedAnswer === null}
                onClick={handleClearResponse}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMarkReview}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  currentQState.isMarkedForReview
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300'
                    : 'border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                }`}
              >
                {currentQState.isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Question Status Palette */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 sticky top-36">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Question Palette
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
            {questionStates.map((qs, idx) => {
              const isCurrent = currentIndex === idx;
              const isAnswered = qs.selectedAnswer !== null;
              const isMarked = qs.isMarkedForReview;

              let cellStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent';
              if (isAnswered && isMarked) {
                cellStyle = 'bg-purple-600 text-white font-bold';
              } else if (isAnswered) {
                cellStyle = 'bg-emerald-500 text-white font-bold';
              } else if (isMarked) {
                cellStyle = 'bg-purple-200 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-400';
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playClick();
                    setCurrentIndex(idx);
                  }}
                  className={`w-full aspect-square rounded-xl text-xs font-bold flex items-center justify-center transition-all relative ${cellStyle} ${
                    isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-md' : 'hover:opacity-80'
                  }`}
                >
                  {idx + 1}
                  {isAnswered && isMarked && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700" />
              <span>Unattempted ({unattemptedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-purple-200 dark:bg-purple-950 border border-purple-400" />
              <span>Review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-purple-600" />
              <span>Ans + Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Submit Mock Test?
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to calculate your score & diagnose your focus areas?
                </p>
              </div>
            </div>

            {/* Test Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{answeredCount}</div>
                <div className="text-slate-400">Answered</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-rose-500">{unattemptedCount}</div>
                <div className="text-slate-400">Unanswered</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{markedCount}</div>
                <div className="text-slate-400">Marked</div>
              </div>
            </div>

            {unattemptedCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
                ⚠️ You still have <strong>{unattemptedCount}</strong> unanswered questions. Unattempted questions will earn 0 points.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Resume Test
              </button>
              <button
                onClick={handleForceSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/25"
              >
                Yes, Final Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
