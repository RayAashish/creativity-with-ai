import { describe, it, expect, beforeEach } from 'vitest';
import { ReadMasterDB } from '../storage/db';
import { DexieDocumentRepository } from '../storage/DocumentRepository';
import { DocumentRecord } from '../types';

describe('DocumentRepository & Storage Layer', () => {
  let db: ReadMasterDB;
  let repo: DexieDocumentRepository;

  beforeEach(async () => {
    // Unique in-memory database name per test
    db = new ReadMasterDB();
    repo = new DexieDocumentRepository(db);
  });

  it('saves and retrieves a document record with blob', async () => {
    const doc: DocumentRecord = {
      id: 'doc-1',
      type: 'md',
      source: 'local',
      hash: 'abc123hash',
      title: 'Operating Systems Guide',
      fileName: 'os.md',
      fileSize: 1024,
      mimeType: 'text/markdown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const content = '# Operating Systems\nIntro to threads.';
    await repo.saveDocument(doc, content);

    const retrieved = await repo.getDocument('doc-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Operating Systems Guide');

    const blobRecord = await repo.getDocumentBlob('doc-1');
    expect(blobRecord).toBeDefined();
    expect(blobRecord?.data).toBe(content);
  });

  it('persists and updates reading position', async () => {
    const doc: DocumentRecord = {
      id: 'doc-pdf-1',
      type: 'pdf',
      source: 'local',
      hash: 'pdfhash789',
      title: 'CS101 Slides',
      fileName: 'slides.pdf',
      fileSize: 2048,
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repo.saveDocument(doc, new ArrayBuffer(8));

    // Update position to page 42
    await repo.updatePosition('doc-pdf-1', { type: 'pdf', page: 42 });

    const updated = await repo.getDocument('doc-pdf-1');
    expect(updated?.lastPosition).toEqual({ type: 'pdf', page: 42 });
  });

  it('finds existing document by hash to prevent duplicates', async () => {
    const doc: DocumentRecord = {
      id: 'doc-dup',
      type: 'md',
      source: 'local',
      hash: 'unique-sha-256',
      title: 'Original File',
      fileName: 'orig.md',
      fileSize: 500,
      mimeType: 'text/markdown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repo.saveDocument(doc, 'Some text');

    const match = await repo.findByHash('unique-sha-256');
    expect(match?.id).toBe('doc-dup');

    const noMatch = await repo.findByHash('non-existent');
    expect(noMatch).toBeUndefined();
  });

  it('supports soft deletion for sync-readiness', async () => {
    const doc: DocumentRecord = {
      id: 'doc-del',
      type: 'md',
      source: 'local',
      hash: 'delhash',
      title: 'To Be Deleted',
      fileName: 'del.md',
      fileSize: 100,
      mimeType: 'text/markdown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repo.saveDocument(doc, 'content');
    await repo.deleteDocument('doc-del', false); // soft delete

    const direct = await repo.getDocument('doc-del');
    expect(direct).toBeUndefined(); // getDocument filters soft-deleted

    const all = await repo.listDocuments(true);
    const softDeleted = all.find((d) => d.id === 'doc-del');
    expect(softDeleted?.deletedAt).toBeTruthy();
  });
});
