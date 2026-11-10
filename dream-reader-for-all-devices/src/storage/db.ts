import Dexie, { type Table } from 'dexie';
import {
  DocumentRecord,
  DocumentBlobRecord,
  AnnotationRecord,
  VocabEntryRecord,
  LookupCacheRecord,
  ReaderSettingsRecord,
} from '../types';

export class ReadMasterDB extends Dexie {
  documents!: Table<DocumentRecord, string>;
  documentBlobs!: Table<DocumentBlobRecord, string>;
  annotations!: Table<AnnotationRecord, string>;
  vocab!: Table<VocabEntryRecord, string>;
  lookupCache!: Table<LookupCacheRecord, string>;
  settings!: Table<ReaderSettingsRecord, string>;
  stats!: Table<any, string>;

  constructor() {
    super('ReadMasterDB');

    // Schema version 1
    this.version(1).stores({
      documents: 'id, type, source, hash, title, createdAt, updatedAt, deletedAt',
      documentBlobs: 'id, updatedAt',
      annotations: 'id, docId, kind, createdAt, updatedAt, deletedAt',
      vocab: 'id, word, docId, createdAt, updatedAt, deletedAt',
      lookupCache: 'id, key, provider, cachedAt',
      settings: 'id, updatedAt',
      stats: 'id, updatedAt',
    });
  }
}

export const db = new ReadMasterDB();
