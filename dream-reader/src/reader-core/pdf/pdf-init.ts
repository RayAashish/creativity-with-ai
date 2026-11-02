import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using Vite asset URL resolution
try {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch (e) {
  console.warn('PDF.js worker initialization fallback:', e);
}

export { pdfjsLib };
