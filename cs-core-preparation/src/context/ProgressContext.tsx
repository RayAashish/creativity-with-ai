import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, TestResult } from '../types';

interface ProgressContextType {
  progress: UserProgress;
  toggleBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;
  recordQuestionAttempt: (questionId: string, isCorrect: boolean, selectedOption: number) => void;
  saveTestResult: (result: TestResult) => void;
  removeFromMistakeNotebook: (questionId: string) => void;
  clearMistakeNotebook: () => void;
  saveNote: (questionId: string, note: string) => void;
  resetProgress: () => void;
}

const STORAGE_KEY = 'cs_mastery_user_progress_v1';

const defaultProgress: UserProgress = {
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalQuestionsSolved: 0,
  totalCorrect: 0,
  bookmarks: [],
  mistakeNotebook: [],
  testHistory: [],
  notes: {}
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // check streak logic
        const today = new Date().toISOString().split('T')[0];
        const lastDate = parsed.lastActiveDate;
        if (lastDate) {
          const diffDays = Math.floor(
            (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            parsed.streak = (parsed.streak || 0) + 1;
            parsed.lastActiveDate = today;
          } else if (diffDays > 1) {
            parsed.streak = 1;
            parsed.lastActiveDate = today;
          }
        } else {
          parsed.lastActiveDate = today;
          parsed.streak = 1;
        }
        return { ...defaultProgress, ...parsed };
      }
    } catch {
      // fallback
    }
    return defaultProgress;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to persist progress to localStorage', e);
    }
  }, [progress]);

  const toggleBookmark = (questionId: string) => {
    setProgress(prev => {
      const exists = prev.bookmarks.includes(questionId);
      const newBookmarks = exists
        ? prev.bookmarks.filter(id => id !== questionId)
        : [...prev.bookmarks, questionId];
      return { ...prev, bookmarks: newBookmarks };
    });
  };

  const isBookmarked = (questionId: string) => {
    return progress.bookmarks.includes(questionId);
  };

  const recordQuestionAttempt = (questionId: string, isCorrect: boolean, selectedOption: number) => {
    setProgress(prev => {
      const newTotal = prev.totalQuestionsSolved + 1;
      const newCorrect = isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect;
      
      let newMistakes = [...prev.mistakeNotebook];
      if (!isCorrect) {
        const existingIdx = newMistakes.findIndex(m => m.questionId === questionId);
        if (existingIdx >= 0) {
          newMistakes[existingIdx] = {
            ...newMistakes[existingIdx],
            wrongAttemptsCount: newMistakes[existingIdx].wrongAttemptsCount + 1,
            lastAttemptedOption: selectedOption,
            addedAt: new Date().toISOString()
          };
        } else {
          newMistakes.unshift({
            questionId,
            addedAt: new Date().toISOString(),
            wrongAttemptsCount: 1,
            lastAttemptedOption: selectedOption
          });
        }
      }

      return {
        ...prev,
        totalQuestionsSolved: newTotal,
        totalCorrect: newCorrect,
        mistakeNotebook: newMistakes
      };
    });
  };

  const saveTestResult = (result: TestResult) => {
    setProgress(prev => {
      // Add any wrong answers from the test to the mistake notebook
      const newMistakes = [...prev.mistakeNotebook];
      result.questionStates.forEach(qState => {
        if (qState.selectedAnswer !== null && qState.selectedAnswer !== qState.question.correctAnswer) {
          const existingIdx = newMistakes.findIndex(m => m.questionId === qState.question.id);
          if (existingIdx >= 0) {
            newMistakes[existingIdx] = {
              ...newMistakes[existingIdx],
              wrongAttemptsCount: newMistakes[existingIdx].wrongAttemptsCount + 1,
              lastAttemptedOption: qState.selectedAnswer,
              addedAt: new Date().toISOString()
            };
          } else {
            newMistakes.unshift({
              questionId: qState.question.id,
              addedAt: new Date().toISOString(),
              wrongAttemptsCount: 1,
              lastAttemptedOption: qState.selectedAnswer
            });
          }
        }
      });

      return {
        ...prev,
        totalQuestionsSolved: prev.totalQuestionsSolved + result.attempted,
        totalCorrect: prev.totalCorrect + result.correct,
        testHistory: [result, ...prev.testHistory],
        mistakeNotebook: newMistakes
      };
    });
  };

  const removeFromMistakeNotebook = (questionId: string) => {
    setProgress(prev => ({
      ...prev,
      mistakeNotebook: prev.mistakeNotebook.filter(m => m.questionId !== questionId)
    }));
  };

  const clearMistakeNotebook = () => {
    setProgress(prev => ({ ...prev, mistakeNotebook: [] }));
  };

  const saveNote = (questionId: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      notes: { ...prev.notes, [questionId]: note }
    }));
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        toggleBookmark,
        isBookmarked,
        recordQuestionAttempt,
        saveTestResult,
        removeFromMistakeNotebook,
        clearMistakeNotebook,
        saveNote,
        resetProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
};
