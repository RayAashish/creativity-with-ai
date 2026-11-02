'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import {
  Monitor,
  Download,
  Link as LinkIcon,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Settings2,
  Flame,
  Eye,
  Sliders,
  Folder,
  FileCode,
  HardDrive,
  Terminal,
} from 'lucide-react';
import { THEMES } from '@/lib/themes';
import { WallpaperPosition, WallpaperThemeId } from '@/types/wallpaper';
import { AutomationModal } from './AutomationModal';

const emptySubscribe = () => () => {};

function useOrigin() {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ''
  );
}

const RESOLUTION_PRESETS = [
  { label: '4K Ultra HD (3840 × 2160)', w: 3840, h: 2160, type: 'desktop' },
  { label: '2K QHD (2560 × 1440)', w: 2560, h: 1440, type: 'desktop' },
  { label: 'Full HD (1920 × 1080)', w: 1920, h: 1080, type: 'desktop' },
  { label: 'Ultrawide (3440 × 1440)', w: 3440, h: 1440, type: 'desktop' },
  { label: 'MacBook Pro 16" (3456 × 2234)', w: 3456, h: 2234, type: 'desktop' },
  { label: 'iPhone 14/15/16 Pro (1179 × 2556)', w: 1179, h: 2556, type: 'mobile' },
  { label: 'Android FHD+ (1080 × 2400)', w: 1080, h: 2400, type: 'mobile' },
  { label: 'Custom Resolution', w: 1920, h: 1080, type: 'custom' },
];

export function Studio() {
  // Input State
  const [github, setGithub] = useState('torvalds');
  const [leetcode, setLeetcode] = useState('');
  const [theme, setTheme] = useState<WallpaperThemeId>('oled');
  const [position, setPosition] = useState<WallpaperPosition>('center');
  const [showGlow, setShowGlow] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // Resolution State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1); // 2K QHD default
  const [customWidth, setCustomWidth] = useState(2560);
  const [customHeight, setCustomHeight] = useState(1440);

  // Preview & UI state
  const [overlayMode, setOverlayMode] = useState<'none' | 'icons' | 'dock'>('none');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);

  const origin = useOrigin();

  const currentWidth = selectedPresetIndex === RESOLUTION_PRESETS.length - 1 ? customWidth : RESOLUTION_PRESETS[selectedPresetIndex].w;
  const currentHeight = selectedPresetIndex === RESOLUTION_PRESETS.length - 1 ? customHeight : RESOLUTION_PRESETS[selectedPresetIndex].h;

  // Auto detect user's screen resolution
  const handleDetectScreen = () => {
    if (typeof window !== 'undefined') {
      const dpr = window.devicePixelRatio || 1;
      const detectedW = Math.round(window.screen.width * dpr);
      const detectedH = Math.round(window.screen.height * dpr);

      // Try matching existing preset
      const matchIdx = RESOLUTION_PRESETS.findIndex((p) => p.w === detectedW && p.h === detectedH);
      if (matchIdx !== -1) {
        setSelectedPresetIndex(matchIdx);
      } else {
        setSelectedPresetIndex(RESOLUTION_PRESETS.length - 1);
        setCustomWidth(detectedW);
        setCustomHeight(detectedH);
      }
    }
  };

  // Build the dynamic URL
  const dynamicQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (github.trim()) params.set('github', github.trim());
    if (leetcode.trim()) params.set('leetcode', leetcode.trim());
    params.set('theme', theme);
    params.set('w', currentWidth.toString());
    params.set('h', currentHeight.toString());
    params.set('pos', position);
    if (!showGlow) params.set('glow', '0');
    if (!showGrid) params.set('grid', '0');
    if (!showStats) params.set('stats', '0');
    return params.toString();
  }, [github, leetcode, theme, currentWidth, currentHeight, position, showGlow, showGrid, showStats]);

  const fullDynamicUrl = useMemo(() => {
    const base = origin || '';
    return `${base}/api/wallpaper?${dynamicQuery}`;
  }, [origin, dynamicQuery]);

  // Preview URL (scales down to 1440 or 1920 for fast preview rendering)
  const previewUrl = useMemo(() => {
    const params = new URLSearchParams(dynamicQuery);
    // Keep aspect ratio but cap preview rendering dimensions to optimize performance
    const maxDim = 1600;
    let previewW = currentWidth;
    let previewH = currentHeight;
    if (previewW > maxDim || previewH > maxDim) {
      if (previewW >= previewH) {
        previewH = Math.round((previewH * maxDim) / previewW);
        previewW = maxDim;
      } else {
        previewW = Math.round((previewW * maxDim) / previewH);
        previewH = maxDim;
      }
    }
    params.set('w', previewW.toString());
    params.set('h', previewH.toString());
    params.set('cb', cacheBuster.toString());
    return `/api/wallpaper?${params.toString()}`;
  }, [dynamicQuery, currentWidth, currentHeight, cacheBuster]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullDynamicUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const downloadUrl = `${fullDynamicUrl}&download=1&nocache=1`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `streakpaper-${github || leetcode || 'wallpaper'}-${currentWidth}x${currentHeight}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  // Aspect ratio string
  const aspectRatioVal = currentWidth / currentHeight;
  const isMobileAspect = aspectRatioVal < 1;

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-6 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-black shadow-lg shadow-emerald-500/20 font-bold">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg">StreakPaper</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                v1.0 Ready
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none">
              Aesthetic Resolution-Aware Developer Wallpaper Generator
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-zinc-800/80 px-3.5 py-2 text-xs font-medium text-zinc-200 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white transition shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Setup Auto-Update</span>
          </button>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-2 rounded-xl bg-zinc-800/80 px-3.5 py-2 text-xs font-medium text-zinc-200 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white transition shadow-sm"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Link!</span>
              </>
            ) : (
              <>
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Copy Dynamic API</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 active:scale-95 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Generating PNG...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download Wallpaper</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body: Left Sidebar (Controls) + Right Area (Live Canvas) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Controls */}
        <aside className="w-[390px] border-r border-zinc-800/80 bg-zinc-900/30 p-5 overflow-y-auto space-y-6 shrink-0 custom-scrollbar">
          {/* Section: Handles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                <span>Developer Profiles</span>
              </label>
              <button
                onClick={() => {
                  setGithub('torvalds');
                  setLeetcode('lee215');
                }}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Load Demo Users
              </button>
            </div>

            {/* GitHub handle */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-zinc-300">GitHub Username</span>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-zinc-500 text-xs font-mono">@</span>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2 pl-7 pr-3 text-xs text-white placeholder-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
                />
              </div>
            </div>

            {/* LeetCode handle */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-zinc-300">LeetCode Username (Optional)</span>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-zinc-500 text-xs font-mono">@</span>
                <input
                  type="text"
                  value={leetcode}
                  onChange={(e) => setLeetcode(e.target.value)}
                  placeholder="e.g. lee215"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2 pl-7 pr-3 text-xs text-white placeholder-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
                />
              </div>
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Section: Screen Resolution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-emerald-400" />
                <span>Screen Resolution</span>
              </label>
              <button
                onClick={handleDetectScreen}
                className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
              >
                Detect My Screen
              </button>
            </div>

            <select
              value={selectedPresetIndex}
              onChange={(e) => setSelectedPresetIndex(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              {RESOLUTION_PRESETS.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.label}
                </option>
              ))}
            </select>

            {selectedPresetIndex === RESOLUTION_PRESETS.length - 1 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-1">Width (px)</span>
                  <input
                    type="number"
                    min={480}
                    max={7680}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value, 10) || 1920)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-1">Height (px)</span>
                  <input
                    type="number"
                    min={320}
                    max={4320}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value, 10) || 1080)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-2.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-zinc-800/80" />

          {/* Section: Themes */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span>Aesthetic Theme</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as WallpaperThemeId[]).map((themeKey) => {
                const item = THEMES[themeKey];
                const isSelected = theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => setTheme(themeKey)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-zinc-900 shadow-md ring-1 ring-emerald-500/40'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-semibold text-zinc-200 mb-2 truncate w-full">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1 w-full">
                      {item.levels.map((lvlColor, idx) => (
                        <div
                          key={idx}
                          className="h-3 flex-1 rounded-sm border border-black/20"
                          style={{ backgroundColor: lvlColor }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Section: Position & Layout */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>Widget Placement</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'center', label: 'Center', desc: 'Balanced middle' },
                { id: 'bottom-right', label: 'Bottom Right', desc: 'Avoids desktop icons' },
                { id: 'top-center', label: 'Top Center', desc: 'macOS dock friendly' },
                { id: 'minimal', label: 'Minimal', desc: 'Compact 3-month widget' },
              ].map((pos) => {
                const isSelected = position === pos.id;
                return (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id as WallpaperPosition)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-zinc-900 shadow-sm ring-1 ring-emerald-500/40'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-semibold text-zinc-200 block">{pos.label}</span>
                    <span className="text-[10px] text-zinc-500 leading-tight block mt-0.5">{pos.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Section: Visual Toggles */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Visual Elements</span>
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850 cursor-pointer">
                <span className="text-xs text-zinc-300">Ambient Neon Glow</span>
                <input
                  type="checkbox"
                  checked={showGlow}
                  onChange={(e) => setShowGlow(e.target.checked)}
                  className="rounded accent-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850 cursor-pointer">
                <span className="text-xs text-zinc-300">Coordinate Dot Grid</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded accent-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850 cursor-pointer">
                <span className="text-xs text-zinc-300">Streak Metric Chips</span>
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                  className="rounded accent-emerald-500 h-4 w-4"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Right Canvas Preview Area */}
        <main className="flex-1 flex flex-col bg-zinc-950/70 overflow-hidden relative">
          {/* Preview Toolbar */}
          <div className="h-12 border-b border-zinc-850/80 bg-zinc-900/40 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-zinc-400" />
                <span>Live Canvas Simulation:</span>
                <span className="text-zinc-200 font-mono">
                  {currentWidth} × {currentHeight} ({aspectRatioVal.toFixed(2)}:1)
                </span>
              </span>

              {/* Mock desktop overlay picker */}
              <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                <button
                  onClick={() => setOverlayMode('none')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    overlayMode === 'none' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Clean View
                </button>
                <button
                  onClick={() => setOverlayMode('icons')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    overlayMode === 'icons' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Desktop Icons Test
                </button>
                <button
                  onClick={() => setOverlayMode('dock')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    overlayMode === 'dock' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  macOS Dock Test
                </button>
              </div>
            </div>

            <button
              onClick={() => setCacheBuster(Date.now())}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition"
              title="Force re-render preview"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Canvas</span>
            </button>
          </div>

          {/* Canvas Viewport Simulation Container */}
          <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
            <div
              className="relative shadow-2xl rounded-xl overflow-hidden border border-zinc-800/90 transition-all flex items-center justify-center bg-black"
              style={{
                aspectRatio: `${currentWidth} / ${currentHeight}`,
                maxWidth: isMobileAspect ? '340px' : '92%',
                maxHeight: '85%',
                width: '100%',
              }}
            >
              {/* Wallpaper Image from Dynamic Route */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="StreakPaper Preview"
                onLoad={() => setPreviewLoading(false)}
                onLoadStart={() => setPreviewLoading(true)}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  previewLoading ? 'opacity-50 blur-sm' : 'opacity-100'
                }`}
              />

              {/* Simulation Overlay: Mock Desktop Icons */}
              {overlayMode === 'icons' && (
                <div className="absolute inset-0 pointer-events-none p-5 flex flex-col gap-4 text-[10px] text-zinc-200">
                  <div className="flex flex-col items-center w-14 gap-1 p-1 rounded bg-black/20 backdrop-blur-[2px]">
                    <HardDrive className="h-6 w-6 text-zinc-300" />
                    <span className="truncate max-w-full text-center">Macintosh HD</span>
                  </div>
                  <div className="flex flex-col items-center w-14 gap-1 p-1 rounded bg-black/20 backdrop-blur-[2px]">
                    <Folder className="h-6 w-6 text-blue-400" />
                    <span className="truncate max-w-full text-center">Projects</span>
                  </div>
                  <div className="flex flex-col items-center w-14 gap-1 p-1 rounded bg-black/20 backdrop-blur-[2px]">
                    <Folder className="h-6 w-6 text-blue-400" />
                    <span className="truncate max-w-full text-center">Documents</span>
                  </div>
                  <div className="flex flex-col items-center w-14 gap-1 p-1 rounded bg-black/20 backdrop-blur-[2px]">
                    <FileCode className="h-6 w-6 text-emerald-400" />
                    <span className="truncate max-w-full text-center">streakpaper</span>
                  </div>
                </div>
              )}

              {/* Simulation Overlay: macOS Dock */}
              {overlayMode === 'dock' && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-2 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-xl">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/80 flex items-center justify-center text-white">
                    <Folder className="h-4 w-4" />
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                    <FileCode className="h-4 w-4" />
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-red-500 flex items-center justify-center text-white">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-zinc-700 flex items-center justify-center text-zinc-300">
                    <Settings2 className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick URL Bar at Bottom */}
          <div className="h-10 border-t border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between text-xs text-zinc-500 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">Auto-Sync API:</span>
              <code className="text-zinc-400 font-mono text-[11px] truncate select-all">{fullDynamicUrl}</code>
            </div>
            <span className="shrink-0 text-zinc-500 text-[11px]">
              Tip: The dynamic URL automatically delivers updated morning streaks without needing manual downloads!
            </span>
          </div>
        </main>
      </div>

      {/* Auto Update Instructions Modal */}
      <AutomationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dynamicUrl={fullDynamicUrl}
      />
    </div>
  );
}
