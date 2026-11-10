import { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfjsLib } from './pdf-init';
import { OutlineItem } from '../../types';

export interface LoadedPdf {
  pdfDoc: PDFDocumentProxy;
  totalPages: number;
  title?: string;
  outline: OutlineItem[];
}

export async function loadPdfDocument(data: ArrayBuffer | Uint8Array): Promise<LoadedPdf> {
  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const isBrowser = typeof window !== 'undefined' && !isTest;
  const origin = isBrowser && window.location?.origin ? window.location.origin : '';
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Data,
    cMapUrl: isBrowser ? `${origin}/cmaps/` : undefined,
    cMapPacked: true,
    standardFontDataUrl: isBrowser ? `${origin}/standard_fonts/` : undefined,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Extract metadata
  let title: string | undefined;
  try {
    const meta = await pdfDoc.getMetadata();
    const info = meta?.info as Record<string, unknown> | undefined;
    if (info && typeof info.Title === 'string' && info.Title.trim()) {
      title = info.Title.trim();
    }
  } catch (err) {
    console.debug('Failed to get PDF metadata:', err);
  }

  // Extract outline / TOC
  let outline: OutlineItem[] = [];
  try {
    const rawOutline = await pdfDoc.getOutline();
    if (rawOutline && rawOutline.length > 0) {
      outline = await parsePdfOutline(pdfDoc, rawOutline, 1);
    }
  } catch (err) {
    console.debug('Failed to extract PDF outline:', err);
  }

  return {
    pdfDoc,
    totalPages,
    title,
    outline,
  };
}

interface RawOutlineItem {
  title: string;
  dest: string | unknown[] | null;
  items?: RawOutlineItem[];
}

async function parsePdfOutline(
  pdfDoc: PDFDocumentProxy,
  rawItems: RawOutlineItem[],
  level = 1
): Promise<OutlineItem[]> {
  const result: OutlineItem[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    let page: number | undefined;

    try {
      if (typeof item.dest === 'string') {
        const dest = await pdfDoc.getDestination(item.dest);
        if (dest && dest[0]) {
          const pageIndex = await pdfDoc.getPageIndex(dest[0]);
          page = pageIndex + 1;
        }
      } else if (Array.isArray(item.dest) && item.dest[0]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageIndex = await pdfDoc.getPageIndex(item.dest[0] as any);
        page = pageIndex + 1;
      }
    } catch {
      // Ignored if destination cannot be resolved
    }

    const outlineItem: OutlineItem = {
      id: `pdf-toc-${level}-${i}-${page || 'none'}`,
      title: item.title,
      page,
      level,
    };

    if (item.items && item.items.length > 0) {
      outlineItem.children = await parsePdfOutline(pdfDoc, item.items, level + 1);
    }

    result.push(outlineItem);
  }

  return result;
}
