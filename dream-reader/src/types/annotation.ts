export type AnnotationKind = 'highlight' | 'underline' | 'strikethrough' | 'comment' | 'ink';

export interface NormalizedRect {
  // Coordinates are normalized between 0 and 1 relative to the PDF page viewport (width & height)
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfAnchor {
  page: number; // 1-based page number
  normalizedRects: NormalizedRect[];
  textQuote: string;
  prefix?: string;
  suffix?: string;
}

export interface MarkdownAnchor {
  textQuote: string;
  prefix?: string;
  suffix?: string;
  headingPath?: string[];
  commitSha?: string;
  lineOffset?: number;
}

export type Anchor = 
  | ({ type: 'pdf' } & PdfAnchor)
  | ({ type: 'md' } & MarkdownAnchor);

export interface InkPoint {
  x: number; // Normalized (0-1) to page width
  y: number; // Normalized (0-1) to page height
  pressure?: number;
}

export interface InkStroke {
  id: string;
  points: InkPoint[];
  color: string;
  size: number; // Stroke width relative or base px
  isHighlighter?: boolean;
}

export interface AnnotationRecord {
  id: string; // UUID v4
  docId: string;
  kind: AnnotationKind;
  color: string; // Hex or css color e.g. #ffeb3b
  anchor: Anchor;
  noteText?: string;
  strokes?: InkStroke[]; // For ink annotations
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  deletedAt?: string | null;
}
