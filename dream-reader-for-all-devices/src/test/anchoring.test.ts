import { describe, it, expect } from 'vitest';
import {
  createTextQuoteSelector,
  matchTextQuoteSelector,
} from '../reader-core/anchoring/text-quote';
import {
  normalizeClientRect,
  denormalizeRect,
  mergeNormalizedRects,
} from '../reader-core/anchoring/pdf-rects';

describe('Text Anchoring (W3C TextQuoteSelector)', () => {
  const documentText = `
    Operating Systems: Three Easy Pieces.
    Virtualization allows multiple programs to run concurrently,
    sharing memory and CPU resources seamlessly.
    Processes are the fundamental abstraction in any modern OS.
    Virtualization allows hardware resources to be multiplexed.
  `;

  it('creates selector with exact text, prefix, and suffix', () => {
    const start = documentText.indexOf('Virtualization allows multiple programs');
    const end = start + 'Virtualization allows multiple programs'.length;

    const selector = createTextQuoteSelector(documentText, start, end, 20);
    expect(selector.exact).toBe('Virtualization allows multiple programs');
    expect(selector.prefix).toBeDefined();
    expect(selector.suffix).toBeDefined();
  });

  it('disambiguates between duplicate phrases using prefix and suffix', () => {
    // There are two sentences starting with "Virtualization allows"
    const firstStart = documentText.indexOf('Virtualization allows');
    const firstEnd = firstStart + 'Virtualization allows'.length;

    const secondStart = documentText.lastIndexOf('Virtualization allows');
    const secondEnd = secondStart + 'Virtualization allows'.length;

    const firstSelector = createTextQuoteSelector(documentText, firstStart, firstEnd, 25);
    const secondSelector = createTextQuoteSelector(documentText, secondStart, secondEnd, 25);

    const matchFirst = matchTextQuoteSelector(documentText, firstSelector);
    const matchSecond = matchTextQuoteSelector(documentText, secondSelector);

    expect(matchFirst?.start).toBe(firstStart);
    expect(matchSecond?.start).toBe(secondStart);
  });

  it('tolerates whitespace normalization', () => {
    const text = 'Concurrency   is\n  difficult   to master.';
    const selector = {
      exact: 'Concurrency is difficult to master.',
      prefix: '',
      suffix: '',
    };

    const match = matchTextQuoteSelector(text, selector);
    expect(match).not.toBeNull();
  });
});

describe('PDF Rect Normalization (0-1 relative to page viewport)', () => {
  const pageBounds = { left: 100, top: 200, width: 800, height: 1000 };

  it('normalizes client rects to 0-1 coordinates', () => {
    const clientRect = { left: 200, top: 400, width: 400, height: 50 };
    const normalized = normalizeClientRect(clientRect, pageBounds);

    expect(normalized.x).toBe(0.125); // (200 - 100) / 800
    expect(normalized.y).toBe(0.2); // (400 - 200) / 1000
    expect(normalized.width).toBe(0.5); // 400 / 800
    expect(normalized.height).toBe(0.05); // 50 / 1000
  });

  it('denormalizes accurately back to any viewport size (resizing / zoom)', () => {
    const normalized = { x: 0.25, y: 0.1, width: 0.5, height: 0.05 };
    const scaledWidth = 1600; // 2x zoom
    const scaledHeight = 2000;

    const denorm = denormalizeRect(normalized, scaledWidth, scaledHeight);
    expect(denorm.left).toBe(400);
    expect(denorm.top).toBe(200);
    expect(denorm.width).toBe(800);
    expect(denorm.height).toBe(100);
  });

  it('merges horizontally adjacent rects on the same line', () => {
    const rect1 = { x: 0.1, y: 0.2, width: 0.15, height: 0.03 };
    const rect2 = { x: 0.25, y: 0.2, width: 0.2, height: 0.03 }; // adjacent

    const merged = mergeNormalizedRects([rect1, rect2]);
    expect(merged.length).toBe(1);
    expect(merged[0].x).toBe(0.1);
    expect(merged[0].width).toBeCloseTo(0.35, 2);
  });
});
