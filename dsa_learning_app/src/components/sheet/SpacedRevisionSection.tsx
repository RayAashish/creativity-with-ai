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
        return { label: '3-Day Interval Review', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 1:
        return { label: '7-Day Interval Review', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 2:
        return { label: '14-Day Final Mastery', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Spaced Review', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-[#0d1017]/80 backdrop-blur-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
            <Clock className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Due for Spaced Revision Today
              </h3>
              <span className="px-2 py-0.2 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                {dueList.length} problem{dueList.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Science-backed retention curve: Resurfacing problems at 3, 7, and 14-day intervals moves DSA concepts into permanent long-term memory.
            </p>
          </div>
        </div>
      </div>

      {/* Due Problems List */}
      <div className="space-y-2.5">
        {dueList.map(({ question, revision }) => {
          const isDone = isQuestionDone(question.id);
          const stageBadge = getStageBadge(revision.stage);

          return (
            <div
              key={question.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition"
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${stageBadge.color}`}>
                      {stageBadge.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {question.topic.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {question.difficulty}
                    </span>
                  </div>

                  <a
                    href={question.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-white hover:text-cyan-400 transition flex items-center gap-1.5"
                  >
                    <span>{question.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => onViewSolution(question)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition transform active:scale-95"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solution</span>
                </button>

                <a
                  href={question.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition"
                >
                  <span>Solve</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleMarkRevised(question.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm"
                  title="Mark this interval complete and advance to next spaced stage"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mark Revised ✅</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
