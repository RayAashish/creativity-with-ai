import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Sparkles, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  Bold, 
  Type, 
  Plus, 
  Minus,
  Check,
  Crop,
  Paintbrush,
  Pipette,
  MousePointer,
  Loader2
} from 'lucide-react';
import { TextBlock, BrushStroke, ToolMode } from '../types';
import { renderCompositeCanvas } from '../utils/canvasRenderer';

interface CanvasAreaProps {
  image: HTMLImageElement | null;
  textBlocks: TextBlock[];
  setTextBlocks: React.Dispatch<React.SetStateAction<TextBlock[]>>;
  brushStrokes: BrushStroke[];
  setBrushStrokes: React.Dispatch<React.SetStateAction<BrushStroke[]>>;
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isComparing: boolean;
  onImageUpload: (file: File) => void;
  onOpenSamples: () => void;
  onScanArea: (area: { x: number; y: number; width: number; height: number }) => void;
  onColorSampled: (hex: string) => void;
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  recordHistory: () => void;
  isScanning?: boolean;
  scanProgress?: { status: string; progress: number } | null;
}

type DragAction = 
  | { type: 'move'; startX: number; startY: number; blockX: number; blockY: number }
  | { type: 'resize'; handle: string; startX: number; startY: number; block: TextBlock }
  | { type: 'rotate'; startAngle: number; initialRotation: number; centerX: number; centerY: number }
  | { type: 'pan'; startX: number; startY: number; initialPan: { x: number; y: number } }
  | { type: 'brush'; stroke: BrushStroke }
  | { type: 'marquee'; startX: number; startY: number; currentX: number; currentY: number };

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  image,
  textBlocks,
  setTextBlocks,
  brushStrokes,
  setBrushStrokes,
  activeBlockId,
  setActiveBlockId,
  toolMode,
  setToolMode,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  isComparing,
  onImageUpload,
  onOpenSamples,
  onScanArea,
  onColorSampled,
  brushSize,
  brushColor,
  brushOpacity,
  recordHistory,
  isScanning,
  scanProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction States
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [dragAction, setDragAction] = useState<DragAction | null>(null);
  const [marqueeBox, setMarqueeBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const activeBlock = textBlocks.find((b) => b.id === activeBlockId) || null;

  // Render Canvas whenever image, textBlocks, brushStrokes, or active state changes
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
    }

    renderCompositeCanvas({
      canvas,
      image,
      textBlocks,
      brushStrokes,
      showOriginalOnly: isComparing,
      activeBlockId,
      hoveredBlockId,
      renderSelectionHighlights: toolMode === 'select' && !isComparing && !editingBlockId,
    });
  }, [image, textBlocks, brushStrokes, isComparing, activeBlockId, hoveredBlockId, toolMode, editingBlockId]);

  // Spacebar to pan detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Convert mouse event coordinates to Canvas image-space coordinates
  const getCanvasCoords = useCallback((e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
    if (!canvasRef.current || !image) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const scaleX = (image.naturalWidth || image.width) / rect.width;
    const scaleY = (image.naturalHeight || image.height) / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [image]);

  // Find if a point is inside a block
  const getHitBlock = useCallback((x: number, y: number): TextBlock | null => {
    // Scan in reverse order (topmost layer first)
    for (let i = textBlocks.length - 1; i >= 0; i--) {
      const b = textBlocks[i];
      if (!b.isVisible) continue;

      // Handle simple bounding box with padding
      const pad = 4;
      if (x >= b.x - pad && x <= b.x + b.width + pad && y >= b.y - pad && y <= b.y + b.height + pad) {
        return b;
      }
    }
    return null;
  }, [textBlocks]);

  // Check if click hits a resize handle on the active block
  const getHitHandle = useCallback((x: number, y: number, block: TextBlock): string | null => {
    const handleRadius = 12 / zoom; // size in canvas units
    const handles = [
      { id: 'nw', x: block.x, y: block.y },
      { id: 'n', x: block.x + block.width / 2, y: block.y },
      { id: 'ne', x: block.x + block.width, y: block.y },
      { id: 'e', x: block.x + block.width, y: block.y + block.height / 2 },
      { id: 'se', x: block.x + block.width, y: block.y + block.height },
      { id: 's', x: block.x + block.width / 2, y: block.y + block.height },
      { id: 'sw', x: block.x, y: block.y + block.height },
      { id: 'w', x: block.x, y: block.y + block.height / 2 },
      { id: 'rot', x: block.x + block.width / 2, y: block.y - 24 },
    ];

    for (const h of handles) {
      const dist = Math.hypot(x - h.x, y - h.y);
      if (dist <= handleRadius) {
        return h.id;
      }
    }
    return null;
  }, [zoom]);

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or space pressed => pan
    if (e.button === 1 || isSpacePressed || toolMode === 'pan') {
      setDragAction({
        type: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        initialPan: { ...panOffset },
      });
      return;
    }

    if (e.button !== 0) return; // only left click

    const coords = getCanvasCoords(e);
    if (!coords) return;

    // Eyedropper mode
    if (toolMode === 'eyedropper') {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const pixel = ctx.getImageData(Math.floor(coords.x), Math.floor(coords.y), 1, 1).data;
          const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
          onColorSampled(hex);
          setToolMode('select');
        }
      }
      return;
    }

    // Brush mode
    if (toolMode === 'brush') {
      recordHistory();
      const newStroke: BrushStroke = {
        id: `stroke-${Date.now()}`,
        points: [{ x: coords.x, y: coords.y }],
        color: brushColor,
        size: brushSize,
        opacity: brushOpacity,
      };
      setBrushStrokes((prev) => [...prev, newStroke]);
      setDragAction({ type: 'brush', stroke: newStroke });
      return;
    }

    // Scan Area mode
    if (toolMode === 'scanArea') {
      setDragAction({
        type: 'marquee',
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      });
      setMarqueeBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
      return;
    }

    // Add Text mode
    if (toolMode === 'addText') {
      recordHistory();
      const newId = `blk-custom-${Date.now()}`;
      const newBlock: TextBlock = {
        id: newId,
        text: 'New Text',
        originalText: '',
        x: Math.max(10, coords.x - 70),
        y: Math.max(10, coords.y - 20),
        width: 140,
        height: 40,
        rotation: 0,
        fontSize: 32,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '700',
        fontStyle: 'normal',
        textAlign: 'left',
        color: '#FFFFFF',
        opacity: 1,
        letterSpacing: 0,
        lineHeight: 1.15,
        strokeColor: '#000000',
        strokeWidth: 0,
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowBlur: 4,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        isUpperCase: false,
        patchColor: '#000000',
        patchType: 'none',
        patchPadding: 6,
        patchFeather: 2,
        patchOpacity: 1,
        confidence: 100,
        isEdited: true,
        isLocked: false,
        isVisible: true,
        isCustom: true,
      };
      setTextBlocks((prev) => [...prev, newBlock]);
      setActiveBlockId(newId);
      setEditingBlockId(newId);
      setEditingText('New Text');
      setToolMode('select');
      return;
    }

    // Select mode
    if (toolMode === 'select') {
      // Check handles on current active block
      if (activeBlock && !activeBlock.isLocked) {
        const handle = getHitHandle(coords.x, coords.y, activeBlock);
        if (handle) {
          recordHistory();
          if (handle === 'rot') {
            const cx = activeBlock.x + activeBlock.width / 2;
            const cy = activeBlock.y + activeBlock.height / 2;
            const startAngle = Math.atan2(coords.y - cy, coords.x - cx) * (180 / Math.PI);
            setDragAction({
              type: 'rotate',
              startAngle,
              initialRotation: activeBlock.rotation || 0,
              centerX: cx,
              centerY: cy,
            });
          } else {
            setDragAction({
              type: 'resize',
              handle,
              startX: coords.x,
              startY: coords.y,
              block: { ...activeBlock },
            });
          }
          return;
        }
      }

      // Check hit block
      const hit = getHitBlock(coords.x, coords.y);
      if (hit) {
        setActiveBlockId(hit.id);
        if (!hit.isLocked) {
          recordHistory();
          setDragAction({
            type: 'move',
            startX: coords.x,
            startY: coords.y,
            blockX: hit.x,
            blockY: hit.y,
          });
        }
      } else {
        setActiveBlockId(null);
        setEditingBlockId(null);
      }
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);

    // If panning
    if (dragAction?.type === 'pan') {
      const dx = e.clientX - dragAction.startX;
      const dy = e.clientY - dragAction.startY;
      setPanOffset({
        x: dragAction.initialPan.x + dx,
        y: dragAction.initialPan.y + dy,
      });
      return;
    }

    if (!coords) return;

    // Brush drawing
    if (dragAction?.type === 'brush') {
      const stroke = dragAction.stroke;
      stroke.points.push({ x: coords.x, y: coords.y });
      setBrushStrokes((prev) =>
        prev.map((s) => (s.id === stroke.id ? { ...stroke } : s))
      );
      return;
    }

    // Marquee box drawing for scan area
    if (dragAction?.type === 'marquee') {
      const minX = Math.min(dragAction.startX, coords.x);
      const minY = Math.min(dragAction.startY, coords.y);
      const w = Math.abs(coords.x - dragAction.startX);
      const h = Math.abs(coords.y - dragAction.startY);
      setMarqueeBox({ x: minX, y: minY, width: w, height: h });
      return;
    }

    // Moving text block
    if (dragAction?.type === 'move' && activeBlockId) {
      const dx = coords.x - dragAction.startX;
      const dy = coords.y - dragAction.startY;
      setTextBlocks((prev) =>
        prev.map((b) =>
          b.id === activeBlockId
            ? { ...b, x: Math.round(dragAction.blockX + dx), y: Math.round(dragAction.blockY + dy), isEdited: true }
            : b
        )
      );
      return;
    }

    // Rotating block
    if (dragAction?.type === 'rotate' && activeBlockId) {
      const currentAngle = Math.atan2(coords.y - dragAction.centerY, coords.x - dragAction.centerX) * (180 / Math.PI);
      let newRot = Math.round(dragAction.initialRotation + (currentAngle - dragAction.startAngle));
      // Snap to 0, 90, 180, 270 if close
      if (Math.abs(newRot % 90) < 3) newRot = Math.round(newRot / 90) * 90;
      setTextBlocks((prev) =>
        prev.map((b) => (b.id === activeBlockId ? { ...b, rotation: newRot, isEdited: true } : b))
      );
      return;
    }

    // Resizing block
    if (dragAction?.type === 'resize' && activeBlockId) {
      const { handle, startX, startY, block } = dragAction;
      const dx = coords.x - startX;
      const dy = coords.y - startY;

      let newX = block.x;
      let newY = block.y;
      let newW = block.width;
      let newH = block.height;

      if (handle.includes('e')) newW = Math.max(30, block.width + dx);
      if (handle.includes('s')) newH = Math.max(16, block.height + dy);
      if (handle.includes('w')) {
        const potentialW = block.width - dx;
        if (potentialW >= 30) {
          newW = potentialW;
          newX = block.x + dx;
        }
      }
      if (handle.includes('n')) {
        const potentialH = block.height - dy;
        if (potentialH >= 16) {
          newH = potentialH;
          newY = block.y + dy;
        }
      }

      // Proportional font-size adjustment when scaling corners
      let newFontSize = block.fontSize;
      if (handle.length === 2 && block.height > 0) {
        const scaleFactor = newH / block.height;
        newFontSize = Math.max(8, Math.round(block.fontSize * scaleFactor));
      }

      setTextBlocks((prev) =>
        prev.map((b) =>
          b.id === activeBlockId
            ? {
                ...b,
                x: Math.round(newX),
                y: Math.round(newY),
                width: Math.round(newW),
                height: Math.round(newH),
                fontSize: newFontSize,
                isEdited: true,
              }
            : b
        )
      );
      return;
    }

    // Hover state detection
    if (toolMode === 'select' && !dragAction) {
      const hit = getHitBlock(coords.x, coords.y);
      setHoveredBlockId(hit ? hit.id : null);
    }
  };

  // Mouse Up handler
  const handleMouseUp = () => {
    if (dragAction?.type === 'marquee' && marqueeBox) {
      if (marqueeBox.width > 15 && marqueeBox.height > 15) {
        onScanArea(marqueeBox);
      }
      setMarqueeBox(null);
      setToolMode('select');
    }
    setDragAction(null);
  };

  // Double Click for Inline WYSIWYG editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const hit = getHitBlock(coords.x, coords.y);
    if (hit) {
      setActiveBlockId(hit.id);
      setEditingBlockId(hit.id);
      setEditingText(hit.text);
    }
  };

  // Submit inline editing
  const handleSaveInlineEdit = () => {
    if (editingBlockId) {
      recordHistory();
      setTextBlocks((prev) =>
        prev.map((b) =>
          b.id === editingBlockId
            ? {
                ...b,
                text: editingText,
                isEdited: true,
              }
            : b
        )
      );
      setEditingBlockId(null);
    }
  };

  // Wheel Zoom support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(5, Math.max(0.15, prev * zoomFactor)));
  };

  // Drag and drop image files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  // Quick Action: Duplicate block
  const handleDuplicate = () => {
    if (!activeBlock) return;
    recordHistory();
    const newId = `blk-dup-${Date.now()}`;
    const duplicated: TextBlock = {
      ...activeBlock,
      id: newId,
      x: activeBlock.x + 20,
      y: activeBlock.y + 20,
      isCustom: true,
      isEdited: true,
    };
    setTextBlocks((prev) => [...prev, duplicated]);
    setActiveBlockId(newId);
  };

  // Quick Action: Delete block
  const handleDelete = () => {
    if (!activeBlockId) return;
    recordHistory();
    setTextBlocks((prev) => prev.filter((b) => b.id !== activeBlockId));
    setActiveBlockId(null);
    setEditingBlockId(null);
  };

  // Quick Action: Change font size
  const handleAdjustFontSize = (delta: number) => {
    if (!activeBlockId) return;
    recordHistory();
    setTextBlocks((prev) =>
      prev.map((b) =>
        b.id === activeBlockId
          ? {
              ...b,
              fontSize: Math.max(8, b.fontSize + delta),
              height: Math.max(16, b.height + delta),
              isEdited: true,
            }
          : b
      )
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center select-none ${
        isSpacePressed || toolMode === 'pan'
          ? 'cursor-grab active:cursor-grabbing'
          : toolMode === 'brush'
          ? 'cursor-crosshair'
          : toolMode === 'eyedropper'
          ? 'cursor-copy'
          : toolMode === 'scanArea' || toolMode === 'addText'
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
    >
      {/* Subtle Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* If No Image Uploaded: Empty State Dropzone */}
      {!image && (
        <div className="z-10 max-w-lg w-full mx-4 text-center">
          <div
            className={`p-10 rounded-2xl border-2 border-dashed transition-all ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-500/10 scale-102'
                : 'border-slate-700/80 bg-slate-900/50 hover:border-slate-600'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Upload Image to Edit Text
            </h2>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Drag &amp; drop any image here, paste from clipboard (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">Ctrl+V</kbd>), or try our sample templates.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <label className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 cursor-pointer transition-all active:scale-95 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
                />
                Browse Files
              </label>

              <button
                onClick={onOpenSamples}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Try Sample Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Viewport */}
      {image && (
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragAction?.type === 'pan' ? 'none' : 'transform 0.05s ease-out',
          }}
          className="relative shadow-2xl rounded-sm overflow-visible"
        >
          {/* Main Rendering Canvas */}
          <canvas
            ref={canvasRef}
            className="block max-w-none shadow-2xl ring-1 ring-slate-800"
          />

          {/* OCR Scanning Overlay with Progress Bar */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-50 pointer-events-none rounded">
              <div className="bg-slate-900/95 border border-indigo-500/50 rounded-2xl p-5 shadow-2xl flex flex-col items-center max-w-xs text-center space-y-3 pointer-events-auto">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Scanning Image Text</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {scanProgress?.status || 'Analyzing fonts & bounding boxes...'}
                  </p>
                </div>
                <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${Math.max(10, Math.round((scanProgress?.progress || 0.1) * 100))}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {Math.round((scanProgress?.progress || 0.1) * 100)}% complete
                </span>
              </div>
            </div>
          )}

          {/* Inline WYSIWYG Text Editor Overlay */}
          {editingBlockId && activeBlock && (
            <div
              style={{
                position: 'absolute',
                left: activeBlock.x,
                top: activeBlock.y,
                width: activeBlock.width,
                height: activeBlock.height,
                transform: `rotate(${activeBlock.rotation || 0}deg)`,
                transformOrigin: 'center center',
                zIndex: 50,
              }}
            >
              <textarea
                autoFocus
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleSaveInlineEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveInlineEdit();
                  } else if (e.key === 'Escape') {
                    setEditingBlockId(null);
                  }
                }}
                style={{
                  fontFamily: activeBlock.fontFamily,
                  fontSize: `${activeBlock.fontSize}px`,
                  fontWeight: activeBlock.fontWeight,
                  fontStyle: activeBlock.fontStyle,
                  textAlign: activeBlock.textAlign,
                  color: activeBlock.color,
                  lineHeight: activeBlock.lineHeight || 1.15,
                  letterSpacing: `${activeBlock.letterSpacing || 0}px`,
                  backgroundColor: activeBlock.patchColor || 'rgba(0,0,0,0.7)',
                }}
                className="w-full h-full resize-none p-1 border-2 border-indigo-500 rounded outline-none shadow-xl text-center overflow-hidden"
              />
            </div>
          )}

          {/* Marquee Selection Box during Area OCR scan */}
          {marqueeBox && (
            <div
              style={{
                position: 'absolute',
                left: marqueeBox.x,
                top: marqueeBox.y,
                width: marqueeBox.width,
                height: marqueeBox.height,
              }}
              className="border-2 border-dashed border-emerald-400 bg-emerald-500/20 pointer-events-none z-40"
            >
              <div className="absolute top-1 left-1 text-[10px] bg-emerald-600 text-white font-mono px-1 rounded">
                Scan Area: {Math.round(marqueeBox.width)} × {Math.round(marqueeBox.height)}
              </div>
            </div>
          )}

          {/* Floating Quick Inspector above selected block */}
          {activeBlock && !editingBlockId && toolMode === 'select' && (
            <div
              style={{
                position: 'absolute',
                left: activeBlock.x + activeBlock.width / 2,
                top: Math.max(10, activeBlock.y - 48),
                transform: 'translateX(-50%)',
                zIndex: 45,
              }}
              className="flex items-center space-x-1 bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700/80 shadow-2xl text-xs whitespace-nowrap"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Quick edit inline */}
              <button
                onClick={() => {
                  setEditingBlockId(activeBlock.id);
                  setEditingText(activeBlock.text);
                }}
                title="Double-click canvas or click here to edit text"
                className="flex items-center space-x-1 px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium truncate max-w-[100px]">{activeBlock.text}</span>
              </button>

              <div className="w-px h-4 bg-slate-700 mx-1" />

              {/* Adjust Font Size */}
              <button
                onClick={() => handleAdjustFontSize(-2)}
                title="Decrease Font Size"
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-[11px] text-slate-300 w-6 text-center">
                {activeBlock.fontSize}
              </span>
              <button
                onClick={() => handleAdjustFontSize(2)}
                title="Increase Font Size"
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              >
                <Plus className="w-3 h-3" />
              </button>

              <div className="w-px h-4 bg-slate-700 mx-1" />

              {/* Text Color Swatch */}
              <label className="relative cursor-pointer p-1 rounded hover:bg-slate-800" title="Text Color">
                <input
                  type="color"
                  value={activeBlock.color}
                  onChange={(e) => {
                    recordHistory();
                    setTextBlocks((prev) =>
                      prev.map((b) =>
                        b.id === activeBlock.id ? { ...b, color: e.target.value, isEdited: true } : b
                      )
                    );
                  }}
                  className="w-4 h-4 rounded cursor-pointer border border-slate-600 bg-transparent block"
                />
              </label>

              {/* Duplicate */}
              <button
                onClick={handleDuplicate}
                title="Duplicate Text Block (Ctrl+D)"
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                title="Delete Text Block (Backspace / Delete)"
                className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
