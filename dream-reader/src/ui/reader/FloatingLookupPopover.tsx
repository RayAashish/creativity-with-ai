import React, { useEffect, useRef } from 'react';
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  X,
  Loader2,
  Copy,
  Check,
  Languages,
} from 'lucide-react';
import { useLookupStore } from '../../stores/lookup-store';
import { useVocabStore } from '../../stores/vocab-store';
import { useReaderStore } from '../../stores/reader-store';
import { lookupService } from '../../lookup/lookup-service';
import { TargetLanguage } from '../../types';
import { HighlightingControls } from './HighlightingControls';
import { ExplainThisModal } from './ExplainThisModal';
import { Sparkles } from 'lucide-react';

export const FloatingLookupPopover: React.FC = () => {
  const {
    isOpen,
    text,
    sourceSentence,
    anchor,
    coords,
    result,
    isLoading,
    error,
    selectedLang,
    closeLookup,
    setSelectedLang,
  } = useLookupStore();

  const { isWordSaved, saveWord, removeWord, vocabEntries } = useVocabStore();
  const { activeDocument } = useReaderStore();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [showExplainModal, setShowExplainModal] = React.useState(false);

  // Close on outside click with mobile touch / tablet selection grace period
  useEffect(() => {
    if (!isOpen) return;

    let isReady = false;
    const readyTimer = setTimeout(() => {
      isReady = true;
    }, 350);

    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      if (!isReady) return;
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closeLookup();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLookup();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(readyTimer);
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeLookup]);

  if (!isOpen) return null;

  const isSaved = isWordSaved(text);
  const isWordResult = result?.type === 'word';
  const wordData = isWordResult ? result.data : null;
  const sentenceData = result?.type === 'sentence' ? result.data : null;

  const handleToggleSave = async () => {
    if (isSaved) {
      const existing = vocabEntries.find(
        (v) => v.word.toLowerCase() === text.toLowerCase().trim()
      );
      if (existing) {
        await removeWord(existing.id);
      }
    } else {
      if (wordData) {
        await saveWord(text, wordData, sourceSentence, activeDocument?.id, anchor);
      } else if (sentenceData) {
        // Save phrase as vocabulary entry
        await saveWord(
          text,
          {
            word: text,
            senses: [
              {
                partOfSpeech: 'phrase',
                hindi: sentenceData.hindi ? [sentenceData.hindi] : [],
                nepali: sentenceData.nepali ? [sentenceData.nepali] : [],
                englishDefinition: text,
                exampleSentence: sourceSentence,
              },
            ],
          },
          sourceSentence,
          activeDocument?.id,
          anchor
        );
      }
    }
  };

  const handleCopy = async (str: string) => {
    await navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={popoverRef}
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        transform: coords.placement === 'above' ? 'translateY(-100%)' : 'none',
      }}
      className="fixed z-50 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 select-text"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <Languages className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm truncate">
            {text}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Audio Pronunciation */}
          <button
            onClick={() => lookupService.speak(text)}
            title="Listen to English pronunciation"
            className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Bookmark Word */}
          <button
            onClick={handleToggleSave}
            title={isSaved ? 'Saved to Vocabulary (Click to remove)' : 'Save to Vocabulary'}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={closeLookup}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Highlighting & Annotating Controls */}
      {activeDocument && (
        <HighlightingControls
          docId={activeDocument.id}
          anchor={anchor}
          onAnnotated={() => {}}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-xs">Finding meaning & translation...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="py-4 text-xs text-red-500 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Word Result View */}
      {!isLoading && wordData && (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {/* Phonetics */}
          {(wordData.phonetic || wordData.devanagariPhonetic) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              {wordData.phonetic && <span className="font-mono">{wordData.phonetic}</span>}
              {wordData.devanagariPhonetic && (
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-medium text-amber-700 dark:text-amber-400 text-[11px]">
                  {wordData.devanagariPhonetic}
                </span>
              )}
            </div>
          )}

          {/* Senses */}
          {wordData.senses.map((sense, idx) => (
            <div key={idx} className="space-y-2 text-xs">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {sense.partOfSpeech}
              </span>

              {/* Hindi Meanings */}
              {(selectedLang === 'hi' || selectedLang === 'both') && (
                <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-zinc-800/40 border border-orange-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block mb-0.5">
                    HINDI (हिंदी)
                  </span>
                  <p className="text-gray-900 dark:text-zinc-100 font-medium leading-relaxed">
                    {sense.hindi.join('; ')}
                  </p>
                </div>
              )}

              {/* Nepali Meanings */}
              {(selectedLang === 'ne' || selectedLang === 'both') && (
                <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-zinc-800/40 border border-blue-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                    NEPALI (नेपाली)
                  </span>
                  <p className="text-gray-900 dark:text-zinc-100 font-medium leading-relaxed">
                    {sense.nepali.join('; ')}
                  </p>
                </div>
              )}

              {/* English Definition */}
              {sense.englishDefinition && (
                <p className="text-gray-600 dark:text-zinc-400 text-[11px] leading-relaxed italic">
                  "{sense.englishDefinition}"
                </p>
              )}

              {/* Example Sentence */}
              {sense.exampleSentence && (
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/60 text-[11px] text-gray-700 dark:text-zinc-300">
                  <span className="font-semibold text-gray-500">Ex: </span>
                  <span>{sense.exampleSentence}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sentence / Machine Translation Result View */}
      {!isLoading && sentenceData && (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 text-xs">
          {/* Target language selector pills */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            {(['hi', 'ne', 'both'] as TargetLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  selectedLang === lang
                    ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800'
                }`}
              >
                {lang === 'hi' ? 'Hindi' : lang === 'ne' ? 'Nepali' : 'Both'}
              </button>
            ))}
          </div>

          {/* Hindi translation */}
          {(selectedLang === 'hi' || selectedLang === 'both') && sentenceData.hindi && (
            <div className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-zinc-800/40 border border-orange-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  HINDI TRANSLATION
                </span>
                <button
                  onClick={() => handleCopy(sentenceData.hindi!)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  title="Copy translation"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-gray-900 dark:text-zinc-100 font-medium leading-relaxed">
                {sentenceData.hindi}
              </p>
            </div>
          )}

          {/* Nepali translation */}
          {(selectedLang === 'ne' || selectedLang === 'both') && sentenceData.nepali && (
            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-zinc-800/40 border border-blue-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  NEPALI TRANSLATION
                </span>
                <button
                  onClick={() => handleCopy(sentenceData.nepali!)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  title="Copy translation"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-gray-900 dark:text-zinc-100 font-medium leading-relaxed">
                {sentenceData.nepali}
              </p>
            </div>
          )}

          <div className="text-[10px] text-gray-400 dark:text-zinc-500 text-right">
            via {sentenceData.provider}
          </div>
        </div>
      )}

      {/* Bottom Footer: Bookmark CTA & Explain */}
      <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <button
          onClick={() => setShowExplainModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
          title="Get AI explanation in English, Hindi, or Nepali"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Explain</span>
        </button>

        <button
          onClick={handleToggleSave}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
            isSaved
              ? 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Saved to Vocabulary' : 'Save Word'}</span>
        </button>
      </div>

      <ExplainThisModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        textToExplain={sourceSentence || text}
        anchor={anchor}
      />
    </div>
  );
};
