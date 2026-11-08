import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Copy,
  Download,
  List,
  Check,
  FileDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Code2,
  Clock,
  Sparkles
} from 'lucide-react';
import { PdfSettings, HeadingItem } from '../types';
import { generateThemeCss } from '../utils/themeStyles';
import { exportMarkdownFile } from '../utils/pdfExport';

interface PreviewPanelProps {
  html: string;
  headings: HeadingItem[];
  settings: PdfSettings;
  documentTitle: string;
  markdown: string;
  onDownloadPdf: () => void;
  onPrintPdf: () => void;
  isGeneratingPdf: boolean;
  isRendering: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  html,
  headings,
  settings,
  documentTitle,
  markdown,
  onDownloadPdf,
  onPrintPdf,
  isGeneratingPdf,
  isRendering,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [zoom, setZoom] = useState(100);
  const [fitToWidth, setFitToWidth] = useState(true);
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [isFocusReader, setIsFocusReader] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Pinch-to-zoom and gesture states
  const [isPinching, setIsPinching] = useState(false);
  const [showZoomPill, setShowZoomPill] = useState(false);
  const zoomPillTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pinchStartDistRef = useRef<number>(0);
  const pinchStartZoomRef = useRef<number>(100);
  const lastTapRef = useRef<number>(0);

  // Target paper dimensions
  const targetPaperWidth = settings.orientation === 'landscape' ? 1040 : 780;

  // Refs for zero-latency touch listeners without re-binding
  const fitToWidthRef = useRef(fitToWidth);
  fitToWidthRef.current = fitToWidth;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const targetPaperWidthRef = useRef(targetPaperWidth);
  targetPaperWidthRef.current = targetPaperWidth;
  const containerWidthRef = useRef(containerWidth);
  containerWidthRef.current = containerWidth;

  const triggerZoomPill = () => {
    setShowZoomPill(true);
    if (zoomPillTimeoutRef.current) clearTimeout(zoomPillTimeoutRef.current);
    zoomPillTimeoutRef.current = setTimeout(() => setShowZoomPill(false), 2200);
  };

  // Keyboard shortcut: Escape exits focus reader mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusReader) {
        setIsFocusReader(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusReader]);

  // Read container width via ResizeObserver
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(el);

    // Two-finger Touch Pinch-in / Pinch-out Handlers (Moto Pad 70 Pro & Touchscreens)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartDistRef.current = dist;
        const currentEffective = fitToWidthRef.current
          ? Math.min(1, Math.max(0.35, (containerWidthRef.current - 48) / targetPaperWidthRef.current))
          : zoomRef.current / 100;
        pinchStartZoomRef.current = Math.round(currentEffective * 100);
        setIsPinching(true);
        triggerZoomPill();
      } else if (e.touches.length === 1) {
        // Quick double-tap to toggle between Auto Fit and 100%
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          setFitToWidth((prev) => {
            const next = !prev;
            if (!next) setZoom(100);
            return next;
          });
          triggerZoomPill();
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistRef.current > 0) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / pinchStartDistRef.current;
        const newZoom = Math.min(260, Math.max(35, Math.round(pinchStartZoomRef.current * factor)));
        setFitToWidth(false);
        setZoom(newZoom);
        triggerZoomPill();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false);
        pinchStartDistRef.current = 0;
      }
    };

    // Trackpad Pinch Gesture (Mac & Windows Trackpad with Ctrl + Wheel)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.8;
        const currentEffectiveScale = fitToWidthRef.current
          ? Math.min(1, Math.max(0.45, (containerWidthRef.current - 48) / targetPaperWidthRef.current))
          : zoomRef.current / 100;
        const baseZoom = Math.round(currentEffectiveScale * 100);
        setFitToWidth(false);
        setZoom(Math.min(260, Math.max(35, Math.round(baseZoom + delta))));
        triggerZoomPill();
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
      if (zoomPillTimeoutRef.current) clearTimeout(zoomPillTimeoutRef.current);
    };
  }, []);

  // Compute effective scale when Fit To Width is active (Supports compact phones down to 320px)
  const computedScale = fitToWidth
    ? Math.min(1, Math.max(0.30, (containerWidth - 32) / targetPaperWidth))
    : zoom / 100;

  // Computed layout dimensions so scaled paper centers and scrolls with 100% precision
  const basePaperHeight = settings.orientation === 'landscape' ? 740 : 1050;
  const scaledWidth = Math.round(targetPaperWidth * computedScale);
  const scaledHeight = Math.round(basePaperHeight * computedScale);

  // Generate scoped CSS for live preview
  const themeCss = generateThemeCss(settings);

  // Copy HTML to clipboard
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (_) {}
  };

  // Copy raw content/code to clipboard
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (_) {}
  };

  // Unique scroll storage key per document to prevent cross-document scroll jumps
  const scrollStorageKey = `markforge_scroll_${documentTitle.replace(/[^\w-]/g, '_')}`;

  // Handle and save scroll position to localStorage + update reading progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target) {
      try {
        localStorage.setItem(scrollStorageKey, String(target.scrollTop));
      } catch (_) {}

      // Calculate 0 to 100% progress
      const maxScroll = target.scrollHeight - target.clientHeight;
      const progress = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((target.scrollTop / maxScroll) * 100))) : 0;
      setReadingProgress(progress);
    }
  };

  // Restore scroll position on document mount and after re-renders
  useEffect(() => {
    if (!html) return;

    const restoreScroll = () => {
      const el = scrollAreaRef.current;
      if (!el) return;

      const savedTopStr = localStorage.getItem(scrollStorageKey);
      if (savedTopStr !== null) {
        const savedTop = parseFloat(savedTopStr);
        if (!isNaN(savedTop) && savedTop > 0 && savedTop <= el.scrollHeight) {
          el.scrollTop = savedTop;
          return;
        }
      }
      // If no valid saved position for this document, ensure it's at top
      el.scrollTop = 0;
    };

    const t1 = setTimeout(restoreScroll, 50);
    const t2 = setTimeout(restoreScroll, 200);
    const t3 = setTimeout(restoreScroll, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [documentTitle, html, scrollStorageKey]);

  // Jump to heading in preview
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowTocDrawer(false);
  };

  const handleDownloadMarkdown = () => {
    exportMarkdownFile(markdown, documentTitle);
  };

  // Metrics: word count, lines, reading time
  const { wordCount, lineCount, readingTimeMinutes } = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const lines = markdown.split('\n').length;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return { wordCount: words, lineCount: lines, readingTimeMinutes: minutes };
  }, [markdown]);

  return (
    <div
      className={`flex-1 flex flex-col h-full bg-[var(--bg-page)] text-[var(--text-primary)] font-mono overflow-hidden relative ${
        isFocusReader ? 'fixed inset-0 z-50 bg-[var(--bg-page)]' : ''
      }`}
    >
      {/* ── Dynamic Reading Progress Bar ── */}
      <div className="w-full h-[2.5px] bg-transparent absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-150 ease-out shadow-xs"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Preview Controls Bar - DSASpace Style */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-xs shrink-0 overflow-x-auto no-scrollbar gap-2 sm:gap-3">
        {/* Left: Outline & Sidebar Minimizer */}
        <div className="flex items-center space-x-2">
          {!isFocusReader && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition items-center space-x-1.5 text-xs font-mono"
              title={isSidebarCollapsed ? 'Show Editor Side' : 'Minimize Editor Side'}
            >
              {isSidebarCollapsed ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="hidden sm:inline">Show Editor</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Minimize Text</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowTocDrawer(!showTocDrawer)}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition flex items-center space-x-2 text-xs font-mono ${
              showTocDrawer
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent shadow-sm'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
            title="Toggle Outline / Table of Contents"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Outline</span>
            {headings.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[var(--border-subtle)]">
                {headings.length}
              </span>
            )}
          </button>

          {/* Reading Time Badge */}
          <div className="hidden lg:flex items-center space-x-1 text-[10px] text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2 py-1 rounded-xl">
            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
            <span>~{readingTimeMinutes} min read</span>
          </div>
        </div>

        {/* Center: Zoom & Auto-Fit Controls (Solves clipping on tablets) */}
        <div className="flex items-center space-x-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-xl">
          <button
            onClick={() => {
              setFitToWidth(false);
              setZoom((z) => Math.max(40, z - 15));
            }}
            title="Zoom out"
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setFitToWidth(!fitToWidth);
              if (!fitToWidth) setZoom(100);
            }}
            title="Toggle Auto Fit to Screen Width"
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition ${
              fitToWidth
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {fitToWidth ? 'Auto Fit' : `${zoom}%`}
          </button>

          <button
            onClick={() => {
              setFitToWidth(false);
              setZoom((z) => Math.min(160, z + 15));
            }}
            title="Zoom in"
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Reader Mode & Document Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Focus Reader Toggle */}
          <button
            onClick={() => setIsFocusReader(!isFocusReader)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition flex items-center space-x-1.5 text-xs font-mono ${
              isFocusReader
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent shadow-sm'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
            title={isFocusReader ? 'Exit Focus Reader (Esc)' : 'Enter Distraction-Free Focus Reader'}
          >
            {isFocusReader ? <Minimize2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isFocusReader ? 'Exit Reader' : 'Reader'}</span>
          </button>

          {/* Copy Raw Code / Markdown Button */}
          <button
            onClick={handleCopyContent}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center space-x-1.5 text-xs font-mono"
            title="Copy Content / Code"
          >
            {copiedContent ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedContent ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download Markdown */}
          <button
            onClick={handleDownloadMarkdown}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center space-x-1.5 text-xs font-mono"
            title="Download .md file"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">.md</span>
          </button>
        </div>
      </div>

      {/* Main Preview Scroll Area (Supports 2-Finger Pinch In/Out, Trackpad Pinch & 1-Finger Pan) */}
      <div
        id="markpdf-scroll-area"
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-2 sm:p-6 lg:p-8 relative select-text"
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {/* Scoped CSS styling for preview document */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />

        {/* Paper Container Simulation (Dynamically scaled via Pinch or Auto Fit) */}
        <div
          style={{
            width: fitToWidth ? '100%' : `${scaledWidth}px`,
            minHeight: `${scaledHeight}px`,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div
            id="markpdf-paper-container"
            className="paper-preview-wrapper transition-transform duration-75 origin-top"
            style={{
              width: `${targetPaperWidth}px`,
              transform: `scale(${computedScale})`,
              transformOrigin: 'top center',
              margin: '0 auto'
            }}
          >
            <div className={`paper-preview-sheet theme-${settings.theme}`}>
              {/* Document Header if enabled */}
              {settings.showHeader && (
                <div className="border-b border-slate-200 pb-3 mb-6 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="font-semibold">{settings.headerTitle || documentTitle}</span>
                  {settings.showDate && <span>{new Date().toLocaleDateString()}</span>}
                </div>
              )}

              {/* Table of Contents if enabled */}
              {settings.showToc && headings.length > 0 && (
                <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 font-mono">
                    Table of Contents
                  </h2>
                  <ul className="space-y-1.5 text-xs">
                    {headings.map((h, i) => (
                      <li
                        key={`${h.id}-${i}`}
                        style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                      >
                        <a
                          href={`#${h.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToHeading(h.id);
                          }}
                          className="text-slate-800 hover:underline font-mono"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rendered Markdown & Code Body */}
              <div
                className="markpdf-doc"
                dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-400 italic">No content to preview</p>' }}
              />

              {/* Document Footer if enabled */}
              {settings.showPageNumbers && (
                <div className="border-t border-slate-200 mt-12 pt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{settings.headerTitle || documentTitle}</span>
                  <span>Page 1 of 1</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Zoom Indicator & Quick Controls on Pinch / Zoom */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 pointer-events-auto ${
            showZoomPill || isPinching
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-strong)] shadow-2xl text-xs font-mono">
            <button
              onClick={() => {
                setFitToWidth(false);
                setZoom((z) => Math.max(35, z - 10));
                triggerZoomPill();
              }}
              className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)] transition"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="font-semibold min-w-[50px] text-center text-[var(--text-primary)]">
              {Math.round(computedScale * 100)}%
            </span>

            <button
              onClick={() => {
                setFitToWidth(false);
                setZoom((z) => Math.min(260, z + 10));
                triggerZoomPill();
              }}
              className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)] transition"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3 bg-[var(--border-subtle)]" />

            <button
              onClick={() => {
                setFitToWidth(true);
                triggerZoomPill();
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                fitToWidth
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Auto Fit
            </button>
          </div>
        </div>

        {/* Focus Reader Mode Quick Exit Floating Pill */}
        {isFocusReader && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-strong)] px-3 py-2 rounded-2xl shadow-2xl">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
              {readingProgress}% read
            </span>
            <button
              onClick={() => setIsFocusReader(false)}
              className="px-3 py-1 bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold rounded-xl text-xs transition"
            >
              Exit Focus (Esc)
            </button>
          </div>
        )}
      </div>

      {/* Floating Outline / TOC Drawer */}
      {showTocDrawer && (
        <div className="absolute top-12 left-4 w-72 max-h-[calc(100%-4rem)] bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-4 overflow-y-auto z-30 animate-in fade-in duration-100">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <h3 className="text-xs font-mono font-semibold text-[var(--text-primary)] flex items-center space-x-1.5">
              <List className="w-3.5 h-3.5" />
              <span>Document Outline</span>
            </h3>
            <button
              onClick={() => setShowTocDrawer(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs px-2 py-0.5 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="text-[10px] text-[var(--text-muted)] mb-2 flex items-center justify-between">
            <span>{wordCount} words • {lineCount} lines</span>
            <span>~{readingTimeMinutes}m read</span>
          </div>

          {headings.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No headings found.</p>
          ) : (
            <div className="space-y-1">
              {headings.map((h, i) => (
                <button
                  key={`${h.id}-${i}`}
                  onClick={() => scrollToHeading(h.id)}
                  style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
                  className={`w-full text-left text-xs font-mono rounded-lg py-1 px-2 transition truncate block ${
                    h.level === 1
                      ? 'font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                      : h.level === 2
                      ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] text-[11px]'
                  }`}
                >
                  {h.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
