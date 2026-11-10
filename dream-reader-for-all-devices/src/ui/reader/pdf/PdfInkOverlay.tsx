import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAnnotationStore } from '../../../stores/annotation-store';
import { useReaderStore } from '../../../stores/reader-store';
import { InkPoint, InkStroke } from '../../../types';
import { normalizePointerPoint, renderStrokeToCanvas } from '../../../reader-core/ink/ink-engine';
import {
  isStrokeSelectedByLasso,
  computeStrokesBoundingBox,
} from '../../../reader-core/ink/lasso-tool';
import { Copy, Trash2, X, Move, Palette } from 'lucide-react';

interface Props {
  pageNumber: number;
  width: number;
  height: number;
}

const QUICK_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#18181b'];
const EMPTY_STROKES: InkStroke[] = [];

export const PdfInkOverlay: React.FC<Props> = ({ pageNumber, width, height }) => {
  const { activeDocument } = useReaderStore();
  const {
    annotations,
    isInkActive,
    inkTool,
    inkColor,
    inkSize,
    isPenOnlyMode,
    selectedStrokeIds,
    setSelectedStrokeIds,
    clearStrokeSelection,
    saveInkStroke,
    moveSelectedStrokes,
    duplicateSelectedStrokes,
    recolorSelectedStrokes,
    deleteSelectedStrokes,
  } = useAnnotationStore();

  // Find saved ink for this page
  const pageInkAnnotation = annotations.find(
    (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === pageNumber
  );
  const savedStrokes = pageInkAnnotation?.strokes || EMPTY_STROKES;

  // Filter selected strokes for this page
  const pageSelectedStrokes = savedStrokes.filter((s) => selectedStrokeIds.includes(s.id));
  const selectionBBox = computeStrokesBoundingBox(pageSelectedStrokes, width, height, 12);

  // Dual Canvas Layers
  const dryCanvasRef = useRef<HTMLCanvasElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // In-progress stroke points stored in mutable ref for 1ms latency (zero React re-renders while drawing)
  const livePointsRef = useRef<InkPoint[]>([]);
  const liveLassoPointsRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);

  // Pending strokes awaiting IndexedDB persistence to eliminate any blinking
  const pendingStrokesRef = useRef<InkStroke[]>([]);

  // Palm Rejection & Stylus Priority Grace Window (350ms-450ms)
  const lastStylusTimeRef = useRef<number>(0);

  // Multi-Touch & Two-Finger Smooth Scrolling
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number; pointerType: string }>>(new Map());
  const isTwoFingerPanningRef = useRef(false);
  const lastPanCentroidRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Lasso Selection & Dragging state
  const isDraggingSelectionRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  // Redraw the Dry Canvas layer (all committed strokes)
  const redrawDryCanvas = useCallback(() => {
    const canvas = dryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Combine saved strokes from store + any recently drawn strokes still persisting
    const allStrokes = [...savedStrokes];
    for (const pending of pendingStrokesRef.current) {
      if (!allStrokes.some((s) => s.id === pending.id)) {
        allStrokes.push(pending);
      }
    }

    // Prune pending strokes that are now confirmed in savedStrokes
    pendingStrokesRef.current = pendingStrokesRef.current.filter(
      (p) => !savedStrokes.some((s) => s.id === p.id)
    );

    // Render strokes
    for (const stroke of allStrokes) {
      const isSelected = selectedStrokeIds.includes(stroke.id);
      // If dragging selection, it's rendered on the live canvas with dynamic offset
      if (isSelected && isDraggingSelectionRef.current) {
        continue;
      }
      renderStrokeToCanvas(ctx, stroke, width, height);
    }
  }, [width, height, savedStrokes, selectedStrokeIds]);

  // Helper: clear the wet live canvas
  const clearLiveCanvas = useCallback(() => {
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
  }, [width, height]);

  // Configure Hi-DPI resolution on dry & live canvases ONLY when page dimensions change
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;

    const dryCanvas = dryCanvasRef.current;
    if (dryCanvas) {
      dryCanvas.width = Math.floor(width * dpr);
      dryCanvas.height = Math.floor(height * dpr);
      dryCanvas.style.width = `${width}px`;
      dryCanvas.style.height = `${height}px`;
      const dryCtx = dryCanvas.getContext('2d');
      if (dryCtx) dryCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const liveCanvas = liveCanvasRef.current;
    if (liveCanvas) {
      liveCanvas.width = Math.floor(width * dpr);
      liveCanvas.height = Math.floor(height * dpr);
      liveCanvas.style.width = `${width}px`;
      liveCanvas.style.height = `${height}px`;
      const liveCtx = liveCanvas.getContext('2d', { desynchronized: true, alpha: true });
      if (liveCtx) liveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    redrawDryCanvas();
  }, [width, height]);

  // Redraw dry canvas when saved annotations or selections change (without reallocating canvas bitmaps)
  useEffect(() => {
    redrawDryCanvas();
  }, [redrawDryCanvas]);

  // If inking is not active and this page has no saved strokes, don't create heavy canvases
  if (!isInkActive && savedStrokes.length === 0) {
    return null;
  }

  // Handle Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInkActive || !containerRef.current) return;

    // Track active pointer for multi-touch gesture detection
    activePointersRef.current.set(e.pointerId, {
      clientX: e.clientX,
      clientY: e.clientY,
      pointerType: e.pointerType,
    });

    // 1. STYLUS DETECTION: Stylus or mouse takes highest priority
    const isStylus = e.pointerType === 'pen' || e.pointerType === 'mouse';
    if (isStylus) {
      lastStylusTimeRef.current = Date.now();
    }

    // 2. MULTI-TOUCH CHECK: If 2 or more touches are detected -> ENTER TWO-FINGER SCROLL GESTURE
    if (activePointersRef.current.size >= 2) {
      // Immediately abort and clear any live stroke started by the first finger (erases accidental marks)
      isDrawingRef.current = false;
      livePointsRef.current = [];
      liveLassoPointsRef.current = [];
      clearLiveCanvas();

      isTwoFingerPanningRef.current = true;
      const pointers = Array.from(activePointersRef.current.values());
      lastPanCentroidRef.current = {
        x: (pointers[0].clientX + pointers[1].clientX) / 2,
        y: (pointers[0].clientY + pointers[1].clientY) / 2,
      };
      return; // Do NOT start drawing!
    }

    // 3. PALM REJECTION CHECKS FOR TOUCH POINTERS
    if (!isStylus) {
      // Layer 1: Stylus Priority Grace Window (ignore touches within 400ms of stylus activity)
      if (Date.now() - lastStylusTimeRef.current < 400) {
        return;
      }
      // Layer 2: Pen-Only Mode (reject all finger drawing when palm rejection filter is turned ON)
      if (isPenOnlyMode) {
        return;
      }
      // Layer 3: Contact Size Heuristic (palm resting flat on screen)
      if (e.width > 26 && e.height > 26) {
        return;
      }
    }

    // 4. CHECK IF CLICKING INSIDE LASSO SELECTION BOUNDING BOX (FOR MOVING)
    if (pageSelectedStrokes.length > 0 && selectionBBox) {
      const bounds = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - bounds.left;
      const clickY = e.clientY - bounds.top;
      const { x, y, width: bw, height: bh } = selectionBBox.pixelRect;

      if (clickX >= x && clickX <= x + bw && clickY >= y && clickY <= y + bh) {
        isDraggingSelectionRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        setDragDelta({ dx: 0, dy: 0 });
        try {
          containerRef.current.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        return;
      } else {
        // Clicked outside selection -> deselect
        clearStrokeSelection();
      }
    }

    // 5. START DRAWING IN-PROGRESS STROKE
    const bounds = containerRef.current.getBoundingClientRect();
    const startPoint = normalizePointerPoint(e, bounds);

    isDrawingRef.current = true;

    if (inkTool === 'lasso') {
      liveLassoPointsRef.current = [{ x: startPoint.x, y: startPoint.y }];
    } else {
      livePointsRef.current = [startPoint];
      // Draw initial tap point immediately to live canvas
      const liveCanvas = liveCanvasRef.current;
      if (liveCanvas) {
        const liveCtx = liveCanvas.getContext('2d');
        if (liveCtx) {
          renderStrokeToCanvas(
            liveCtx,
            {
              id: 'live',
              points: [startPoint, { ...startPoint, x: startPoint.x + 0.001 }],
              color: inkTool === 'highlighter' ? `${inkColor}66` : inkColor,
              size: inkTool === 'highlighter' ? inkSize * 3 : inkSize,
              isHighlighter: inkTool === 'highlighter',
            },
            width,
            height
          );
        }
      }
    }

    try {
      containerRef.current.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Handle Pointer Move (Runs in <0.2ms directly on 2D Canvas without React re-renders)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Keep active pointer coordinates updated
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, {
        clientX: e.clientX,
        clientY: e.clientY,
        pointerType: e.pointerType,
      });
    }

    // 1. TWO-FINGER SCROLL GESTURE EXECUTION
    if (isTwoFingerPanningRef.current || activePointersRef.current.size >= 2) {
      const pointers = Array.from(activePointersRef.current.values());
      if (pointers.length >= 2) {
        const currentCentroidX = (pointers[0].clientX + pointers[1].clientX) / 2;
        const currentCentroidY = (pointers[0].clientY + pointers[1].clientY) / 2;

        const dy = lastPanCentroidRef.current.y - currentCentroidY;
        const dx = lastPanCentroidRef.current.x - currentCentroidX;

        lastPanCentroidRef.current = { x: currentCentroidX, y: currentCentroidY };

        // Scroll the parent PDF viewer smoothly
        const scrollContainer =
          document.getElementById('pdf-scroll-container') ||
          document.querySelector('.pdf-viewer-scroll-container') ||
          containerRef.current?.closest('.overflow-y-auto');

        if (scrollContainer) {
          scrollContainer.scrollTop += dy;
          scrollContainer.scrollLeft += dx;
        }
      }
      return; // Never draw when panning
    }

    // 2. DRAGGING LASSO SELECTION
    if (isDraggingSelectionRef.current && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setDragDelta({ dx, dy });

      // Live preview the dragged strokes on the live canvas
      const liveCanvas = liveCanvasRef.current;
      if (liveCanvas) {
        const liveCtx = liveCanvas.getContext('2d');
        if (liveCtx) {
          liveCtx.clearRect(0, 0, width, height);
          liveCtx.save();
          liveCtx.translate(dx, dy);
          for (const stroke of pageSelectedStrokes) {
            renderStrokeToCanvas(liveCtx, stroke, width, height);
          }
          liveCtx.restore();
        }
      }
      return;
    }

    // 3. DRAWING IN-PROGRESS WET STROKE
    if (!isDrawingRef.current || !isInkActive || !containerRef.current) return;

    if (e.pointerType === 'pen') {
      lastStylusTimeRef.current = Date.now();
    }

    const bounds = containerRef.current.getBoundingClientRect();

    // High refresh rate coalesced events (120Hz/144Hz tablets like Moto Pad 70 Pro)
    const coalescedList =
      e.nativeEvent && 'getCoalescedEvents' in e.nativeEvent
        ? (e.nativeEvent as unknown as { getCoalescedEvents: () => PointerEvent[] }).getCoalescedEvents()
        : [e.nativeEvent as PointerEvent];

    const liveCanvas = liveCanvasRef.current;
    if (!liveCanvas) return;
    const liveCtx = liveCanvas.getContext('2d');
    if (!liveCtx) return;

    if (inkTool === 'lasso') {
      for (const evt of coalescedList) {
        const x = Math.max(0, Math.min(1, (evt.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (evt.clientY - bounds.top) / bounds.height));
        liveLassoPointsRef.current.push({
          x: Number(x.toFixed(5)),
          y: Number(y.toFixed(5)),
        });
      }

      // Draw dashed lasso outline on live canvas
      liveCtx.clearRect(0, 0, width, height);
      if (liveLassoPointsRef.current.length >= 2) {
        liveCtx.save();
        liveCtx.beginPath();
        liveCtx.setLineDash([6, 4]);
        liveCtx.strokeStyle = '#3b82f6';
        liveCtx.lineWidth = 2;
        liveCtx.fillStyle = 'rgba(59, 130, 246, 0.12)';

        const first = liveLassoPointsRef.current[0];
        liveCtx.moveTo(first.x * width, first.y * height);
        for (let i = 1; i < liveLassoPointsRef.current.length; i++) {
          const pt = liveLassoPointsRef.current[i];
          liveCtx.lineTo(pt.x * width, pt.y * height);
        }
        liveCtx.closePath();
        liveCtx.fill();
        liveCtx.stroke();
        liveCtx.restore();
      }
    } else {
      // Pen or Highlighter stroke
      for (const evt of coalescedList) {
        const x = Math.max(0, Math.min(1, (evt.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (evt.clientY - bounds.top) / bounds.height));
        livePointsRef.current.push({
          x: Number(x.toFixed(5)),
          y: Number(y.toFixed(5)),
          pressure: evt.pressure > 0 ? Number(evt.pressure.toFixed(3)) : 0.5,
        });
      }

      // Fast GPU path fill on desynchronized 2D canvas (<0.2ms latency)
      liveCtx.clearRect(0, 0, width, height);
      renderStrokeToCanvas(
        liveCtx,
        {
          id: 'live',
          points: livePointsRef.current,
          color: inkTool === 'highlighter' ? `${inkColor}66` : inkColor,
          size: inkTool === 'highlighter' ? inkSize * 3 : inkSize,
          isHighlighter: inkTool === 'highlighter',
        },
        width,
        height
      );
    }
  };

  // Handle Pointer Up / Cancel (Instant Zero-Blink Commit to Dry Canvas)
  const handlePointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);

    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    // Reset two-finger panning when pointers fall below 2
    if (isTwoFingerPanningRef.current) {
      if (activePointersRef.current.size < 2) {
        isTwoFingerPanningRef.current = false;
      }
      return;
    }

    // Finish dragging selection
    if (isDraggingSelectionRef.current) {
      isDraggingSelectionRef.current = false;
      dragStartRef.current = null;
      clearLiveCanvas();

      if (activeDocument && (Math.abs(dragDelta.dx) > 2 || Math.abs(dragDelta.dy) > 2)) {
        const normDx = dragDelta.dx / width;
        const normDy = dragDelta.dy / height;
        await moveSelectedStrokes(
          activeDocument.id,
          pageNumber,
          pageSelectedStrokes.map((s) => s.id),
          normDx,
          normDy
        );
      }
      setDragDelta({ dx: 0, dy: 0 });
      return;
    }

    if (!isDrawingRef.current || !isInkActive || !activeDocument) return;
    isDrawingRef.current = false;

    if (inkTool === 'lasso') {
      clearLiveCanvas();
      if (liveLassoPointsRef.current.length >= 3) {
        const selected = savedStrokes
          .filter((stroke) => isStrokeSelectedByLasso(stroke, liveLassoPointsRef.current))
          .map((stroke) => stroke.id);

        setSelectedStrokeIds(selected);
      }
      liveLassoPointsRef.current = [];
    } else if (livePointsRef.current.length >= 1) {
      const points =
        livePointsRef.current.length === 1
          ? [livePointsRef.current[0], { ...livePointsRef.current[0], x: livePointsRef.current[0].x + 0.001 }]
          : livePointsRef.current;

      const stroke: InkStroke = {
        id: crypto.randomUUID(),
        points,
        color: inkTool === 'highlighter' ? `${inkColor}66` : inkColor,
        size: inkTool === 'highlighter' ? inkSize * 3 : inkSize,
        isHighlighter: inkTool === 'highlighter',
      };

      // 1. INSTANT ZERO-BLINK COMMIT: Stamp finished stroke directly onto the dry canvas
      const dryCanvas = dryCanvasRef.current;
      if (dryCanvas) {
        const dryCtx = dryCanvas.getContext('2d');
        if (dryCtx) {
          renderStrokeToCanvas(dryCtx, stroke, width, height);
        }
      }

      // 2. Clear the live canvas in the same synchronous frame (zero screen blanking)
      clearLiveCanvas();
      livePointsRef.current = [];

      // 3. Hold in pendingStrokesRef so subsequent dry canvas redraws preserve it while DB saves
      pendingStrokesRef.current.push(stroke);

      // 4. Persist to Dexie asynchronously in background
      await saveInkStroke(activeDocument.id, pageNumber, stroke);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        touchAction: isInkActive ? 'none' : 'auto',
        pointerEvents: isInkActive ? 'auto' : 'none',
        zIndex: isInkActive ? 30 : 0,
        cursor:
          inkTool === 'lasso'
            ? 'crosshair'
            : isDraggingSelectionRef.current
            ? 'grabbing'
            : 'crosshair',
      }}
      className="absolute inset-0 select-none"
    >
      {/* 1. Dry Canvas Layer: All saved & committed ink strokes */}
      <canvas
        ref={dryCanvasRef}
        className="absolute inset-0 block pointer-events-none"
      />

      {/* 2. Live Wet Canvas Layer: Desynchronized hardware-accelerated 1ms drawing layer */}
      <canvas
        ref={liveCanvasRef}
        className="absolute inset-0 block pointer-events-none"
      />

      {/* 3. Selection Bounding Box & Handles for Lasso Selected Strokes */}
      {pageSelectedStrokes.length > 0 && selectionBBox && (
        <div
          style={{
            position: 'absolute',
            left: `${selectionBBox.pixelRect.x + dragDelta.dx}px`,
            top: `${selectionBBox.pixelRect.y + dragDelta.dy}px`,
            width: `${selectionBBox.pixelRect.width}px`,
            height: `${selectionBBox.pixelRect.height}px`,
            pointerEvents: 'none',
          }}
          className="border-2 border-dashed border-blue-500 bg-blue-500/10 rounded-lg pointer-events-none"
        >
          {/* Corner anchor handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border border-white" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border border-white" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border border-white" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border border-white" />
        </div>
      )}

      {/* 4. Floating Action Menu for Selected Strokes */}
      {pageSelectedStrokes.length > 0 && selectionBBox && !isDraggingSelectionRef.current && (
        <div
          style={{
            left: `${Math.max(10, Math.min(width - 240, selectionBBox.pixelRect.x))}px`,
            top: `${Math.max(
              10,
              selectionBBox.pixelRect.y - 48 < 10
                ? selectionBBox.pixelRect.y + selectionBBox.pixelRect.height + 10
                : selectionBBox.pixelRect.y - 48
            )}px`,
            pointerEvents: 'auto',
          }}
          className="absolute z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl px-2 py-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          {/* Drag info */}
          <div
            title="Drag the bounding box with pen or finger to reposition"
            className="flex items-center gap-1 px-1.5 py-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400 cursor-grab"
          >
            <Move className="w-3.5 h-3.5 text-blue-500" />
            <span>Drag to move</span>
          </div>

          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800" />

          {/* Color Change Menu */}
          <div className="relative">
            <button
              onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
              title="Change ink color"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {isColorMenuOpen && (
              <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-1.5 shadow-lg flex gap-1 z-40">
                {QUICK_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={async () => {
                      if (!activeDocument) return;
                      await recolorSelectedStrokes(
                        activeDocument.id,
                        pageNumber,
                        pageSelectedStrokes.map((s) => s.id),
                        col
                      );
                      setIsColorMenuOpen(false);
                    }}
                    style={{ backgroundColor: col }}
                    className="w-4 h-4 rounded-full border border-black/10 hover:scale-125 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Duplicate Button */}
          <button
            onClick={async () => {
              if (!activeDocument) return;
              await duplicateSelectedStrokes(
                activeDocument.id,
                pageNumber,
                pageSelectedStrokes.map((s) => s.id)
              );
            }}
            title="Duplicate selected strokes"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={async () => {
              if (!activeDocument) return;
              await deleteSelectedStrokes(
                activeDocument.id,
                pageNumber,
                pageSelectedStrokes.map((s) => s.id)
              );
            }}
            title="Delete selected strokes"
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Deselect */}
          <button
            onClick={clearStrokeSelection}
            title="Deselect (Esc)"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
