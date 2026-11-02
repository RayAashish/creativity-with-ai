import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Download,
  List,
  Check,
  Printer,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Eye
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
    if (zoomPillTimeoutRef.current) {
      clearTimeout(zoomPillTimeoutRef.current);
    }
    zoomPillTimeoutRef.current = setTimeout(() => {
      setShowZoomPill(false);
    }, 2000);
  };

  // Track container width and bind pinch-to-zoom gestures
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.clientWidth);
    };
    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
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

        const currentEffectiveScale = fitToWidthRef.current
          ? Math.min(1, Math.max(0.45, (containerWidthRef.current - 48) / targetPaperWidthRef.current))
          : zoomRef.current / 100;

        pinchStartZoomRef.current = Math.round(currentEffectiveScale * 100);
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
        const newZoom = Math.max(35, Math.min(260, Math.round(pinchStartZoomRef.current * factor)));
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
        const nextZoom = Math.max(35, Math.min(260, Math.round(baseZoom + delta)));
        setFitToWidth(false);
        setZoom(nextZoom);
        triggerZoomPill();
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', updateWidth);
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
    } catch (e) {
      console.error(e);
    }
  };

  // Download raw markdown file (Works on both Web and Android native)
  const handleDownloadMarkdown = async () => {
    await exportMarkdownFile(markdown, documentTitle);
  };

  // Handle and save scroll position to localStorage
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target) {
      try {
        localStorage.setItem('markpdf_preview_scroll_top', String(target.scrollTop));
        if (target.scrollHeight > 0) {
          localStorage.setItem('markpdf_preview_scroll_ratio', String(target.scrollTop / target.scrollHeight));
        }
      } catch (_) {}
    }
  };

  // Restore scroll position on document mount and after re-renders
  useEffect(() => {
    if (!html) return;

    const restoreScroll = () => {
      const el = scrollAreaRef.current;
      if (!el) return;

      const savedTopStr = localStorage.getItem('markpdf_preview_scroll_top');
      const savedRatioStr = localStorage.getItem('markpdf_preview_scroll_ratio');

      if (savedTopStr !== null) {
        const savedTop = parseFloat(savedTopStr);
        if (!isNaN(savedTop) && savedTop > 0) {
          if (el.scrollHeight >= savedTop) {
            el.scrollTop = savedTop;
          } else if (savedRatioStr !== null) {
            const ratio = parseFloat(savedRatioStr);
            if (!isNaN(ratio)) {
              el.scrollTop = ratio * el.scrollHeight;
            }
          }
        }
      }
    };

    const t1 = setTimeout(restoreScroll, 50);
    const t2 = setTimeout(restoreScroll, 200);
    const t3 = setTimeout(restoreScroll, 500);
    const t4 = setTimeout(restoreScroll, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [html]);

  // Jump to heading in preview
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-page)] text-[var(--text-primary)] font-mono overflow-hidden relative">
      {/* Top Preview Controls Bar - DSASpace Style */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-xs shrink-0 overflow-x-auto no-scrollbar gap-2 sm:gap-3">
        {/* Left: Outline & Sidebar Minimizer */}
        <div className="flex items-center space-x-2">
          {/* Collapse/Expand Sidebar Toggle (Desktop/Tablet Split Mode Only) */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition items-center space-x-1.5 text-xs font-mono"
            title={isSidebarCollapsed ? 'Show Editor' : 'Minimize Editor Side'}
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

        {/* Right: Document Actions (Copy HTML & Download Markdown — Print & PDF are in Top Header) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={handleCopyHtml}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center space-x-1.5 text-xs font-mono"
            title="Copy Rendered HTML"
          >
            {copiedHtml ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedHtml ? 'Copied' : 'HTML'}</span>
          </button>

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
            width: `${scaledWidth}px`,
            minHeight: `${scaledHeight}px`,
            marginBottom: '60px'
          }}
          className="mx-auto relative"
        >
          <div
            style={{
              transform: `scale(${computedScale})`,
              transformOrigin: 'top left',
              transition: isPinching ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              width: `${targetPaperWidth}px`,
              minHeight: `${basePaperHeight}px`
            }}
            className="bg-white text-slate-900 rounded-2xl shadow-xl p-6 sm:p-12 lg:p-14 relative border border-[var(--border-subtle)] shrink-0"
          >
            <div id="markpdf-paper-container">
              {isRendering && (
                <div className="absolute top-4 right-4 bg-zinc-900/10 text-zinc-800 border border-zinc-300 px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-ping" />
                  <span>Rendering...</span>
                </div>
              )}

              {/* Document Header if enabled */}
              {settings.showHeader && (
                <div className="border-b border-slate-200 pb-3 mb-6 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="font-semibold text-slate-600 uppercase tracking-wider">
                    {settings.headerTitle || documentTitle}
                  </span>
                  {settings.showDate && <span>{new Date().toLocaleDateString()}</span>}
                </div>
              )}

              {/* Table of Contents in document if enabled */}
              {settings.showToc && headings.length > 0 && (
                <div className="doc-toc-wrapper mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="doc-toc-title font-mono font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Table of Contents
                  </div>
                  <ul className="doc-toc-list space-y-1 text-xs">
                    {headings.map((h) => (
                      <li
                        key={h.id}
                        className={`doc-toc-item-${Math.min(h.level, 3)}`}
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

              {/* Rendered Markdown Body */}
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
