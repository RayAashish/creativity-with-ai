import { create } from 'zustand';
import { AnnotationRecord, Anchor, InkStroke } from '../types';
import { annotationRepository } from '../storage';
import { translateStroke } from '../reader-core/ink/lasso-tool';

export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', hex: '#fef08a', bgClass: 'bg-yellow-200/60', borderClass: 'border-yellow-400' },
  { name: 'Green', hex: '#bbf7d0', bgClass: 'bg-emerald-200/60', borderClass: 'border-emerald-400' },
  { name: 'Blue', hex: '#bae6fd', bgClass: 'bg-sky-200/60', borderClass: 'border-sky-400' },
  { name: 'Pink', hex: '#fbcfe8', bgClass: 'bg-pink-200/60', borderClass: 'border-pink-400' },
  { name: 'Purple', hex: '#e9d5ff', bgClass: 'bg-purple-200/60', borderClass: 'border-purple-400' },
];

export type InkToolType = 'pen' | 'highlighter' | 'eraser' | 'lasso';

interface AnnotationState {
  annotations: AnnotationRecord[];
  isLoading: boolean;
  selectedColor: string;
  activeAnnotationId: string | null;

  // Freehand Ink Settings
  isInkActive: boolean;
  inkTool: InkToolType;
  inkColor: string;
  inkSize: number;
  isPenOnlyMode: boolean; // Palm rejection for tablets & styluses
  selectedStrokeIds: string[]; // Lasso selected stroke IDs

  // Actions
  loadAnnotations: (docId: string) => Promise<void>;
  createHighlight: (
    docId: string,
    anchor: Anchor,
    color: string,
    kind?: 'highlight' | 'underline' | 'strikethrough'
  ) => Promise<AnnotationRecord>;
  createComment: (
    docId: string,
    anchor: Anchor,
    noteText: string,
    color?: string
  ) => Promise<AnnotationRecord>;
  updateComment: (id: string, noteText: string) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  setSelectedColor: (color: string) => void;
  setActiveAnnotationId: (id: string | null) => void;

  // Ink Actions
  setInkActive: (active: boolean) => void;
  setInkTool: (tool: InkToolType) => void;
  setInkColor: (color: string) => void;
  setInkSize: (size: number) => void;
  setPenOnlyMode: (enabled: boolean) => void;
  setSelectedStrokeIds: (ids: string[]) => void;
  clearStrokeSelection: () => void;
  saveInkStroke: (docId: string, page: number, stroke: InkStroke) => Promise<void>;
  undoInkStroke: (docId: string, page: number) => Promise<void>;
  clearPageInk: (docId: string, page: number) => Promise<void>;
  moveSelectedStrokes: (
    docId: string,
    page: number,
    strokeIds: string[],
    dx: number,
    dy: number
  ) => Promise<void>;
  duplicateSelectedStrokes: (
    docId: string,
    page: number,
    strokeIds: string[],
    offset?: { dx: number; dy: number }
  ) => Promise<void>;
  recolorSelectedStrokes: (
    docId: string,
    page: number,
    strokeIds: string[],
    color: string
  ) => Promise<void>;
  deleteSelectedStrokes: (docId: string, page: number, strokeIds: string[]) => Promise<void>;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  isLoading: false,
  selectedColor: HIGHLIGHT_COLORS[0].hex,
  activeAnnotationId: null,

  isInkActive: false,
  inkTool: 'pen',
  inkColor: '#ef4444', // default red pen
  inkSize: 3,
  isPenOnlyMode: false,
  selectedStrokeIds: [],

  loadAnnotations: async (docId: string) => {
    set({ isLoading: true });
    try {
      const items = await annotationRepository.listAnnotations(docId);
      set({ annotations: items, isLoading: false });
    } catch (err) {
      console.error('Failed to load annotations:', err);
      set({ isLoading: false });
    }
  },

  createHighlight: async (
    docId: string,
    anchor: Anchor,
    color: string,
    kind: 'highlight' | 'underline' | 'strikethrough' = 'highlight'
  ) => {
    const record = await annotationRepository.saveAnnotation({
      id: crypto.randomUUID(),
      docId,
      kind,
      color,
      anchor,
    });
    await get().loadAnnotations(docId);
    return record;
  },

  createComment: async (
    docId: string,
    anchor: Anchor,
    noteText: string,
    color: string = HIGHLIGHT_COLORS[0].hex
  ) => {
    const record = await annotationRepository.saveAnnotation({
      id: crypto.randomUUID(),
      docId,
      kind: 'comment',
      color,
      anchor,
      noteText: noteText.trim(),
    });
    await get().loadAnnotations(docId);
    return record;
  },

  updateComment: async (id: string, noteText: string) => {
    const updated = await annotationRepository.updateAnnotation(id, {
      noteText: noteText.trim(),
    });
    set((state) => ({
      annotations: state.annotations.map((a) => (a.id === id ? updated : a)),
    }));
  },

  deleteAnnotation: async (id: string) => {
    await annotationRepository.deleteAnnotation(id);
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
      activeAnnotationId: state.activeAnnotationId === id ? null : state.activeAnnotationId,
    }));
  },

  setSelectedColor: (color: string) => set({ selectedColor: color }),
  setActiveAnnotationId: (id: string | null) => set({ activeAnnotationId: id }),

  setInkActive: (isInkActive: boolean) => {
    set({ isInkActive });
    if (!isInkActive) {
      set({ selectedStrokeIds: [] });
    }
  },
  setInkTool: (inkTool: InkToolType) => {
    set({ inkTool });
    if (inkTool !== 'lasso') {
      set({ selectedStrokeIds: [] });
    }
  },
  setInkColor: (inkColor: string) => set({ inkColor }),
  setInkSize: (inkSize: number) => set({ inkSize }),
  setPenOnlyMode: (isPenOnlyMode: boolean) => set({ isPenOnlyMode }),
  setSelectedStrokeIds: (selectedStrokeIds: string[]) => set({ selectedStrokeIds }),
  clearStrokeSelection: () => set({ selectedStrokeIds: [] }),

  saveInkStroke: async (docId: string, page: number, stroke: InkStroke) => {
    const { annotations } = get();
    // Find existing ink record for this page
    const existing = annotations.find(
      (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === page
    );

    if (existing) {
      const updatedStrokes = [...(existing.strokes || []), stroke];
      await annotationRepository.updateAnnotation(existing.id, { strokes: updatedStrokes });
    } else {
      await annotationRepository.saveAnnotation({
        id: crypto.randomUUID(),
        docId,
        kind: 'ink',
        color: stroke.color,
        anchor: {
          type: 'pdf',
          page,
          normalizedRects: [],
          textQuote: '[Ink Drawing]',
        },
        strokes: [stroke],
      });
    }
    await get().loadAnnotations(docId);
  },

  undoInkStroke: async (docId: string, page: number) => {
    const { annotations } = get();
    const existing = annotations.find(
      (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === page
    );

    if (existing && existing.strokes && existing.strokes.length > 0) {
      const remainingStrokes = existing.strokes.slice(0, -1);
      if (remainingStrokes.length === 0) {
        await annotationRepository.deleteAnnotation(existing.id);
      } else {
        await annotationRepository.updateAnnotation(existing.id, { strokes: remainingStrokes });
      }
      await get().loadAnnotations(docId);
    }
  },

  clearPageInk: async (docId: string, page: number) => {
    const { annotations } = get();
    const existing = annotations.find(
      (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === page
    );
    if (existing) {
      await annotationRepository.deleteAnnotation(existing.id);
      await get().loadAnnotations(docId);
      set({ selectedStrokeIds: [] });
    }
  },

  moveSelectedStrokes: async (
    docId: string,
    page: number,
    strokeIds: string[],
    dx: number,
    dy: number
  ) => {
    const { annotations } = get();
    const existing = annotations.find(
      (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === page
    );
    if (!existing || !existing.strokes || strokeIds.length === 0) return;

    const idSet = new Set(strokeIds);
    const updatedStrokes = existing.strokes.map((s) => {
      if (idSet.has(s.id)) {
        return translateStroke(s, dx, dy);
      }
      return s;
    });

    await annotationRepository.updateAnnotation(existing.id, { strokes: updatedStrokes });
    await get().loadAnnotations(docId);
  },

  duplicateSelectedStrokes: async (
    docId: string,
    page: number,
    strokeIds: string[],
    offset = { dx: 0.02, dy: 0.02 }
  ) => {
    const { annotations } = get();
    const existing = annotations.find(
      (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === page
    );
    if (!existing || !existing.strokes || strokeIds.length === 0) return;

    const idSet = new Set(strokeIds);
    const newStrokes: InkStroke[] = [];
    const newIds: string[] = [];

    for (const s of existing.strokes) {
      if (idSet.has(s.id)) {
        const cloned: InkStroke = {
          ...translateStroke(s, offset.dx, offset.dy),
          id: crypto.randomUUID(),
        };
        newStrokes.push(cloned);
        newIds.push(cloned.id);
      }
    }

    const updatedStrokes = [...existing.strokes, ...newStrokes];
    await annotationRepository.updateAnnotation(existing.id, { strokes: updatedStrokes });
    await get().loadAnnotations(docId);
    set({ selectedStrokeIds: newIds });
  },

  recolorSelectedStrokes: async (
    docId: string,
    page: number,
    strokeIds: string[],
    color: string
  ) => {
    const { annotations } = get();
    const existing = annotations.find(
      (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === page
    );
    if (!existing || !existing.strokes || strokeIds.length === 0) return;

    const idSet = new Set(strokeIds);
    const updatedStrokes = existing.strokes.map((s) => {
      if (idSet.has(s.id)) {
        return {
          ...s,
          color: s.isHighlighter ? `${color}66` : color,
        };
      }
      return s;
    });

    await annotationRepository.updateAnnotation(existing.id, { strokes: updatedStrokes });
    await get().loadAnnotations(docId);
  },

  deleteSelectedStrokes: async (docId: string, page: number, strokeIds: string[]) => {
    const { annotations } = get();
    const existing = annotations.find(
      (a) => a.kind === 'ink' && a.anchor.type === 'pdf' && a.anchor.page === page
    );
    if (!existing || !existing.strokes || strokeIds.length === 0) return;

    const idSet = new Set(strokeIds);
    const remaining = existing.strokes.filter((s) => !idSet.has(s.id));
    if (remaining.length === 0) {
      await annotationRepository.deleteAnnotation(existing.id);
    } else {
      await annotationRepository.updateAnnotation(existing.id, { strokes: remaining });
    }
    await get().loadAnnotations(docId);
    set({ selectedStrokeIds: [] });
  },
}));
