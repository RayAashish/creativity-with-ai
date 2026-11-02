import { db } from '../storage/db';

export interface GlobalSearchResultItem {
  id: string;
  category: 'document' | 'annotation' | 'vocab';
  title: string;
  snippet: string;
  docId: string;
  page?: number;
  kind?: string;
}

export class GlobalSearchService {
  async search(query: string): Promise<GlobalSearchResultItem[]> {
    const clean = query.trim().toLowerCase();
    if (!clean || clean.length < 2) return [];

    const results: GlobalSearchResultItem[] = [];

    // 1. Search in Documents
    const docs = await db.documents.toArray();
    docs.forEach((doc) => {
      if (!doc.deletedAt) {
        if (doc.title.toLowerCase().includes(clean) || doc.fileName.toLowerCase().includes(clean)) {
          results.push({
            id: `doc-${doc.id}`,
            category: 'document',
            title: doc.title,
            snippet: `${doc.type.toUpperCase()} • ${doc.source === 'github' ? 'GitHub' : 'Local File'}`,
            docId: doc.id,
          });
        }
      }
    });

    // 2. Search in Annotations (Highlights & Comments)
    const annotations = await db.annotations.toArray();
    annotations.forEach((ann) => {
      if (!ann.deletedAt) {
        const quoteMatch = ann.anchor.textQuote?.toLowerCase().includes(clean);
        const noteMatch = ann.noteText?.toLowerCase().includes(clean);

        if (quoteMatch || noteMatch) {
          const doc = docs.find((d) => d.id === ann.docId);
          results.push({
            id: `ann-${ann.id}`,
            category: 'annotation',
            title: doc?.title || 'Document Annotation',
            snippet: ann.noteText || ann.anchor.textQuote || '',
            docId: ann.docId,
            page: ann.anchor.type === 'pdf' ? ann.anchor.page : undefined,
            kind: ann.kind,
          });
        }
      }
    });

    // 3. Search in Vocabulary Notebook
    const vocab = await db.vocab.toArray();
    vocab.forEach((v) => {
      if (!v.deletedAt) {
        const wordMatch = v.word.toLowerCase().includes(clean);
        const sentenceMatch = v.sourceSentence?.toLowerCase().includes(clean);
        const hindiMatch = v.meanings.senses.some((s) =>
          s.hindi.some((h) => h.toLowerCase().includes(clean))
        );
        const nepaliMatch = v.meanings.senses.some((s) =>
          s.nepali.some((n) => n.toLowerCase().includes(clean))
        );

        if (wordMatch || sentenceMatch || hindiMatch || nepaliMatch) {
          const doc = v.docId ? docs.find((d) => d.id === v.docId) : undefined;
          const firstSense = v.meanings.senses[0];
          const meaningsStr = [firstSense?.hindi?.[0], firstSense?.nepali?.[0]]
            .filter(Boolean)
            .join(' • ');
          const docPrefix = doc?.title ? `[${doc.title}] ` : '';

          results.push({
            id: `vocab-${v.id}`,
            category: 'vocab',
            title: v.word,
            snippet: `${docPrefix}${meaningsStr || v.sourceSentence || ''}`,
            docId: v.docId || '',
            page: v.anchor?.type === 'pdf' ? v.anchor.page : undefined,
          });
        }
      }
    });

    return results;
  }
}

export const globalSearchService = new GlobalSearchService();
