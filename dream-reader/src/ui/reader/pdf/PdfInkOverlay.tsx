import React, { useRef, useState } from 'react';
import { useAnnotationStore } from '../../../stores/annotation-store';
import { useReaderStore } from '../../../stores/reader-store';
import { InkPoint, InkStroke } from '../../../types';
import { normalizePointerPoint, renderStrokeToSvgPath } from '../../../reader-core/ink/ink-engine';
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

  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPoints, setCurrentPoints] = useState<InkPoint[]>([]);
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  // Find saved ink for this page
  const pageInkAnnotation = annotations.find(
    (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === pageNumber
  );
  const savedStrokes = pageInkAnnotation?.strokes || [];

  // Filter selected strokes for this page
  const pageSelectedStrokes = savedStrokes.filter((s) => selectedStrokeIds.includes(s.id));
  const selectionBBox = computeStrokesBoundingBox(pageSelectedStrokes, width, height, 12);

  // Handle pointer down
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isInkActive || !svgRef.current) return;

    // Palm Rejection: If explicitly enabled, ignore large flat palm contacts (contact area > 28px)
    if (isPenOnlyMode && e.pointerType === 'touch' && e.width > 28 && e.height > 28) {
      return;
    }

    // Check if clicking inside active selection bounding box or its move handle
    if (pageSelectedStrokes.length > 0 && selectionBBox) {
      const bounds = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - bounds.left;
      const clickY = e.clientY - bounds.top;
      const { x, y, width: bw, height: bh } = selectionBBox.pixelRect;

      if (clickX >= x && clickX <= x + bw && clickY >= y && clickY <= y + bh) {
        // Start dragging selection
        setIsDraggingSelection(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragDelta({ dx: 0, dy: 0 });
        try {
          svgRef.current.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        return;
      } else {
        // Clicked outside selection -> deselect
        clearStrokeSelection();
      }
    }

    const bounds = svgRef.current.getBoundingClientRect();
    const startPoint = normalizePointerPoint(e, bounds);

    setIsDrawing(true);

    if (inkTool === 'lasso') {
      setLassoPoints([{ x: startPoint.x, y: startPoint.y }]);
    } else {
      setCurrentPoints([startPoint]);
    }

    try {
      svgRef.current.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    // If dragging existing lasso selection
    if (isDraggingSelection && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setDragDelta({ dx, dy });
      return;
    }

    if (!isDrawing || !isInkActive) return;

    // Palm rejection: ignore large palm contact
    if (isPenOnlyMode && e.pointerType === 'touch' && e.width > 28 && e.height > 28) return;

    const bounds = svgRef.current.getBoundingClientRect();

    // High refresh rate coalesced events support (120Hz/144Hz tablets like Moto Pad 70 Pro)
    const coalescedList =
      e.nativeEvent && 'getCoalescedEvents' in e.nativeEvent
        ? (e.nativeEvent as unknown as { getCoalescedEvents: () => PointerEvent[] }).getCoalescedEvents()
        : [e.nativeEvent as PointerEvent];

    if (inkTool === 'lasso') {
      const newLassoPoints = coalescedList.map((evt) => {
        const x = Math.max(0, Math.min(1, (evt.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (evt.clientY - bounds.top) / bounds.height));
        return { x: Number(x.toFixed(5)), y: Number(y.toFixed(5)) };
      });
      setLassoPoints((prev) => [...prev, ...newLassoPoints]);
    } else {
      const newStrokePoints = coalescedList.map((evt) => {
        const x = Math.max(0, Math.min(1, (evt.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (evt.clientY - bounds.top) / bounds.height));
        return {
          x: Number(x.toFixed(5)),
          y: Number(y.toFixed(5)),
          pressure: evt.pressure > 0 ? Number(evt.pressure.toFixed(3)) : 0.5,
        };
      });
      setCurrentPoints((prev) => [...prev, ...newStrokePoints]);
    }
  };

  // Handle pointer up / cancel
  const handlePointerUp = async (e: React.PointerEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      try {
        svgRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    // Finish dragging selection
    if (isDraggingSelection) {
      setIsDraggingSelection(false);
      setDragStart(null);

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

    if (!isDrawing || !isInkActive || !activeDocument) return;
    setIsDrawing(false);

    if (inkTool === 'lasso') {
      if (lassoPoints.length >= 3) {
        const selected = savedStrokes
          .filter((stroke) => isStrokeSelectedByLasso(stroke, lassoPoints))
          .map((stroke) => stroke.id);

        setSelectedStrokeIds(selected);
      }
      setLassoPoints([]);
    } else if (currentPoints.length >= 1) {
      // Create stroke (single tap dot or multi-point line)
      const points =
        currentPoints.length === 1
          ? [currentPoints[0], { ...currentPoints[0], x: currentPoints[0].x + 0.001 }]
          : currentPoints;

      const stroke: InkStroke = {
        id: crypto.randomUUID(),
        points,
        color: inkTool === 'highlighter' ? `${inkColor}66` : inkColor,
        size: inkTool === 'highlighter' ? inkSize * 3 : inkSize,
        isHighlighter: inkTool === 'highlighter',
      };

      await saveInkStroke(activeDocument.id, pageNumber, stroke);
      setCurrentPoints([]);
    }
  };

  const liveStrokePath =
    currentPoints.length >= 2
      ? renderStrokeToSvgPath(
          {
            id: 'live',
            points: currentPoints,
            color: inkColor,
            size: inkTool === 'highlighter' ? inkSize * 3 : inkSize,
            isHighlighter: inkTool === 'highlighter',
          },
          width,
          height
        )
      : '';

  // Lasso polygon path string
  const lassoSvgPath =
    lassoPoints.length >= 2
      ? `M ${lassoPoints.map((p) => `${(p.x * width).toFixed(1)},${(p.y * height).toFixed(1)}`).join(' L ')} Z`
      : '';

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: isInkActive ? 'auto' : 'none',
        zIndex: isInkActive ? 30 : 0,
      }}
      className="absolute inset-0"
    >
      <svg
        ref={svgRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          touchAction: isInkActive ? 'none' : 'auto',
          cursor:
            inkTool === 'lasso'
              ? 'crosshair'
              : inkTool === 'eraser'
              ? 'cell'
              : pageSelectedStrokes.length > 0 && isDraggingSelection
              ? 'grabbing'
              : 'crosshair',
        }}
        className="w-full h-full block"
      >
        {/* Saved Strokes */}
        {savedStrokes.map((stroke) => {
          const isSelected = selectedStrokeIds.includes(stroke.id);
          const pathData = renderStrokeToSvgPath(stroke, width, height);
          if (!pathData) return null;

          const transformStyle =
            isSelected && isDraggingSelection
              ? `translate(${dragDelta.dx}px, ${dragDelta.dy}px)`
              : undefined;

          return (
            <path
              key={stroke.id}
              d={pathData}
              fill={stroke.color}
              style={{
                mixBlendMode: stroke.isHighlighter ? 'multiply' : 'normal',
                transform: transformStyle,
                transition: isDraggingSelection ? 'none' : 'transform 0.1s ease-out',
                filter: isSelected ? 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.7))' : undefined,
              }}
            />
          );
        })}

        {/* Live Inking Stroke in Progress */}
        {isDrawing && inkTool !== 'lasso' && liveStrokePath && (
          <path
            d={liveStrokePath}
            fill={inkTool === 'highlighter' ? `${inkColor}66` : inkColor}
            style={{ mixBlendMode: inkTool === 'highlighter' ? 'multiply' : 'normal' }}
          />
        )}

        {/* Live Lasso Selection Loop */}
        {isDrawing && inkTool === 'lasso' && lassoSvgPath && (
          <path
            d={lassoSvgPath}
            fill="rgba(59, 130, 246, 0.12)"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        )}

        {/* Selection Bounding Box for Lasso Selected Strokes */}
        {pageSelectedStrokes.length > 0 && selectionBBox && (
          <g
            style={{
              transform: isDraggingSelection
                ? `translate(${dragDelta.dx}px, ${dragDelta.dy}px)`
                : undefined,
            }}
          >
            <rect
              x={selectionBBox.pixelRect.x}
              y={selectionBBox.pixelRect.y}
              width={selectionBBox.pixelRect.width}
              height={selectionBBox.pixelRect.height}
              fill="rgba(59, 130, 246, 0.08)"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              rx="6"
              className="cursor-grab active:cursor-grabbing"
            />
            {/* Corner resize/indicator handles */}
            <circle
              cx={selectionBBox.pixelRect.x}
              cy={selectionBBox.pixelRect.y}
              r="4"
              fill="#2563eb"
            />
            <circle
              cx={selectionBBox.pixelRect.x + selectionBBox.pixelRect.width}
              cy={selectionBBox.pixelRect.y}
              r="4"
              fill="#2563eb"
            />
            <circle
              cx={selectionBBox.pixelRect.x}
              cy={selectionBBox.pixelRect.y + selectionBBox.pixelRect.height}
              r="4"
              fill="#2563eb"
            />
            <circle
              cx={selectionBBox.pixelRect.x + selectionBBox.pixelRect.width}
              cy={selectionBBox.pixelRect.y + selectionBBox.pixelRect.height}
              r="4"
              fill="#2563eb"
            />
          </g>
        )}
      </svg>

      {/* Floating Action Menu for Selected Strokes */}
      {pageSelectedStrokes.length > 0 && selectionBBox && !isDraggingSelection && (
        <div
          style={{
            left: `${Math.max(10, Math.min(width - 240, selectionBBox.pixelRect.x))}px`,
            top: `${Math.max(
              10,
              selectionBBox.pixelRect.y - 48 < 10
                ? selectionBBox.pixelRect.y + selectionBBox.pixelRect.height + 10
                : selectionBBox.pixelRect.y - 48
            )}px`,
          }}
          className="absolute z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl px-2 py-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 select-none"
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
