import { TextBlock, BrushStroke } from '../types';

export interface RenderCanvasOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement | null;
  textBlocks: TextBlock[];
  brushStrokes: BrushStroke[];
  showOriginalOnly?: boolean; // For Compare Before/After
  activeBlockId?: string | null;
  hoveredBlockId?: string | null;
  renderSelectionHighlights?: boolean;
}

export function renderCompositeCanvas({
  canvas,
  image,
  textBlocks,
  brushStrokes,
  showOriginalOnly = false,
  activeBlockId = null,
  hoveredBlockId = null,
  renderSelectionHighlights = false,
}: RenderCanvasOptions) {
  if (!canvas || !image) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw base original image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // If "Before" mode is held, only show the original image
  if (showOriginalOnly) {
    return;
  }

  // 2. Render manual touch-up / brush strokes
  if (brushStrokes && brushStrokes.length > 0) {
    ctx.save();
    for (const stroke of brushStrokes) {
      if (!stroke.points || stroke.points.length === 0) continue;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.globalAlpha = stroke.opacity;

      const p0 = stroke.points[0];
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. Render Background Patches (Erases original text from the image)
  // Only patch if the block is visible, has a patch type !== 'none', and (isEdited OR custom OR text changed)
  for (const block of textBlocks) {
    if (!block.isVisible) continue;
    if (block.patchType === 'none') continue;
    // We draw the patch if the text was modified, moved, styled, or if it's set to active patch
    const shouldPatch = block.isEdited || block.text !== block.originalText || block.isCustom;
    if (!shouldPatch) continue;

    ctx.save();
    ctx.globalAlpha = block.patchOpacity ?? 1;

    const pad = block.patchPadding || 4;
    const px = Math.max(0, block.x - pad);
    const py = Math.max(0, block.y - pad);
    const pw = block.width + pad * 2;
    const ph = block.height + pad * 2;

    // Apply rotation if needed
    if (block.rotation && block.rotation !== 0) {
      const cx = block.x + block.width / 2;
      const cy = block.y + block.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((block.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    if (block.patchFeather && block.patchFeather > 0) {
      ctx.shadowColor = block.patchColor;
      ctx.shadowBlur = block.patchFeather;
    }

    ctx.fillStyle = block.patchColor || '#ffffff';
    
    // Rounded rect patch for natural blend
    const radius = Math.min(6, Math.min(pw, ph) / 4);
    drawRoundedRect(ctx, px, py, pw, ph, radius);
    ctx.fill();

    ctx.restore();
  }

  // 4. Render Text Layers
  for (const block of textBlocks) {
    if (!block.isVisible) continue;

    // If block is not edited, not custom, and text is unchanged, the original image already contains it!
    const isModified = block.isEdited || block.text !== block.originalText || block.isCustom;
    if (!isModified) continue;

    ctx.save();
    ctx.globalAlpha = block.opacity ?? 1;

    const cx = block.x + block.width / 2;
    const cy = block.y + block.height / 2;

    // Handle rotation around center
    ctx.translate(cx, cy);
    if (block.rotation && block.rotation !== 0) {
      ctx.rotate((block.rotation * Math.PI) / 180);
    }
    ctx.translate(-cx, -cy);

    // Font setup
    const fontSize = block.fontSize || 24;
    const fontStyle = block.fontStyle || 'normal';
    const fontWeight = block.fontWeight || 'normal';
    const fontFamily = block.fontFamily || 'sans-serif';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';

    // Letter spacing if supported
    if ('letterSpacing' in ctx && typeof block.letterSpacing === 'number') {
      (ctx as any).letterSpacing = `${block.letterSpacing}px`;
    }

    // Shadow setup
    if (block.shadowBlur > 0 && block.shadowColor !== 'transparent') {
      ctx.shadowColor = block.shadowColor;
      ctx.shadowBlur = block.shadowBlur;
      ctx.shadowOffsetX = block.shadowOffsetX || 0;
      ctx.shadowOffsetY = block.shadowOffsetY || 0;
    }

    // Split text into lines
    const displayText = block.isUpperCase ? block.text.toUpperCase() : block.text;
    const lines = displayText.split('\n');
    const lineHeightPx = fontSize * (block.lineHeight || 1.15);
    const totalTextHeight = lines.length * lineHeightPx;
    let startY = block.y + (block.height - totalTextHeight) / 2 + lineHeightPx / 2;

    for (const line of lines) {
      let lineX = block.x;
      if (block.textAlign === 'center') {
        ctx.textAlign = 'center';
        lineX = block.x + block.width / 2;
      } else if (block.textAlign === 'right') {
        ctx.textAlign = 'right';
        lineX = block.x + block.width;
      } else {
        ctx.textAlign = 'left';
        lineX = block.x;
      }

      // Stroke / Outline
      if (block.strokeWidth && block.strokeWidth > 0 && block.strokeColor) {
        ctx.strokeStyle = block.strokeColor;
        ctx.lineWidth = block.strokeWidth;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(line, lineX, startY);
      }

      // Main Text Fill
      ctx.fillStyle = block.color || '#000000';
      ctx.fillText(line, lineX, startY);

      startY += lineHeightPx;
    }

    ctx.restore();
  }

  // 5. Render Selection bounding boxes and handles if in editor mode
  if (renderSelectionHighlights) {
    for (const block of textBlocks) {
      if (!block.isVisible) continue;
      const isSelected = block.id === activeBlockId;
      const isHovered = block.id === hoveredBlockId && !isSelected;

      if (!isSelected && !isHovered) {
        // Draw very faint dashed bounding box on unselected detected items to show they are editable
        ctx.save();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(block.x, block.y, block.width, block.height);
        ctx.restore();
        continue;
      }

      ctx.save();
      const cx = block.x + block.width / 2;
      const cy = block.y + block.height / 2;

      ctx.translate(cx, cy);
      if (block.rotation && block.rotation !== 0) {
        ctx.rotate((block.rotation * Math.PI) / 180);
      }
      ctx.translate(-cx, -cy);

      if (isSelected) {
        // Active selection border
        ctx.strokeStyle = '#6366f1'; // Indigo 500
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(block.x, block.y, block.width, block.height);

        // Draw Corner and Edge resize handles
        const handleSize = 8;
        const halfHandle = handleSize / 2;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 2;

        const handles = [
          { x: block.x, y: block.y }, // Top-left
          { x: block.x + block.width / 2, y: block.y }, // Top-center
          { x: block.x + block.width, y: block.y }, // Top-right
          { x: block.x + block.width, y: block.y + block.height / 2 }, // Right-center
          { x: block.x + block.width, y: block.y + block.height }, // Bottom-right
          { x: block.x + block.width / 2, y: block.y + block.height }, // Bottom-center
          { x: block.x, y: block.y + block.height }, // Bottom-left
          { x: block.x, y: block.y + block.height / 2 }, // Left-center
        ];

        for (const h of handles) {
          ctx.fillRect(h.x - halfHandle, h.y - halfHandle, handleSize, handleSize);
          ctx.strokeRect(h.x - halfHandle, h.y - halfHandle, handleSize, handleSize);
        }

        // Rotation Handle stick and knob at the top
        const rotY = block.y - 24;
        ctx.beginPath();
        ctx.moveTo(block.x + block.width / 2, block.y);
        ctx.lineTo(block.x + block.width / 2, rotY);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(block.x + block.width / 2, rotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (isHovered) {
        // Hover border
        ctx.strokeStyle = '#38bdf8'; // Sky blue
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(block.x, block.y, block.width, block.height);
      }

      ctx.restore();
    }
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
