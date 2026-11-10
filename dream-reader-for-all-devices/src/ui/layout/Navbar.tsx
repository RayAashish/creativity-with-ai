import React, { useState, useEffect } from 'react';
import { BookOpen, Sun, Moon, Coffee, ArrowLeft, HelpCircle, Bookmark, Languages, Download, Flame, Sparkles, Search } from 'lucide-react';
import { useReaderStore } from '../../stores/reader-store';
import { useSettingsStore } from '../../stores/settings-store';
import { useVocabStore } from '../../stores/vocab-store';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import { VocabNotebookModal } from '../vocab/VocabNotebookModal';
import { ExportModal } from '../export/ExportModal';
import { FlashcardReviewModal } from '../flashcards/FlashcardReviewModal';
import { ReadingInsightsModal } from '../insights/ReadingInsightsModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { isCardDueForReview } from '../../reader-core/srs/sm2';
import { insightsService } from '../../services/insights-service';
import { TargetLanguage, ReadingStatsRecord, DEFAULT_STATS } from '../../types';

export const Navbar: React.FC = () => {
  const { activeDocument, closeDocument } = useReaderStore();
  const { settings, setTheme, setTargetLanguage } = useSettingsStore();
  const { vocabEntries, loadVocab } = useVocabStore();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [stats, setStats] = useState<ReadingStatsRecord>(DEFAULT_STATS);

  useEffect(() => {
    loadVocab();
    insightsService.getStats().then(setStats);
  }, [loadVocab]);

  // Global Cmd+K shortcut for universal search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowGlobalSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dueCardsCount = vocabEntries.filter((v) => isCardDueForReview(v.srsState)).length;

  const cycleLanguage = () => {
    const langs: TargetLanguage[] = ['both', 'hi', 'ne'];
    const currentIdx = langs.indexOf(settings.targetLanguage);
    const nextLang = langs[(currentIdx + 1) % langs.length];
    setTargetLanguage(nextLang);
  };

  const getLangBadge = () => {
    switch (settings.targetLanguage) {
      case 'hi':
        return 'EN ⇄ HINDI';
      case 'ne':
        return 'EN ⇄ NEPALI';
      case 'both':
      default:
        return 'EN ⇄ HI & NE';
    }
  };

  return (
    <>
      <header className="min-h-14 pt-[env(safe-area-inset-top,0px)] border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between transition-colors">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          {activeDocument ? (
            <button
              onClick={closeDocument}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Return to Library"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Library</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                ReadMaster
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                EN ⇄ HI/NE
              </span>
            </div>
          )}

          {activeDocument && (
            <div className="flex items-center gap-2 min-w-0 pl-2 border-l border-gray-200 dark:border-zinc-800">
              <span className="text-xs uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                {activeDocument.type.toUpperCase()}
              </span>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate max-w-[280px] md:max-w-md" title={activeDocument.title}>
                {activeDocument.title}
              </h2>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5">
          {/* Universal Search (Cmd+K) */}
          <button
            onClick={() => setShowGlobalSearch(true)}
            title="Global Search (Cmd+K)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-gray-200 dark:border-zinc-800"
          >
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden md:inline text-[11px] text-gray-400">Search</span>
            <kbd className="hidden lg:inline text-[10px] font-mono px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-400">
              ⌘K
            </kbd>
          </button>

          {/* Target Language Switcher Toggle */}
          <button
            onClick={cycleLanguage}
            title={`Active Lookup Language: ${settings.targetLanguage} (Click to switch)`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getLangBadge()}</span>
          </button>

          {/* Vocabulary Notebook Button */}
          <button
            onClick={() => setShowVocabModal(true)}
            title="Open Vocabulary Notebook"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span className="hidden sm:inline">Notebook</span>
            {vocabEntries.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                {vocabEntries.length}
              </span>
            )}
          </button>

          {/* Flashcards SM-2 Review Button */}
          <button
            onClick={() => setShowFlashcards(true)}
            title="Flashcard Review (Spaced Repetition)"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Cards</span>
            {dueCardsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                {dueCardsCount}
              </span>
            )}
          </button>

          {/* Reading Streak & Insights Button */}
          <button
            onClick={() => setShowInsights(true)}
            title="Reading Streaks & Insights"
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 rounded-lg border border-orange-200 dark:border-orange-900/60 hover:bg-orange-100 transition-colors"
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>{stats.currentStreakDays}d</span>
          </button>

          {/* Export Button */}
          {activeDocument && (
            <button
              onClick={() => setShowExportModal(true)}
              title="Export Notes, Vocabulary, and Annotations"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">Export</span>
            </button>
          )}

          {/* Theme Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-gray-200 dark:border-zinc-700/60">
            <button
              onClick={() => setTheme('light')}
              title="Light theme"
              className={`p-1.5 rounded-md transition-all ${
                settings.theme === 'light'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              title="Sepia theme (Warm paper)"
              className={`p-1.5 rounded-md transition-all ${
                settings.theme === 'sepia'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
              }`}
            >
              <Coffee className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark theme"
              className={`p-1.5 rounded-md transition-all ${
                settings.theme === 'dark'
                  ? 'bg-zinc-700 text-amber-400 shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
            className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <VocabNotebookModal isOpen={showVocabModal} onClose={() => setShowVocabModal(false)} />
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <FlashcardReviewModal isOpen={showFlashcards} onClose={() => setShowFlashcards(false)} />
      <ReadingInsightsModal isOpen={showInsights} onClose={() => setShowInsights(false)} />
      <GlobalSearchModal isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
    </>
  );
};
