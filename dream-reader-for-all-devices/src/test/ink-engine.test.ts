import { describe, it, expect } from 'vitest';
import { renderStrokeToSvgPath, getSvgPathFromStroke } from '../reader-core/ink/ink-engine';
import { InkStroke } from '../types';

describe('Freehand Ink Engine (perfect-freehand)', () => {
  it('converts stroke points into a closed SVG path string', () => {
    const rawPoints = [
      [10, 10],
      [20, 25],
      [35, 40],
      [50, 50],
      [65, 60],
    ];

    const path = getSvgPathFromStroke(rawPoints, true);
    expect(path).toMatch(/^M\d+/);
    expect(path).toContain('Q');
    expect(path).toContain('T');
    expect(path.endsWith('Z')).toBe(true);
  });

  it('renders normalized ink stroke across arbitrary canvas dimensions', () => {
    const stroke: InkStroke = {
      id: 'stroke-test',
      points: [
        { x: 0.1, y: 0.1, pressure: 0.5 },
        { x: 0.2, y: 0.2, pressure: 0.5 },
        { x: 0.3, y: 0.3, pressure: 0.6 },
        { x: 0.4, y: 0.4, pressure: 0.5 },
      ],
      color: '#ef4444',
      size: 4,
    };

    // Standard 600x800 page
    const pathStandard = renderStrokeToSvgPath(stroke, 600, 800);
    expect(pathStandard.length).toBeGreaterThan(0);

    // Scaled 2x zoom (1200x1600 page)
    const pathZoomed = renderStrokeToSvgPath(stroke, 1200, 1600);
    expect(pathZoomed.length).toBeGreaterThan(0);
    expect(pathZoomed).not.toBe(pathStandard);
  });

  it('handles highlighter strokes without thinning', () => {
    const stroke: InkStroke = {
      id: 'highlighter-test',
      points: [
        { x: 0.1, y: 0.5, pressure: 0.5 },
        { x: 0.3, y: 0.5, pressure: 0.5 },
        { x: 0.5, y: 0.5, pressure: 0.5 },
        { x: 0.7, y: 0.5, pressure: 0.5 },
      ],
      color: '#fef08a66',
      size: 12,
      isHighlighter: true,
    };

    const path = renderStrokeToSvgPath(stroke, 800, 1000);
    expect(path).toContain('M');
  });
});
