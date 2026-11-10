import React from 'react';
import {
  PenTool,
  Highlighter,
  LassoSelect,
  RotateCcw,
  Trash2,
  X,
  Tablet,
  Check,
} from 'lucide-react';
import { useAnnotationStore } from '../../../stores/annotation-store';
import { useReaderStore } from '../../../stores/reader-store';

const INK_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Black', hex: '#18181b' },
];

export const PdfInkToolbar: React.FC = () => {
  const {
    isInkActive,
    inkTool,
    inkColor,
    inkSize,
    isPenOnlyMode,
    selectedStrokeIds,
    setInkActive,
    setInkTool,
    setInkColor,
    setInkSize,
    setPenOnlyMode,
    clearStrokeSelection,
    undoInkStroke,
    clearPageInk,
  } = useAnnotationStore();

  const { activeDocument, currentPage } = useReaderStore();

  if (!isInkActive || !activeDocument) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl px-4 py-2 flex flex-wrap items-center gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-bottom-3 duration-150 select-none max-w-[95vw]">
      {/* Tool Toggle: Pen vs Highlighter vs Lasso */}
      <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-xl">
        <button
          onClick={() => setInkTool('pen')}
          title="Pen (Stylus / Touch / Mouse)"
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
            inkTool === 'pen'
              ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden sm:inline">Pen</span>
        </button>

        <button
          onClick={() => setInkTool('highlighter')}
          title="Freehand Highlighter"
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
            inkTool === 'highlighter'
              ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
          }`}
        >
          <Highlighter className="w-4 h-4" />
          <span className="hidden sm:inline">Highlight</span>
        </button>

        <button
          onClick={() => setInkTool('lasso')}
          title="Lasso Select: Loop around ink strokes to move, recolor, copy or delete"
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
            inkTool === 'lasso'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
          }`}
        >
          <LassoSelect className="w-4 h-4" />
          <span>Lasso</span>
        </button>
      </div>

      {/* Palm Rejection / Stylus Filter for Tablets (e.g. Moto Pad 70 Pro) */}
      <button
        onClick={() => setPenOnlyMode(!isPenOnlyMode)}
        title={
          isPenOnlyMode
            ? 'Palm Filter ON: Large flat palm rests are ignored while writing'
            : 'Normal: All pen and touch inputs draw smoothly'
        }
        className={`px-2 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
          isPenOnlyMode
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-xs'
            : 'bg-gray-50 dark:bg-zinc-800/60 border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-800'
        }`}
      >
        <Tablet className="w-3.5 h-3.5" />
        <span className="hidden md:inline">
          {isPenOnlyMode ? 'Palm Filter ON' : 'Palm Filter'}
        </span>
        {isPenOnlyMode && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
      </button>

      <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800" />

      {/* Contextual Options: If Lasso is active and strokes are selected */}
      {inkTool === 'lasso' ? (
        <div className="flex items-center gap-2">
          {selectedStrokeIds.length > 0 ? (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <span className="bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-lg">
                {selectedStrokeIds.length} selected
              </span>
              <button
                onClick={clearStrokeSelection}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400 dark:text-zinc-500 hidden sm:inline">
              Draw loop around strokes to select
            </span>
          )}
        </div>
      ) : (
        <>
          {/* Color Palette */}
          <div className="flex items-center gap-1.5">
            {INK_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setInkColor(c.hex)}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  inkColor === c.hex
                    ? 'scale-125 ring-2 ring-amber-500 border-white'
                    : 'border-black/10 hover:scale-110'
                }`}
              />
            ))}
          </div>

          <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1">
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => setInkSize(size)}
                title={`Stroke width: ${size}px`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  inkSize === size
                    ? 'bg-gray-100 dark:bg-zinc-800 text-amber-600 font-bold'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div
                  style={{ width: `${size * 2}px`, height: `${size * 2}px` }}
                  className="rounded-full bg-current"
                />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800" />

      {/* Undo Button */}
      <button
        onClick={() => undoInkStroke(activeDocument.id, currentPage)}
        title="Undo last stroke"
        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Clear Page Ink */}
      <button
        onClick={() => clearPageInk(activeDocument.id, currentPage)}
        title="Clear ink on this page"
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800" />

      {/* Close Ink Toolbar */}
      <button
        onClick={() => setInkActive(false)}
        title="Exit Inking mode"
        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
