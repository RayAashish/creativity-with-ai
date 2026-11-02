import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadPdfDocument } from '../reader-core/pdf/pdf-loader';
import { PdfSearchEngine } from '../reader-core/pdf/pdf-search';

describe('PDF Engine (pdfjs-dist loader & search)', () => {
  it('loads sample PDF and extracts pages, outline, and metadata', async () => {
    const pdfPath = path.resolve(__dirname, '../../sample-docs/sample-paper.pdf');
    const buffer = fs.readFileSync(pdfPath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const loaded = await loadPdfDocument(arrayBuffer);
    expect(loaded.totalPages).toBe(3);
    expect(loaded.outline.length).toBeGreaterThanOrEqual(1);
    expect(loaded.outline[0].title).toContain('Chapter 1');
  });

  it('searches text across PDF pages and returns match snippets', async () => {
    const pdfPath = path.resolve(__dirname, '../../sample-docs/sample-paper.pdf');
    const buffer = fs.readFileSync(pdfPath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const loaded = await loadPdfDocument(arrayBuffer);
    const searchEngine = new PdfSearchEngine(loaded.pdfDoc);

    const matches = await searchEngine.search('virtual memory');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].pageNumber).toBe(2);
    expect(matches[0].snippet.toLowerCase()).toContain('virtual memory');
  });
});
