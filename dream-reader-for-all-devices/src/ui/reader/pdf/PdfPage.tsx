import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { pdfjsLib } from '../../../reader-core/pdf/pdf-init';
import { PdfHighlightOverlay } from './PdfHighlightOverlay';
import { PdfInkOverlay } from './PdfInkOverlay';

interface Props {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  defaultDimensions?: { width: number; height: number };
  onPageIntersect?: (pageNumber: number) => void;
}

export const PdfPage: React.FC<Props> = ({
  pdfDoc,
  pageNumber,
  scale,
  defaultDimensions,
  onPageIntersect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(
    defaultDimensions || null
  );
  const [isInViewport, setIsInViewport] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const currentRenderTaskRef = useRef<RenderTask | null>(null);
  const lastRenderedScaleRef = useRef<number | null>(null);
  const onPageIntersectRef = useRef(onPageIntersect);

  useEffect(() => {
    onPageIntersectRef.current = onPageIntersect;
  }, [onPageIntersect]);

  // 1. Observe when page enters nearby viewport window (1000px margin for smooth pre-rendering)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      {
        rootMargin: '1000px 0px 1000px 0px',
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Intersection observer to report active reading page (50% visibility)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            onPageIntersectRef.current?.(pageNumber);
          }
        });
      },
      { threshold: [0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber]);

  // 3. Render canvas and text layer when in or near viewport; release GPU resources when scrolled out
  useEffect(() => {
    if (!isInViewport) {
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        currentRenderTaskRef.current = null;
      }
      if (isRendered && canvasRef.current) {
        // Release hardware GPU texture back to Android OS
        canvasRef.current.width = 1;
        canvasRef.current.height = 1;
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
        }
        setIsRendered(false);
        lastRenderedScaleRef.current = null;
      }
      return;
    }
    if (isRendered && lastRenderedScaleRef.current === scale) return;

    let isCancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        if (!pageDimensions || pageDimensions.width !== viewport.width / scale) {
          setPageDimensions({
            width: viewport.width / scale,
            height: viewport.height / scale,
          });
        }

        const canvas = canvasRef.current;
        const textLayer = textLayerRef.current;
        if (!canvas || !textLayer) return;

        // Cancel previous render task if active
        if (currentRenderTaskRef.current) {
          try {
            currentRenderTaskRef.current.cancel();
          } catch {
            // ignore
          }
          currentRenderTaskRef.current = null;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // High-DPI transform matrix for Retina screens
        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

        const renderContext = {
          canvasContext: ctx,
          viewport,
          transform,
        };

        const renderTask = page.render(renderContext);
        currentRenderTaskRef.current = renderTask;
        await renderTask.promise;
        currentRenderTaskRef.current = null;

        if (isCancelled) return;

        // Clear and render text layer
        textLayer.innerHTML = '';
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;
        textLayer.style.setProperty('--scale-factor', `${scale}`);
        if (containerRef.current) {
          containerRef.current.style.setProperty('--scale-factor', `${scale}`);
        }

        const textContent = await page.getTextContent();
        if (isCancelled) return;

        // PDF.js v4 TextLayer class API
        const textLayerInstance = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayer,
          viewport,
        });

        await textLayerInstance.render();

        lastRenderedScaleRef.current = scale;
        setIsRendered(true);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
          // Expected cancellation
          return;
        }
        console.error(`Error rendering page ${pageNumber}:`, err);
      }
    };

    render();

    return () => {
      isCancelled = true;
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, scale, isInViewport, isRendered]);

  const targetWidth = (pageDimensions?.width || defaultDimensions?.width || 612) * scale;
  const targetHeight = (pageDimensions?.height || defaultDimensions?.height || 792) * scale;

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      style={{
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
        minWidth: `${targetWidth}px`,
        minHeight: `${targetHeight}px`,
        ['--scale-factor' as any]: `${scale}`,
      }}
      className="pdf-page-container shrink-0 relative my-4 rounded shadow-md bg-white select-text transition-shadow"
    >
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 block rounded" />

      {/* Text Layer for text selection & lookup */}
      <div ref={textLayerRef} className="textLayer" />

      {/* Annotations & Highlight Overlay */}
      <PdfHighlightOverlay pageNumber={pageNumber} width={targetWidth} height={targetHeight} />

      {/* Freehand Stylus & Touch Ink Overlay (rendered only when in viewport) */}
      {isInViewport && (
        <PdfInkOverlay pageNumber={pageNumber} width={targetWidth} height={targetHeight} />
      )}

      {/* Loading placeholder when not yet rendered */}
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/70 text-gray-400 text-xs">
          Page {pageNumber}
        </div>
      )}
    </div>
  );
};
