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
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Hard':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 rounded-2xl">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-white">DSA Problem Roulette</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pool: <span className="text-cyan-400 font-semibold">{topicName}</span> • Unsolved Available:{' '}
                <span className="text-emerald-400 font-bold">{totalRemaining}</span> / {totalInPool}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 relative z-10 overflow-x-auto pb-1">
          <button
            onClick={() => {
              onSelectTopic('all');
              handleRoll('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              currentTopic === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            🌐 All 450 Sheet
          </button>
          {TOPICS.slice(0, 4).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTopic(t.id);
                handleRoll(t.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition ${
                currentTopic === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {question ? (
          <div className={`relative z-10 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 mb-6 transition-all duration-300 ${isSpinning ? 'opacity-40 scale-98' : 'opacity-100 scale-100'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                {question.platform}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
                {TOPICS.find(t => t.id === question.topic)?.name || question.topic}
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
              {question.title}
            </h4>

            {question.description && (
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {question.description}
              </p>
            )}

            {question.companies && question.companies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-xs text-slate-400">Asked at:</span>
                {question.companies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleOpenProblem(question.url)}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
              >
                <span>Launch on {question.platform}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              {onViewSolution && (
                <button
                  onClick={() => onViewSolution(question)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition transform active:scale-95"
                  title="View step-by-step intuition, pseudocode, and 4-language code"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>💡 Solution</span>
                </button>
              )}

              <button
                onClick={() => handleMarkDoneAndCelebrate(question.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{isDone ? 'Solved ✅' : 'Mark Done'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 bg-slate-950/80 rounded-2xl border border-emerald-500/40 p-6 sm:p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-white mb-2">
              All Questions in this Category Completed! 🎉
            </h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-5 leading-relaxed">
              Incredible work! You have marked all questions in <span className="text-emerald-400 font-semibold">{topicName}</span> as "Already Done". Because the random selector filters out completed questions, there are no uncompleted problems remaining.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIncludeDone(true);
                  onRollNew(currentTopic, true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
              >
                Include Completed for Revision Mode
              </button>
              <button
                onClick={() => {
                  onSelectTopic('all');
                  handleRoll('all');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
              >
                Switch to All 450 Sheet Pool
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 pt-2 border-t border-slate-800">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDone}
              onChange={(e) => setIncludeDone(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
            />
            <span>Include "Already Done" questions in random pool (Revision Mode)</span>
          </label>

          <button
            onClick={() => handleRoll(currentTopic)}
            disabled={isSpinning}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 rounded-xl text-xs font-bold transition transform active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Roll Another Question 🎲</span>
          </button>
        </div>
      </div>
    </div>
  );
};
