import { create } from 'zustand';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { DocumentRecord, DocumentPosition, OutlineItem } from '../types';
import { documentRepository } from '../storage';
import { loadPdfDocument } from '../reader-core/pdf/pdf-loader';
import { extractMarkdownHeadings } from '../reader-core/markdown/markdown-parser';
import { PdfSearchEngine, SearchMatch } from '../reader-core/pdf/pdf-search';
import { githubService } from '../services/github-service';
import { libraryService } from '../services/library-service';
import { useAnnotationStore } from './annotation-store';

export type SidebarTab = 'toc' | 'thumbnails' | 'search' | 'annotations';
export type FitMode = 'custom' | 'fit-width' | 'fit-page';

interface ReaderState {
  activeDocument: DocumentRecord | null;
  documentContent: ArrayBuffer | string | null;
  isLoading: boolean;
  error: string | null;

  // PDF specific
  pdfDocProxy: PDFDocumentProxy | null;
  currentPage: number;
  totalPages: number;

  // View settings
  zoomLevel: number;
  fitMode: FitMode;
  isZenMode: boolean; // Fullscreen / Zen study mode for tablets & desktop

  // Outline / TOC
  outline: OutlineItem[];
  isSidebarOpen: boolean;
  sidebarTab: SidebarTab;

  // Search
  searchEngine: PdfSearchEngine | null;
  searchQuery: string;
  searchResults: SearchMatch[];
  currentSearchIndex: number;
  isSearching: boolean;

  // GitHub remote warning
  remoteWarning: { changed: boolean; latestSha?: string } | null;

  // Actions
  openDocument: (id: string) => Promise<void>;
  closeDocument: () => void;
  setCurrentPage: (page: number) => void;
  setZoomLevel: (zoom: number) => void;
  setFitMode: (mode: FitMode) => void;
  toggleZenMode: () => void;
  setZenMode: (zen: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  search: (query: string) => Promise<void>;
  nextSearchResult: () => void;
  prevSearchResult: () => void;
  clearSearch: () => void;
  dismissRemoteWarning: () => void;
  saveMarkdownScroll: (scrollRatio: number) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  activeDocument: null,
  documentContent: null,
  isLoading: false,
  error: null,

  pdfDocProxy: null,
  currentPage: 1,
  totalPages: 1,

  zoomLevel: 1.0,
  fitMode: 'fit-width',
  isZenMode: false,

  outline: [],
  isSidebarOpen: false,
  sidebarTab: 'toc',

  searchEngine: null,
  searchQuery: '',
  searchResults: [],
  currentSearchIndex: -1,
  isSearching: false,

  remoteWarning: null,

  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  setZenMode: (isZenMode: boolean) => set({ isZenMode }),

  openDocument: async (id: string) => {
    set({ isLoading: true, error: null, remoteWarning: null, searchResults: [], searchQuery: '', currentSearchIndex: -1 });

    try {
      const doc = await documentRepository.getDocument(id);
      if (!doc) {
        throw new Error('Document not found in storage.');
      }

      const blobRecord = await documentRepository.getDocumentBlob(id);
      if (!blobRecord) {
        throw new Error('Document content could not be loaded.');
      }

      const initialPage = doc.type === 'pdf' && doc.lastPosition?.type === 'pdf' ? doc.lastPosition.page : 1;

      if (doc.type === 'pdf') {
        const loaded = await loadPdfDocument(blobRecord.data as ArrayBuffer);
        const searchEngine = new PdfSearchEngine(loaded.pdfDoc);

        set({
          activeDocument: doc,
          documentContent: blobRecord.data,
          pdfDocProxy: loaded.pdfDoc,
          totalPages: loaded.totalPages,
          currentPage: Math.min(Math.max(1, initialPage), loaded.totalPages),
          outline: loaded.outline,
          searchEngine,
          isLoading: false,
        });
      } else {
        // Markdown
        const textContent = typeof blobRecord.data === 'string' ? blobRecord.data : new TextDecoder().decode(blobRecord.data as ArrayBuffer);
        const outline = extractMarkdownHeadings(textContent);

        set({
          activeDocument: doc,
          documentContent: textContent,
          pdfDocProxy: null,
          totalPages: 1,
          currentPage: 1,
          outline,
          searchEngine: null,
          isLoading: false,
        });

        // Check if remote GitHub document changed
        if (doc.source === 'github' && doc.metadata?.github) {
          const gh = doc.metadata.github;
          githubService.checkRemoteChanged(gh.owner, gh.repo, gh.branch, gh.path, gh.commitSha).then((res) => {
            if (res.changed) {
              set({ remoteWarning: res });
            }
          });
        }
      }

      // Load document annotations
      useAnnotationStore.getState().loadAnnotations(id);
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to open document',
      });
    }
  },

  closeDocument: () => {
    const { pdfDocProxy } = get();
    if (pdfDocProxy) {
      try {
        pdfDocProxy.destroy();
      } catch {
        // ignore
      }
    }
    set({
      activeDocument: null,
      documentContent: null,
      pdfDocProxy: null,
      outline: [],
      searchResults: [],
      searchQuery: '',
      currentSearchIndex: -1,
      remoteWarning: null,
    });
  },

  setCurrentPage: (page: number) => {
    const { activeDocument, totalPages, currentPage } = get();
    const clamped = Math.max(1, Math.min(page, totalPages));
    if (clamped === currentPage) return;
    set({ currentPage: clamped });

    if (activeDocument && activeDocument.type === 'pdf') {
      const position: DocumentPosition = {
        type: 'pdf',
        page: clamped,
      };
      libraryService.savePosition(activeDocument.id, position);
    }
  },

  setZoomLevel: (zoom: number) => {
    const clamped = Math.min(3.0, Math.max(0.5, Number(zoom.toFixed(2))));
    set({ zoomLevel: clamped, fitMode: 'custom' });
  },

  setFitMode: (fitMode: FitMode) => {
    set({ fitMode });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (isSidebarOpen: boolean) => {
    set({ isSidebarOpen });
  },

  setSidebarTab: (sidebarTab: SidebarTab) => {
    set({ sidebarTab, isSidebarOpen: true });
  },

  search: async (query: string) => {
    const { activeDocument, searchEngine, documentContent } = get();
    if (!query.trim()) {
      set({ searchQuery: '', searchResults: [], currentSearchIndex: -1, isSearching: false });
      return;
    }

    set({ searchQuery: query, isSearching: true, currentSearchIndex: -1 });

    if (activeDocument?.type === 'pdf' && searchEngine) {
      try {
        const results = await searchEngine.search(query);
        set({
          searchResults: results,
          currentSearchIndex: results.length > 0 ? 0 : -1,
          isSearching: false,
        });

        if (results.length > 0) {
          get().setCurrentPage(results[0].pageNumber);
        }
      } catch (err) {
        console.error('Search failed:', err);
        set({ isSearching: false });
      }
    } else if (activeDocument?.type === 'md' && typeof documentContent === 'string') {
      // Markdown search
      const cleanQuery = query.toLowerCase();
      const lines = documentContent.split('\n');
      const results: SearchMatch[] = [];

      lines.forEach((line, lineIdx) => {
        if (line.toLowerCase().includes(cleanQuery)) {
          results.push({
            id: `md-match-${lineIdx}`,
            pageNumber: 1,
            matchIndex: lineIdx,
            snippet: line.trim(),
            fullSentence: line.trim(),
          });
        }
      });

      set({
        searchResults: results,
        currentSearchIndex: results.length > 0 ? 0 : -1,
        isSearching: false,
      });
    }
  },

  nextSearchResult: () => {
    const { searchResults, currentSearchIndex, setCurrentPage } = get();
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIndex + 1) % searchResults.length;
    set({ currentSearchIndex: nextIdx });
    setCurrentPage(searchResults[nextIdx].pageNumber);
  },

  prevSearchResult: () => {
    const { searchResults, currentSearchIndex, setCurrentPage } = get();
    if (searchResults.length === 0) return;
    const prevIdx = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    set({ currentSearchIndex: prevIdx });
    setCurrentPage(searchResults[prevIdx].pageNumber);
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [], currentSearchIndex: -1 });
  },

  dismissRemoteWarning: () => {
    set({ remoteWarning: null });
  },

  saveMarkdownScroll: (scrollRatio: number) => {
    const { activeDocument } = get();
    if (activeDocument && activeDocument.type === 'md') {
      const position: DocumentPosition = {
        type: 'md',
        scrollRatio,
      };
      libraryService.savePosition(activeDocument.id, position);
    }
  },
}));
