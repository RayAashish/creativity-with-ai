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
  Sun,
  Moon
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  streak,
  totalDone,
  totalQuestions,
  onQuickRoulette,
  onOpenBuyCoffee,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const navItems = [
    { 
      id: 'sheet' as NavTab, 
      label: '450 Sheet', 
      fullLabel: '450 DSA Sheet', 
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
    <header className="sticky top-0 z-40 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] w-full transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-15 sm:h-16">
          
          {/* Logo & Brand (Editorial Swiss Style) */}
          <div 
            onClick={() => onSelectTab('sheet')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] group-hover:border-[var(--border-active)] transition">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
                  DSASpace
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">
                  :: 450
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] hidden sm:block font-normal leading-none mt-0.5">
                Learn, Play & Master DSA
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)] flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    <span className="hidden xl:inline">{item.fullLabel}</span>
                    <span className="xl:hidden">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive 
                        ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]' 
                        : 'bg-[var(--badge-bg)] text-[var(--text-secondary)]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-green)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Roulette, Buy Coffee, Share, Streak & Theme Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Roulette Button */}
            <button
              type="button"
              onClick={onQuickRoulette}
              className="btn-outline flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              title="Roll a random question right now"
            >
              <Dice5 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Random Q</span>
            </button>

            {/* Buy Me a Coffee Button */}
            {onOpenBuyCoffee && (
              <button
                type="button"
                onClick={onOpenBuyCoffee}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-lg text-xs font-medium transition"
                title="Support DSASpace with a Coffee"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Buy Coffee</span>
              </button>
            )}

            {/* Share / Copy Domain Link */}
            <button
              type="button"
              onClick={handleShare}
              className="btn-outline p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs flex items-center gap-1.5"
              title="Copy DSASpace link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--status-green)]" />
                  <span className="text-[var(--status-green)] text-xs hidden lg:inline font-mono">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-xs">Share</span>
                </>
              )}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs font-mono font-medium text-[var(--text-secondary)]">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
              <span>{streak}d</span>
            </div>

            {/* Minimalist Light / Dark Mode Toggle (Exact Portfolio Match) */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] flex items-center justify-center transition active:scale-95"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-[var(--border-subtle)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
                  isActive ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
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
