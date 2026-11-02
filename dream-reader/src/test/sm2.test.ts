import { describe, it, expect } from 'vitest';
import { calculateSM2, isCardDueForReview } from '../reader-core/srs/sm2';
import { SRSState } from '../types';

describe('Spaced Repetition SM-2 Algorithm', () => {
  const initialState: SRSState = {
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
  };

  it('schedules 1 day for first successful review (Grade 4 - Good)', () => {
    const next = calculateSM2(initialState, 4);
    expect(next.repetition).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBe(2.5); // 2.5 + (0.1 - 1 * 0.1) = 2.5
  });

  it('schedules 6 days for second successful review', () => {
    const state1 = calculateSM2(initialState, 4);
    const state2 = calculateSM2(state1, 4);

    expect(state2.repetition).toBe(2);
    expect(state2.interval).toBe(6);
  });

  it('multiplies interval by ease factor on third successful review', () => {
    const state1 = calculateSM2(initialState, 4);
    const state2 = calculateSM2(state1, 4);
    const state3 = calculateSM2(state2, 5); // Easy

    expect(state3.repetition).toBe(3);
    expect(state3.interval).toBe(Math.round(6 * state2.easeFactor));
    expect(state3.easeFactor).toBeGreaterThan(state2.easeFactor);
  });

  it('resets repetition count to 0 if card is forgotten (Grade 1 - Again)', () => {
    const advancedState: SRSState = {
      interval: 15,
      repetition: 4,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
    };

    const failed = calculateSM2(advancedState, 1);
    expect(failed.repetition).toBe(0);
    expect(failed.interval).toBe(1);
    expect(failed.easeFactor).toBeLessThan(2.5);
    expect(failed.easeFactor).toBeGreaterThanOrEqual(1.3); // minimum threshold
  });

  it('determines card due status correctly', () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const futureDate = new Date(Date.now() + 86400000 * 2).toISOString();

    expect(isCardDueForReview({ interval: 1, repetition: 0, easeFactor: 2.5, nextReviewDate: pastDate })).toBe(true);
    expect(isCardDueForReview({ interval: 1, repetition: 0, easeFactor: 2.5, nextReviewDate: futureDate })).toBe(false);
  });
});
