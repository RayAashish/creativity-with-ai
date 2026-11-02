import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { InputMode, PdfSettings, HeadingItem, TabletViewMode, AppTheme } from './types';
import { SAMPLE_SHOWCASE } from './utils/sampleMarkdown';
import { parseMarkdownToHtml } from './utils/markdownParser';
import { downloadPdfFromServer, exportPdfClientSide, printViaBrowser, buildCompleteHtml } from './utils/pdfExport';
import { fetchMarkdownContent } from './utils/githubUrlHelper';
import { FileEdit, SlidersHorizontal, Eye, PanelLeftOpen, GripVertical } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const STORAGE_KEYS = {
  MARKDOWN: 'markpdf_saved_markdown',
  TITLE: 'markpdf_saved_title',
  FILENAME: 'markpdf_saved_filename',
  URL: 'markpdf_saved_url',
  THEME: 'markpdf_theme',
  SIDEBAR_WIDTH: 'markpdf_sidebar_width'
};

export const App: React.FC = () => {
  // Load persisted document or default to showcase
  const [markdown, setMarkdown] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.MARKDOWN);
      if (saved && saved.trim().length > 0) return saved;
    }
    return SAMPLE_SHOWCASE;
  });
  const [html, setHtml] = useState<string>('');
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [documentTitle, setDocumentTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.TITLE);
      if (saved && saved.trim().length > 0) return saved;
    }
    return 'MarkPDF Feature Showcase';
  });
  const [fileName, setFileName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.FILENAME);
      if (saved && saved.trim().length > 0) return saved;
    }
    return 'showcase.md';
  });
  const [mode, setMode] = useState<InputMode>('editor');
  const [activeLeftTab, setActiveLeftTab] = useState<'input' | 'settings'>('input');
  const [mobileTab, setMobileTab] = useState<'editor' | 'settings' | 'preview'>('editor');
  const [viewMode, setViewMode] = useState<TabletViewMode>('split');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // App Theme: 'dark' | 'beige' | 'light' (Matches DSASpace)
  const [appTheme, setAppTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme) || 'dark';
  });

  // Dynamic Draggable Sidebar Width (in px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('markpdf_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 260) return parsed;
      }
      return Math.max(360, Math.min(620, Math.floor(window.innerWidth * 0.42)));
    }
    return 480;
  });

  const [isResizing, setIsResizing] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const sidebarWidthRef = useRef<number>(sidebarWidth);

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [settings, setSettings] = useState<PdfSettings>({
    theme: 'minimal',
    format: 'A4',
    orientation: 'portrait',
    margin: 'standard',
    fontSize: 'normal',
    fontFamily: 'mono',
    showPageNumbers: true,
    showHeader: false,
    headerTitle: 'MarkPDF Document',
    showDate: true,
    showToc: false,
    codeTheme: 'github'
  });

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, appTheme);
  }, [appTheme]);

  // Persist current document across page reloads & app restarts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MARKDOWN, markdown);
      localStorage.setItem(STORAGE_KEYS.TITLE, documentTitle);
      localStorage.setItem(STORAGE_KEYS.FILENAME, fileName);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [markdown, documentTitle, fileName]);

  // Pointer event handlers for draggable resizer (Touch & Mouse unified via Pointer Events API)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    isDraggingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const minW = 260;
    const maxW = Math.max(minW, window.innerWidth - 320);
    const newWidth = Math.round(Math.max(minW, Math.min(maxW, e.clientX)));
    sidebarWidthRef.current = newWidth;
    setSidebarWidth(newWidth);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      localStorage.setItem('markpdf_sidebar_width', sidebarWidthRef.current.toString());
    }
  };

  const handleResetWidth = () => {
    const defaultW = Math.max(360, Math.min(620, Math.floor(window.innerWidth * 0.42)));
    setSidebarWidth(defaultW);
    sidebarWidthRef.current = defaultW;
    localStorage.setItem('markpdf_sidebar_width', defaultW.toString());
    showToast(`Editor width reset to ${defaultW}px`);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Re-render markdown when changed
  useEffect(() => {
    let isMounted = true;
    setIsRendering(true);

    const timer = setTimeout(async () => {
      try {
        const { html: parsedHtml, headings: extractedHeadings } = await parseMarkdownToHtml(markdown);
        if (isMounted) {
          setHtml(parsedHtml);
          setHeadings(extractedHeadings);
        }
      } catch (err) {
        console.error('Parsing markdown failed:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [markdown]);

  // Load a preset sample
  const handleLoadSample = (content: string, title: string) => {
    setMarkdown(content);
    setDocumentTitle(title);
    setFileName(`${title.toLowerCase().replace(/\s+/g, '-')}.md`);
    setSettings((prev) => ({ ...prev, headerTitle: title }));
    showToast(`Loaded "${title}"`);
  };

  // Reset to empty
  const handleReset = () => {
    const blank = '# Untitled Document\n\nStart typing markdown here...';
    setMarkdown(blank);
    setDocumentTitle('Untitled Document');
    setFileName('document.md');
    setSettings((prev) => ({ ...prev, headerTitle: 'Untitled Document' }));
    try {
      localStorage.removeItem(STORAGE_KEYS.MARKDOWN);
      localStorage.removeItem(STORAGE_KEYS.TITLE);
      localStorage.removeItem(STORAGE_KEYS.FILENAME);
      localStorage.removeItem(STORAGE_KEYS.URL);
    } catch (_) {}
    showToast('Document reset');
  };

  // File Upload Handler
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setMarkdown(content);
        setFileName(file.name);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setDocumentTitle(nameWithoutExt);
        setSettings((prev) => ({ ...prev, headerTitle: nameWithoutExt }));
        try {
          localStorage.setItem(STORAGE_KEYS.MARKDOWN, content);
          localStorage.setItem(STORAGE_KEYS.TITLE, nameWithoutExt);
          localStorage.setItem(STORAGE_KEYS.FILENAME, file.name);
        } catch (_) {}
        setMode('editor');
        showToast(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // URL Fetch Handler
  const handleUrlFetch = async (url: string) => {
    setIsFetchingUrl(true);
    try {
      const data = await fetchMarkdownContent(url);
      setMarkdown(data.content);
      const name = data.filename || 'fetched-document.md';
      setFileName(name);
      const title = data.title || name.replace(/\.md$/i, '');
      setDocumentTitle(title);
      setSettings((prev) => ({ ...prev, headerTitle: title }));

      try {
        localStorage.setItem(STORAGE_KEYS.MARKDOWN, data.content);
        localStorage.setItem(STORAGE_KEYS.TITLE, title);
        localStorage.setItem(STORAGE_KEYS.FILENAME, name);
        localStorage.setItem(STORAGE_KEYS.URL, url);
      } catch (_) {}

      setMode('editor');
      showToast(`Fetched markdown from ${data.sourceUrl || 'URL'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch URL', 'error');
      throw err;
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Listen for native Android PDF save confirmation
  useEffect(() => {
    (window as any).onPdfSaved = (fileName: string) => {
      showToast(`PDF saved to Downloads: ${fileName}`);
      setIsGeneratingPdf(false);
    };
    return () => {
      delete (window as any).onPdfSaved;
    };
  }, []);

  // Universal PDF Download (Works on Web AND Android without ANR or media permissions)
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    showToast('Preparing PDF...');
    try {
      // 1. Android Native App: Direct PDF file download to Downloads folder
      if (Capacitor.isNativePlatform() && (window as any).AndroidPrint) {
        const fullHtml = buildCompleteHtml(html, settings, headings, documentTitle);
        if (typeof (window as any).AndroidPrint.downloadPdfDirect === 'function') {
          (window as any).AndroidPrint.downloadPdfDirect(fullHtml, documentTitle);
          showToast('Saving PDF directly to Downloads folder...');
          setIsGeneratingPdf(false);
          return;
        } else if (typeof (window as any).AndroidPrint.printPdf === 'function') {
          (window as any).AndroidPrint.printPdf(documentTitle);
          setIsGeneratingPdf(false);
          return;
        }
      }

      // 2. On Web, try server endpoint first for vector fidelity
      const serverResult = await downloadPdfFromServer(html, settings, headings, documentTitle);
      if (serverResult.success) {
        showToast('PDF downloaded successfully!');
        return;
      }

      // 3. Web fallback: Client-side html2pdf
      const paperElement = document.getElementById('markpdf-paper-container');
      if (paperElement) {
        showToast('Generating PDF via browser...');
        const clientResult = await exportPdfClientSide(paperElement, settings, documentTitle);
        if (clientResult.success) {
          showToast('PDF downloaded!');
          return;
        }
      }

      // 4. Ultimate fallback: Browser Print
      printViaBrowser(html, settings, headings, documentTitle);
    } catch (err: any) {
      console.error('Download error:', err);
      printViaBrowser(html, settings, headings, documentTitle);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Browser / Android Native Print Dialog
  const handlePrintPdf = () => {
    if (Capacitor.isNativePlatform() && (window as any).AndroidPrint) {
      const fullHtml = buildCompleteHtml(html, settings, headings, documentTitle);
      if (typeof (window as any).AndroidPrint.printHtml === 'function') {
        (window as any).AndroidPrint.printHtml(fullHtml, documentTitle);
      } else {
        (window as any).AndroidPrint.printPdf(documentTitle);
      }
      return;
    }
    printViaBrowser(html, settings, headings, documentTitle);
  };

  // Determine if sidebar should be shown
  const showSidebar = !isSidebarCollapsed && viewMode !== 'preview';

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--bg-page)] text-[var(--text-primary)] font-mono overflow-hidden select-text transition-colors">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-mono font-semibold flex items-center space-x-2 transition-all duration-200 animate-in slide-in-from-bottom-2 ${
            notification.type === 'error'
              ? 'bg-red-600 text-white border border-red-500'
              : 'bg-[var(--accent)] text-[var(--accent-contrast)] border border-[var(--border-strong)]'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        onDownloadPdf={handleDownloadPdf}
        onPrintPdf={handlePrintPdf}
        isGeneratingPdf={isGeneratingPdf}
        documentTitle={documentTitle}
        viewMode={viewMode}
        onViewModeChange={(m) => {
          setViewMode(m);
          if (m === 'preview') setIsSidebarCollapsed(true);
          else setIsSidebarCollapsed(false);
        }}
        appTheme={appTheme}
        onAppThemeChange={setAppTheme}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Expand Sidebar Button when collapsed (Desktop/Tablet Only) */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="hidden md:flex absolute top-3 left-3 z-20 p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-lg hover:bg-[var(--bg-card-hover)] transition items-center space-x-1.5 text-xs font-mono"
            title="Expand Editor Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Show Editor</span>
          </button>
        )}

        {/* Left Panel (Input & Settings) - Responsive for Mobile & Desktop */}
        <div
          style={
            viewMode === 'editor'
              ? { width: '100%' }
              : { width: `${sidebarWidth}px` }
          }
          className={`flex flex-col border-r border-[var(--border-subtle)] shrink-0 bg-[var(--bg-subtle)] ${
            isResizing ? 'transition-none select-none' : 'transition-[width] duration-150'
          } ${
            mobileTab === 'preview' ? 'hidden' : 'flex'
          } ${
            showSidebar ? 'md:flex' : 'md:hidden'
          } w-full md:w-auto`}
        >
            {/* Subheader: Switch between Content Input & Styling Settings (Desktop only; on mobile bottom bar switches this) */}
            <div className="hidden md:flex items-center justify-between px-3 py-2 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setActiveLeftTab('input');
                    setMobileTab('editor');
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                    activeLeftTab === 'input'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Markdown</span>
                </button>

                <button
                  onClick={() => {
                    setActiveLeftTab('settings');
                    setMobileTab('settings');
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                    activeLeftTab === 'settings'
                      ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Layout & Theme</span>
                </button>
              </div>

              {/* Quick Minimize Text Side button */}
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="text-[10px] font-mono px-2 py-1 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                title="Minimize Text Side"
              >
                Hide
              </button>
            </div>

            {/* Left Panel Content */}
            <div className="flex-1 min-h-0 flex flex-col">
              {activeLeftTab === 'input' ? (
                <InputPanel
                  mode={mode}
                  onModeChange={setMode}
                  markdown={markdown}
                  onMarkdownChange={setMarkdown}
                  onUrlFetch={handleUrlFetch}
                  isFetchingUrl={isFetchingUrl}
                  fileName={fileName}
                  onFileUpload={handleFileUpload}
                />
              ) : (
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                  documentTitle={documentTitle}
                  onTitleChange={setDocumentTitle}
                />
              )}
            </div>
          </div>

        {/* Draggable Divider Splitter Handle (Mouse, Touch, Pen Pointer Support) */}
        {showSidebar && viewMode === 'split' && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleResetWidth}
            className="hidden md:flex items-center justify-center w-5 hover:w-5 -ml-2.5 z-30 cursor-col-resize group relative select-none shrink-0 touch-none"
            title="Drag to resize editor view • Double-click to reset"
          >
            {/* Splitter Line */}
            <div
              className={`w-[2px] h-full transition-colors ${
                isResizing
                  ? 'bg-[var(--accent)] w-[3px]'
                  : 'bg-[var(--border-subtle)] group-hover:bg-[var(--accent)]'
              }`}
            />
            {/* Grab Grip Badge */}
            <div
              className={`absolute w-4 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center shadow-md transition-all ${
                isResizing ? 'opacity-100 scale-110 border-[var(--accent)] shadow-lg ring-2 ring-[var(--accent)]/30' : 'opacity-40 group-hover:opacity-100'
              }`}
            >
              <GripVertical className="w-2.5 h-2.5 text-[var(--text-primary)]" />
            </div>

            {/* Live Size Badge during Drag */}
            {isResizing && (
              <div className="absolute top-1/2 -translate-y-1/2 left-6 z-50 pointer-events-none px-2.5 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-strong)] text-[11px] font-mono font-semibold shadow-2xl whitespace-nowrap text-[var(--text-primary)] flex items-center space-x-1.5 animate-in fade-in">
                <span>{sidebarWidth}px</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-muted)]">
                  {Math.round((sidebarWidth / (typeof window !== 'undefined' ? window.innerWidth : 1200)) * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Right Panel: Live Document Preview */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            mobileTab === 'preview' ? 'flex' : 'hidden'
          } ${
            isSidebarCollapsed || viewMode === 'split' || viewMode === 'preview' ? 'md:flex' : 'md:hidden'
          }`}
        >
          <PreviewPanel
            html={html}
            headings={headings}
            settings={settings}
            documentTitle={documentTitle}
            markdown={markdown}
            onDownloadPdf={handleDownloadPdf}
            onPrintPdf={handlePrintPdf}
            isGeneratingPdf={isGeneratingPdf}
            isRendering={isRendering}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
      </div>

      {/* Mobile/Tablet Bottom Navigation Dock (Safe from gesture navigation bar) */}
      <div className="flex md:hidden bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),_8px)] text-xs shrink-0 z-30 justify-around safe-bottom-padding">
        <button
          data-tab="editor"
          onClick={() => {
            setMobileTab('editor');
            setActiveLeftTab('input');
          }}
          className={`flex-1 py-1.5 font-medium flex flex-col items-center space-y-0.5 rounded-xl transition ${
            mobileTab === 'editor'
              ? 'text-[var(--accent)] bg-[var(--badge-bg)] font-semibold'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span className="text-[10px]">Editor</span>
        </button>

        <button
          data-tab="style"
          onClick={() => {
            setMobileTab('settings');
            setActiveLeftTab('settings');
          }}
          className={`flex-1 py-1.5 font-medium flex flex-col items-center space-y-0.5 rounded-xl transition ${
            mobileTab === 'settings'
              ? 'text-[var(--accent)] bg-[var(--badge-bg)] font-semibold'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px]">Style</span>
        </button>

        <button
          data-tab="preview"
          onClick={() => {
            setMobileTab('preview');
          }}
          className={`flex-1 py-1.5 font-medium flex flex-col items-center space-y-0.5 rounded-xl transition ${
            mobileTab === 'preview'
              ? 'text-[var(--accent)] bg-[var(--badge-bg)] font-semibold'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-[10px]">Preview</span>
        </button>
      </div>
    </div>
  );
};

export default App;
