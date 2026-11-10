import React from 'react';
import {
  PanelLeft,
  AlertTriangle,
  RefreshCw,
  Bookmark,
  Volume2,
  Languages,
  Expand,
  Shrink,
} from 'lucide-react';
import { useReaderStore } from '../../../stores/reader-store';
import { useSettingsStore } from '../../../stores/settings-store';
import { useAnnotationStore } from '../../../stores/annotation-store';
import { FontSize, FontFamily } from '../../../types';
import { useLibraryStore } from '../../../stores/library-store';

interface Props {
  onToggleBilingual?: () => void;
  isBilingualOpen?: boolean;
  onToggleReadAloud?: () => void;
  isReadAloudOpen?: boolean;
}

export const MarkdownToolbar: React.FC<Props> = ({
  onToggleBilingual,
  isBilingualOpen,
  onToggleReadAloud,
  isReadAloudOpen,
}) => {
  const {
    isSidebarOpen,
    sidebarTab,
    setSidebarTab,
    remoteWarning,
    activeDocument,
    openDocument,
    isZenMode,
    toggleZenMode,
  } = useReaderStore();
  const { settings, setFontSize, setFontFamily } = useSettingsStore();
  const { annotations } = useAnnotationStore();
  const { importGitHub } = useLibraryStore();

  const handleUpdateFromRemote = async () => {
    if (!activeDocument?.metadata?.github?.rawUrl) return;
    const url = `https://github.com/${activeDocument.metadata.github.owner}/${activeDocument.metadata.github.repo}/blob/${activeDocument.metadata.github.branch}/${activeDocument.metadata.github.path}`;
    try {
      const updated = await importGitHub(url);
      await openDocument(updated.id);
    } catch (err) {
      console.error('Failed to update remote document:', err);
    }
  };

  return (
    <div className="h-12 border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-4 flex items-center justify-between z-30 select-none">
      {/* Left: TOC & Notes Sidebar Toggle */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSidebarTab('toc')}
          title="Toggle Table of Contents (b)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            isSidebarOpen && sidebarTab === 'toc'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium'
              : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <PanelLeft className="w-4 h-4" />
          <span>TOC</span>
        </button>

        <button
          onClick={() => setSidebarTab('annotations')}
          title="Toggle Notes & Annotations Sidebar"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            isSidebarOpen && sidebarTab === 'annotations'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium'
              : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Notes</span>
          {annotations.length > 0 && (
            <span className="text-[10px] px-1 rounded-full bg-amber-500 text-white font-bold">
              {annotations.length}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-gray-200 dark:border-zinc-800 mx-1" />

        {/* Read-Aloud */}
        <button
          onClick={onToggleReadAloud}
          title="Listen to Read-Aloud"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            isReadAloudOpen
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
              : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden md:inline">Listen</span>
        </button>

        {/* Bilingual Parallel Reader */}
        <button
          onClick={onToggleBilingual}
          title="Toggle Bilingual Parallel Reader"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            isBilingualOpen
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
              : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span className="hidden md:inline">Bilingual</span>
        </button>

        {remoteWarning?.changed && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>GitHub file was updated remotely</span>
            <button
              onClick={handleUpdateFromRemote}
              className="ml-1 underline font-semibold flex items-center gap-1 hover:text-amber-900"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Typography Controls */}
      <div className="flex items-center gap-2">
        {/* Font Family */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
          {(['sans', 'serif', 'mono'] as FontFamily[]).map((f) => (
            <button
              key={f}
              onClick={() => setFontFamily(f)}
              className={`px-2 py-1 rounded capitalize font-medium transition-all ${
                settings.fontFamily === f
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Font Size */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
          {(['sm', 'base', 'lg', 'xl'] as FontSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-2 py-1 rounded uppercase font-medium transition-all ${
                settings.fontSize === size
                  ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              {size === 'base' ? 'Md' : size}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 dark:border-zinc-800 mx-0.5" />

        {/* Zen Mode Button */}
        <button
          onClick={toggleZenMode}
          title={isZenMode ? 'Exit Zen Mode' : 'Zen Study Mode'}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isZenMode
              ? 'bg-amber-500 text-white font-bold shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          {isZenMode ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
