import React, { useState, useEffect } from 'react';
import { X, Languages, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useReaderStore } from '../../stores/reader-store';
import { useSettingsStore } from '../../stores/settings-store';
import { getApiUrl } from '../../services/api-config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pageOrSectionText: string;
}

export const BilingualPane: React.FC<Props> = ({
  isOpen,
  onClose,
  pageOrSectionText,
}) => {
  const { settings } = useSettingsStore();
  const { currentPage, activeDocument } = useReaderStore();

  const [paragraphs, setParagraphs] = useState<
    { original: string; translation?: string; loading: boolean }[]
  >([]);
  const [lang, setLang] = useState<'hi' | 'ne'>('hi');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !pageOrSectionText.trim()) return;

    // Split text into meaningful paragraphs
    const paras = pageOrSectionText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    const initial = paras.map((p) => ({
      original: p,
      loading: true,
    }));
    setParagraphs(initial);

    // Fetch translations for paragraphs in parallel with glossary protection
    const neverTerms = settings.neverTranslateTerms || [];
    paras.forEach((p, idx) => {
      fetch(getApiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: p,
          targetLang: lang,
          contextTerms: neverTerms,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setParagraphs((prev) =>
            prev.map((item, i) =>
              i === idx
                ? {
                    ...item,
                    translation: lang === 'hi' ? data.hindi : data.nepali,
                    loading: false,
                  }
                : item
            )
          );
        })
        .catch(() => {
          setParagraphs((prev) =>
            prev.map((item, i) =>
              i === idx ? { ...item, translation: item.original, loading: false } : item
            )
          );
        });
    });
  }, [isOpen, pageOrSectionText, lang, (settings.neverTranslateTerms || []).join(',')]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <aside className="w-80 sm:w-96 h-full border-l border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex flex-col z-30 shrink-0 select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-xs">
            Bilingual Parallel Reader
          </h3>
          {activeDocument?.type === 'pdf' && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
              P. {currentPage}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Language Toggle */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-950/40 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-gray-500">Target Language:</span>
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg">
          <button
            onClick={() => setLang('hi')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              lang === 'hi'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 font-semibold shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => setLang('ne')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              lang === 'ne'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 font-semibold shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            नेपाली (Nepali)
          </button>
        </div>
      </div>

      {/* Parallel Paragraphs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/60 space-y-2 text-xs"
            >
              {/* Original English */}
              <div className="text-gray-600 dark:text-zinc-400 leading-relaxed font-sans pb-1.5 border-b border-gray-100 dark:border-zinc-800/80">
                {p.original}
              </div>

              {/* Translation */}
              <div className="text-gray-900 dark:text-zinc-100 font-medium leading-relaxed">
                {p.loading ? (
                  <div className="flex items-center gap-1.5 text-gray-400 py-1 text-[11px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    <span>Translating paragraph...</span>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p>{p.translation}</p>
                    <button
                      onClick={() => handleCopy(p.translation || '', idx)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 shrink-0"
                      title="Copy translation"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-400 text-xs space-y-2">
            <Sparkles className="w-6 h-6 mx-auto opacity-30 text-amber-500" />
            <p>Select or navigate to a page with technical text to see parallel translation.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
