export type DocumentType = 'pdf' | 'md';
export type DocumentSourceType = 'local' | 'github';

export interface PdfPosition {
  type: 'pdf';
  page: number; // 1-based page number
  zoom?: number;
  scrollRatio?: number; // 0 to 1 scroll offset on that page or document
}

export interface MarkdownPosition {
  type: 'md';
  headingSlug?: string;
  scrollRatio?: number; // 0 to 1 scroll progress in markdown
  line?: number;
}

export type DocumentPosition = PdfPosition | MarkdownPosition;

export interface GitHubMetadata {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  commitSha: string;
  rawUrl?: string;
  lastCheckedAt?: string;
  remoteModified?: boolean;
}

export interface DocumentMetadata {
  fileSize?: number;
  totalPages?: number;
  author?: string;
  keywords?: string[];
  github?: GitHubMetadata;
  [key: string]: unknown;
}

export interface DocumentRecord {
  id: string; // UUID v4
  type: DocumentType;
  source: DocumentSourceType;
  hash: string; // SHA-256 of file content
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  lastPosition?: DocumentPosition;
  metadata?: DocumentMetadata;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  deletedAt?: string | null; // For sync
}

export interface DocumentBlobRecord {
  id: string; // docId
  data: ArrayBuffer | string; // ArrayBuffer for PDF, string for MD
  updatedAt: string;
}

export interface OutlineItem {
  id: string;
  title: string;
  page?: number; // For PDF
  slug?: string; // For Markdown
  level: number; // 1, 2, 3...
  children?: OutlineItem[];
}
