import { db, ReadMasterDB } from './db';
import { DocumentRecord, DocumentBlobRecord, DocumentPosition, DocumentMetadata } from '../types';

export interface IDocumentRepository {
  saveDocument(doc: DocumentRecord, blob: ArrayBuffer | string): Promise<DocumentRecord>;
  getDocument(id: string): Promise<DocumentRecord | undefined>;
  getDocumentBlob(id: string): Promise<DocumentBlobRecord | undefined>;
  listDocuments(includeDeleted?: boolean): Promise<DocumentRecord[]>;
  updatePosition(id: string, position: DocumentPosition): Promise<void>;
  updateMetadata(id: string, metadata: Partial<DocumentMetadata>): Promise<void>;
  findByHash(hash: string): Promise<DocumentRecord | undefined>;
  deleteDocument(id: string, hard?: boolean): Promise<void>;
}

export class DexieDocumentRepository implements IDocumentRepository {
  constructor(private database: ReadMasterDB = db) {}

  async saveDocument(doc: DocumentRecord, blob: ArrayBuffer | string): Promise<DocumentRecord> {
    const now = new Date().toISOString();
    const documentToSave: DocumentRecord = {
      ...doc,
      updatedAt: now,
      createdAt: doc.createdAt || now,
      deletedAt: doc.deletedAt ?? null,
    };

    await this.database.transaction('rw', [this.database.documents, this.database.documentBlobs], async () => {
      await this.database.documents.put(documentToSave);
      await this.database.documentBlobs.put({
        id: doc.id,
        data: blob,
        updatedAt: now,
      });
    });

    return documentToSave;
  }

  async getDocument(id: string): Promise<DocumentRecord | undefined> {
    const doc = await this.database.documents.get(id);
    if (!doc || doc.deletedAt) return undefined;
    return doc;
  }

  async getDocumentBlob(id: string): Promise<DocumentBlobRecord | undefined> {
    return this.database.documentBlobs.get(id);
  }

  async listDocuments(includeDeleted = false): Promise<DocumentRecord[]> {
    const all = await this.database.documents.orderBy('updatedAt').reverse().toArray();
    if (includeDeleted) return all;
    return all.filter((doc) => !doc.deletedAt);
  }

  async updatePosition(id: string, position: DocumentPosition): Promise<void> {
    const now = new Date().toISOString();
    await this.database.documents.update(id, {
      lastPosition: position,
      updatedAt: now,
    });
  }

  async updateMetadata(id: string, metadata: Partial<DocumentMetadata>): Promise<void> {
    const doc = await this.database.documents.get(id);
    if (!doc) return;
    const now = new Date().toISOString();
    await this.database.documents.update(id, {
      metadata: { ...(doc.metadata || {}), ...metadata },
      updatedAt: now,
    });
  }

  async findByHash(hash: string): Promise<DocumentRecord | undefined> {
    const doc = await this.database.documents.where('hash').equals(hash).first();
    if (!doc || doc.deletedAt) return undefined;
    return doc;
  }

  async deleteDocument(id: string, hard = false): Promise<void> {
    if (hard) {
      await this.database.transaction('rw', [this.database.documents, this.database.documentBlobs], async () => {
        await this.database.documents.delete(id);
        await this.database.documentBlobs.delete(id);
      });
    } else {
      const now = new Date().toISOString();
      await this.database.documents.update(id, {
        deletedAt: now,
        updatedAt: now,
      });
    }
  }
}

export const documentRepository = new DexieDocumentRepository();
