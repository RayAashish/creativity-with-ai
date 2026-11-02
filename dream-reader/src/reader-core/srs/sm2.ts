import { SRSState } from '../../types';

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewRatingOption {
  grade: ReviewGrade;
  label: string;
  sublabel: string;
  colorClass: string;
}

export const REVIEW_RATINGS: ReviewRatingOption[] = [
  { grade: 1, label: 'Again', sublabel: '< 1 day', colorClass: 'bg-red-500 hover:bg-red-600 text-white' },
  { grade: 2, label: 'Hard', sublabel: '1 day', colorClass: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { grade: 4, label: 'Good', sublabel: 'Optimal', colorClass: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  { grade: 5, label: 'Easy', sublabel: 'Mastered', colorClass: 'bg-sky-500 hover:bg-sky-600 text-white' },
];

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm.
 * Computes interval, repetition count, and ease factor based on recall performance grade (0-5).
 */
export function calculateSM2(
  currentState: SRSState = {
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
  },
  grade: ReviewGrade
): SRSState {
  let { interval, repetition, easeFactor } = currentState;

  if (grade >= 3) {
    // Correct recall
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    // Incorrect recall: restart repetition cycle
    repetition = 0;
    interval = 1;
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  easeFactor = Math.max(1.3, Number((easeFactor + delta).toFixed(3)));

  // Calculate next review date (now + interval days)
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    interval,
    repetition,
    easeFactor,
    nextReviewDate: nextDate.toISOString(),
    lastReviewedAt: new Date().toISOString(),
  };
}

/**
 * Checks if a vocabulary entry is due for review today.
 */
export function isCardDueForReview(srsState?: SRSState): boolean {
  if (!srsState || !srsState.nextReviewDate) return true;
  return new Date(srsState.nextReviewDate).getTime() <= Date.now();
}
