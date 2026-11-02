import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Bookmark, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useReaderStore } from '../../stores/reader-store';
import { useAnnotationStore } from '../../stores/annotation-store';
import { getApiUrl } from '../../services/api-config';
import { Anchor } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  textToExplain: string;
  anchor?: Anchor;
}

export const ExplainThisModal: React.FC<Props> = ({
  isOpen,
  onClose,
  textToExplain,
  anchor,
}) => {
  const { activeDocument } = useReaderStore();
  const { createComment } = useAnnotationStore();

  const [language, setLanguage] = useState<'en' | 'hi' | 'ne'>('en');
  const [mode, setMode] = useState<'beginner' | 'standard' | 'code'>('beginner');
  const [explanation, setExplanation] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedAsNote, setSavedAsNote] = useState(false);

  useEffect(() => {
    if (!isOpen || !textToExplain.trim()) return;

    let cancelled = false;
    setIsLoading(true);
    setSavedAsNote(false);

    fetch(getApiUrl('/api/explain'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: textToExplain,
        language,
        mode,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setExplanation(data.explanation || 'No explanation returned.');
        setProvider(data.provider || 'AI Explainer');
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setExplanation(`Failed to generate explanation: ${err.message}`);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, textToExplain, language, mode]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsNote = async () => {
    if (!activeDocument || !anchor) return;
    const cleanNote = explanation.replace(/[#*`]/g, '').slice(0, 300) + '...';
    await createComment(activeDocument.id, anchor, cleanNote);
    setSavedAsNote(true);
    setTimeout(() => setSavedAsNote(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">
                "Explain This" AI Assistant
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Understand complex technical paragraphs without tab switching
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Quote Banner */}
        <div className="px-6 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-400 italic line-clamp-2">
          "{textToExplain}"
        </div>

        {/* Controls: Language and Mode */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-zinc-900">
          {/* Language Selector */}
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            {(['en', 'hi', 'ne'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  language === l
                    ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
                }`}
              >
                {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'नेपाली'}
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => setMode('beginner')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                mode === 'beginner'
                  ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setMode('standard')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                mode === 'standard'
                  ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMode('code')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                mode === 'code'
                  ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
              }`}
            >
              Code-Aware
            </button>
          </div>
        </div>

        {/* Explanation Content */}
        <div className="p-6 max-h-[380px] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs">Deconstructing concepts and analogies...</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-xs">
          <span className="text-[11px] text-gray-400">
            {provider}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {anchor && (
              <button
                onClick={handleSaveAsNote}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-xs transition-colors"
              >
                {savedAsNote ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{savedAsNote ? 'Saved to Notes!' : 'Attach as Note'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
