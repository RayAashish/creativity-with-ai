import { InkStroke } from '../../types';

/**
 * Point in polygon check using standard ray-casting algorithm.
 * Coordinates are normalized (0 to 1).
 */
export function isPointInPolygon(
  point: { x: number; y: number },
  polygon: { x: number; y: number }[]
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Determines whether a given stroke is selected by the drawn lasso polygon.
 */
export function isStrokeSelectedByLasso(
  stroke: InkStroke,
  lassoPolygon: { x: number; y: number }[]
): boolean {
  if (!stroke.points || stroke.points.length === 0 || lassoPolygon.length < 3) {
    return false;
  }

  // Count how many points are enclosed
  let pointsInside = 0;
  for (const pt of stroke.points) {
    if (isPointInPolygon(pt, lassoPolygon)) {
      pointsInside++;
    }
  }

  // If at least 35% of sample points are inside the lasso, select it
  const ratio = pointsInside / stroke.points.length;
  if (ratio >= 0.35) return true;

  // Alternatively, check centroid
  const sumX = stroke.points.reduce((acc, p) => acc + p.x, 0);
  const sumY = stroke.points.reduce((acc, p) => acc + p.y, 0);
  const centroid = { x: sumX / stroke.points.length, y: sumY / stroke.points.length };

  return isPointInPolygon(centroid, lassoPolygon);
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  pixelRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Computes bounding box of selected strokes with comfortable padding for UI handles.
 */
export function computeStrokesBoundingBox(
  strokes: InkStroke[],
  pageWidth: number,
  pageHeight: number,
  paddingPx: number = 8
): BoundingBox | null {
  if (!strokes || strokes.length === 0) return null;

  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  let hasPoints = false;

  for (const stroke of strokes) {
    for (const pt of stroke.points) {
      hasPoints = true;
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  if (!hasPoints) return null;

  const rawPixelX = minX * pageWidth;
  const rawPixelY = minY * pageHeight;
  const rawPixelW = (maxX - minX) * pageWidth;
  const rawPixelH = (maxY - minY) * pageHeight;

  const pixelX = Math.max(0, rawPixelX - paddingPx);
  const pixelY = Math.max(0, rawPixelY - paddingPx);
  const pixelW = Math.min(pageWidth - pixelX, rawPixelW + paddingPx * 2);
  const pixelH = Math.min(pageHeight - pixelY, rawPixelH + paddingPx * 2);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    pixelRect: {
      x: pixelX,
      y: pixelY,
      width: Math.max(28, pixelW),
      height: Math.max(28, pixelH),
    },
  };
}

/**
 * Translates stroke points by normalized delta (dx, dy).
 */
export function translateStroke(stroke: InkStroke, dx: number, dy: number): InkStroke {
  return {
    ...stroke,
    points: stroke.points.map((p) => ({
      ...p,
      x: Math.max(0, Math.min(1, p.x + dx)),
      y: Math.max(0, Math.min(1, p.y + dy)),
    })),
  };
}
