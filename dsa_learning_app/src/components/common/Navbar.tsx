import React, { useState } from 'react';
import { 
  Rocket, 
  Gamepad2, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  Flame, 
  Dice5,
  Share2,
  Check
} from 'lucide-react';

export type NavTab = 'sheet' | 'games' | 'learning' | 'dashboard';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  streak: number;
  totalDone: number;
  totalQuestions: number;
  onQuickRoulette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  streak,
  totalDone,
  totalQuestions,
  onQuickRoulette,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const navItems = [
    { id: 'sheet' as NavTab, label: '450 DSA Sheet', icon: CheckSquare, badge: `${totalDone}/${totalQuestions}` },
    { id: 'games' as NavTab, label: 'DSA Games Arcade', icon: Gamepad2, highlight: true },
    { id: 'learning' as NavTab, label: 'Concept Academy', icon: BookOpen },
    { id: 'dashboard' as NavTab, label: 'Progress & Stats', icon: BarChart3 },
  ];

  const handleShare = () => {
    const siteUrl = 'https://dsaspace.vercel.app';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(siteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectTab('sheet')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-white tracking-tight">
                  DSA<span className="text-cyan-400">Space</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-md">
                  450
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                dsaspace.vercel.app • Learn, Play & Master DSA
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Roulette, Share & Streak */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Roulette Button */}
            <button
              onClick={onQuickRoulette}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm"
              title="Roll a random question right now"
            >
              <Dice5 className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Random Q</span>
            </button>

            {/* Share / Copy Domain Link */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition"
              title="Copy DSASpace link (dsaspace.vercel.app)"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500/20" />
              <span>{streak}d</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
