import { describe, it, expect } from 'vitest';
import { exportService } from '../reader-core/export/export-service';
import { AnnotationRecord, DocumentRecord, VocabEntryRecord } from '../types';

describe('Export Service (Markdown, Anki CSV, JSON)', () => {
  const mockDoc: DocumentRecord = {
    id: 'doc-export-test',
    type: 'pdf',
    source: 'local',
    hash: 'hash123',
    title: 'Operating Systems: Three Easy Pieces',
    fileName: 'ostep.pdf',
    fileSize: 4096,
    mimeType: 'application/pdf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAnnotations: AnnotationRecord[] = [
    {
      id: 'ann-1',
      docId: 'doc-export-test',
      kind: 'highlight',
      color: '#fef08a',
      anchor: {
        type: 'pdf',
        page: 12,
        normalizedRects: [{ x: 0.1, y: 0.2, width: 0.5, height: 0.04 }],
        textQuote: 'Virtual memory isolates faulty processes.',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      docId: 'doc-export-test',
      kind: 'comment',
      color: '#bbf7d0',
      noteText: 'Re-read before systems interview.',
      anchor: {
        type: 'pdf',
        page: 45,
        normalizedRects: [{ x: 0.1, y: 0.4, width: 0.6, height: 0.04 }],
        textQuote: 'Concurrency introduces subtle non-deterministic bugs.',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockVocab: VocabEntryRecord[] = [
    {
      id: 'vocab-1',
      word: 'concurrency',
      meanings: {
        word: 'concurrency',
        devanagariPhonetic: 'कन्करेन्सी',
        senses: [
          {
            partOfSpeech: 'noun',
            hindi: ['समवर्तिता'],
            nepali: ['समकालीनता'],
            englishDefinition: 'Simultaneous execution of multiple threads.',
          },
        ],
      },
      sourceSentence: 'Concurrency enables the server to handle thousands of requests.',
      docId: 'doc-export-test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('generates Obsidian/Notion-friendly markdown with frontmatter, quotes, and vocab table', () => {
    const md = exportService.generateMarkdownExport(mockDoc, mockAnnotations, mockVocab);

    expect(md).toContain('---');
    expect(md).toContain('title: "Operating Systems: Three Easy Pieces"');
    expect(md).toContain('total_annotations: 2');
    expect(md).toContain('total_vocabulary: 1');
    expect(md).toContain('> "Virtual memory isolates faulty processes."');
    expect(md).toContain('**Note:** Re-read before systems interview.');
    expect(md).toContain('| **concurrency** |');
    expect(md).toContain('समवर्तिता');
    expect(md).toContain('समकालीनता');
  });

  it('generates Anki-ready CSV with UTF-8 BOM encoding for Devanagari script', () => {
    const csv = exportService.generateAnkiCsv(mockVocab, mockDoc.title);

    expect(csv.startsWith('\uFEFF')).toBe(true); // UTF-8 BOM for Anki & Excel
    expect(csv).toContain('Front');
    expect(csv).toContain('Back');
    expect(csv).toContain('concurrency');
    expect(csv).toContain('समवर्तिता');
    expect(csv).toContain('समकालीनता');
    expect(csv).toContain('readmaster technical-english');
  });

  it('generates complete portable JSON backup', () => {
    const jsonStr = exportService.generateJsonExport(mockDoc, mockAnnotations, mockVocab);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.app).toBe('ReadMaster');
    expect(parsed.document.title).toBe(mockDoc.title);
    expect(parsed.annotations.length).toBe(2);
    expect(parsed.vocabulary.length).toBe(1);
  });
});
