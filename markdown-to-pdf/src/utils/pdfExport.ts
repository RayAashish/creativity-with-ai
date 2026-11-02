import { PdfSettings, HeadingItem } from '../types';
import { generateThemeCss, getMarginCssValue } from './themeStyles';
import html2pdf from 'html2pdf.js';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export function buildCompleteHtml(
  contentHtml: string,
  settings: PdfSettings,
  headings: HeadingItem[],
  documentTitle: string
): string {
  const css = generateThemeCss(settings);

  // Build Table of Contents HTML if enabled
  let tocHtml = '';
  if (settings.showToc && headings.length > 0) {
    const items = headings
      .map(
        (h) =>
          `<li class="doc-toc-item-${Math.min(h.level, 3)}"><a class="doc-toc-link" href="#${h.id}">${h.text}</a></li>`
      )
      .join('\n');

    tocHtml = `
      <div class="doc-toc-wrapper">
        <div class="doc-toc-title">Table of Contents</div>
        <ul class="doc-toc-list">
          ${items}
        </ul>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <style>
    ${css}
  </style>
</head>
<body>
  <div class="markpdf-doc">
    ${tocHtml}
    ${contentHtml}
  </div>
</body>
</html>`;
}

/**
 * Storage permission helper - on Android 10+ scoped storage/PrintManager handles files
 * with zero sensitive media permission prompts.
 */
export async function ensureStoragePermission(): Promise<boolean> {
  return true;
}

/**
 * Universal Client-Side Direct PDF Export
 * Supports both Web browsers and native Android (via AndroidPrint bridge or standard download)
 */
export async function exportPdfClientSide(
  element: HTMLElement,
  settings: PdfSettings,
  documentTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const safeTitle = (documentTitle || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');

    // On native Android, delegate to zero-overhead system PrintManager to avoid ANR freezing
    if (Capacitor.isNativePlatform() && (window as any).AndroidPrint) {
      if (typeof (window as any).AndroidPrint.printPdf === 'function') {
        (window as any).AndroidPrint.printPdf(safeTitle);
        return { success: true };
      }
    }

    const marginMm = settings.margin === 'compact' ? 8 : settings.margin === 'generous' ? 20 : 12;

    const opt = {
      margin: marginMm,
      filename: `${safeTitle}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2, // High-DPI for crisp text
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: settings.format.toLowerCase(),
        orientation: settings.orientation
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    if (Capacitor.isNativePlatform()) {
      // Direct cache write and share (no dangerous permissions needed)
      const pdfDataUri: string = await html2pdf().set(opt).from(element).outputPdf('datauristring');
      const base64Data = pdfDataUri.split(',')[1];
      const fileName = `${safeTitle}.pdf`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: safeTitle,
        text: `Exported ${fileName} from MarkPDF`,
        url: savedFile.uri,
        dialogTitle: 'Save or Open PDF'
      });

      return { success: true };
    } else {
      // Web browser direct download
      await html2pdf().set(opt).from(element).save();
      return { success: true };
    }
  } catch (err: any) {
    console.error('Client-side PDF generation error:', err);
    return { success: false, error: err.message || 'Client-side PDF generation failed' };
  }
}

/**
 * Universal Markdown File (.md) Export for both Web and Android native
 */
export async function exportMarkdownFile(
  markdown: string,
  documentTitle: string
): Promise<{ success: boolean; error?: string }> {
  const safeTitle = (documentTitle || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeTitle}.md`;

  if (Capacitor.isNativePlatform()) {
    try {
      // Safe base64 encoding for UTF-8 text
      const base64Data = btoa(unescape(encodeURIComponent(markdown)));

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: fileName,
        text: 'Markdown document from MarkPDF',
        url: savedFile.uri,
        dialogTitle: 'Save or Open Markdown File'
      });

      return { success: true };
    } catch (err: any) {
      console.error('Android Markdown export error:', err);
      return { success: false, error: err.message };
    }
  }

  // Web browser direct download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  return { success: true };
}

/**
 * Server PDF Export with automatic client-side fallback
 */
export async function downloadPdfFromServer(
  contentHtml: string,
  settings: PdfSettings,
  headings: HeadingItem[],
  documentTitle: string
): Promise<{ success: boolean; error?: string }> {
  // If running on native Android, skip server call and use client-side native exporter
  if (Capacitor.isNativePlatform()) {
    return { success: false, error: 'Use native exporter' };
  }

  try {
    const fullHtml = buildCompleteHtml(contentHtml, settings, headings, documentTitle);
    const marginVal = getMarginCssValue(settings.margin);

    const marginObj = {
      top: marginVal,
      right: marginVal,
      bottom: marginVal,
      left: marginVal
    };

    const headerTemplate = settings.showHeader
      ? `<div style="font-size: 9px; font-family: 'DM Mono', monospace; color: #888; width: 100%; padding: 0 20mm; display: flex; justify-content: space-between;">
           <span>${settings.headerTitle || documentTitle}</span>
           ${settings.showDate ? `<span>${new Date().toLocaleDateString()}</span>` : ''}
         </div>`
      : '<div></div>';

    const footerTemplate = settings.showPageNumbers
      ? `<div style="font-size: 9px; font-family: 'DM Mono', monospace; color: #888; width: 100%; padding: 0 20mm; display: flex; justify-content: space-between;">
           <span></span>
           <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
         </div>`
      : '<div></div>';

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: fullHtml,
        title: documentTitle,
        format: settings.format,
        landscape: settings.orientation === 'landscape',
        margin: marginObj,
        displayHeaderFooter: settings.showHeader || settings.showPageNumbers,
        headerTemplate,
        footerTemplate
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    const safeName = (documentTitle || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    return { success: true };
  } catch (err: any) {
    console.warn('Server PDF unavailable, client fallback will be used:', err);
    return { success: false, error: err.message || 'Server PDF generation unavailable' };
  }
}

/**
 * Client-Side Browser Native Print Dialog
 */
export function printViaBrowser(
  contentHtml: string,
  settings: PdfSettings,
  headings: HeadingItem[],
  documentTitle: string
) {
  const fullHtml = buildCompleteHtml(contentHtml, settings, headings, documentTitle);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(fullHtml);
  doc.close();

  // Allow fonts & styles to load before print prompt
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 400);
}
