import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useReaderStore } from '../../../stores/reader-store';
import { useLookupStore } from '../../../stores/lookup-store';
import { getSelectionDetails } from '../../../reader-core/selection-handler';
import { PdfToolbar } from './PdfToolbar';
import { PdfSidebar } from './PdfSidebar';
import { PdfPage } from './PdfPage';
import { PdfInkToolbar } from './PdfInkToolbar';
import { BilingualPane } from '../BilingualPane';
import { ReadAloudBar } from '../ReadAloudBar';
import { insightsService } from '../../../services/insights-service';

const VIRTUAL_WINDOW_PAGES = 4; // currentPage +/- 4 pages (up to 9 pages rendered simultaneously)

interface PlaceholderProps {
  pageNumber: number;
  width: number;
  height: number;
  onPageIntersect?: (pageNumber: number) => void;
}

const PdfPagePlaceholder: React.FC<PlaceholderProps> = ({
  pageNumber,
  width,
  height,
  onPageIntersect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onPageIntersect);

  useEffect(() => {
    onIntersectRef.current = onPageIntersect;
  }, [onPageIntersect]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          onIntersectRef.current?.(pageNumber);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber]);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
      className="pdf-page-container shrink-0 relative my-4 rounded shadow-md bg-white/80 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800/80 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 select-none"
    >
      <div className="flex flex-col items-center gap-1.5 opacity-60">
        <div className="w-6 h-8 border border-dashed border-gray-300 dark:border-zinc-700 rounded-sm flex items-center justify-center text-[10px] font-mono">
          {pageNumber}
        </div>
        <span className="text-xs font-medium">Page {pageNumber}</span>
      </div>
    </div>
  );
};

export const PdfViewer: React.FC = () => {
  const {
    pdfDocProxy,
    totalPages,
    currentPage,
    zoomLevel,
    fitMode,
    isZenMode,
    searchEngine,
    setCurrentPage,
  } = useReaderStore();

  const { triggerLookup } = useLookupStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [computedScale, setComputedScale] = useState(zoomLevel);
  const [isBilingualOpen, setIsBilingualOpen] = useState(false);
  const [isReadAloudOpen, setIsReadAloudOpen] = useState(false);
  const [currentPageText, setCurrentPageText] = useState('');
  const [defaultDimensions, setDefaultDimensions] = useState<{ width: number; height: number }>({
    width: 612,
    height: 792,
  });
  const hasScrolledInitialRef = useRef(false);

  // Fetch initial page dimensions for smooth layout without jumping
  useEffect(() => {
    if (pdfDocProxy) {
      pdfDocProxy
        .getPage(1)
        .then((page) => {
          const vp = page.getViewport({ scale: 1 });
          setDefaultDimensions({ width: vp.width, height: vp.height });
        })
        .catch(() => {});
    }
  }, [pdfDocProxy]);

  // Reset initial scroll flag when document changes
  useEffect(() => {
    hasScrolledInitialRef.current = false;
  }, [pdfDocProxy]);

  // Stable callback for page intersection to avoid observer recreation
  const handlePageIntersect = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  // Extract text of current page for Bilingual & Read-Aloud
  useEffect(() => {
    if (searchEngine) {
      searchEngine.getPageText(currentPage).then(setCurrentPageText);
    }
  }, [searchEngine, currentPage]);

  // Track active reading time (15 seconds increment)
  useEffect(() => {
    const timer = setInterval(() => {
      insightsService.recordReadingSeconds(15);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Handle text selection in PDF text layer (touch, stylus, mouse)
  const handleSelectionCheck = useCallback(() => {
    setTimeout(() => {
      const details = getSelectionDetails();
      if (details && details.text.trim()) {
        triggerLookup(details);
      }
    }, 40);
  }, [triggerLookup]);

  // Listen to mobile / tablet document selectionchange for reliable lookup
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleSelectionChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
          const details = getSelectionDetails();
          if (details && details.text.trim()) {
            triggerLookup(details);
          }
        }
      }, 250);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [triggerLookup]);

  // Compute scale when fitMode is active or on container resize
  const updateFitScale = useCallback(async () => {
    if (!pdfDocProxy || !scrollContainerRef.current) return;
    if (fitMode === 'custom') {
      setComputedScale(zoomLevel);
      return;
    }

    try {
      const firstPage = await pdfDocProxy.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const container = scrollContainerRef.current;

      const availableWidth = container.clientWidth - 48; // padding
      const availableHeight = container.clientHeight - 48;

      if (fitMode === 'fit-width') {
        const rawScale = Math.max(0.4, Math.min(2.5, availableWidth / viewport.width));
        const scale = Number(rawScale.toFixed(2));
        setComputedScale((prev) => (Math.abs(prev - scale) > 0.02 ? scale : prev));
      } else if (fitMode === 'fit-page') {
        const rawScale = Math.max(0.4, Math.min(2.0, availableHeight / viewport.height));
        const scale = Number(rawScale.toFixed(2));
        setComputedScale((prev) => (Math.abs(prev - scale) > 0.02 ? scale : prev));
      }
    } catch (err) {
      console.warn('Failed to calculate fit scale:', err);
    }
  }, [pdfDocProxy, fitMode, zoomLevel]);

  useEffect(() => {
    updateFitScale();
    window.addEventListener('resize', updateFitScale);
    return () => window.removeEventListener('resize', updateFitScale);
  }, [updateFitScale]);

  // Re-calculate fit scale when bilingual pane opens/closes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFitScale();
    }, 100);
    return () => clearTimeout(timer);
  }, [isBilingualOpen, updateFitScale]);

  // Initial scroll to persisted page ONCE per document open
  useEffect(() => {
    if (!hasScrolledInitialRef.current && currentPage > 1) {
      hasScrolledInitialRef.current = true;
      const timer = setTimeout(() => {
        const el = document.getElementById(`pdf-page-${currentPage}`);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  if (!pdfDocProxy) return null;

  return (
    <div className={`flex flex-col ${isZenMode ? 'h-screen' : 'h-[calc(100vh-3.5rem)]'} overflow-hidden bg-gray-100 dark:bg-zinc-950`}>
      {/* PDF Action Toolbar */}
      <PdfToolbar
        onToggleBilingual={() => setIsBilingualOpen(!isBilingualOpen)}
        isBilingualOpen={isBilingualOpen}
        onToggleReadAloud={() => setIsReadAloudOpen(!isReadAloudOpen)}
        isReadAloudOpen={isReadAloudOpen}
      />

      {/* Main Reading Canvas & Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        <PdfSidebar />

        {/* Scrollable Document Container */}
        <div
          ref={scrollContainerRef}
          id="pdf-scroll-container"
          onMouseUp={handleSelectionCheck}
          onPointerUp={handleSelectionCheck}
          onTouchEnd={handleSelectionCheck}
          className="pdf-viewer-scroll-container flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center select-text"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isWithinWindow = Math.abs(pageNum - currentPage) <= VIRTUAL_WINDOW_PAGES;
            const targetWidth = (defaultDimensions?.width || 612) * computedScale;
            const targetHeight = (defaultDimensions?.height || 792) * computedScale;

            if (isWithinWindow) {
              return (
                <PdfPage
                  key={pageNum}
                  pdfDoc={pdfDocProxy}
                  pageNumber={pageNum}
                  scale={computedScale}
                  defaultDimensions={defaultDimensions}
                  onPageIntersect={handlePageIntersect}
                />
              );
            }

            return (
              <PdfPagePlaceholder
                key={pageNum}
                pageNumber={pageNum}
                width={targetWidth}
                height={targetHeight}
                onPageIntersect={handlePageIntersect}
              />
            );
          })}
        </div>

        {/* Parallel Bilingual Pane */}
        <BilingualPane
          isOpen={isBilingualOpen}
          onClose={() => setIsBilingualOpen(false)}
          pageOrSectionText={currentPageText}
        />
      </div>

      {/* Floating Freehand Ink Controls */}
      <PdfInkToolbar />

      {/* Floating Read-Aloud Audio Player */}
      <ReadAloudBar
        isOpen={isReadAloudOpen}
        onClose={() => setIsReadAloudOpen(false)}
        fullText={currentPageText}
      />
    </div>
  );
};
