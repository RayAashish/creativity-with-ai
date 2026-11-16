import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Clock, Zap, BookOpen, Menu, X, ShieldCheck, Coffee } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';
import { VisitorCounter } from './VisitorCounter';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isLast48Hours: boolean;
  onToggleLast48Hours: () => void;
  onOpenSearch: () => void;
  onOpenSupport?: () => void;
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedLanguage,
  onLanguageChange,
  isLast48Hours,
  onToggleLast48Hours,
  onOpenSearch,
  onOpenSupport,
  targetRole,
  onTargetRoleChange,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('spdse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('spdse_theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-paper-50/95 dark:bg-paper-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-left focus:outline-none group py-1"
            title="SPDSE.Prep Dashboard"
          >
            <Logo variant="full" size="md" />
          </button>
        </div>

        {/* Center: Search button shortcut */}
        <div className="hidden sm:flex flex-1 max-w-xs mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-sm hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search size={14} />
              <span>Search PYQs, sets, patterns...</span>
            </span>
            <kbd className="font-mono text-[10px] bg-neutral-200/80 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Role, Language, Last 48H Mode, Theme */}
        <div className="flex items-center gap-2.5">
          
          {/* Live Visitor Counter */}
          <div className="hidden sm:block">
            <VisitorCounter variant="navbar" />
          </div>

          {/* Target Role Selector */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">Role:</span>
            <select
              value={targetRole}
              onChange={(e) => onTargetRoleChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-sm px-2 py-1 focus:ring-1 focus:ring-accent focus:outline-none"
            >
              <option value="dse" className="bg-paper-50 dark:bg-paper-900">DSE (₹6.5L)</option>
              <option value="sp_l1" className="bg-paper-50 dark:bg-paper-900">SP L1 (₹10.5L)</option>
              <option value="sp_l2" className="bg-paper-50 dark:bg-paper-900">SP L2 (₹16L)</option>
              <option value="sp_l3" className="bg-paper-50 dark:bg-paper-900">SP L3 (₹21L)</option>
            </select>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-sm p-0.5 bg-neutral-100/60 dark:bg-neutral-800/60">
            {(['java', 'cpp', 'python'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-sm transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Py'}
              </button>
            ))}
          </div>

          {/* Last-48-Hours Toggle */}
          <button
            onClick={onToggleLast48Hours}
            title="Last-48-Hours Revision Mode (Hides new problems, shows mistake log and templates)"
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm border transition-all ${
              isLast48Hours
                ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Clock size={13} className={isLast48Hours ? 'text-amber-600 dark:text-amber-400' : ''} />
            <span className="hidden sm:inline">48h Mode</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-sm border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Buy Me a Coffee / Support */}
          {onOpenSupport && (
            <button
              onClick={onOpenSupport}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 font-mono font-medium transition-all shadow-sm"
              title="Support the Developer / Buy Me a Coffee"
            >
              <Coffee size={13} className="text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Coffee</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
