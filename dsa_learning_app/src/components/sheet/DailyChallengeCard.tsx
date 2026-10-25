import React from 'react';
import { 
  Sparkles, 
  Flame, 
  ExternalLink, 
  CheckCircle2, 
  Lightbulb, 
  Calendar
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
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const handleToggle = () => {
    onToggleDone(question.id);
    if (!isDone) {
      try {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1017]/80 backdrop-blur-xl p-4 sm:p-5 shadow-lg hover-glow transition-all">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Metadata & Title */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Daily Challenge</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.06] text-[11px] font-mono">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>{formattedDate}</span>
            </span>

            <span className={`px-2 py-0.5 rounded-md border font-medium text-[11px] ${getDifficultyBadge(question.difficulty)}`}>
              {question.difficulty}
            </span>

            <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06] text-[11px] font-mono uppercase">
              {question.topic}
            </span>

            {dailyStreak > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-semibold">
                <Flame className="w-3 h-3 fill-amber-500/30 text-amber-400" />
                <span>{dailyStreak}d Streak</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-cyan-400 transition cursor-pointer" onClick={() => onViewSolution(question)}>
              {question.title}
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-0.2 rounded border border-white/[0.06]">
              {question.platform}
            </span>
          </div>

          {question.description && (
            <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed max-w-3xl">
              {question.description}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
          <button
            type="button"
            onClick={() => onViewSolution(question)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium transition active:scale-95"
            title="View Intuition, Pseudocode & Solutions in 4 Languages"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Solution</span>
          </button>

          <a
            href={question.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-sm shadow-cyan-500/20 transition active:scale-95"
          >
            <span>Solve</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition active:scale-95 ${
              isDone
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-zinc-200 border-white/[0.08]'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span>{isDone ? 'Completed' : 'Mark Done'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
