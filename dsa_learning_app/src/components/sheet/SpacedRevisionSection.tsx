import React from 'react';
import { 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink, 
  Lightbulb, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Question, RevisionItem } from '../../types/dsa';
import confetti from 'canvas-confetti';

interface SpacedRevisionSectionProps {
  dueList: { question: Question; revision: RevisionItem }[];
  onAdvanceRevision: (questionId: string) => void;
  onViewSolution: (question: Question) => void;
  onToggleDone: (questionId: string) => void;
  isQuestionDone: (questionId: string) => boolean;
}

export const SpacedRevisionSection: React.FC<SpacedRevisionSectionProps> = ({
  dueList,
  onAdvanceRevision,
  onViewSolution,
  onToggleDone,
  isQuestionDone,
}) => {
  if (dueList.length === 0) return null;

  const handleMarkRevised = (questionId: string) => {
    onAdvanceRevision(questionId);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (e) {
      console.error(e);
    }
  };

  const getStageBadge = (stage: number) => {
    switch (stage) {
      case 0:
        return { label: '3-Day Interval Review', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 1:
        return { label: '7-Day Interval Review', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700' };
      case 2:
        return { label: '14-Day Final Mastery', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      default:
        return { label: 'Spaced Review', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' };
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#131417] p-4 sm:p-5 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
            <Clock className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Due for Spaced Revision Today
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
                {dueList.length} problem{dueList.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Science-backed retention curve: Resurfacing problems at 3, 7, and 14-day intervals moves DSA concepts into permanent long-term memory.
            </p>
          </div>
        </div>
      </div>

      {/* Due Problems List */}
      <div className="space-y-2.5">
        {dueList.map(({ question, revision }) => {
          const stageBadge = getStageBadge(revision.stage);

          return (
            <div
              key={question.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${stageBadge.color}`}>
                      {stageBadge.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 uppercase">
                      {question.topic}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                      {question.difficulty}
                    </span>
                  </div>

                  <a
                    href={question.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:opacity-75 transition flex items-center gap-1.5"
                  >
                    <span>{question.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => onViewSolution(question)}
                  className="btn-outline flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Solution</span>
                </button>

                <a
                  href={question.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-solid flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  <span>Solve</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleMarkRevised(question.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm"
                  title="Mark this interval complete and advance to next spaced stage"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mark Revised</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
