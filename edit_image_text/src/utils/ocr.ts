import { createWorker } from 'tesseract.js';
import type { TextBlock } from '../types';

export interface OCRProgressCallback {
  (progress: { status: string; progress: number }): void;
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Sample background and text colors around and inside a bounding box
export function sampleColorsFromCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number
): { backgroundColor: string; textColor: string } {
  try {
    const pad = 6;
    const sx = Math.max(0, Math.floor(x - pad));
    const sy = Math.max(0, Math.floor(y - pad));
    const sw = Math.min(canvasWidth - sx, Math.ceil(width + pad * 2));
    const sh = Math.min(canvasHeight - sy, Math.ceil(height + pad * 2));

    if (sw <= 0 || sh <= 0) {
      return { backgroundColor: '#ffffff', textColor: '#000000' };
    }

    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const data = imgData.data;

    // Collect perimeter pixels (top row, bottom row, left col, right col) for background
    const bgPixels: { r: number; g: number; b: number }[] = [];

    for (let c = 0; c < sw; c++) {
      // Top edge
      const topIdx = (0 * sw + c) * 4;
      bgPixels.push({ r: data[topIdx], g: data[topIdx + 1], b: data[topIdx + 2] });

      // Bottom edge
      const botIdx = ((sh - 1) * sw + c) * 4;
      bgPixels.push({ r: data[botIdx], g: data[botIdx + 1], b: data[botIdx + 2] });
    }

    for (let r = 1; r < sh - 1; r++) {
      // Left edge
      const leftIdx = (r * sw + 0) * 4;
      bgPixels.push({ r: data[leftIdx], g: data[leftIdx + 1], b: data[leftIdx + 2] });

      // Right edge
      const rightIdx = (r * sw + (sw - 1)) * 4;
      bgPixels.push({ r: data[rightIdx], g: data[rightIdx + 1], b: data[rightIdx + 2] });
    }

    // Average BG Color
    let bgR = 0, bgG = 0, bgB = 0;
    for (const px of bgPixels) {
      bgR += px.r;
      bgG += px.g;
      bgB += px.b;
    }
    const bgLen = bgPixels.length || 1;
    const avgBgR = bgR / bgLen;
    const avgBgG = bgG / bgLen;
    const avgBgB = bgB / bgLen;

    const backgroundColor = rgbToHex(avgBgR, avgBgG, avgBgB);

    // Compute contrast inside the box to detect text color
    const textPixels: { r: number; g: number; b: number; diff: number }[] = [];

    // Scan interior (skip border pad)
    const innerStartX = Math.min(pad, Math.floor(sw / 4));
    const innerEndX = Math.max(innerStartX + 1, sw - pad);
    const innerStartY = Math.min(pad, Math.floor(sh / 4));
    const innerEndY = Math.max(innerStartY + 1, sh - pad);

    for (let r = innerStartY; r < innerEndY; r++) {
      for (let c = innerStartX; c < innerEndX; c++) {
        const idx = (r * sw + c) * 4;
        const pr = data[idx];
        const pg = data[idx + 1];
        const pb = data[idx + 2];

        // Euclidean color distance from background
        const diff = Math.sqrt(
          Math.pow(pr - avgBgR, 2) +
          Math.pow(pg - avgBgG, 2) +
          Math.pow(pb - avgBgB, 2)
        );

        if (diff > 45) {
          textPixels.push({ r: pr, g: pg, b: pb, diff });
        }
      }
    }

    // Sort by highest contrast diff and take top 50%
    let textColor = '#000000';
    if (textPixels.length > 5) {
      textPixels.sort((a, b) => b.diff - a.diff);
      const topCount = Math.max(5, Math.floor(textPixels.length * 0.5));
      let tr = 0, tg = 0, tb = 0;
      for (let i = 0; i < topCount; i++) {
        tr += textPixels[i].r;
        tg += textPixels[i].g;
        tb += textPixels[i].b;
      }
      textColor = rgbToHex(tr / topCount, tg / topCount, tb / topCount);
    } else {
      // Fallback: If BG is dark, text is white, else text is black
      const bgLuminance = (0.299 * avgBgR + 0.587 * avgBgG + 0.114 * avgBgB);
      textColor = bgLuminance > 128 ? '#000000' : '#ffffff';
    }

    return { backgroundColor, textColor };
  } catch (err) {
    console.warn('Color sampling error:', err);
    return { backgroundColor: '#ffffff', textColor: '#000000' };
  }
}

export async function detectTextInImage(
  imageSource: HTMLImageElement | HTMLCanvasElement | string,
  onProgress?: OCRProgressCallback,
  language: string = 'eng',
  area?: { x: number; y: number; width: number; height: number },
  granularity: 'line' | 'word' = 'line'
): Promise<TextBlock[]> {
  // Convert image to clean offscreen canvas to avoid any CORS or serialization issues
  const tempCanvas = document.createElement('canvas');
  let imgWidth = 800;
  let imgHeight = 600;

  if (imageSource instanceof HTMLImageElement) {
    imgWidth = imageSource.naturalWidth || imageSource.width || 800;
    imgHeight = imageSource.naturalHeight || imageSource.height || 600;
    tempCanvas.width = imgWidth;
    tempCanvas.height = imgHeight;
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (ctx) ctx.drawImage(imageSource, 0, 0);
  } else if (imageSource instanceof HTMLCanvasElement) {
    imgWidth = imageSource.width || 800;
    imgHeight = imageSource.height || 600;
    tempCanvas.width = imgWidth;
    tempCanvas.height = imgHeight;
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (ctx) ctx.drawImage(imageSource, 0, 0);
  }

  // Initialize Worker with graceful fallback if non-English traineddata fails to download
  let worker: any;
  const targetLang = language || 'eng';

  try {
    worker = await createWorker(targetLang, 1, {
      logger: m => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: typeof m.progress === 'number' ? m.progress : 0,
          });
        }
      },
    });
  } catch (initErr) {
    console.warn(`Failed to initialize OCR with language ${targetLang}, falling back to 'eng':`, initErr);
    worker = await createWorker('eng', 1, {
      logger: m => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: typeof m.progress === 'number' ? m.progress : 0,
          });
        }
      },
    });
  }

  try {
    const recognizeOptions: any = {};
    if (area && area.width > 5 && area.height > 5) {
      recognizeOptions.rectangle = {
        left: Math.round(area.x),
        top: Math.round(area.y),
        width: Math.round(area.width),
        height: Math.round(area.height),
      };
    }

    // CRITICAL: In Tesseract.js v5 / v6 / v7, output must explicitly include blocks / layoutBlocks / words
    // Otherwise it defaults to { text: true } which returns blocks: undefined!
    const ret = await worker.recognize(
      tempCanvas,
      recognizeOptions,
      {
        text: true,
        blocks: true,
        layoutBlocks: true,
        hocr: true,
        tsv: true,
      }
    );
    const data: any = ret.data;

    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    const rawItems: Array<{
      text: string;
      bbox: { x0: number; y0: number; x1: number; y1: number };
      confidence: number;
    }> = [];

    if (granularity === 'word') {
      // Extract words
      if (data.words && Array.isArray(data.words)) {
        for (const w of data.words) {
          const clean = (w.text || '').replace(/[\r\n]+/g, ' ').trim();
          if (clean && w.bbox) {
            rawItems.push({
              text: clean,
              bbox: w.bbox,
              confidence: Math.round(w.confidence || 85),
            });
          }
        }
      }
    } else {
      // 1. Primary: Extract lines from blocks -> paragraphs -> lines
      if (data.blocks && Array.isArray(data.blocks)) {
        for (const block of data.blocks) {
          if (block.paragraphs && Array.isArray(block.paragraphs)) {
            for (const para of block.paragraphs) {
              if (para.lines && Array.isArray(para.lines)) {
                for (const line of para.lines) {
                  const clean = (line.text || '').replace(/[\r\n]+/g, ' ').trim();
                  if (clean && line.bbox) {
                    rawItems.push({
                      text: clean,
                      bbox: line.bbox,
                      confidence: Math.round(line.confidence || 85),
                    });
                  }
                }
              }
            }
          }
        }
      }

      // 2. Fallback: try data.lines directly
      if (rawItems.length === 0 && data.lines && Array.isArray(data.lines)) {
        for (const line of data.lines) {
          const clean = (line.text || '').replace(/[\r\n]+/g, ' ').trim();
          if (clean && line.bbox) {
            rawItems.push({
              text: clean,
              bbox: line.bbox,
              confidence: Math.round(line.confidence || 85),
            });
          }
        }
      }

      // 3. Fallback: try data.words
      if (rawItems.length === 0 && data.words && Array.isArray(data.words)) {
        for (const w of data.words) {
          const clean = (w.text || '').replace(/[\r\n]+/g, ' ').trim();
          if (clean && w.bbox) {
            rawItems.push({
              text: clean,
              bbox: w.bbox,
              confidence: Math.round(w.confidence || 85),
            });
          }
        }
      }
    }

    const blocks: TextBlock[] = [];
    let idCounter = 1;

    for (const item of rawItems) {
      const cleanText = item.text.trim();
      if (!cleanText || cleanText.length === 0) continue;

      const bbox = item.bbox;
      if (!bbox) continue;

      const x = Math.max(0, bbox.x0);
      const y = Math.max(0, bbox.y0);
      const width = Math.max(20, bbox.x1 - bbox.x0);
      const height = Math.max(16, bbox.y1 - bbox.y0);

      // Sample colors
      let bgColor = '#ffffff';
      let txtColor = '#000000';

      if (tempCtx) {
        const colors = sampleColorsFromCanvas(tempCtx, x, y, width, height, imgWidth, imgHeight);
        bgColor = colors.backgroundColor;
        txtColor = colors.textColor;
      }

      // Estimate font size based on box height (around 74% of line height)
      const fontSize = Math.max(12, Math.round(height * 0.74));

      // Detect if uppercase
      const isUpperCase = cleanText === cleanText.toUpperCase() && /[A-Z]/.test(cleanText);

      blocks.push({
        id: `blk-${Date.now()}-${idCounter++}`,
        text: cleanText,
        originalText: cleanText,
        x,
        y,
        width,
        height,
        rotation: 0,
        fontSize,
        fontFamily: isUpperCase ? "'Anton', 'Impact', sans-serif" : "'Inter', sans-serif",
        fontWeight: isUpperCase ? '700' : '600',
        fontStyle: 'normal',
        textAlign: 'left',
        color: txtColor,
        opacity: 1,
        letterSpacing: 0,
        lineHeight: 1.15,
        strokeColor: '#000000',
        strokeWidth: 0,
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        isUpperCase,
        patchColor: bgColor,
        patchType: 'auto-solid',
        patchPadding: Math.max(4, Math.round(fontSize * 0.16)),
        patchFeather: 3,
        patchOpacity: 1,
        confidence: item.confidence,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      });
    }

    return blocks;
  } finally {
    await worker.terminate();
  }
}
