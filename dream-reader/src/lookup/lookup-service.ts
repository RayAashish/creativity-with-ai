import { db } from '../storage/db';
import { LookupResult, SentenceTranslation, TargetLanguage, VocabMeaning } from '../types';
import { lookupWordInLocalDictionary } from './dictionary-dataset';
import { getApiUrl } from '../services/api-config';

export class LookupService {
  /**
   * Looks up a word or sentence, utilizing:
   * 1. Offline dictionary for single words (immediate)
   * 2. IndexedDB cache (zero network latency for previously looked up text)
   * 3. Backend translation proxy
   */
  async lookup(
    text: string,
    targetLanguage: TargetLanguage = 'both',
    neverTranslateTerms: string[] = []
  ): Promise<LookupResult> {
    const clean = text.trim();
    if (!clean) {
      throw new Error('Lookup text cannot be empty');
    }

    const words = clean.split(/\s+/).filter(Boolean);
    const isSingleWord = words.length === 1;

    // 1. Single Word: Check built-in open dictionary dataset
    if (isSingleWord) {
      const dictHit = lookupWordInLocalDictionary(clean);
      if (dictHit) {
        return {
          type: 'word',
          data: dictHit,
        };
      }
    }

    // 2. Check IndexedDB lookup cache
    const cacheKey = `${targetLanguage}:${clean.toLowerCase()}`;
    const cached = await db.lookupCache.get(cacheKey);
    if (cached) {
      return cached.result;
    }

    // 3. Machine translation via backend proxy
    try {
      const res = await fetch(getApiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: clean,
          targetLang: targetLanguage,
          contextTerms: neverTranslateTerms,
        }),
      });

      if (!res.ok) {
        throw new Error(`Proxy error: ${res.statusText}`);
      }

      const data: any = await res.json();

      let result: LookupResult;

      if (isSingleWord && (data.wordDetails || data.hindi || data.nepali)) {
        const hiDetails = data.wordDetails?.hindi;
        const neDetails = data.wordDetails?.nepali;
        const hiMeanings =
          hiDetails?.senses?.[0]?.meanings?.slice(0, 4) || (data.hindi ? [data.hindi] : []);
        const neMeanings =
          neDetails?.senses?.[0]?.meanings?.slice(0, 4) || (data.nepali ? [data.nepali] : []);

        const wordMeaning: VocabMeaning = {
          word: clean,
          phonetic: hiDetails?.phonetic || neDetails?.phonetic,
          devanagariPhonetic: hiDetails?.romanized || neDetails?.romanized,
          senses: [
            {
              partOfSpeech: hiDetails?.senses?.[0]?.partOfSpeech || 'noun / term',
              hindi: hiMeanings.length > 0 ? hiMeanings : [clean],
              nepali: neMeanings.length > 0 ? neMeanings : [clean],
              englishDefinition: `Definition of "${clean}".`,
            },
          ],
        };

        result = {
          type: 'word',
          data: wordMeaning,
        };
      } else {
        result = {
          type: 'sentence',
          data: data as SentenceTranslation,
        };
      }

      // Save to IndexedDB cache
      await db.lookupCache.put({
        id: cacheKey,
        key: cacheKey,
        provider: data.provider || 'Translation Proxy',
        result,
        cachedAt: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      // Fallback offline word construction if network fails
      if (isSingleWord) {
        const fallbackWord: VocabMeaning = {
          word: clean,
          senses: [
            {
              partOfSpeech: 'word',
              hindi: [clean],
              nepali: [clean],
              englishDefinition: 'Offline definition unavailable. Check connection for live translation.',
            },
          ],
        };
        return { type: 'word', data: fallbackWord };
      }

      throw err;
    }
  }

  /**
   * Speaks the word out loud using Web Speech API (speechSynthesis).
   */
  speak(text: string, lang = 'en-US'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85; // Slightly slower for crisp language learning
    window.speechSynthesis.speak(utterance);
  }
}

export const lookupService = new LookupService();
