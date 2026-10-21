import React from 'react';
import { 
  Sparkles, 
  Flame, 
  ExternalLink, 
  CheckCircle2, 
  Lightbulb, 
  Calendar,
  Building2,
  Clock
} from 'lucide-react';
import { Question } from '../../types/dsa';
import confetti from 'canvas-confetti';

interface DailyChallengeCardProps {
  question: Question;
  dateStr: string;
  isDone: boolean;
  dailyStreak: number;
  onToggleDone: (questionId: string) => void;
  onViewSolution: (question: Question) => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  question,
  dateStr,
  isDone,
  dailyStreak,
  onToggleDone,
  onViewSolution,
}) => {
  const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Hard':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const handleToggle = () => {
    onToggleDone(question.id);
    if (!isDone) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-5 sm:p-6 shadow-2xl transition hover:border-cyan-500/60">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2.5 flex-1 min-w-0">
          {/* Top metadata tags */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Daily Challenge</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80 font-mono text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formattedDate}</span>
            </span>

            <span className={`px-2.5 py-0.5 rounded-lg border font-bold text-xs ${getDifficultyBadge(question.difficulty)}`}>
              {question.difficulty}
            </span>

            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              {question.topic.toUpperCase()}
            </span>

            {/* Daily Streak Callout */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500/30 text-amber-400" />
              <span>{dailyStreak}d Daily Streak</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {question.title}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {question.platform}
            </span>
          </div>

          {/* Description & Companies */}
          {question.description && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {question.description}
            </p>
          )}

          {question.companies && question.companies.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>Frequently asked at:</span>
              </span>
              {question.companies.slice(0, 5).map((comp, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-shrink-0 pt-2 md:pt-0">
          <button
            onClick={() => onViewSolution(question)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition transform active:scale-95 shadow-sm"
            title="View intuition, pseudocode, and 4-language code"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>💡 Solution</span>
          </button>

          <a
            href={question.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600/25 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition transform active:scale-95"
          >
            <span>Solve on {question.platform}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleToggle}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition transform active:scale-95 ${
              isDone
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isDone ? 'Completed Today ✅' : 'Mark Daily Done'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
