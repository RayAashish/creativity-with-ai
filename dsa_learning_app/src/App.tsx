import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/common/Navbar';
import { Dsa450Sheet } from './components/sheet/Dsa450Sheet';
import { GamesHub } from './components/games/GamesHub';
import { LearningHub } from './components/learning/LearningHub';
import { ProgressDashboard } from './components/dashboard/ProgressDashboard';
import { RandomQuestionModal } from './components/sheet/RandomQuestionModal';
import { BuyMeCoffeeModal } from './components/common/BuyMeCoffeeModal';
import { ThemeBackgroundCanvas } from './components/common/ThemeBackgroundCanvas';
import { 
  getStoredProgress, 
  saveStoredProgress, 
  pickRandomQuestion,
  setProblemStatus,
  advanceSpacedRevision,
  markDailyChallengeDone,
  getProblemStatus
} from './utils/storage';
import { QUESTIONS_450 } from './data/questions450';
import { Question, Topic, UserProgress, ProblemStatus } from './types/dsa';
import confetti from 'canvas-confetti';
import { Globe, Heart, Coffee } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('sheet');
  const [progress, setProgress] = useState<UserProgress>(getStoredProgress());
  const [isBuyCoffeeOpen, setIsBuyCoffeeOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('dsaspace_theme_v1') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    try {
      localStorage.setItem('dsaspace_theme_v1', currentTheme);
    } catch (e) {
      // ignore
    }
  }, [currentTheme]);

  const [isQuickRouletteOpen, setIsQuickRouletteOpen] = useState<boolean>(false);
  const [quickRouletteData, setQuickRouletteData] = useState<{
    question: Question | null;
    totalRemaining: number;
    totalInPool: number;
  }>({ question: null, totalRemaining: 0, totalInPool: 0 });
  const [quickRouletteTopic, setQuickRouletteTopic] = useState<Topic | 'all'>('all');

  useEffect(() => {
    saveStoredProgress(progress);
  }, [progress]);

  const handleToggleDone = (questionId: string) => {
    setProgress((prev) => {
      const current = getProblemStatus(prev, questionId);
      const nextStatus: ProblemStatus = current === 'solved' ? 'not_started' : 'solved';
      return setProblemStatus(prev, questionId, nextStatus);
    });
  };

  const handleSetProblemStatus = (questionId: string, status: ProblemStatus) => {
    setProgress((prev) => setProblemStatus(prev, questionId, status));
  };

  const handleAdvanceRevision = (questionId: string) => {
    setProgress((prev) => advanceSpacedRevision(prev, questionId));
  };

  const handleToggleDailyChallenge = (questionId: string) => {
    setProgress((prev) => markDailyChallengeDone(prev, questionId));
  };

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

  const handleSaveNote = (questionId: string, note: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [questionId]: note,
      },
    }));
  };

  const handleQuickRoulette = () => {
    const res = pickRandomQuestion(QUESTIONS_450, progress.doneQuestions, quickRouletteTopic, false);
    setQuickRouletteData(res);
    setIsQuickRouletteOpen(true);
  };

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
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative w-full overflow-x-hidden">
      {/* Portfolio-Style Ambient Motion Canvas (Sakura petals, embers, aurora, matrix, ocean, constellations) */}
      <ThemeBackgroundCanvas currentTheme={currentTheme} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          streak={totalDone === 0 ? 0 : progress.streak}
          totalDone={totalDone}
          totalQuestions={totalQuestions}
          onQuickRoulette={handleQuickRoulette}
          onOpenBuyCoffee={() => setIsBuyCoffeeOpen(true)}
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
        />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'sheet' && (
          <Dsa450Sheet
            progress={progress}
            doneMap={progress.doneQuestions}
            starredMap={progress.starredQuestions}
            notesMap={progress.notes}
            onToggleDone={handleToggleDone}
            onSetProblemStatus={handleSetProblemStatus}
            onToggleStar={handleToggleStar}
            onSaveNote={handleSaveNote}
            onAdvanceRevision={handleAdvanceRevision}
            onToggleDailyChallenge={handleToggleDailyChallenge}
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
            onOpenBuyCoffee={() => setIsBuyCoffeeOpen(true)}
          />
        )}
      </main>

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

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-200">
              DSA<span className="text-cyan-400">Space</span>
            </span>
            <span className="text-slate-700">•</span>
            <a 
              href="https://dsaspace.vercel.app" 
              target="_blank" 
              rel="noreferrer" 
              className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>dsaspace.vercel.app</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button
              onClick={() => setIsBuyCoffeeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm shadow-amber-500/10 group"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Buy Me a Coffee ☕</span>
            </button>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Direct Jump to LeetCode & GFG</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-cyan-400 font-mono">100% Offline Storage</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for DSA Learners
            </span>
          </div>
        </div>
      </footer>

      <BuyMeCoffeeModal
        isOpen={isBuyCoffeeOpen}
        onClose={() => setIsBuyCoffeeOpen(false)}
      />
      </div>
    </div>
  );
}

export default App;
