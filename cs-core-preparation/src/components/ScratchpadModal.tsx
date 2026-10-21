import React, { useState, useEffect } from 'react';
import { PenTool, X, Trash2, Copy, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'cs_mastery_scratchpad_content';

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setNote(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    localStorage.setItem(STORAGE_KEY, e.target.value);
  };

  const handleClear = () => {
    sounds.playClick();
    if (window.confirm('Clear all rough work notes?')) {
      setNote('');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Candidate Scratchpad & Rough Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Scratch work persists automatically across mocks and questions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              title="Copy notes"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
              title="Clear scratchpad"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 flex-1 flex flex-col">
          <textarea
            value={note}
            onChange={handleChange}
            placeholder="Type formulas, trace Gantt charts, write SQL snippets, or scratch calculations here... (e.g., EMAT = 0.9 * 110 + 0.1 * 210 = 120 ns)"
            className="w-full flex-1 min-h-[300px] p-4 font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>{note.length} characters written</span>
          <span>Tip: Press ESC or click outside to save and dismiss</span>
        </div>
      </div>
    </div>
  );
};
