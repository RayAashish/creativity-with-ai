import { create } from 'zustand';
import { DocumentRecord } from '../types';
import { libraryService } from '../services/library-service';

interface LibraryState {
  documents: DocumentRecord[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  loadDocuments: () => Promise<void>;
  importFile: (file: File) => Promise<DocumentRecord>;
  importGitHub: (url: string) => Promise<DocumentRecord>;
  importSample: () => Promise<DocumentRecord>;
  deleteDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  documents: [],
  isLoading: false,
  isImporting: false,
  error: null,

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const documents = await libraryService.getLibraryDocuments();
      set({ documents, isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load library',
      });
    }
  },

  importFile: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const doc = await libraryService.importLocalFile(file);
      await get().loadDocuments();
      set({ isImporting: false });
      return doc;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import file';
      set({ isImporting: false, error: msg });
      throw err;
    }
  },

  importGitHub: async (url: string) => {
    set({ isImporting: true, error: null });
    try {
      const doc = await libraryService.importFromGitHub(url);
      await get().loadDocuments();
      set({ isImporting: false });
      return doc;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import from GitHub';
      set({ isImporting: false, error: msg });
      throw err;
    }
  },

  importSample: async () => {
    set({ isImporting: true, error: null });
    try {
      const doc = await libraryService.importSampleDocument();
      await get().loadDocuments();
      set({ isImporting: false });
      return doc;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import sample';
      set({ isImporting: false, error: msg });
      throw err;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      await libraryService.removeDocument(id);
      await get().loadDocuments();
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete document' });
    }
  },

  clearError: () => set({ error: null }),
}));
