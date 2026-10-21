import { jsPDF } from 'jspdf';
import { TextBlock, BrushStroke } from '../types';
import { renderCompositeCanvas } from './canvasRenderer';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp' | 'pdf';
  quality: number; // 0.1 to 1.0
  fileName?: string;
}

export function generateExportCanvas(
  image: HTMLImageElement,
  textBlocks: TextBlock[],
  brushStrokes: BrushStroke[]
): HTMLCanvasElement {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = image.naturalWidth || image.width;
  exportCanvas.height = image.naturalHeight || image.height;

  renderCompositeCanvas({
    canvas: exportCanvas,
    image,
    textBlocks,
    brushStrokes,
    showOriginalOnly: false,
    renderSelectionHighlights: false, // clean export without editor UI
  });

  return exportCanvas;
}

export async function exportImage(
  image: HTMLImageElement,
  textBlocks: TextBlock[],
  brushStrokes: BrushStroke[],
  options: ExportOptions
): Promise<void> {
  const exportCanvas = generateExportCanvas(image, textBlocks, brushStrokes);
  const baseName = options.fileName || 'edited-image';

  if (options.format === 'pdf') {
    const isLandscape = exportCanvas.width > exportCanvas.height;
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'px',
      format: [exportCanvas.width, exportCanvas.height],
    });

    const imgData = exportCanvas.toDataURL('image/jpeg', options.quality || 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, exportCanvas.width, exportCanvas.height);
    doc.save(`${baseName}.pdf`);
    return;
  }

  const mimeType = options.format === 'jpeg' ? 'image/jpeg' : options.format === 'webp' ? 'image/webp' : 'image/png';
  const dataUrl = exportCanvas.toDataURL(mimeType, options.quality);

  const link = document.createElement('a');
  link.download = `${baseName}.${options.format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyImageToClipboard(
  image: HTMLImageElement,
  textBlocks: TextBlock[],
  brushStrokes: BrushStroke[]
): Promise<boolean> {
  try {
    const exportCanvas = generateExportCanvas(image, textBlocks, brushStrokes);

    return new Promise((resolve) => {
      exportCanvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } catch (err) {
          console.error('Clipboard write error:', err);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Copy to clipboard failed:', err);
    return false;
  }
}
