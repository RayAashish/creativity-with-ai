import React, { useState } from 'react';
import { Question } from '../../types';
import { Bookmark, CheckCircle2, XCircle, Lightbulb, PenTool, Check } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { sounds } from '../../utils/soundEffects';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const { toggleBookmark, isBookmarked, recordQuestionAttempt, progress, saveNote } = useProgress();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(progress.notes[question.id] || '');
  const [savedNoteSuccess, setSavedNoteSuccess] = useState(false);

  const bookmarked = isBookmarked(question.id);

  const handleSelectOption = (idx: number) => {
    if (isRevealed) return;
    setSelectedOption(idx);
    setIsRevealed(true);
    const isCorrect = idx === question.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }
    recordQuestionAttempt(question.id, isCorrect, idx);
  };

  const handleSaveNote = () => {
    sounds.playClick();
    saveNote(question.id, noteText);
    setSavedNoteSuccess(true);
    setTimeout(() => {
      setSavedNoteSuccess(false);
      setShowNoteEditor(false);
    }, 1200);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Question Header & Meta */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
            #{index + 1}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {question.subject.toUpperCase()}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {question.topic}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
              question.difficulty === 'hard'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                : question.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900'
            }`}
          >
            {question.difficulty === 'hard' ? 'GATE Level' : question.difficulty === 'medium' ? 'TCS / Placement' : 'Concept Easy'}
          </span>
          {question.examTags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action icons: Bookmark + Note */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setShowNoteEditor(!showNoteEditor);
            }}
            className={`p-2 rounded-lg border transition ${
              progress.notes[question.id]
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-200 dark:border-amber-800'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Add private question note"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              toggleBookmark(question.id);
            }}
            className={`p-2 rounded-lg border transition ${
              bookmarked
                ? 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 border-pink-200 dark:border-pink-800'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* User Note Editor (Drawer) */}
      {showNoteEditor && (
        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
            <span>Personal Note for Question #{index + 1}:</span>
            {savedNoteSuccess && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Type your personal mnemonic, shortcut, or note for this question..."
            rows={2}
            className="w-full p-2.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNoteEditor(false)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              className="px-3 py-1 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Question Text */}
      <div className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
        {question.question}
      </div>

      {/* Code Snippet if applicable */}
      {question.codeSnippet && (
        <pre className="p-3.5 rounded-xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800">
          <code>{question.codeSnippet}</code>
        </pre>
      )}

      {/* 4 Interactive Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {question.options.map((opt, optIdx) => {
          let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200';

          if (isRevealed) {
            if (optIdx === question.correctAnswer) {
              btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500';
            } else if (optIdx === selectedOption) {
              btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 ring-1 ring-rose-500';
            } else {
              btnStyle = 'border-slate-200 dark:border-slate-800 opacity-60 text-slate-400';
            }
          }

          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(optIdx)}
              className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${btnStyle}`}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                isRevealed && optIdx === question.correctAnswer
                  ? 'bg-emerald-500 text-white'
                  : isRevealed && optIdx === selectedOption
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="leading-snug">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Answer Explanation & Concept Pill */}
      {isRevealed && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            {selectedOption === question.correctAnswer ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Correct Answer! (+1 point)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <XCircle className="w-4 h-4" /> Incorrect — Correct option is {String.fromCharCode(65 + question.correctAnswer)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {question.explanation}
          </p>

          {question.keyFormulaOrNote && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-mono text-indigo-700 dark:text-indigo-300">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>{question.keyFormulaOrNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
