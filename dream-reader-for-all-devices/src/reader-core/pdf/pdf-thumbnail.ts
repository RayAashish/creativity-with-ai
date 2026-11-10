import { PDFDocumentProxy } from 'pdfjs-dist';

export async function renderPageThumbnail(
  pdfDoc: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth = 140
): Promise<void> {
  const page = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  await page.render(renderContext).promise;
}
