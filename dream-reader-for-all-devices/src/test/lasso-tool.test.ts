import { describe, it, expect } from 'vitest';
import {
  isPointInPolygon,
  isStrokeSelectedByLasso,
  computeStrokesBoundingBox,
  translateStroke,
} from '../reader-core/ink/lasso-tool';
import { InkStroke } from '../types';

describe('Lasso Tool Core Engine', () => {
  const squarePolygon = [
    { x: 0.2, y: 0.2 },
    { x: 0.6, y: 0.2 },
    { x: 0.6, y: 0.6 },
    { x: 0.2, y: 0.6 },
  ];

  it('correctly determines whether points are inside or outside a polygon', () => {
    // Inside point
    expect(isPointInPolygon({ x: 0.4, y: 0.4 }, squarePolygon)).toBe(true);

    // Outside points
    expect(isPointInPolygon({ x: 0.1, y: 0.1 }, squarePolygon)).toBe(false);
    expect(isPointInPolygon({ x: 0.8, y: 0.4 }, squarePolygon)).toBe(false);
    expect(isPointInPolygon({ x: 0.4, y: 0.9 }, squarePolygon)).toBe(false);
  });

  it('selects strokes that are enclosed within the lasso loop', () => {
    const enclosedStroke: InkStroke = {
      id: 'stroke-1',
      points: [
        { x: 0.3, y: 0.3, pressure: 0.5 },
        { x: 0.35, y: 0.35, pressure: 0.6 },
        { x: 0.4, y: 0.4, pressure: 0.5 },
      ],
      color: '#ef4444',
      size: 3,
    };

    const outsideStroke: InkStroke = {
      id: 'stroke-2',
      points: [
        { x: 0.8, y: 0.8, pressure: 0.5 },
        { x: 0.85, y: 0.85, pressure: 0.5 },
      ],
      color: '#3b82f6',
      size: 3,
    };

    expect(isStrokeSelectedByLasso(enclosedStroke, squarePolygon)).toBe(true);
    expect(isStrokeSelectedByLasso(outsideStroke, squarePolygon)).toBe(false);
  });

  it('computes accurate bounding box for selected strokes with pixel padding', () => {
    const strokes: InkStroke[] = [
      {
        id: 'stroke-1',
        points: [
          { x: 0.1, y: 0.2 },
          { x: 0.5, y: 0.4 },
        ],
        color: '#ef4444',
        size: 3,
      },
    ];

    const box = computeStrokesBoundingBox(strokes, 1000, 1000, 10);
    expect(box).not.toBeNull();
    expect(box?.minX).toBe(0.1);
    expect(box?.maxX).toBe(0.5);
    expect(box?.minY).toBe(0.2);
    expect(box?.maxY).toBe(0.4);

    // Pixel rect should take padding into account: 0.1 * 1000 = 100 - 10 = 90
    expect(box?.pixelRect.x).toBe(90);
    expect(box?.pixelRect.y).toBe(190);
  });

  it('translates strokes by delta coordinates properly', () => {
    const stroke: InkStroke = {
      id: 'stroke-1',
      points: [
        { x: 0.2, y: 0.3 },
        { x: 0.4, y: 0.5 },
      ],
      color: '#ef4444',
      size: 3,
    };

    const translated = translateStroke(stroke, 0.1, -0.05);
    expect(translated.points[0].x).toBeCloseTo(0.3);
    expect(translated.points[0].y).toBeCloseTo(0.25);
    expect(translated.points[1].x).toBeCloseTo(0.5);
    expect(translated.points[1].y).toBeCloseTo(0.45);
  });
});
