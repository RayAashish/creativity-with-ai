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
  Coffee,
  Sparkles
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
  currentTheme?: string;
  onSelectTheme?: (themeId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  streak,
  totalDone,
  totalQuestions,
  onQuickRoulette,
  onOpenBuyCoffee,
  currentTheme = 'modern',
  onSelectTheme,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const isRetro = currentTheme === 'retro';

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
      label: 'Progress', 
      fullLabel: 'Analytics', 
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
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b w-full transition-colors duration-300 ${
      isRetro 
        ? 'bg-slate-950/92 border-pink-500/25 shadow-lg shadow-pink-500/5' 
        : 'bg-slate-950/90 border-slate-800/80 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectTab('sheet')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
              isRetro 
                ? 'bg-gradient-to-tr from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30 group-hover:scale-105' 
                : 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105'
            }`}>
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-xl text-white tracking-tight">
                  DSA<span className={isRetro ? 'text-pink-400 font-mono tracking-normal' : 'text-cyan-400'}>Space</span>
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md border ${
                  isRetro 
                    ? 'bg-pink-500/15 text-pink-300 border-pink-500/40 font-mono' 
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-sans'
                }`}>
                  {isRetro ? '8-BIT' : '450'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden 2xl:block font-medium leading-none mt-0.5">
                {isRetro ? '// RETRO ARCADE EDITION' : 'Learn, Play & Master DSA'}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 sm:p-1.5 rounded-2xl border flex-shrink-0 transition-colors ${
            isRetro 
              ? 'bg-purple-950/40 border-pink-500/25' 
              : 'bg-slate-900/80 border-slate-800/80'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? isRetro
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>
                    <span className="hidden 2xl:inline">{item.fullLabel}</span>
                    <span className="2xl:hidden">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isRetro ? 'bg-pink-400' : 'bg-indigo-400'}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Segmented Theme Toggle, Quick Roulette, Buy Coffee, Share & Streak */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="hidden xl:block h-5 w-px bg-slate-800/80 mr-0.5" />

            {/* Curated Theme Switcher: Minimal Modern vs Retro Vibe */}
            {onSelectTheme && (
              <div 
                className={`flex items-center p-0.5 sm:p-1 rounded-xl border transition-all ${
                  isRetro 
                    ? 'bg-purple-950/60 border-pink-500/30' 
                    : 'bg-slate-900/90 border-slate-800'
                }`}
                role="group"
                aria-label="Theme Selector"
              >
                <button
                  type="button"
                  onClick={() => onSelectTheme('modern')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !isRetro
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Minimal Modern Mode (Clean, sleek, distraction-free)"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${!isRetro ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">Modern</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTheme('retro')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isRetro
                      ? 'bg-pink-950/80 text-pink-300 border border-pink-500/50 shadow-sm shadow-pink-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Retro Arcade Vibe (80s synthwave perspective grid & neon glow)"
                >
                  <Gamepad2 className={`w-3.5 h-3.5 ${isRetro ? 'text-pink-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">Retro</span>
                </button>
              </div>
            )}

            {/* Quick Roulette Button */}
            <button
              type="button"
              onClick={onQuickRoulette}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 border rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm group ${
                isRetro 
                  ? 'bg-gradient-to-r from-pink-500/15 to-purple-500/15 hover:from-pink-500/25 hover:to-purple-500/25 text-pink-300 border-pink-500/40' 
                  : 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border-cyan-500/40'
              }`}
              title="Roll a random question right now"
            >
              <Dice5 className={`w-4 h-4 group-hover:rotate-45 transition-transform duration-200 ${
                isRetro ? 'text-pink-400' : 'text-cyan-400'
              }`} />
              <span className="hidden xl:inline">Random Q</span>
            </button>

            {/* Buy Me a Coffee Button */}
            {onOpenBuyCoffee && (
              <button
                type="button"
                onClick={onOpenBuyCoffee}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-400/60 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm shadow-amber-500/10 group"
                title="Support DSASpace with a Coffee"
              >
                <Coffee className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden xl:inline">Buy Coffee</span>
                <span className="hidden md:inline xl:hidden text-[11px]">Coffee</span>
              </button>
            )}

            {/* Share / Copy Domain Link */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-2.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition"
              title="Copy DSASpace link (dsaspace.vercel.app)"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] hidden xl:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] hidden xl:inline">Share</span>
                </>
              )}
            </button>

            {/* Streak Counter */}
            <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 border rounded-xl text-xs font-bold ${
              isRetro 
                ? 'bg-amber-500/10 border-amber-500/35 text-amber-300 font-mono' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>{streak}d</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
                  isActive 
                    ? isRetro ? 'text-pink-400 font-bold' : 'text-cyan-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
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
