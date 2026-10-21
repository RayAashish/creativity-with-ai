import React, { useState, useEffect, useRef } from 'react';
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
  Palette
} from 'lucide-react';

export type NavTab = 'sheet' | 'games' | 'learning' | 'dashboard';

export interface SiteTheme {
  id: string;
  name: string;
  icon: string;
  gradient: string;
}

export const THEMES: SiteTheme[] = [
  { id: 'dark', name: 'Dark Space', icon: '🌌', gradient: 'linear-gradient(135deg, #6366f1, #06b6d4)' },
  { id: 'sakura', name: 'Sakura Petals', icon: '🌸', gradient: 'linear-gradient(135deg, #f472b6, #fb7185)' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '⚡', gradient: 'linear-gradient(135deg, #00f0ff, #ff007f)' },
  { id: 'aurora', name: 'Aurora Borealis', icon: '✨', gradient: 'linear-gradient(135deg, #2dd4bf, #a78bfa)' },
  { id: 'ember', name: 'Ember Fire', icon: '🔥', gradient: 'linear-gradient(135deg, #ff5722, #ffb300)' },
  { id: 'ocean', name: 'Ocean Depths', icon: '🌊', gradient: 'linear-gradient(135deg, #38bdf8, #34d399)' },
  { id: 'matrix', name: 'Terminal Matrix', icon: '💻', gradient: 'linear-gradient(135deg, #00ff66, #39ff14)' },
];

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
  currentTheme = 'dark',
  onSelectTheme,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { id: 'sheet' as NavTab, label: '450 Sheet', fullLabel: '450 DSA Sheet', icon: CheckSquare, badge: `${totalDone}/${totalQuestions}` },
    { id: 'games' as NavTab, label: 'Arcade', fullLabel: 'DSA Games Arcade', icon: Gamepad2, highlight: true },
    { id: 'learning' as NavTab, label: 'Academy', fullLabel: 'Concept Academy', icon: BookOpen },
    { id: 'dashboard' as NavTab, label: 'Stats', fullLabel: 'Progress & Stats', icon: BarChart3 },
  ];

  const currentThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    if (themeMenuOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [themeMenuOpen]);

  const handleShare = () => {
    const siteUrl = 'https://dsaspace.vercel.app';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(siteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 h-16 sm:h-20">
          
          {/* Logo & Brand with Tagline Restored */}
          <div 
            onClick={() => onSelectTab('sheet')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition flex-shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-xl text-white tracking-tight">
                  DSA<span className="text-cyan-400">Space</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-md">
                  450
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium leading-none mt-0.5">
                Learn, Play & Master DSA
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 sm:p-1.5 rounded-2xl border border-slate-800/80 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 lg:gap-2 px-2.5 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>
                    <span className="hidden xl:inline">{item.fullLabel}</span>
                    <span className="xl:hidden">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
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

          {/* Right Actions: Theme Selector, Quick Roulette, Buy Coffee, Share & Streak */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Visual Divider between Nav and Actions on Desktop */}
            <div className="hidden lg:block h-5 w-px bg-slate-800/80 mr-0.5" />

            {/* Portfolio-Style Theme Selector Dropdown */}
            {onSelectTheme && (
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold transition"
                  title="Switch Visual Theme & Ambient Particles"
                  aria-label="Change Background Theme"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ background: currentThemeObj.gradient }}
                  />
                  <span className="text-xs">{currentThemeObj.icon}</span>
                  <span className="hidden xl:inline font-bold">{currentThemeObj.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400">▾</span>
                </button>

                {themeMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 py-1.5 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Ambient Themes
                    </div>
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          onSelectTheme(th.id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-left transition ${
                          th.id === currentTheme
                            ? 'bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <span className="text-sm">{th.icon}</span>
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: th.gradient }}
                        />
                        <span className="flex-1 truncate">{th.name}</span>
                        {th.id === currentTheme && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Roulette Button */}
            <button
              onClick={onQuickRoulette}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm group"
              title="Roll a random question right now"
            >
              <Dice5 className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-200" />
              <span className="hidden sm:inline">Random Q</span>
            </button>

            {/* Buy Me a Coffee Button */}
            {onOpenBuyCoffee && (
              <button
                onClick={onOpenBuyCoffee}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-400/60 rounded-xl text-xs font-bold transition transform active:scale-95 shadow-sm shadow-amber-500/10 group"
                title="Support DSASpace with a Coffee"
              >
                <Coffee className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden sm:inline">Buy Coffee</span>
                <span className="sm:hidden text-[11px]">Coffee</span>
              </button>
            )}

            {/* Share / Copy Domain Link */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition"
              title="Copy DSASpace link (dsaspace.vercel.app)"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] hidden md:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] hidden md:inline">Share</span>
                </>
              )}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>{streak}d</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition ${
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
