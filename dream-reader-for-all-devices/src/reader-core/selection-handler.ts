import { normalizeClientRect } from './anchoring/pdf-rects';
import { createTextQuoteSelector } from './anchoring/text-quote';
import { Anchor, PdfAnchor, MarkdownAnchor } from '../types';
import { SelectionInfo } from '../stores/lookup-store';

/**
 * Extracts the surrounding sentence from a DOM Selection.
 */
export function extractSurroundingSentence(selection: Selection): string {
  if (!selection.anchorNode) return selection.toString();

  try {
    const node = selection.anchorNode;
    const fullText = node.textContent || '';
    const offset = selection.anchorOffset;

    // Search backward for start of sentence
    let start = Math.max(0, fullText.lastIndexOf('.', offset));
    if (start > 0) start += 1; // Skip the period

    // Search forward for end of sentence
    let end = fullText.indexOf('.', offset + selection.toString().length);
    if (end === -1) end = fullText.length;
    else end += 1;

    const sentence = fullText.slice(start, end).trim();
    return sentence.length > 5 ? sentence : selection.toString();
  } catch {
    return selection.toString();
  }
}

/**
 * Analyzes the active DOM Selection and constructs an Anchor and SelectionInfo.
 */
export function getSelectionDetails(): SelectionInfo | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;

  const rawText = selection.toString().trim();
  if (!rawText || rawText.length < 1) return null;

  const range = selection.getRangeAt(0);
  const clientRect = range.getBoundingClientRect();
  if (clientRect.width === 0 && clientRect.height === 0) return null;

  const sentence = extractSurroundingSentence(selection);

  // Check if inside PDF page
  const pageContainer = range.startContainer.parentElement?.closest('[data-page-number]') as HTMLElement | null;
  let anchor: Anchor | undefined;

  if (pageContainer) {
    const pageNum = parseInt(pageContainer.getAttribute('data-page-number') || '1', 10);
    const pageBounds = pageContainer.getBoundingClientRect();

    const rangeRects = Array.from(range.getClientRects());
    const normalizedRects = rangeRects.map((r) =>
      normalizeClientRect(
        { left: r.left, top: r.top, width: r.width, height: r.height },
        pageBounds
      )
    );

    const pdfAnchor: PdfAnchor = {
      page: pageNum,
      normalizedRects,
      textQuote: rawText,
    };

    anchor = { type: 'pdf', ...pdfAnchor };
  } else {
    // Markdown or generic text
    const article = range.startContainer.parentElement?.closest('article');
    const docText = article?.textContent || '';
    const startIdx = docText.indexOf(rawText);

    const quoteSelector = createTextQuoteSelector(
      docText,
      Math.max(0, startIdx),
      Math.max(0, startIdx + rawText.length)
    );

    const mdAnchor: MarkdownAnchor = {
      textQuote: rawText,
      prefix: quoteSelector.prefix,
      suffix: quoteSelector.suffix,
    };

    anchor = { type: 'md', ...mdAnchor };
  }

  return {
    text: rawText,
    sourceSentence: sentence,
    anchor,
    clientRect: {
      top: clientRect.top,
      left: clientRect.left,
      bottom: clientRect.bottom,
      right: clientRect.right,
      width: clientRect.width,
      height: clientRect.height,
    },
  };
}
