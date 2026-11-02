import { documentRepository } from '../storage';
import { DocumentRecord, DocumentType, DocumentPosition } from '../types';
import { githubService } from './github-service';
import { parseGitHubUrl } from '../reader-core/markdown/github-resolver';
import { SAMPLE_SYSTEM_DESIGN_MD } from './sample-doc';

/**
 * Computes a SHA-256 hex hash from an ArrayBuffer or UTF-8 string.
 */
export async function calculateSha256(data: ArrayBuffer | string): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class LibraryService {
  /**
   * Imports a local PDF or Markdown file into the offline-first database.
   */
  async importLocalFile(file: File): Promise<DocumentRecord> {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isMd = file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown') || file.type.includes('markdown') || file.type.includes('text');

    if (!isPdf && !isMd) {
      throw new Error('Unsupported file type. Please upload a PDF or Markdown (.md) file.');
    }

    const type: DocumentType = isPdf ? 'pdf' : 'md';
    let blobData: ArrayBuffer | string;

    if (isPdf) {
      blobData = await file.arrayBuffer();
    } else {
      blobData = await file.text();
    }

    const hash = await calculateSha256(blobData);

    // Check if duplicate already exists
    const existing = await documentRepository.findByHash(hash);
    if (existing) {
      return existing;
    }

    const docId = crypto.randomUUID();
    const now = new Date().toISOString();

    const title = file.name.replace(/\.[^/.]+$/, ''); // remove extension

    const docRecord: DocumentRecord = {
      id: docId,
      type,
      source: 'local',
      hash,
      title,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || (isPdf ? 'application/pdf' : 'text/markdown'),
      createdAt: now,
      updatedAt: now,
      metadata: {
        fileSize: file.size,
      },
    };

    return documentRepository.saveDocument(docRecord, blobData);
  }

  /**
   * Imports a Markdown file directly from a GitHub repository URL.
   */
  async importFromGitHub(githubUrl: string): Promise<DocumentRecord> {
    const repoRef = parseGitHubUrl(githubUrl);
    if (!repoRef) {
      throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repo or file link.');
    }

    let branch = repoRef.branch;
    let filePath = repoRef.path;

    // If branch is HEAD or not specified, fetch default branch
    if (branch === 'HEAD' || !branch) {
      const info = await githubService.getRepoInfo(repoRef.owner, repoRef.repo);
      branch = info.defaultBranch;
    }

    // If path is empty, default to README.md
    if (!filePath) {
      filePath = 'README.md';
    }

    const { content, sha } = await githubService.fetchRawFile(repoRef.owner, repoRef.repo, branch, filePath);
    const hash = await calculateSha256(content);

    // Check existing
    const existing = await documentRepository.findByHash(hash);
    if (existing) {
      return existing;
    }

    const docId = crypto.randomUUID();
    const now = new Date().toISOString();
    const fileName = filePath.split('/').pop() || 'README.md';
    const title = `${repoRef.repo} / ${fileName}`;

    const docRecord: DocumentRecord = {
      id: docId,
      type: 'md',
      source: 'github',
      hash,
      title,
      fileName,
      fileSize: new TextEncoder().encode(content).length,
      mimeType: 'text/markdown',
      createdAt: now,
      updatedAt: now,
      metadata: {
        github: {
          owner: repoRef.owner,
          repo: repoRef.repo,
          branch,
          path: filePath,
          commitSha: sha,
          rawUrl: `https://raw.githubusercontent.com/${repoRef.owner}/${repoRef.repo}/${branch}/${filePath}`,
          lastCheckedAt: now,
          remoteModified: false,
        },
      },
    };

    return documentRepository.saveDocument(docRecord, content);
  }

  /**
   * Imports a built-in technical sample document for instant onboarding.
   */
  async importSampleDocument(): Promise<DocumentRecord> {
    const content = SAMPLE_SYSTEM_DESIGN_MD;
    const hash = await calculateSha256(content);

    const existing = await documentRepository.findByHash(hash);
    if (existing) {
      return existing;
    }

    const docId = crypto.randomUUID();
    const now = new Date().toISOString();

    const docRecord: DocumentRecord = {
      id: docId,
      type: 'md',
      source: 'local',
      hash,
      title: 'System Design: Distributed Cache & Virtual Memory',
      fileName: 'system-design-primer.md',
      fileSize: new TextEncoder().encode(content).length,
      mimeType: 'text/markdown',
      createdAt: now,
      updatedAt: now,
      metadata: {
        fileSize: new TextEncoder().encode(content).length,
      },
    };

    return documentRepository.saveDocument(docRecord, content);
  }

  /**
   * Persists the reader's current page or scroll position.
   */
  async savePosition(docId: string, position: DocumentPosition): Promise<void> {
    await documentRepository.updatePosition(docId, position);
  }

  /**
   * Lists all documents stored in IndexedDB.
   */
  async getLibraryDocuments(): Promise<DocumentRecord[]> {
    return documentRepository.listDocuments();
  }

  /**
   * Deletes a document from the local database.
   */
  async removeDocument(docId: string): Promise<void> {
    await documentRepository.deleteDocument(docId, true);
  }
}

export const libraryService = new LibraryService();
