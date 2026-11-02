import { create } from 'zustand';
import { Anchor, LookupResult, TargetLanguage } from '../types';
import { lookupService } from '../lookup/lookup-service';
import { useSettingsStore } from './settings-store';

export interface SelectionInfo {
  text: string;
  sourceSentence?: string;
  anchor?: Anchor;
  clientRect: { top: number; left: number; bottom: number; right: number; width: number; height: number };
}

interface LookupState {
  isOpen: boolean;
  text: string;
  sourceSentence?: string;
  anchor?: Anchor;
  coords: { x: number; y: number; placement: 'above' | 'below' };
  result: LookupResult | null;
  isLoading: boolean;
  error: string | null;
  selectedLang: TargetLanguage;

  triggerLookup: (selection: SelectionInfo) => Promise<void>;
  closeLookup: () => void;
  setSelectedLang: (lang: TargetLanguage) => void;
}

export const useLookupStore = create<LookupState>((set, get) => ({
  isOpen: false,
  text: '',
  sourceSentence: '',
  coords: { x: 0, y: 0, placement: 'above' },
  result: null,
  isLoading: false,
  error: null,
  selectedLang: 'both',

  triggerLookup: async (selection: SelectionInfo) => {
    const { text, sourceSentence, anchor, clientRect } = selection;
    if (!text || !text.trim()) return;

    // Calculate smart popover positioning:
    // Try to place above selection; if too close to viewport top, place below
    const popoverHeight = 240;
    const placement = clientRect.top > popoverHeight + 20 ? 'above' : 'below';
    const x = Math.max(16, Math.min(window.innerWidth - 360, clientRect.left + clientRect.width / 2 - 170));
    const y = placement === 'above' ? clientRect.top - 8 : clientRect.bottom + 8;

    const initialLang = useSettingsStore.getState().settings.targetLanguage;

    set({
      isOpen: true,
      text: text.trim(),
      sourceSentence: sourceSentence?.trim(),
      anchor,
      coords: { x, y, placement },
      result: null,
      isLoading: true,
      error: null,
      selectedLang: initialLang,
    });

    try {
      const neverTranslate = useSettingsStore.getState().settings.neverTranslateTerms;
      const res = await lookupService.lookup(text.trim(), initialLang, neverTranslate);
      set({ result: res, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Lookup failed',
      });
    }
  },

  closeLookup: () => {
    set({ isOpen: false, text: '', result: null, error: null });
  },

  setSelectedLang: async (lang: TargetLanguage) => {
    set({ selectedLang: lang });
    const { text } = get();
    if (!text) return;

    set({ isLoading: true });
    try {
      const neverTranslate = useSettingsStore.getState().settings.neverTranslateTerms;
      const res = await lookupService.lookup(text, lang, neverTranslate);
      set({ result: res, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Translation failed',
      });
    }
  },
}));
