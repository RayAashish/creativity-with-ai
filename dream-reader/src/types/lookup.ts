import { VocabMeaning } from './vocab';

export type TargetLanguage = 'hi' | 'ne' | 'both';

export interface SentenceTranslation {
  originalText: string;
  hindi?: string;
  nepali?: string;
  provider: string;
}

export type LookupResult = 
  | { type: 'word'; data: VocabMeaning }
  | { type: 'sentence'; data: SentenceTranslation };

export interface LookupCacheRecord {
  id: string; // key: `${lang}:${cleanText}`
  key: string;
  provider: string;
  result: LookupResult;
  cachedAt: string;
}
