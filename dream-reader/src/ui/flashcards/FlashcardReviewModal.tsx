import React, { useState } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Flame,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useVocabStore } from '../../stores/vocab-store';
import { calculateSM2, isCardDueForReview, ReviewGrade, REVIEW_RATINGS } from '../../reader-core/srs/sm2';
import { lookupService } from '../../lookup/lookup-service';
import { vocabRepository } from '../../storage/VocabRepository';
import { insightsService } from '../../services/insights-service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FlashcardReviewModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { vocabEntries, loadVocab } = useVocabStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  if (!isOpen) return null;

  // Filter due cards
  const dueCards = vocabEntries.filter((v) => isCardDueForReview(v.srsState));
  const activeDeck = dueCards.length > 0 ? dueCards : vocabEntries;
  const currentCard = activeDeck[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (grade: ReviewGrade) => {
    if (!currentCard) return;

    // Calculate new SM-2 state
    const nextSRS = calculateSM2(currentCard.srsState, grade);

    // Save to database
    await vocabRepository.saveVocab({
      ...currentCard,
      srsState: nextSRS,
    });

    await insightsService.recordCardReviewed();
    setReviewedCount((prev) => prev + 1);

    if (currentIndex + 1 < activeDeck.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionCompleted(true);
      await loadVocab();
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setReviewedCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">
                Spaced Repetition Flashcards
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                SuperMemo-2 (SM-2) Daily Vocabulary Retention
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

        {/* Content */}
        <div className="p-6">
          {sessionCompleted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                  Daily Review Completed!
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  You reviewed <strong>{reviewedCount}</strong> card(s) today.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold text-xs border border-orange-200 dark:border-orange-900/60">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>Daily Streak Active!</span>
              </div>

              <div className="pt-4 flex items-center justify-center gap-2">
                <button
                  onClick={resetSession}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200"
                >
                  Review Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Done
                </button>
              </div>
            </div>
          ) : activeDeck.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-zinc-800 text-amber-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-zinc-100 text-base">
                No vocabulary saved yet
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                Double-click or select any English word while reading to save it to your vocabulary deck!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
                <span>
                  Card {currentIndex + 1} of {activeDeck.length}
                </span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {dueCards.length > 0 ? `${dueCards.length} due today` : 'Reviewing all cards'}
                </span>
              </div>

              {/* 3D Flashcard */}
              <div
                onClick={handleFlip}
                className="w-full min-h-[220px] rounded-2xl border-2 border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 p-6 flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-all select-none shadow-sm relative group"
              >
                {!isFlipped ? (
                  // Front side
                  <div className="flex flex-col items-center justify-center text-center my-auto space-y-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-zinc-100 capitalize">
                        {currentCard.word}
                      </h2>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          lookupService.speak(currentCard.word);
                        }}
                        title="Listen to pronunciation"
                        className="p-1 text-gray-400 hover:text-amber-600 rounded"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    {currentCard.meanings.devanagariPhonetic && (
                      <span className="text-sm px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium">
                        {currentCard.meanings.devanagariPhonetic}
                      </span>
                    )}

                    {currentCard.sourceSentence && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 italic max-w-md mt-2">
                        "{currentCard.sourceSentence}"
                      </p>
                    )}

                    <span className="text-[11px] text-gray-400 pt-3">
                      Click to flip & see Hindi / Nepali meaning →
                    </span>
                  </div>
                ) : (
                  // Back side
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-2">
                      <span className="font-bold text-base text-gray-900 dark:text-zinc-100 capitalize">
                        {currentCard.word}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-600 uppercase">
                        {currentCard.meanings.senses[0]?.partOfSpeech || 'Word'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {currentCard.meanings.senses[0]?.hindi && (
                        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-zinc-800 border border-orange-100 dark:border-zinc-700">
                          <span className="text-[10px] font-bold text-orange-600 block mb-0.5">
                            HINDI (हिंदी)
                          </span>
                          <p className="font-semibold text-gray-800 dark:text-zinc-200">
                            {currentCard.meanings.senses[0].hindi.join('; ')}
                          </p>
                        </div>
                      )}

                      {currentCard.meanings.senses[0]?.nepali && (
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700">
                          <span className="text-[10px] font-bold text-blue-600 block mb-0.5">
                            NEPALI (नेपाली)
                          </span>
                          <p className="font-semibold text-gray-800 dark:text-zinc-200">
                            {currentCard.meanings.senses[0].nepali.join('; ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {currentCard.meanings.senses[0]?.englishDefinition && (
                      <p className="text-xs text-gray-600 dark:text-zinc-400 italic">
                        "{currentCard.meanings.senses[0].englishDefinition}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SM-2 Recall Rating Buttons */}
              {isFlipped ? (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {REVIEW_RATINGS.map((rate) => (
                    <button
                      key={rate.label}
                      onClick={() => handleRate(rate.grade)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-transform hover:scale-[1.02] shadow-xs ${rate.colorClass}`}
                    >
                      <span>{rate.label}</span>
                      <span className="text-[10px] opacity-80">{rate.sublabel}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={handleFlip}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Show Answer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
