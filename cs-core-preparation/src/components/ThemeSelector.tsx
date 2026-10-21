import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
        title="Change theme"
        aria-label="Select Theme"
      >
        <Palette className="w-4 h-4 text-indigo-500" />
        <span className="hidden sm:inline">Theme:</span>
        <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
          {availableThemes.find(t => t.id === theme)?.label.split(' ')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Choose Appearance ({availableThemes.length} Styles)
          </div>
          <div className="mt-1 space-y-1">
            {availableThemes.map(t => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    sounds.playClick();
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        {t.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t.desc}
                      </div>
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
