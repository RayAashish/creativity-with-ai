import { describe, it, expect, beforeEach } from 'vitest';
import { ReadMasterDB } from '../storage/db';
import { DexieVocabRepository } from '../storage/VocabRepository';
import { VocabMeaning } from '../types';

describe('Vocabulary Notebook Repository', () => {
  let db: ReadMasterDB;
  let repo: DexieVocabRepository;

  beforeEach(() => {
    db = new ReadMasterDB();
    repo = new DexieVocabRepository(db);
  });

  const sampleMeaning: VocabMeaning = {
    word: 'latency',
    phonetic: '/ˈleɪ.tən.si/',
    devanagariPhonetic: 'लेटेंसी',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['विलंबता'],
        nepali: ['विलम्बता'],
        englishDefinition: 'Time delay in data transmission.',
      },
    ],
  };

  it('saves vocabulary entry with anchor and source sentence', async () => {
    const entry = await repo.saveVocab({
      id: 'vocab-1',
      word: 'latency',
      meanings: sampleMeaning,
      sourceSentence: 'Edge computing reduces network latency for mobile devices.',
      docId: 'doc-os-101',
      anchor: {
        type: 'pdf',
        page: 5,
        normalizedRects: [{ x: 0.1, y: 0.2, width: 0.3, height: 0.05 }],
        textQuote: 'latency',
      },
      srsState: {
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString(),
      },
    });

    expect(entry.id).toBeDefined();
    expect(entry.word).toBe('latency');
    expect(entry.createdAt).toBeDefined();

    const retrieved = await repo.getVocabByWord('latency');
    expect(retrieved).toBeDefined();
    expect(retrieved?.sourceSentence).toContain('Edge computing');
    expect(retrieved?.anchor?.type).toBe('pdf');
  });

  it('lists active vocabulary and filters by docId', async () => {
    await repo.saveVocab({
      id: 'v1',
      word: 'latency',
      meanings: sampleMeaning,
      docId: 'doc-1',
    });
    await repo.saveVocab({
      id: 'v2',
      word: 'throughput',
      meanings: { word: 'throughput', senses: [] },
      docId: 'doc-2',
    });

    const all = await repo.listVocab();
    expect(all.length).toBe(2);

    const doc1Only = await repo.listVocab('doc-1');
    expect(doc1Only.length).toBe(1);
    expect(doc1Only[0].word).toBe('latency');
  });

  it('soft deletes vocabulary entries', async () => {
    await repo.saveVocab({
      id: 'v-del',
      word: 'mutex',
      meanings: { word: 'mutex', senses: [] },
    });

    await repo.deleteVocab('v-del', false);

    const retrieved = await repo.getVocabByWord('mutex');
    expect(retrieved).toBeUndefined();
  });
});
