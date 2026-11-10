import React, { useRef, useEffect } from 'react';
import { X, Search, ChevronRight, ChevronDown, BookOpen, Loader2 } from 'lucide-react';
import { useReaderStore } from '../../../stores/reader-store';
import { useAnnotationStore } from '../../../stores/annotation-store';
import { OutlineItem } from '../../../types';
import { renderPageThumbnail } from '../../../reader-core/pdf/pdf-thumbnail';
import { AnnotationSidebarList } from '../AnnotationSidebarList';

export const PdfSidebar: React.FC = () => {
  const {
    isSidebarOpen,
    sidebarTab,
    outline,
    pdfDocProxy,
    totalPages,
    currentPage,
    searchQuery,
    searchResults,
    currentSearchIndex,
    isSearching,
    setSidebarOpen,
    setSidebarTab,
    setCurrentPage,
    search,
    nextSearchResult,
    prevSearchResult,
  } = useReaderStore();

  const { annotations } = useAnnotationStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSidebarOpen && sidebarTab === 'search') {
      searchInputRef.current?.focus();
    }
  }, [isSidebarOpen, sidebarTab]);

  if (!isSidebarOpen) return null;

  const jumpToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const pageEl = document.getElementById(`pdf-page-${pageNumber}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="w-72 sm:w-80 h-full border-r border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex flex-col z-20 shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setSidebarTab('toc')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              sidebarTab === 'toc'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-xs'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            TOC
          </button>
          <button
            onClick={() => setSidebarTab('thumbnails')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              sidebarTab === 'thumbnails'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-xs'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            Pages
          </button>
          <button
            onClick={() => setSidebarTab('search')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              sidebarTab === 'search'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-xs'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setSidebarTab('annotations')}
            className={`px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
              sidebarTab === 'annotations'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-xs'
                : 'text-gray-500 dark:text-zinc-400'
            }`}
          >
            <span>Notes</span>
            {annotations.length > 0 && (
              <span className="text-[10px] px-1 rounded-full bg-amber-500 text-white font-bold">
                {annotations.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {sidebarTab === 'toc' && (
          <div className="space-y-1">
            {outline.length > 0 ? (
              outline.map((item) => (
                <OutlineNode key={item.id} item={item} onSelectPage={jumpToPage} activePage={currentPage} />
              ))
            ) : (
              <div className="text-center py-12 text-xs text-gray-400 dark:text-zinc-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>No table of contents embedded in this PDF.</span>
              </div>
            )}
          </div>
        )}

        {sidebarTab === 'thumbnails' && pdfDocProxy && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <ThumbnailItem
                key={pageNum}
                pageNum={pageNum}
                isActive={pageNum === currentPage}
                pdfDoc={pdfDocProxy}
                onClick={() => jumpToPage(pageNum)}
              />
            ))}
          </div>
        )}

        {sidebarTab === 'search' && (
          <div className="flex flex-col h-full space-y-3">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Find in document..."
                value={searchQuery}
                onChange={(e) => search(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin absolute right-2.5 top-2.5" />
              )}
            </div>

            {/* Results count & match navigation */}
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 px-1">
                <span>
                  Match {currentSearchIndex + 1} of {searchResults.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevSearchResult}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                    title="Previous match"
                  >
                    <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button
                    onClick={nextSearchResult}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                    title="Next match"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {searchResults.map((match, idx) => (
                <button
                  key={match.id}
                  onClick={() => {
                    useReaderStore.setState({ currentSearchIndex: idx });
                    jumpToPage(match.pageNumber);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                    currentSearchIndex === idx
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                      : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[10px] text-gray-500 dark:text-zinc-400 mb-0.5">
                    <span>Page {match.pageNumber}</span>
                  </div>
                  <p className="line-clamp-2 text-[11px] leading-relaxed">
                    {match.snippet}
                  </p>
                </button>
              ))}

              {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  No matches found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}

        {sidebarTab === 'annotations' && <AnnotationSidebarList />}
      </div>
    </aside>
  );
};

// Subcomponent: Outline Node
const OutlineNode: React.FC<{
  item: OutlineItem;
  onSelectPage: (page: number) => void;
  activePage: number;
}> = ({ item, onSelectPage, activePage }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isCurrent = item.page === activePage;

  return (
    <div className="text-xs">
      <div
        className={`flex items-center py-1.5 px-2 rounded-lg cursor-pointer group transition-colors ${
          isCurrent
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-medium'
            : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
        }`}
        style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
        onClick={() => item.page && onSelectPage(item.page)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
          >
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <span className="truncate flex-1" title={item.title}>
          {item.title}
        </span>

        {item.page && (
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-1">
            {item.page}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-0.5">
          {item.children!.map((child) => (
            <OutlineNode
              key={child.id}
              item={child}
              onSelectPage={onSelectPage}
              activePage={activePage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Subcomponent: Thumbnail Item
const ThumbnailItem: React.FC<{
  pageNum: number;
  isActive: boolean;
  // @ts-expect-error proxy type
  pdfDoc: PDFDocumentProxy;
  onClick: () => void;
}> = ({ pageNum, isActive, pdfDoc, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderPageThumbnail(pdfDoc, pageNum, canvas, 130).catch(() => {});
  }, [pdfDoc, pageNum]);

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer flex flex-col items-center p-1.5 rounded-xl border transition-all ${
        isActive
          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs'
          : 'border-gray-200 dark:border-zinc-800 hover:border-amber-300 bg-gray-50/50 dark:bg-zinc-800/40'
      }`}
    >
      <div className="w-full aspect-[3/4] bg-white rounded shadow-2xs overflow-hidden flex items-center justify-center relative">
        <canvas ref={canvasRef} className="w-full h-auto" />
      </div>
      <span
        className={`text-[10px] mt-1 font-medium ${
          isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-zinc-500'
        }`}
      >
        {pageNum}
      </span>
    </div>
  );
};
