import { create } from 'zustand';
import { VocabEntryRecord, VocabMeaning, Anchor } from '../types';
import { vocabRepository } from '../storage';

interface VocabState {
  vocabEntries: VocabEntryRecord[];
  isLoading: boolean;
  loadVocab: (docId?: string) => Promise<void>;
  saveWord: (
    word: string,
    meanings: VocabMeaning,
    sourceSentence?: string,
    docId?: string,
    anchor?: Anchor
  ) => Promise<VocabEntryRecord>;
  removeWord: (id: string) => Promise<void>;
  isWordSaved: (word: string) => boolean;
}

export const useVocabStore = create<VocabState>((set, get) => ({
  vocabEntries: [],
  isLoading: false,

  loadVocab: async (docId?: string) => {
    set({ isLoading: true });
    try {
      const items = await vocabRepository.listVocab(docId);
      set({ vocabEntries: items, isLoading: false });
    } catch (err) {
      console.error('Failed to load vocabulary:', err);
      set({ isLoading: false });
    }
  },

  saveWord: async (
    word: string,
    meanings: VocabMeaning,
    sourceSentence?: string,
    docId?: string,
    anchor?: Anchor
  ) => {
    const entry = await vocabRepository.saveVocab({
      id: crypto.randomUUID(),
      word: word.trim(),
      meanings,
      sourceSentence: sourceSentence?.trim(),
      docId,
      anchor,
      srsState: {
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
      },
    });

    await get().loadVocab();
    return entry;
  },

  removeWord: async (id: string) => {
    await vocabRepository.deleteVocab(id);
    await get().loadVocab();
  },

  isWordSaved: (word: string) => {
    const clean = word.toLowerCase().trim();
    return get().vocabEntries.some((v) => v.word.toLowerCase() === clean);
  },
}));
