import { PdfSettings } from '../types';

export function getMarginCssValue(margin: PdfSettings['margin']): string {
  switch (margin) {
    case 'compact':
      return '12mm';
    case 'generous':
      return '28mm';
    case 'standard':
    default:
      return '20mm';
  }
}

export function getFontFamilyCss(family: PdfSettings['fontFamily']): string {
  switch (family) {
    case 'serif':
      return "'Merriweather', Georgia, 'Times New Roman', serif";
    case 'mono':
      return "'Fira Code', 'Courier New', Courier, monospace";
    case 'sans':
    default:
      return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }
}

export function getFontSizeCss(size: PdfSettings['fontSize']): { body: string; h1: string; h2: string } {
  switch (size) {
    case 'small':
      return { body: '13px', h1: '24px', h2: '19px' };
    case 'large':
      return { body: '16px', h1: '32px', h2: '25px' };
    case 'normal':
    default:
      return { body: '14.5px', h1: '28px', h2: '22px' };
  }
}

/**
 * Generates the full CSS string applied to the document (both live preview and PDF output)
 */
export function generateThemeCss(settings: PdfSettings): string {
  const marginVal = getMarginCssValue(settings.margin);
  const fontFam = getFontFamilyCss(settings.fontFamily);
  const fontSizes = getFontSizeCss(settings.fontSize);

  // Base theme color schemes
  let themeRules = '';

  switch (settings.theme) {
    case 'academic':
      themeRules = `
        .markpdf-doc {
          color: #1a1a1a;
          background: #ffffff;
          line-height: 1.7;
          text-align: justify;
        }
        .markpdf-doc h1 {
          text-align: center;
          font-weight: 700;
          letter-spacing: -0.01em;
          border-bottom: 2px solid #222;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .markpdf-doc h2 {
          font-weight: 600;
          border-bottom: 1px solid #ccc;
          padding-bottom: 6px;
          margin-top: 28px;
        }
        .markpdf-doc blockquote {
          border-left: 3px solid #444;
          background: #fbfbfb;
          font-style: italic;
        }
        .markpdf-doc table th {
          background: #f0f0f0;
          border-bottom: 2px solid #333;
        }
      `;
      break;

    case 'modern':
      themeRules = `
        .markpdf-doc {
          color: #1e293b;
          background: #ffffff;
          line-height: 1.65;
        }
        .markpdf-doc h1 {
          color: #0f172a;
          font-weight: 800;
          letter-spacing: -0.03em;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 12px;
        }
        .markpdf-doc h2 {
          color: #1e293b;
          font-weight: 700;
          letter-spacing: -0.02em;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
        }
        .markpdf-doc .code-block-wrapper {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .markpdf-doc table {
          border-radius: 8px;
          overflow: hidden;
        }
        .markpdf-doc table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
        }
      `;
      break;

    case 'minimal':
      themeRules = `
        .markpdf-doc {
          color: #111111;
          background: #ffffff;
          line-height: 1.6;
        }
        .markpdf-doc h1 {
          font-weight: 700;
          border-bottom: 1px solid #111;
          padding-bottom: 10px;
        }
        .markpdf-doc h2 {
          font-weight: 600;
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 6px;
        }
        .markpdf-doc blockquote {
          border-left: 2px solid #111;
          background: transparent;
        }
        .markpdf-doc table th {
          border-bottom: 2px solid #111;
          background: transparent;
        }
      `;
      break;

    case 'executive':
      themeRules = `
        .markpdf-doc {
          color: #1e293b;
          background: #ffffff;
          line-height: 1.65;
        }
        .markpdf-doc h1 {
          color: #091e42;
          font-weight: 800;
          border-bottom: 3px solid #0052cc;
          padding-bottom: 12px;
        }
        .markpdf-doc h2 {
          color: #172b4d;
          font-weight: 700;
          border-bottom: 1.5px solid #dfe1e6;
          padding-bottom: 6px;
        }
        .markpdf-doc table th {
          background: #091e42;
          color: #ffffff;
          font-weight: 600;
        }
        .markpdf-doc .callout {
          border-radius: 6px;
        }
      `;
      break;

    case 'github':
    default:
      themeRules = `
        .markpdf-doc {
          color: #1f2328;
          background: #ffffff;
          line-height: 1.6;
        }
        .markpdf-doc h1 {
          font-weight: 600;
          border-bottom: 1px solid #d0d7de;
          padding-bottom: 0.3em;
        }
        .markpdf-doc h2 {
          font-weight: 600;
          border-bottom: 1px solid #d0d7de;
          padding-bottom: 0.3em;
        }
        .markpdf-doc blockquote {
          border-left: 0.25em solid #d0d7de;
          color: #656d76;
        }
        .markpdf-doc table th {
          background: #f6f8fa;
        }
      `;
      break;
  }

  // Syntax highlighting styles for code blocks
  const codeHighlightRules = `
    .hljs { color: #24292e; background: #f6f8fa; }
    .hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
    .hljs-keyword, .hljs-selector-tag { color: #d73a49; font-weight: 600; }
    .hljs-string, .hljs-doctag { color: #032f62; }
    .hljs-title, .hljs-section, .hljs-selector-id { color: #6f42c1; font-weight: 600; }
    .hljs-variable, .hljs-template-variable { color: #e36209; }
    .hljs-type, .hljs-class .hljs-title { color: #6f42c1; }
    .hljs-number, .hljs-literal { color: #005cc5; }
    .hljs-built_in, .hljs-builtin-name { color: #005cc5; }
  `;

  return `
    @page {
      size: ${settings.format} ${settings.orientation};
      margin: ${marginVal};
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .markpdf-doc {
      font-family: ${fontFam};
      font-size: ${fontSizes.body};
      width: 100%;
      margin: 0 auto;
      word-wrap: break-word;
    }

    /* Typography */
    .markpdf-doc h1 { font-size: ${fontSizes.h1}; margin-top: 0; margin-bottom: 16px; break-after: avoid-page; page-break-after: avoid; }
    .markpdf-doc h2 { font-size: ${fontSizes.h2}; margin-top: 24px; margin-bottom: 12px; break-after: avoid-page; page-break-after: avoid; }
    .markpdf-doc h3 { font-size: calc(${fontSizes.body} * 1.25); margin-top: 20px; margin-bottom: 8px; break-after: avoid-page; page-break-after: avoid; }
    .markpdf-doc h4 { font-size: calc(${fontSizes.body} * 1.1); margin-top: 16px; margin-bottom: 6px; break-after: avoid-page; page-break-after: avoid; }
    .markpdf-doc p { margin-top: 0; margin-bottom: 14px; }
    .markpdf-doc ul, .markpdf-doc ol { margin-top: 0; margin-bottom: 14px; padding-left: 24px; }
    .markpdf-doc li { margin-bottom: 4px; }
    .markpdf-doc hr { height: 1px; border: none; background: #e2e8f0; margin: 24px 0; }
    .markpdf-doc a { color: #0969da; text-decoration: none; }
    .markpdf-doc strong { font-weight: 600; }

    /* Inline Code */
    .markpdf-doc code:not(.hljs) {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(175, 184, 193, 0.2);
      border-radius: 4px;
      font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* Code Blocks */
    .markpdf-doc .code-block-wrapper {
      margin: 16px 0;
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .markpdf-doc .code-block-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 4px 10px;
      background: #eaeef2;
      border-bottom: 1px solid #d0d7de;
    }
    .markpdf-doc .code-lang-badge {
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      color: #57606a;
      text-transform: uppercase;
      font-weight: 600;
    }
    .markpdf-doc pre {
      margin: 0;
      padding: 12px 16px;
      overflow-x: auto;
      font-size: 86%;
      line-height: 1.45;
      font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* Tables */
    .markpdf-doc .table-container {
      margin: 16px 0;
      overflow-x: auto;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .markpdf-doc table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      font-size: 92%;
    }
    .markpdf-doc table th, .markpdf-doc table td {
      padding: 8px 12px;
      border: 1px solid #d0d7de;
      text-align: left;
    }
    .markpdf-doc table tr:nth-child(2n) {
      background-color: #f8fafc;
    }

    /* Blockquotes */
    .markpdf-doc blockquote {
      margin: 16px 0;
      padding: 8px 16px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* GitHub Callouts */
    .markpdf-doc .callout {
      margin: 16px 0;
      padding: 12px 16px;
      border-left: 4px solid #0969da;
      background: #f6f8fa;
      border-radius: 4px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .markpdf-doc .callout-header {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .markpdf-doc .callout-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .markpdf-doc .callout-note { border-left-color: #0969da; background: #f0f7ff; }
    .markpdf-doc .callout-note .callout-header { color: #0969da; }
    .markpdf-doc .callout-note .callout-indicator { background: #0969da; }

    .markpdf-doc .callout-tip { border-left-color: #1a7f37; background: #f0fbf3; }
    .markpdf-doc .callout-tip .callout-header { color: #1a7f37; }
    .markpdf-doc .callout-tip .callout-indicator { background: #1a7f37; }

    .markpdf-doc .callout-important { border-left-color: #8250df; background: #f9f5ff; }
    .markpdf-doc .callout-important .callout-header { color: #8250df; }
    .markpdf-doc .callout-important .callout-indicator { background: #8250df; }

    .markpdf-doc .callout-warning { border-left-color: #9a6700; background: #fffbe6; }
    .markpdf-doc .callout-warning .callout-header { color: #9a6700; }
    .markpdf-doc .callout-warning .callout-indicator { background: #9a6700; }

    .markpdf-doc .callout-caution { border-left-color: #cf222e; background: #fff0f1; }
    .markpdf-doc .callout-caution .callout-header { color: #cf222e; }
    .markpdf-doc .callout-caution .callout-indicator { background: #cf222e; }

    /* KaTeX math formulas */
    .markpdf-doc .katex-display-wrapper {
      margin: 16px 0;
      text-align: center;
      overflow-x: auto;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .markpdf-doc .katex-inline-wrapper {
      padding: 0 2px;
    }

    /* Mermaid diagrams */
    .markpdf-doc .mermaid-container {
      margin: 20px 0;
      display: flex;
      justify-content: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .markpdf-doc .mermaid-container svg {
      max-width: 100% !important;
      height: auto !important;
    }

    /* Images */
    .markpdf-doc img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* Task lists */
    .markpdf-doc input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
    }

    /* Heading anchor hidden for print */
    .heading-anchor {
      display: none;
      color: #94a3b8;
      margin-left: 6px;
      text-decoration: none;
    }
    .heading-anchor-group:hover .heading-anchor {
      display: inline;
    }

    /* Table of contents in preview / doc */
    .doc-toc-wrapper {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 24px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .doc-toc-title {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
    }
    .doc-toc-list {
      list-style-type: none;
      padding-left: 0;
      margin: 0;
    }
    .doc-toc-item-1 { font-weight: 600; margin: 4px 0; }
    .doc-toc-item-2 { margin: 3px 0 3px 14px; }
    .doc-toc-item-3 { margin: 2px 0 2px 28px; font-size: 92%; color: #64748b; }
    .doc-toc-link { color: #0284c7; text-decoration: none; }
    .doc-toc-link:hover { text-decoration: underline; }

    ${themeRules}
    ${codeHighlightRules}

    /* Print media overrides */
    @media print {
      body {
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .markpdf-doc {
        width: 100% !important;
        max-width: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .heading-anchor {
        display: none !important;
      }
    }
  `;
}
