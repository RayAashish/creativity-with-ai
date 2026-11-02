import { describe, it, expect, beforeEach } from 'vitest';
import { ReadMasterDB } from '../storage/db';
import { DexieAnnotationRepository } from '../storage/AnnotationRepository';
import { HIGHLIGHT_COLORS } from '../stores/annotation-store';

describe('AnnotationRepository & Storage Layer', () => {
  let db: ReadMasterDB;
  let repo: DexieAnnotationRepository;

  beforeEach(() => {
    db = new ReadMasterDB();
    repo = new DexieAnnotationRepository(db);
  });

  it('creates and retrieves highlights in 5 distinct colors', async () => {
    for (let i = 0; i < HIGHLIGHT_COLORS.length; i++) {
      const color = HIGHLIGHT_COLORS[i].hex;
      await repo.saveAnnotation({
        id: `ann-${i}`,
        docId: 'doc-pdf-test',
        kind: 'highlight',
        color,
        anchor: {
          type: 'pdf',
          page: 1,
          normalizedRects: [{ x: 0.1 * i, y: 0.1, width: 0.2, height: 0.04 }],
          textQuote: `Sample quote ${i}`,
        },
      });
    }

    const all = await repo.listAnnotations('doc-pdf-test');
    expect(all.length).toBe(5);
    expect(all[0].color).toBe(HIGHLIGHT_COLORS[0].hex);
    expect(all[4].color).toBe(HIGHLIGHT_COLORS[4].hex);
  });

  it('saves comments with note text and deep link IDs', async () => {
    const comment = await repo.saveAnnotation({
      id: 'comment-unique-id',
      docId: 'doc-1',
      kind: 'comment',
      color: '#fef08a',
      noteText: 'Important concept for midterm exam!',
      anchor: {
        type: 'pdf',
        page: 3,
        normalizedRects: [{ x: 0.2, y: 0.3, width: 0.4, height: 0.05 }],
        textQuote: 'Virtual memory isolates processes',
      },
    });

    expect(comment.id).toBe('comment-unique-id');
    expect(comment.noteText).toBe('Important concept for midterm exam!');

    // Update note
    const updated = await repo.updateAnnotation(comment.id, {
      noteText: 'Revised note: Review chapter 4 as well.',
    });
    expect(updated.noteText).toContain('Revised note');
  });

  it('persists freehand ink vector strokes on a page', async () => {
    const inkAnnotation = await repo.saveAnnotation({
      id: 'ink-page-2',
      docId: 'doc-1',
      kind: 'ink',
      color: '#ef4444',
      anchor: {
        type: 'pdf',
        page: 2,
        normalizedRects: [],
        textQuote: '[Ink Drawing]',
      },
      strokes: [
        {
          id: 'stroke-1',
          points: [
            { x: 0.1, y: 0.1, pressure: 0.5 },
            { x: 0.2, y: 0.2, pressure: 0.6 },
            { x: 0.3, y: 0.25, pressure: 0.7 },
            { x: 0.4, y: 0.3, pressure: 0.5 },
          ],
          color: '#ef4444',
          size: 3,
        },
      ],
    });

    expect(inkAnnotation.kind).toBe('ink');
    expect(inkAnnotation.strokes?.length).toBe(1);

    const page2Only = await repo.listAnnotations('doc-1', 2);
    expect(page2Only.length).toBe(1);
    expect(page2Only[0].strokes?.[0].points.length).toBe(4);
  });

  it('soft deletes annotations cleanly', async () => {
    await repo.saveAnnotation({
      id: 'del-ann',
      docId: 'doc-del',
      kind: 'underline',
      color: '#3b82f6',
      anchor: {
        type: 'pdf',
        page: 1,
        normalizedRects: [],
        textQuote: 'Underlined phrase',
      },
    });

    await repo.deleteAnnotation('del-ann', false);

    const active = await repo.listAnnotations('doc-del');
    expect(active.length).toBe(0);
  });
});
