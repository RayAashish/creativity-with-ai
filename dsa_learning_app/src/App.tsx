import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/common/Navbar';
import { Dsa450Sheet } from './components/sheet/Dsa450Sheet';
import { GamesHub } from './components/games/GamesHub';
import { LearningHub } from './components/learning/LearningHub';
import { ProgressDashboard } from './components/dashboard/ProgressDashboard';
import { RandomQuestionModal } from './components/sheet/RandomQuestionModal';
import { 
  getStoredProgress, 
  saveStoredProgress, 
  pickRandomQuestion 
} from './utils/storage';
import { QUESTIONS_450 } from './data/questions450';
import { Question, Topic, UserProgress } from './types/dsa';
import confetti from 'canvas-confetti';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('sheet');
  const [progress, setProgress] = useState<UserProgress>(getStoredProgress());

  // Global Quick Roulette Modal
  const [isQuickRouletteOpen, setIsQuickRouletteOpen] = useState<boolean>(false);
  const [quickRouletteData, setQuickRouletteData] = useState<{
    question: Question | null;
    totalRemaining: number;
    totalInPool: number;
  }>({ question: null, totalRemaining: 0, totalInPool: 0 });
  const [quickRouletteTopic, setQuickRouletteTopic] = useState<Topic | 'all'>('all');

  // Sync progress to localStorage whenever it changes
  useEffect(() => {
    saveStoredProgress(progress);
  }, [progress]);

  // Handle Done Toggle
  const handleToggleDone = (questionId: string) => {
    setProgress((prev) => {
      const nextDone = { ...prev.doneQuestions };
      if (nextDone[questionId]) {
        delete nextDone[questionId];
      } else {
        nextDone[questionId] = true;
      }
      return {
        ...prev,
        doneQuestions: nextDone,
      };
    });
  };

  // Handle Star Toggle
  const handleToggleStar = (questionId: string) => {
    setProgress((prev) => {
      const nextStarred = { ...prev.starredQuestions };
      if (nextStarred[questionId]) {
        delete nextStarred[questionId];
      } else {
        nextStarred[questionId] = true;
      }
      return {
        ...prev,
        starredQuestions: nextStarred,
      };
    });
  };

  // Handle Note Save
  const handleSaveNote = (questionId: string, note: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [questionId]: note,
      },
    }));
  };

  // Trigger Global Quick Roulette
  const handleQuickRoulette = () => {
    const res = pickRandomQuestion(QUESTIONS_450, progress.doneQuestions, quickRouletteTopic, false);
    setQuickRouletteData(res);
    setIsQuickRouletteOpen(true);
  };

  // Reset Progress
  const handleResetProgress = () => {
    const fresh: UserProgress = {
      doneQuestions: {},
      starredQuestions: {},
      notes: {},
      lastActiveDate: new Date().toISOString(),
      streak: 1,
    };
    setProgress(fresh);
  };

  // Import Progress
  const handleImportProgress = (imported: UserProgress) => {
    setProgress(imported);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {
      console.error(e);
    }
  };

  const totalDone = Object.values(progress.doneQuestions).filter(Boolean).length;
  const totalQuestions = QUESTIONS_450.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        streak={progress.streak}
        totalDone={totalDone}
        totalQuestions={totalQuestions}
        onQuickRoulette={handleQuickRoulette}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'sheet' && (
          <Dsa450Sheet
            doneMap={progress.doneQuestions}
            starredMap={progress.starredQuestions}
            notesMap={progress.notes}
            onToggleDone={handleToggleDone}
            onToggleStar={handleToggleStar}
            onSaveNote={handleSaveNote}
          />
        )}

        {activeTab === 'games' && <GamesHub />}

        {activeTab === 'learning' && (
          <LearningHub
            onNavigateToGames={() => setActiveTab('games')}
            onNavigateToSheet={() => setActiveTab('sheet')}
          />
        )}

        {activeTab === 'dashboard' && (
          <ProgressDashboard
            progress={progress}
            onImportProgress={handleImportProgress}
            onResetProgress={handleResetProgress}
            onNavigateToSheet={() => setActiveTab('sheet')}
          />
        )}
      </main>

      {/* Global Quick Roulette Modal */}
      <RandomQuestionModal
        isOpen={isQuickRouletteOpen}
        onClose={() => setIsQuickRouletteOpen(false)}
        question={quickRouletteData.question}
        totalRemaining={quickRouletteData.totalRemaining}
        totalInPool={quickRouletteData.totalInPool}
        currentTopic={quickRouletteTopic}
        onRollNew={(topic, includeDone) => {
          const res = pickRandomQuestion(QUESTIONS_450, progress.doneQuestions, topic, includeDone);
          setQuickRouletteData(res);
        }}
        onToggleDone={handleToggleDone}
        isDone={quickRouletteData.question ? Boolean(progress.doneQuestions[quickRouletteData.question.id]) : false}
        onSelectTopic={(topic) => setQuickRouletteTopic(topic)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AlgoMaster Pro • Ultimate DSA Interview Preparation & 450 Sheet Platform</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Direct links to LeetCode & GeeksforGeeks</span>
            <span className="text-cyan-500 font-mono">100% Offline Local Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
