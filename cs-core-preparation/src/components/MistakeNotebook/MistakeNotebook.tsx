import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { getQuestionById } from '../../data/questions';
import { QuestionCard } from '../PracticeArea/QuestionCard';
import { TestSettings } from '../../types';
import {
  Bookmark,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface MistakeNotebookProps {
  onStartMistakeTest: (settings: TestSettings, title: string) => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({ onStartMistakeTest }) => {
  const { progress, clearMistakeNotebook, removeFromMistakeNotebook } = useProgress();
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const mistakes = progress.mistakeNotebook;
  const questions = mistakes
    .map(m => ({ mistake: m, question: getQuestionById(m.questionId) }))
    .filter((item): item is { mistake: typeof item.mistake; question: NonNullable<typeof item.question> } => item.question !== undefined);

  const filteredItems = filterSubject === 'all'
    ? questions
    : questions.filter(item => item.question.subject === filterSubject);

  const handleLaunchRetest = () => {
    sounds.playFanfare();
    onStartMistakeTest(
      {
        mode: 'custom',
        questionCount: Math.min(filteredItems.length, 30),
        durationMinutes: Math.min(filteredItems.length * 2, 45),
        hasTimer: true
      },
      `Mistake Notebook Targeted Retest (${Math.min(filteredItems.length, 30)} Qs)`
    );
  };

  const handleClearAll = () => {
    sounds.playClick();
    if (window.confirm('Clear all entries from your Mistake Notebook?')) {
      clearMistakeNotebook();
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Targeted Weakness Rectification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Personal Mistake Notebook
          </h1>
          <p className="text-sm text-slate-500">
            Auto-collects questions you got wrong in mocks & practice. Re-test yourself until zero mistakes remain!
          </p>
        </div>

        {questions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              onClick={handleLaunchRetest}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 transition transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Re-Test Mistakes ({filteredItems.length})</span>
            </button>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Your Mistake Notebook is Clean!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Whenever you miss a question during Practice or in a Mock Test, it will be automatically captured here so you can review and eliminate your weak spots.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredItems.length}</strong> logged mistakes
            </span>
            <span>
              Click question card options to re-check your understanding
            </span>
          </div>

          <div className="space-y-4">
            {filteredItems.map((item, idx) => (
              <div key={item.question.id} className="relative group">
                <QuestionCard question={item.question} index={idx} />
                <button
                  onClick={() => {
                    sounds.playClick();
                    removeFromMistakeNotebook(item.question.id);
                  }}
                  className="absolute top-4 right-16 p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition border border-transparent hover:border-emerald-200 text-xs font-semibold flex items-center gap-1"
                  title="Mark as Mastered and Remove from Mistakes"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Mastered</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
