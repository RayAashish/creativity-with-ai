import React from 'react';
import {
  Compass,
  BookOpen,
  CheckCircle2,
  Timer,
  Layers,
  Bookmark,
  Volume2,
  VolumeX,
  Flame,
  Calculator,
  PenTool
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { useProgress } from '../context/ProgressContext';
import { sounds } from '../utils/soundEffects';

export type NavTab = 'dashboard' | 'learning' | 'practice' | 'mock' | 'flashcards' | 'mistakes';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenCalc: () => void;
  onOpenScratchpad: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCalc,
  onOpenScratchpad
}) => {
  const { progress } = useProgress();
  const [isMuted, setIsMuted] = React.useState(sounds.getMuted());

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass className="w-4 h-4" /> },
    { id: 'learning', label: 'Learning Hub', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'practice', label: 'Question Bank', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'mock', label: 'Mock Tests', icon: <Timer className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'mistakes',
      label: 'Mistake Notebook',
      icon: <Bookmark className="w-4 h-4" />,
      badge: progress.mistakeNotebook.length > 0 ? progress.mistakeNotebook.length : undefined
    }
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => {
              sounds.playClick();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg">⚡</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
                  CoreCS Mastery
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  GATE & TCS Prep
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                DSA • Networks • OOPs • DBMS • OS • Aptitude
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Streak, Calc, Scratchpad, Sound, Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold shadow-sm"
              title={`${progress.streak} Day Active Practice Streak!`}
            >
              <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>{progress.streak}d Streak</span>
            </div>

            {/* Quick Virtual Calculator */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenCalc();
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Open Virtual Scientific Calculator"
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Quick Candidate Scratchpad */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenScratchpad();
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Open Scratchpad / Notes"
            >
              <PenTool className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* 5 Themes Switcher */}
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Nav Scroller */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(item.id);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                active
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-1 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
