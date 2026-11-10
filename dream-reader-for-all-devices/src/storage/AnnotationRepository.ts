import { db, ReadMasterDB } from './db';
import { AnnotationRecord } from '../types';

export interface IAnnotationRepository {
  saveAnnotation(
    annotation: Omit<AnnotationRecord, 'createdAt' | 'updatedAt'>
  ): Promise<AnnotationRecord>;
  getAnnotation(id: string): Promise<AnnotationRecord | undefined>;
  listAnnotations(docId: string, page?: number): Promise<AnnotationRecord[]>;
  updateAnnotation(id: string, updates: Partial<AnnotationRecord>): Promise<AnnotationRecord>;
  deleteAnnotation(id: string, hard?: boolean): Promise<void>;
}

export class DexieAnnotationRepository implements IAnnotationRepository {
  constructor(private database: ReadMasterDB = db) {}

  async saveAnnotation(
    annotation: Omit<AnnotationRecord, 'createdAt' | 'updatedAt'>
  ): Promise<AnnotationRecord> {
    const now = new Date().toISOString();
    const record: AnnotationRecord = {
      ...annotation,
      id: annotation.id || crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.database.annotations.put(record);
    return record;
  }

  async getAnnotation(id: string): Promise<AnnotationRecord | undefined> {
    const item = await this.database.annotations.get(id);
    if (!item || item.deletedAt) return undefined;
    return item;
  }

  async listAnnotations(docId: string, page?: number): Promise<AnnotationRecord[]> {
    const items = await this.database.annotations
      .where('docId')
      .equals(docId)
      .toArray();

    const active = items.filter((a) => !a.deletedAt);

    if (page !== undefined) {
      return active.filter((a) => a.anchor && a.anchor.type === 'pdf' && a.anchor.page === page);
    }

    // Sort by createdAt ascending or page
    return active.sort((a, b) => {
      const pageA = a.anchor?.type === 'pdf' ? a.anchor.page : 0;
      const pageB = b.anchor?.type === 'pdf' ? b.anchor.page : 0;
      if (pageA !== pageB) return pageA - pageB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async updateAnnotation(id: string, updates: Partial<AnnotationRecord>): Promise<AnnotationRecord> {
    const current = await this.getAnnotation(id);
    if (!current) {
      throw new Error(`Annotation ${id} not found.`);
    }

    const updated: AnnotationRecord = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.database.annotations.put(updated);
    return updated;
  }

  async deleteAnnotation(id: string, hard = false): Promise<void> {
    if (hard) {
      await this.database.annotations.delete(id);
    } else {
      await this.database.annotations.update(id, {
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export const annotationRepository = new DexieAnnotationRepository();
