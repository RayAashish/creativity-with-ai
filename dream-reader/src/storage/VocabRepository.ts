import { db, ReadMasterDB } from './db';
import { VocabEntryRecord } from '../types';

export interface IVocabRepository {
  saveVocab(entry: Omit<VocabEntryRecord, 'createdAt' | 'updatedAt'>): Promise<VocabEntryRecord>;
  getVocabByWord(word: string): Promise<VocabEntryRecord | undefined>;
  listVocab(docId?: string): Promise<VocabEntryRecord[]>;
  deleteVocab(id: string, hard?: boolean): Promise<void>;
}

export class DexieVocabRepository implements IVocabRepository {
  constructor(private database: ReadMasterDB = db) {}

  async saveVocab(entry: Omit<VocabEntryRecord, 'createdAt' | 'updatedAt'>): Promise<VocabEntryRecord> {
    const now = new Date().toISOString();
    const existing = await this.getVocabByWord(entry.word);

    const record: VocabEntryRecord = {
      ...entry,
      id: existing ? existing.id : entry.id || crypto.randomUUID(),
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.database.vocab.put(record);
    return record;
  }

  async getVocabByWord(word: string): Promise<VocabEntryRecord | undefined> {
    const clean = word.toLowerCase().trim();
    const item = await this.database.vocab.where('word').equalsIgnoreCase(clean).first();
    if (!item || item.deletedAt) return undefined;
    return item;
  }

  async listVocab(docId?: string): Promise<VocabEntryRecord[]> {
    let collection = this.database.vocab.orderBy('updatedAt').reverse();
    const items = await collection.toArray();
    const active = items.filter((v) => !v.deletedAt);
    if (docId) {
      return active.filter((v) => v.docId === docId);
    }
    return active;
  }

  async deleteVocab(id: string, hard = false): Promise<void> {
    if (hard) {
      await this.database.vocab.delete(id);
    } else {
      await this.database.vocab.update(id, {
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export const vocabRepository = new DexieVocabRepository();
