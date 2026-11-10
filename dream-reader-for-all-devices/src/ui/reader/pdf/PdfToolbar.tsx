import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  PanelLeft,
  Search,
  List,
  LayoutGrid,
  PenTool,
  Bookmark,
  Volume2,
  Languages,
  Expand,
  Shrink,
} from 'lucide-react';
import { useReaderStore } from '../../../stores/reader-store';
import { useAnnotationStore } from '../../../stores/annotation-store';

interface Props {
  onToggleBilingual?: () => void;
  isBilingualOpen?: boolean;
  onToggleReadAloud?: () => void;
  isReadAloudOpen?: boolean;
}

export const PdfToolbar: React.FC<Props> = ({
  onToggleBilingual,
  isBilingualOpen,
  onToggleReadAloud,
  isReadAloudOpen,
}) => {
  const {
    currentPage,
    totalPages,
    zoomLevel,
    fitMode,
    isZenMode,
    toggleZenMode,
    isSidebarOpen,
    sidebarTab,
    setCurrentPage,
    setZoomLevel,
    setFitMode,
    toggleSidebar,
    setSidebarTab,
  } = useReaderStore();

  const { isInkActive, setInkActive, annotations } = useAnnotationStore();

  const [inputPage, setInputPage] = useState(String(currentPage));

  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      const pageEl = document.getElementById(`pdf-page-${pageNum}`);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setInputPage(String(currentPage));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const target = currentPage - 1;
      setCurrentPage(target);
      document.getElementById(`pdf-page-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const target = currentPage + 1;
      setCurrentPage(target);
      document.getElementById(`pdf-page-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-12 border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2 sm:px-4 flex items-center justify-between z-30 select-none overflow-x-auto no-scrollbar gap-2">
      {/* Left: Sidebar Tabs */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={toggleSidebar}
          title="Toggle Navigation Sidebar (b)"
          className={`p-1.5 rounded-lg transition-colors ${
            isSidebarOpen
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 dark:border-zinc-800 mx-1" />

        <button
          onClick={() => setSidebarTab('toc')}
          title="Table of Contents"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isSidebarOpen && sidebarTab === 'toc'
              ? 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-medium'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <List className="w-4 h-4" />
          <span className="hidden xl:inline">TOC</span>
        </button>

        <button
          onClick={() => setSidebarTab('thumbnails')}
          title="Page Thumbnails"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isSidebarOpen && sidebarTab === 'thumbnails'
              ? 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-medium'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden xl:inline">Thumbnails</span>
        </button>

        <button
          onClick={() => setSidebarTab('search')}
          title="Search Text in PDF (Cmd+F)"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isSidebarOpen && sidebarTab === 'search'
              ? 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-medium'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="hidden xl:inline">Search</span>
        </button>

        <button
          onClick={() => setSidebarTab('annotations')}
          title="Annotation Sidebar (Highlights, Notes, Ink)"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isSidebarOpen && sidebarTab === 'annotations'
              ? 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-medium'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="hidden xl:inline">Notes</span>
          {annotations.length > 0 && (
            <span className="text-[10px] px-1 rounded-full bg-amber-500 text-white font-bold">
              {annotations.length}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-gray-200 dark:border-zinc-800 mx-1" />

        <button
          onClick={() => setInkActive(!isInkActive)}
          title="Freehand Stylus & Ink Drawing"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isInkActive
              ? 'bg-amber-500 text-white font-bold shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden sm:inline">Draw</span>
        </button>

        {/* Read-Aloud Audio Player Toggle */}
        <button
          onClick={onToggleReadAloud}
          title="Listen to Read-Aloud with Synced Highlighting"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isReadAloudOpen
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden lg:inline">Listen</span>
        </button>

        {/* Bilingual Parallel Reader Toggle */}
        <button
          onClick={onToggleBilingual}
          title="Toggle Bilingual Parallel Reader"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isBilingualOpen
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span className="hidden lg:inline">Bilingual</span>
        </button>
      </div>

      {/* Center: Page Jump */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          title="Previous Page (k / Up)"
          className="p-1 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <form onSubmit={handlePageSubmit} className="flex items-center text-xs text-gray-600 dark:text-zinc-400">
          <input
            type="text"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={() => setInputPage(String(currentPage))}
            className="w-10 text-center py-0.5 px-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-gray-900 dark:text-zinc-100"
          />
          <span className="mx-1.5">/</span>
          <span className="font-medium text-gray-900 dark:text-zinc-200">{totalPages}</span>
        </form>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          title="Next Page (j / Down / Space)"
          className="p-1 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Zoom & Layout */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setZoomLevel(zoomLevel - 0.15)}
          disabled={zoomLevel <= 0.5}
          title="Zoom Out (-)"
          className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoomLevel(1.0)}
          title="Reset Zoom to 100% (0)"
          className="px-1.5 sm:px-2 py-0.5 text-xs font-mono font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          onClick={() => setZoomLevel(zoomLevel + 0.15)}
          disabled={zoomLevel >= 3.0}
          title="Zoom In (+)"
          className="p-1.5 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 dark:border-zinc-800 mx-0.5 sm:mx-1" />

        <button
          onClick={() => setFitMode(fitMode === 'fit-width' ? 'custom' : 'fit-width')}
          title="Fit Width"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            fitMode === 'fit-width'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit Width</span>
        </button>

        <button
          onClick={() => setFitMode(fitMode === 'fit-page' ? 'custom' : 'fit-page')}
          title="Fit Page"
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            fitMode === 'fit-page'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit Page</span>
        </button>

        <div className="h-4 w-px bg-gray-200 dark:border-zinc-800 mx-0.5 sm:mx-1" />

        {/* Zen / Fullscreen Study Mode (Perfect for Tablets) */}
        <button
          onClick={toggleZenMode}
          title={isZenMode ? 'Exit Zen Mode (Show Top Bar)' : 'Zen Study Mode (Fullscreen Paper View)'}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isZenMode
              ? 'bg-amber-500 text-white font-bold shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          {isZenMode ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isZenMode ? 'Exit Zen' : 'Zen View'}</span>
        </button>
      </div>
    </div>
  );
};
