import React, { useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Scan, 
  MousePointer, 
  Type, 
  Crop, 
  Paintbrush, 
  Hand, 
  Pipette, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { ToolMode } from '../types';

interface ToolbarProps {
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  onImageUpload: (file: File) => void;
  onOpenSamples: () => void;
  onScanImage: () => void;
  isScanning: boolean;
  scanProgress: { status: string; progress: number } | null;
  hasImage: boolean;
  ocrLanguage: string;
  setOcrLanguage: (lang: string) => void;
  ocrGranularity: 'line' | 'word';
  setOcrGranularity: (granularity: 'line' | 'word') => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  toolMode,
  setToolMode,
  onImageUpload,
  onOpenSamples,
  onScanImage,
  isScanning,
  scanProgress,
  hasImage,
  ocrLanguage,
  setOcrLanguage,
  ocrGranularity,
  setOcrGranularity,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  brushOpacity,
  setBrushOpacity,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      // reset input value so the same file can be reloaded if needed
      e.target.value = '';
    }
  };

  return (
    <div className="h-12 border-b border-slate-800 bg-slate-900/70 px-4 flex items-center justify-between z-20 select-none overflow-x-auto gap-2">
      {/* Left: Upload & Sample buttons */}
      <div className="flex items-center space-x-2 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all hover:border-slate-600"
          title="Upload image from computer"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload Image</span>
        </button>

        <button
          onClick={onOpenSamples}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
          title="Try with curated sample images (Memes, Menus, Posters)"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Samples</span>
        </button>
      </div>

      {/* Center: Tool Modes */}
      {hasImage && (
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 shrink-0">
          <button
            onClick={() => setToolMode('select')}
            title="Select & Edit Text (V)"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === 'select'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Select</span>
          </button>

          <button
            onClick={() => setToolMode('addText')}
            title="Add New Text (T)"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === 'addText'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Text</span>
          </button>

          <button
            onClick={() => setToolMode('scanArea')}
            title="Scan Specific Area (S) - Draw a box to scan text"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === 'scanArea'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan Area</span>
          </button>

          <button
            onClick={() => setToolMode('brush')}
            title="Touch-up Brush / Eraser (B) - Clean up background spots"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === 'brush'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Brush</span>
          </button>

          <button
            onClick={() => setToolMode('eyedropper')}
            title="Eyedropper (I) - Sample color from canvas"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === 'eyedropper'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eyedropper</span>
          </button>

          <button
            onClick={() => setToolMode('pan')}
            title="Pan Canvas (H / Spacebar)"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === 'pan'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pan</span>
          </button>
        </div>
      )}

      {/* Right: Brush contextual settings OR Scan OCR Button */}
      <div className="flex items-center space-x-2 shrink-0">
        {hasImage && toolMode === 'brush' && (
          <div className="flex items-center space-x-2 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/70 text-xs">
            <span className="text-slate-400 text-[11px]">Size:</span>
            <input
              type="range"
              min="2"
              max="60"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16 h-1.5 accent-indigo-500 rounded-lg cursor-pointer"
            />
            <span className="text-slate-300 font-mono text-[11px] w-5">{brushSize}</span>

            <span className="text-slate-400 text-[11px] ml-1">Color:</span>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border border-slate-600 bg-transparent"
            />

            <span className="text-slate-400 text-[11px] ml-1">Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={brushOpacity}
              onChange={(e) => setBrushOpacity(Number(e.target.value))}
              className="w-14 h-1.5 accent-indigo-500 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {hasImage && (
          <div className="flex items-center space-x-1.5">
            {/* OCR Granularity Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setOcrGranularity('line')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  ocrGranularity === 'line'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Detect full lines of text"
              >
                Lines
              </button>
              <button
                onClick={() => setOcrGranularity('word')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  ocrGranularity === 'word'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Detect individual words"
              >
                Words
              </button>
            </div>

            <select
              value={ocrLanguage}
              onChange={(e) => setOcrLanguage(e.target.value)}
              disabled={isScanning}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="eng">English</option>
              <option value="spa">Spanish (Español)</option>
              <option value="fra">French (Français)</option>
              <option value="deu">German (Deutsch)</option>
              <option value="ita">Italian (Italiano)</option>
              <option value="por">Portuguese</option>
              <option value="hin">Hindi (हिंदी)</option>
              <option value="chi_sim">Chinese (Simplified)</option>
              <option value="jpn">Japanese</option>
            </select>

            <button
              onClick={onScanImage}
              disabled={isScanning}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {scanProgress
                      ? `${Math.round(scanProgress.progress * 100)}%`
                      : 'Scanning...'}
                  </span>
                </>
              ) : (
                <>
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scan Text</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
