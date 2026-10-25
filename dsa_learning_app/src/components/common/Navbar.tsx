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
  Check,
  Coffee
} from 'lucide-react';

export type NavTab = 'sheet' | 'games' | 'learning' | 'dashboard';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  streak: number;
  totalDone: number;
  totalQuestions: number;
  onQuickRoulette: () => void;
  onOpenBuyCoffee?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  streak,
  totalDone,
  totalQuestions,
  onQuickRoulette,
  onOpenBuyCoffee,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const navItems = [
    { 
      id: 'sheet' as NavTab, 
      label: '450 Sheet', 
      fullLabel: 'Love Babbar 450', 
      icon: CheckSquare,
      badge: `${totalDone}/${totalQuestions}`
    },
    { 
      id: 'learning' as NavTab, 
      label: 'Academy', 
      fullLabel: 'Concept Academy', 
      icon: BookOpen,
      highlight: true
    },
    { 
      id: 'games' as NavTab, 
      label: 'Games', 
      fullLabel: 'Algo Games', 
      icon: Gamepad2,
      badge: 'Play'
    },
    { 
      id: 'dashboard' as NavTab, 
      label: 'Analytics', 
      fullLabel: 'Progress Analytics', 
      icon: BarChart3 
    },
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
    <header className="sticky top-0 z-40 bg-[#08090d]/80 backdrop-blur-xl border-b border-white/[0.08] w-full transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectTab('sheet')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[1px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0a0c14] rounded-[11px] flex items-center justify-center">
                <Rocket className="w-4 h-4 text-cyan-400 group-hover:text-indigo-400 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  DSA<span className="text-cyan-400 font-bold">Space</span>
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-white/[0.06] text-zinc-300 border border-white/[0.08] rounded">
                  450
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block font-medium leading-none mt-0.5">
                Learn, Play & Master DSA
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm border border-white/10 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400 group-hover:text-white" />
                  <span>
                    <span className="hidden xl:inline">{item.fullLabel}</span>
                    <span className="xl:hidden">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-zinc-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Roulette, Buy Coffee, Share & Streak */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Roulette Button */}
            <button
              type="button"
              onClick={onQuickRoulette}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.08] hover:border-cyan-500/40 rounded-xl text-xs font-medium transition active:scale-95 shadow-sm group"
              title="Roll a random question right now"
            >
              <Dice5 className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform duration-200" />
              <span className="hidden sm:inline">Random Q</span>
            </button>

            {/* Buy Me a Coffee Button */}
            {onOpenBuyCoffee && (
              <button
                type="button"
                onClick={onOpenBuyCoffee}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] text-amber-300 border border-amber-500/25 hover:border-amber-400/40 rounded-xl text-xs font-medium transition active:scale-95 shadow-sm group"
                title="Support DSASpace with a Coffee"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden md:inline">Buy Coffee</span>
              </button>
            )}

            {/* Share / Copy Domain Link */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white border border-white/[0.08] rounded-xl text-xs font-medium transition"
              title="Copy DSASpace link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs hidden lg:inline">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden lg:inline text-xs">Share</span>
                </>
              )}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl text-xs font-semibold text-amber-400 font-mono">
              <Flame className="w-3.5 h-3.5 fill-amber-500/30 text-amber-400" />
              <span>{streak}d</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-white/[0.06]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
