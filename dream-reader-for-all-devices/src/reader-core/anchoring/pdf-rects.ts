import { NormalizedRect } from '../../types';

/**
 * Normalizes client rects (pixels) into 0-1 coordinates relative to a PDF page element.
 * This guarantees annotations and highlights scale and reposition perfectly across
 * any zoom level, window resizing, or screen DPI changes.
 */
export function normalizeClientRect(
  rect: { left: number; top: number; width: number; height: number },
  pageBounds: { left: number; top: number; width: number; height: number }
): NormalizedRect {
  if (pageBounds.width <= 0 || pageBounds.height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const x = Math.max(0, Math.min(1, (rect.left - pageBounds.left) / pageBounds.width));
  const y = Math.max(0, Math.min(1, (rect.top - pageBounds.top) / pageBounds.height));
  const width = Math.max(0, Math.min(1 - x, rect.width / pageBounds.width));
  const height = Math.max(0, Math.min(1 - y, rect.height / pageBounds.height));

  return {
    x: Number(x.toFixed(5)),
    y: Number(y.toFixed(5)),
    width: Number(width.toFixed(5)),
    height: Number(height.toFixed(5)),
  };
}

/**
 * Converts a normalized rect (0-1) back to pixel dimensions for a given page dimension.
 */
export function denormalizeRect(
  normalized: NormalizedRect,
  pageWidth: number,
  pageHeight: number
): { left: number; top: number; width: number; height: number } {
  return {
    left: normalized.x * pageWidth,
    top: normalized.y * pageHeight,
    width: normalized.width * pageWidth,
    height: normalized.height * pageHeight,
  };
}

/**
 * Merges adjacent or overlapping normalized rects on the same text line.
 */
export function mergeNormalizedRects(rects: NormalizedRect[]): NormalizedRect[] {
  if (rects.length <= 1) return rects;

  // Sort by Y first, then X
  const sorted = [...rects].sort((a, b) => (Math.abs(a.y - b.y) > 0.005 ? a.y - b.y : a.x - b.x));
  const merged: NormalizedRect[] = [];

  for (const current of sorted) {
    if (merged.length === 0) {
      merged.push({ ...current });
      continue;
    }

    const prev = merged[merged.length - 1];
    // Check if on the same horizontal line (similar Y and height)
    const sameLine = Math.abs(prev.y - current.y) < 0.008 && Math.abs(prev.height - current.height) < 0.008;
    const horizontallyAdjacent = current.x <= prev.x + prev.width + 0.01;

    if (sameLine && horizontallyAdjacent) {
      const maxX = Math.max(prev.x + prev.width, current.x + current.width);
      prev.width = maxX - prev.x;
      prev.height = Math.max(prev.height, current.height);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}
