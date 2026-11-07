import { getStroke } from 'perfect-freehand';
import { InkPoint, InkStroke } from '../../types';

export interface StrokeOptions {
  size: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  simulatePressure?: boolean;
}

/**
 * Converts stroke points returned by perfect-freehand into an SVG path `d` string.
 */
export function getSvgPathFromStroke(points: number[][], closed = true): string {
  const len = points.length;
  if (len < 4) return '';

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${(
    (b[0] + c[0]) /
    2
  ).toFixed(2)},${((b[1] + c[1]) / 2).toFixed(2)}`;

  for (let i = 2; i < len - 1; i++) {
    a = points[i];
    b = points[i + 1];
    result += ` T${((a[0] + b[0]) / 2).toFixed(2)},${((a[1] + b[1]) / 2).toFixed(2)}`;
  }

  if (closed) {
    result += 'Z';
  }

  return result;
}

/**
 * Computes the SVG path string for a normalized InkStroke given canvas dimensions.
 */
export function renderStrokeToSvgPath(
  stroke: InkStroke,
  pageWidth: number,
  pageHeight: number,
  options?: Partial<StrokeOptions>
): string {
  const rawPoints = stroke.points.map((p) => [
    p.x * pageWidth,
    p.y * pageHeight,
    p.pressure ?? 0.5,
  ]);

  const strokePoints = getStroke(rawPoints, {
    size: stroke.size || 3,
    thinning: stroke.isHighlighter ? 0 : 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: true,
    ...options,
  });

  return getSvgPathFromStroke(strokePoints);
}

/**
 * Renders an InkStroke onto an HTML5 2D Canvas context.
 * High-performance, direct GPU rasterization without DOM overhead.
 */
export function renderStrokeToCanvas(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  pageWidth: number,
  pageHeight: number,
  options?: Partial<StrokeOptions>
): void {
  if (!stroke.points || stroke.points.length === 0) return;

  const rawPoints = stroke.points.map((p) => [
    p.x * pageWidth,
    p.y * pageHeight,
    p.pressure ?? 0.5,
  ]);

  const outline = getStroke(rawPoints, {
    size: stroke.size || 3,
    thinning: stroke.isHighlighter ? 0 : 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: true,
    ...options,
  });

  if (outline.length < 2) return;

  ctx.save();
  if (stroke.isHighlighter) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = stroke.color;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = stroke.color;
  }

  ctx.beginPath();
  ctx.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i][0], outline[i][1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Normalizes client coordinates from a PointerEvent to (0-1) coordinates relative to page dimensions.
 */
export function normalizePointerPoint(
  e: React.PointerEvent<HTMLElement | SVGSVGElement | HTMLCanvasElement> | PointerEvent,
  bounds: DOMRect
): InkPoint {
  const x = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
  const y = Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height));
  return {
    x: Number(x.toFixed(5)),
    y: Number(y.toFixed(5)),
    pressure: e.pressure > 0 ? Number(e.pressure.toFixed(3)) : 0.5,
  };
}
