import React, { useState } from 'react';
import { SubjectId, Flashcard } from '../../types';
import { FLASHCARDS } from '../../data/flashcards';
import { SUBJECTS } from '../../data/subjects';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  XCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const FlashcardDeck: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  const filteredCards = selectedSubject === 'all'
    ? FLASHCARDS
    : FLASHCARDS.filter(fc => fc.subject === selectedSubject);

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];

  const handleFlip = () => {
    sounds.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    sounds.playClick();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    sounds.playClick();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    sounds.playClick();
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * filteredCards.length));
  };

  const markMastered = () => {
    sounds.playCorrect();
    if (currentCard && !masteredIds.includes(currentCard.id)) {
      setMasteredIds([...masteredIds, currentCard.id]);
    }
    handleNext();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Recall Revision System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          High-Yield CS Flashcards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Flip cards to test your recall on time complexities, protocol port numbers, normal forms, and formulas.
        </p>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            sounds.playClick();
            setSelectedSubject('all');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            selectedSubject === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All Cards ({FLASHCARDS.length})
        </button>
        {SUBJECTS.map(s => {
          const count = FLASHCARDS.filter(fc => fc.subject === s.id).length;
          const active = selectedSubject === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                sounds.playClick();
                setSelectedSubject(s.id);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {s.shortName} ({count})
            </button>
          );
        })}
      </div>

      {currentCard ? (
        <div className="space-y-4">
          {/* Card Meta & Progress */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
            <span>Card {currentIndex + 1} of {filteredCards.length}</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{masteredIds.length} Mastered</span>
            </span>
          </div>

          {/* Interactive Flip Card Container */}
          <div
            onClick={handleFlip}
            className="w-full min-h-[320px] rounded-3xl p-8 cursor-pointer shadow-lg hover:shadow-2xl transition-all border border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {currentCard.subject.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">
                  {currentCard.topic}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-500 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                <span>Click to Flip</span>
              </span>
            </div>

            {/* Card Content (Front vs Back) */}
            <div className="py-8 text-center">
              {!isFlipped ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Question / Prompt:
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in zoom-in-95 duration-150">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block">
                    Answer & Recall Concept:
                  </span>
                  <div className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line font-mono bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    {currentCard.back}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="capitalize">{currentCard.difficulty} Difficulty</span>
              <span>{isFlipped ? 'Side B (Answer)' : 'Side A (Prompt)'}</span>
            </div>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition shadow-sm"
                title="Shuffle Flashcards"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={markMastered}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Mastered</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">
          No flashcards available for this filter.
        </div>
      )}
    </div>
  );
};
