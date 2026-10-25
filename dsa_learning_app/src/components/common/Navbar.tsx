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
  Moon,
  Palette,
  Zap
} from 'lucide-react';

export type NavTab = 'sheet' | 'arena' | 'learning' | 'games' | 'dashboard';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  streak: number;
  totalDone: number;
  totalQuestions: number;
  onQuickRoulette: () => void;
  onOpenBuyCoffee?: () => void;
  theme?: 'dark' | 'beige' | 'light';
  onToggleTheme?: () => void;
  onSetTheme?: (theme: 'dark' | 'beige' | 'light') => void;
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
  onSetTheme,
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
      id: 'arena' as NavTab, 
      label: 'Arena', 
      fullLabel: 'Master Arena', 
      icon: Zap,
      badge: 'Crazy'
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-15 sm:h-16">
          
          {/* Logo & Brand (Editorial Swiss Style) */}
          <div 
            onClick={() => onSelectTab('sheet')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] group-hover:border-[var(--border-active)] transition">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
                  DSASpace
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">
                  :: 450
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] hidden md:block font-normal leading-none mt-0.5">
                Learn, Play & Master DSA
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop - only when wide screen has plenty of room) */}
          <nav className="hidden xl:flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)] flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.label}</span>
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

          {/* Right Actions: Quick Roulette, Buy Coffee, Share, Streak & Theme Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Quick Roulette Button */}
            <button
              type="button"
              onClick={onQuickRoulette}
              className="btn-outline flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
              title="Roll a random question right now"
            >
              <Dice5 className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline">Random Q</span>
            </button>

            {/* Buy Me a Coffee Button */}
            {onOpenBuyCoffee && (
              <button
                type="button"
                onClick={onOpenBuyCoffee}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 rounded-lg text-xs font-medium transition"
                title="Support DSASpace with a Coffee"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span className="hidden 2xl:inline">Buy Coffee</span>
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
                  <span className="text-[var(--status-green)] text-xs hidden 2xl:inline font-mono">Copied</span>
                </>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs font-mono font-medium text-[var(--text-secondary)]">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
              <span>{streak}d</span>
            </div>

            {/* 3-Way Minimalist Theme Segmented Control (Always Compact Icons, Never Overflow) */}
            <div className="hidden sm:inline-flex items-center p-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs font-mono">
              <button
                type="button"
                onClick={() => onSetTheme ? onSetTheme('dark') : onToggleTheme?.()}
                className={`p-1.5 rounded-md transition flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border-subtle)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Obsidian Dark Theme"
                aria-label="Obsidian Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onSetTheme ? onSetTheme('beige') : onToggleTheme?.()}
                className={`p-1.5 rounded-md transition flex items-center justify-center ${
                  theme === 'beige' 
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border-subtle)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Warm Beige / Editorial Paper Theme"
                aria-label="Warm Beige / Editorial Paper Theme"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onSetTheme ? onSetTheme('light') : onToggleTheme?.()}
                className={`p-1.5 rounded-md transition flex items-center justify-center ${
                  theme === 'light' 
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border-subtle)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Swiss Paper Light Theme"
                aria-label="Swiss Paper Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile 1-Touch Theme Cycle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition active:scale-95 sm:hidden"
              title={`Current theme: ${theme}. Click to cycle Dark -> Beige -> Light.`}
            >
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5" />
              ) : theme === 'beige' ? (
                <Palette className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Row (For Tablets and Medium Laptops < 1280px) */}
        <div className="flex xl:hidden items-center justify-around py-2 border-t border-[var(--border-subtle)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center sm:gap-2 gap-1 py-1 px-2.5 sm:px-4 rounded-lg text-xs font-medium transition ${
                  isActive 
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] sm:text-xs">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono hidden sm:inline ${
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
        </div>
      </div>
    </header>
  );
};
