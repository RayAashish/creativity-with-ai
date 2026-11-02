import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export const syncRouter = Router();

// In-memory sync datastore (ready for PostgreSQL driver attachment via schema.sql)
interface SyncStore {
  documents: Map<string, any>;
  annotations: Map<string, any>;
  vocabulary: Map<string, any>;
  shareableLinks: Map<string, { docId: string; createdAt: string }>;
}

const syncStore: SyncStore = {
  documents: new Map(),
  annotations: new Map(),
  vocabulary: new Map(),
  shareableLinks: new Map(),
};

// Push local changes to cloud
syncRouter.post('/push', (req: Request, res: Response) => {
  try {
    const { documents = [], annotations = [], vocabulary = [] } = req.body;

    // Last-Write-Wins (LWW) merge for documents
    documents.forEach((doc: any) => {
      const existing = syncStore.documents.get(doc.id);
      if (!existing || new Date(doc.updatedAt) > new Date(existing.updatedAt)) {
        syncStore.documents.set(doc.id, doc);
      }
    });

    // LWW merge for annotations
    annotations.forEach((ann: any) => {
      const existing = syncStore.annotations.get(ann.id);
      if (!existing || new Date(ann.updatedAt) > new Date(existing.updatedAt)) {
        syncStore.annotations.set(ann.id, ann);
      }
    });

    // LWW merge for vocabulary
    vocabulary.forEach((v: any) => {
      const existing = syncStore.vocabulary.get(v.id);
      if (!existing || new Date(v.updatedAt) > new Date(existing.updatedAt)) {
        syncStore.vocabulary.set(v.id, v);
      }
    });

    res.json({
      status: 'ok',
      syncedAt: new Date().toISOString(),
      accepted: {
        documents: documents.length,
        annotations: annotations.length,
        vocabulary: vocabulary.length,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Sync push failed', details: String(err) });
  }
});

// Pull remote changes since lastSyncedAt
syncRouter.post('/pull', (req: Request, res: Response) => {
  try {
    const { lastSyncedAt } = req.body;
    const since = lastSyncedAt ? new Date(lastSyncedAt).getTime() : 0;

    const changedDocs: any[] = [];
    syncStore.documents.forEach((doc) => {
      if (new Date(doc.updatedAt).getTime() > since) {
        changedDocs.push(doc);
      }
    });

    const changedAnns: any[] = [];
    syncStore.annotations.forEach((ann) => {
      if (new Date(ann.updatedAt).getTime() > since) {
        changedAnns.push(ann);
      }
    });

    const changedVocab: any[] = [];
    syncStore.vocabulary.forEach((v) => {
      if (new Date(v.updatedAt).getTime() > since) {
        changedVocab.push(v);
      }
    });

    res.json({
      serverTimestamp: new Date().toISOString(),
      documents: changedDocs,
      annotations: changedAnns,
      vocabulary: changedVocab,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Sync pull failed', details: String(err) });
  }
});

// Generate shareable read-only link for a document
syncRouter.post('/share', (req: Request, res: Response) => {
  try {
    const { docId, document, annotations } = req.body;
    if (!docId) {
      return res.status(400).json({ error: 'Missing docId' });
    }

    if (document) {
      syncStore.documents.set(docId, document);
    }
    if (annotations && Array.isArray(annotations)) {
      annotations.forEach((a: any) => syncStore.annotations.set(a.id, a));
    }

    const token = crypto.randomBytes(12).toString('hex');
    syncStore.shareableLinks.set(token, {
      docId,
      createdAt: new Date().toISOString(),
    });

    const shareUrl = `${req.protocol}://${req.get('host')}/?share=${token}`;
    res.json({
      token,
      shareUrl,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Share link generation failed', details: String(err) });
  }
});

// Public read-only fetch of a shared document
syncRouter.get('/share/:token', (req: Request, res: Response) => {
  try {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    const link = syncStore.shareableLinks.get(token);

    if (!link) {
      return res.status(404).json({ error: 'Shared link not found or expired' });
    }

    const doc = syncStore.documents.get(link.docId);
    if (!doc) {
      return res.status(404).json({ error: 'Shared document content not found' });
    }

    const docAnnotations: any[] = [];
    syncStore.annotations.forEach((ann) => {
      if (ann.docId === link.docId && !ann.deletedAt) {
        docAnnotations.push(ann);
      }
    });

    res.json({
      document: doc,
      annotations: docAnnotations,
      sharedAt: link.createdAt,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve shared document', details: String(err) });
  }
});
