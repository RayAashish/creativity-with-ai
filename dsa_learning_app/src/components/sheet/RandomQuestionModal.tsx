import React, { useState } from 'react';
import { Sparkles, ExternalLink, CheckCircle2, RotateCw, X, Trophy, Lightbulb } from 'lucide-react';
import { Question, Topic } from '../../types/dsa';
import { TOPICS } from '../../data/topics';
import confetti from 'canvas-confetti';

interface RandomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  totalRemaining: number;
  totalInPool: number;
  currentTopic: Topic | 'all';
  onRollNew: (topic: Topic | 'all', includeDone: boolean) => void;
  onToggleDone: (questionId: string) => void;
  isDone: boolean;
  onSelectTopic: (topic: Topic | 'all') => void;
  onViewSolution?: (question: Question) => void;
}

export const RandomQuestionModal: React.FC<RandomQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  totalRemaining,
  totalInPool,
  currentTopic,
  onRollNew,
  onToggleDone,
  isDone,
  onSelectTopic,
  onViewSolution,
}) => {
  const [includeDone, setIncludeDone] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  if (!isOpen) return null;

  const topicName = currentTopic === 'all' 
    ? 'All Categories' 
    : TOPICS.find(t => t.id === currentTopic)?.name || currentTopic;

  const handleRoll = (topicToRoll: Topic | 'all' = currentTopic) => {
    setIsSpinning(true);
    setTimeout(() => {
      onRollNew(topicToRoll, includeDone);
      setIsSpinning(false);
    }, 350);
  };

  const handleOpenProblem = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMarkDoneAndCelebrate = (qId: string) => {
    onToggleDone(qId);
    try {
      confetti({ particleCount: 75, spread: 60 });
    } catch (e) {
      console.error(e);
    }
  };

  const getDifficultyColor = (diff: string) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">DSA Problem Roulette</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Pool: <span className="font-semibold text-[var(--text-primary)]">{topicName}</span> • Unsolved Available:{' '}
                <span className="text-[var(--status-green)] font-bold">{totalRemaining}</span> / {totalInPool}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-subtle)] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 relative z-10 overflow-x-auto pb-1 category-scroll-container">
          <button
            onClick={() => {
              onSelectTopic('all');
              handleRoll('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              currentTopic === 'all'
                ? 'btn-solid shadow-sm'
                : 'btn-outline text-[var(--text-secondary)]'
            }`}
          >
            All 450 Sheet
          </button>
          {TOPICS.slice(0, 4).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTopic(t.id);
                handleRoll(t.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap transition ${
                currentTopic === t.id
                  ? 'btn-solid shadow-sm'
                  : 'btn-outline text-[var(--text-secondary)]'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {question ? (
          <div className={`relative z-10 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-subtle)] p-6 mb-6 transition-all duration-300 ${isSpinning ? 'opacity-40 scale-98' : 'opacity-100 scale-100'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {question.platform}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] uppercase">
                {TOPICS.find(t => t.id === question.topic)?.name || question.topic}
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2 leading-snug">
              {question.title}
            </h4>

            {question.description && (
              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                {question.description}
              </p>
            )}

            {question.companies && question.companies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-xs text-[var(--text-muted)]">Asked at:</span>
                {question.companies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => handleOpenProblem(question.url)}
                className="btn-solid flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl"
              >
                <span>Launch on {question.platform}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              {onViewSolution && (
                <button
                  onClick={() => onViewSolution(question)}
                  className="btn-outline flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                  title="View step-by-step intuition, pseudocode, and 4-language code"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>Solution</span>
                </button>
              )}

              <button
                onClick={() => handleMarkDoneAndCelebrate(question.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  isDone
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'btn-outline'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span>{isDone ? 'Solved' : 'Mark Done'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 bg-[var(--bg-subtle)] rounded-2xl border border-emerald-500/30 p-6 sm:p-8 mb-6 text-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--status-green)]">
              <Trophy className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              All Questions in this Category Completed!
            </h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-5 leading-relaxed">
              Incredible work! You have marked all questions in <span className="text-[var(--status-green)] font-semibold">{topicName}</span> as completed.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIncludeDone(true);
                  onRollNew(currentTopic, true);
                }}
                className="btn-solid px-4 py-2 text-xs rounded-xl"
              >
                Include Completed for Revision Mode
              </button>
              <button
                onClick={() => {
                  onSelectTopic('all');
                  handleRoll('all');
                }}
                className="btn-outline px-4 py-2 text-xs rounded-xl"
              >
                Switch to All 450 Sheet Pool
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 pt-2 border-t border-[var(--border-subtle)]">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDone}
              onChange={(e) => setIncludeDone(e.target.checked)}
              className="rounded border-[var(--border-strong)] text-[var(--text-primary)] focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>Include completed questions in random pool (Revision Mode)</span>
          </label>

          <button
            onClick={() => handleRoll(currentTopic)}
            disabled={isSpinning}
            className="btn-solid flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Roll Another Question</span>
          </button>
        </div>
      </div>
    </div>
  );
};
