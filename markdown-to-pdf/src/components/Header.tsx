import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  RefreshCw,
  Columns,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  X
} from 'lucide-react';
import { TabletViewMode, AppTheme } from '../types';
import { SAMPLE_SHOWCASE, SAMPLE_GITHUB_README, SAMPLE_ACADEMIC_PAPER } from '../utils/sampleMarkdown';

interface HeaderProps {
  onLoadSample: (content: string, title: string) => void;
  onReset: () => void;
  onDownloadPdf: () => void;
  onPrintPdf: () => void;
  isGeneratingPdf: boolean;
  documentTitle: string;
  viewMode: TabletViewMode;
  onViewModeChange: (mode: TabletViewMode) => void;
  appTheme: AppTheme;
  onAppThemeChange: (theme: AppTheme) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  onDownloadPdf,
  onPrintPdf,
  isGeneratingPdf,
  documentTitle,
  viewMode,
  onViewModeChange,
  appTheme,
  onAppThemeChange,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Cycle through themes on mobile/compact tablet (single tap)
  const cycleTheme = () => {
    if (appTheme === 'dark') onAppThemeChange('beige');
    else if (appTheme === 'beige') onAppThemeChange('light');
    else onAppThemeChange('dark');
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-[var(--text-primary)] px-3 sm:px-4 lg:px-6 pt-[max(env(safe-area-inset-top),_10px)] pb-2.5 transition-colors w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Sidebar Toggle Button (Desktop/Tablet Only) */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            title={isSidebarCollapsed ? 'Show Sidebar' : 'Minimize Sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center font-mono font-bold text-xs shadow-sm shrink-0">
              <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-bold text-sm sm:text-base tracking-tight text-[var(--text-primary)]">
                MarkPDF
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--border-subtle)]">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher (Desktop & Tablet Split Screen — Compact Icons on Tablets < 1024px, Full on Desktop) */}
        <div className="hidden md:flex items-center space-x-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)] shrink-0">
          <button
            onClick={() => onViewModeChange('split')}
            className={`px-2.5 lg:px-3 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition ${
              viewMode === 'split' && !isSidebarCollapsed
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Split view"
          >
            <Columns className="w-4 h-4" />
            <span className="hidden xl:inline">Split</span>
          </button>
          <button
            onClick={() => onViewModeChange('editor')}
            className={`px-2.5 lg:px-3 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition ${
              viewMode === 'editor' && !isSidebarCollapsed
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Editor Focus"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden xl:inline">Editor</span>
          </button>
          <button
            onClick={() => onViewModeChange('preview')}
            className={`px-2.5 lg:px-3 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition ${
              viewMode === 'preview' || isSidebarCollapsed
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Minimize text side & focus preview"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden xl:inline">Preview</span>
          </button>
        </div>

        {/* Right: Theme Toggles & Export Actions (Guaranteed shrink-0 and within viewport) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 shrink-0">
          {/* Compact Single-Tap Theme Toggle for Mobile & Tablet Portrait (< 1024px) */}
          <button
            onClick={cycleTheme}
            className="flex lg:hidden p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
            title={`Theme: ${appTheme} (tap to cycle)`}
          >
            {appTheme === 'dark' && <Moon className="w-4 h-4" />}
            {appTheme === 'beige' && <Palette className="w-4 h-4" />}
            {appTheme === 'light' && <Sun className="w-4 h-4" />}
          </button>

          {/* Desktop DSASpace 3-Way Theme Switcher (>= 1024px) */}
          <div className="hidden lg:flex items-center p-0.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <button
              onClick={() => onAppThemeChange('dark')}
              className={`p-1.5 rounded-lg transition ${
                appTheme === 'dark'
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Dark Obsidian theme"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAppThemeChange('beige')}
              className={`p-1.5 rounded-lg transition ${
                appTheme === 'beige'
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="DSASpace Warm Beige theme"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAppThemeChange('light')}
              className={`p-1.5 rounded-lg transition ${
                appTheme === 'light'
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Clean Light theme"
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Quick Samples Dropdown (>= 1024px) */}
          <div className="relative group hidden lg:block">
            <button
              type="button"
              className="inline-flex items-center space-x-1.5 text-xs font-mono px-3 py-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Samples</span>
            </button>
            <div className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl py-2 hidden group-hover:block z-50 animate-in fade-in duration-100">
              <div className="px-3.5 py-1 text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Load Preset
              </div>
              <button
                onClick={() => onLoadSample(SAMPLE_SHOWCASE, 'Feature Showcase')}
                className="w-full text-left px-3.5 py-2 text-xs font-mono text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition flex flex-col"
              >
                <span className="font-semibold">Full Feature Showcase</span>
                <span className="text-[10px] text-[var(--text-muted)]">Math, Mermaid, Tables, Alerts</span>
              </button>
              <button
                onClick={() => onLoadSample(SAMPLE_GITHUB_README, 'FastCache README')}
                className="w-full text-left px-3.5 py-2 text-xs font-mono text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition flex flex-col"
              >
                <span className="font-semibold">GitHub Repository README</span>
                <span className="text-[10px] text-[var(--text-muted)]">Badges, code blocks, syntax</span>
              </button>
              <button
                onClick={() => onLoadSample(SAMPLE_ACADEMIC_PAPER, 'AeroBFT Research Paper')}
                className="w-full text-left px-3.5 py-2 text-xs font-mono text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition flex flex-col"
              >
                <span className="font-semibold">Academic Research Paper</span>
                <span className="text-[10px] text-[var(--text-muted)]">Formal equations, abstract, tables</span>
              </button>
            </div>
          </div>

          {/* Desktop Reset Button (>= 1024px) */}
          <button
            onClick={onReset}
            title="Reset document"
            className="hidden lg:flex p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Print Button (Tablet & Desktop >= 640px) */}
          <button
            onClick={onPrintPdf}
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-mono font-medium px-2.5 lg:px-3.5 py-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition shadow-sm active:scale-95 shrink-0"
            title="System Print or Preview"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden xl:inline">Print</span>
          </button>

          {/* Quick Options Menu (Visible on Mobile & Tablet < 1024px so Samples, Print, Reset are always reachable) */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[var(--border-subtle)] mb-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-semibold">Options</span>
                  <button onClick={() => setShowMobileMenu(false)} className="text-[var(--text-muted)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-3.5 py-1 text-[10px] font-mono text-[var(--text-muted)] uppercase">Presets</div>
                <button
                  onClick={() => {
                    onLoadSample(SAMPLE_SHOWCASE, 'Feature Showcase');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-mono hover:bg-[var(--bg-card-hover)]"
                >
                  Feature Showcase
                </button>
                <button
                  onClick={() => {
                    onLoadSample(SAMPLE_GITHUB_README, 'FastCache README');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-mono hover:bg-[var(--bg-card-hover)]"
                >
                  GitHub README
                </button>
                <button
                  onClick={() => {
                    onLoadSample(SAMPLE_ACADEMIC_PAPER, 'AeroBFT Research Paper');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-mono hover:bg-[var(--bg-card-hover)]"
                >
                  Academic Paper
                </button>

                <div className="my-1.5 border-t border-[var(--border-subtle)]" />

                <button
                  onClick={() => {
                    onPrintPdf();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-mono flex items-center space-x-2.5 hover:bg-[var(--bg-card-hover)]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>

                <button
                  onClick={() => {
                    onReset();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-mono flex items-center space-x-2.5 text-red-500 hover:bg-[var(--bg-card-hover)]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Document</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action: Download PDF Button (GUARANTEED visible within screen boundary) */}
          <button
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center space-x-1.5 sm:space-x-2 text-xs font-mono font-bold px-3 sm:px-3.5 lg:px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50 shrink-0"
            title="Download PDF directly to device"
          >
            {isGeneratingPdf ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden md:inline">Download PDF</span>
            <span className="md:hidden">PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
