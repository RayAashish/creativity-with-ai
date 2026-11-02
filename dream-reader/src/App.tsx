import React, { useEffect } from 'react';
import { Navbar } from './ui/layout/Navbar';
import { LibraryView } from './ui/library/LibraryView';
import { ReaderView } from './ui/reader/ReaderView';
import { FloatingLookupPopover } from './ui/reader/FloatingLookupPopover';
import { useReaderStore } from './stores/reader-store';
import { useSettingsStore } from './stores/settings-store';
import { useAnnotationStore } from './stores/annotation-store';
import { configureNativeStatusBar, registerAndroidBackButton } from './services/native-bridge';
import { Shrink } from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeDocument,
    isZenMode,
    toggleZenMode,
    closeDocument,
    toggleSidebar,
    setSidebarTab,
    setZoomLevel,
    zoomLevel,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useReaderStore();
  const { loadSettings, settings, setTheme } = useSettingsStore();
  const { isInkActive, setInkActive } = useAnnotationStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Android Native Integration (Status Bar & Hardware Back Button)
  useEffect(() => {
    configureNativeStatusBar(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    const unregister = registerAndroidBackButton(() => {
      if (isInkActive) {
        setInkActive(false);
        return true;
      }
      if (isZenMode) {
        toggleZenMode();
        return true;
      }
      if (activeDocument) {
        closeDocument();
        return true;
      }
      return false;
    });
    return unregister;
  }, [activeDocument, isInkActive, isZenMode, closeDocument, setInkActive, toggleZenMode]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Escape key exits Zen Mode or Inking
      if (e.key === 'Escape') {
        if (isZenMode) {
          toggleZenMode();
        } else if (isInkActive) {
          setInkActive(false);
        }
        return;
      }

      // Search shortcut (Cmd+F / Ctrl+F)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSidebarTab('search');
        return;
      }

      if (e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === 't') {
        e.preventDefault();
        const themes = ['light', 'sepia', 'dark'] as const;
        const currentIdx = themes.indexOf(settings.theme);
        const nextTheme = themes[(currentIdx + 1) % themes.length];
        setTheme(nextTheme);
      } else if (activeDocument?.type === 'pdf') {
        if (e.key === 'j' || e.key === 'ArrowDown') {
          if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            document.getElementById(`pdf-page-${currentPage + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (e.key === 'k' || e.key === 'ArrowUp') {
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            document.getElementById(`pdf-page-${currentPage - 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          setZoomLevel(zoomLevel + 0.15);
        } else if (e.key === '-') {
          e.preventDefault();
          setZoomLevel(zoomLevel - 0.15);
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(1.0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeDocument,
    currentPage,
    totalPages,
    zoomLevel,
    isZenMode,
    isInkActive,
    settings.theme,
    setCurrentPage,
    setZoomLevel,
    toggleSidebar,
    setSidebarTab,
    setTheme,
    toggleZenMode,
    setInkActive,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors relative">
      {/* Top Navigation Bar: hidden in Zen study mode */}
      {!isZenMode && <Navbar />}

      {/* Floating Exit Button for Zen Mode */}
      {isZenMode && activeDocument && (
        <button
          onClick={toggleZenMode}
          title="Exit Zen Fullscreen Mode (Esc)"
          className="fixed top-3 right-4 z-50 p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-all text-xs flex items-center gap-1.5"
        >
          <Shrink className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Exit Zen</span>
        </button>
      )}

      <main className="flex-1">
        {activeDocument ? <ReaderView /> : <LibraryView />}
      </main>
      <FloatingLookupPopover />
    </div>
  );
};

export default App;
