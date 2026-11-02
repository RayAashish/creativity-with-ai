import { PDFDocumentProxy } from 'pdfjs-dist';

export interface SearchMatch {
  id: string;
  pageNumber: number;
  matchIndex: number;
  snippet: string;
  fullSentence: string;
}

export class PdfSearchEngine {
  private pageTextCache = new Map<number, string>();

  constructor(private pdfDoc: PDFDocumentProxy) {}

  async getPageText(pageNumber: number): Promise<string> {
    if (this.pageTextCache.has(pageNumber)) {
      return this.pageTextCache.get(pageNumber)!;
    }

    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');

      this.pageTextCache.set(pageNumber, text);
      return text;
    } catch (err) {
      console.warn(`Failed to extract text from page ${pageNumber}:`, err);
      return '';
    }
  }

  async search(
    query: string,
    onProgress?: (matchesFound: number, pageChecked: number, totalPages: number) => void
  ): Promise<SearchMatch[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    const matches: SearchMatch[] = [];
    const totalPages = this.pdfDoc.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const text = await this.getPageText(pageNum);
      const lowerText = text.toLowerCase();
      let pos = lowerText.indexOf(cleanQuery);
      let matchIdx = 0;

      while (pos !== -1) {
        const start = Math.max(0, pos - 40);
        const end = Math.min(text.length, pos + cleanQuery.length + 40);
        const snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');

        // Attempt to find full sentence
        const sentenceStart = Math.max(0, text.lastIndexOf('.', pos) + 1);
        let sentenceEnd = text.indexOf('.', pos + cleanQuery.length);
        if (sentenceEnd === -1) sentenceEnd = text.length;
        const fullSentence = text.slice(sentenceStart, sentenceEnd + 1).trim();

        matches.push({
          id: `match-${pageNum}-${matchIdx}`,
          pageNumber: pageNum,
          matchIndex: matchIdx,
          snippet,
          fullSentence: fullSentence || snippet,
        });

        matchIdx++;
        pos = lowerText.indexOf(cleanQuery, pos + cleanQuery.length);
      }

      if (onProgress) {
        onProgress(matches.length, pageNum, totalPages);
      }
    }

    return matches;
  }
}
