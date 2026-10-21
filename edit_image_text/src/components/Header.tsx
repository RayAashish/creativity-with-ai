import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  RotateCw, 
  Eye, 
  Download, 
  Settings, 
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface HeaderProps {
  imageName: string | null;
  imageDimensions: { width: number; height: number } | null;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isComparing: boolean;
  setIsComparing: (comparing: boolean) => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  textCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  imageName,
  imageDimensions,
  zoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isComparing,
  setIsComparing,
  onOpenExport,
  onOpenSettings,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  textCount,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              TextMorph
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI &amp; OCR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">In-Image Text Editor</p>
        </div>
      </div>

      {/* Center: Image Info & History / Zoom Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {imageDimensions && (
          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="font-medium text-slate-300 truncate max-w-[140px]" title={imageName || 'Image'}>
              {imageName || 'Image'}
            </span>
            <span className="text-slate-600">•</span>
            <span>{imageDimensions.width} × {imageDimensions.height}px</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center text-indigo-300">
              <Layers className="w-3.5 h-3.5 mr-1" />
              {textCount} {textCount === 1 ? 'block' : 'blocks'}
            </span>
          </div>
        )}

        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z / Cmd+Z)"
            className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-700/60 rounded-md transition-colors disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z)"
            className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-700/60 rounded-md transition-colors disabled:cursor-not-allowed"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={onZoomOut}
            title="Zoom Out (-)"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-md transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-slate-300 w-12 text-center text-[11px]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            title="Zoom In (+)"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-md transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onZoomFit}
            title="Fit to Screen"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-md transition-colors border-l border-slate-700/60 ml-0.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Compare Before/After, Settings & Export */}
      <div className="flex items-center space-x-2">
        {imageDimensions && (
          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            title="Hold to see original unedited image"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isComparing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isComparing ? 'Original' : 'Hold: Compare'}</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          title="App Settings & API Keys"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          disabled={!imageDimensions}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 active:scale-95 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
