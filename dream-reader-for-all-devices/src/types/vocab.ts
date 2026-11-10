import { Anchor } from './annotation';

export interface MeaningSense {
  partOfSpeech: string; // e.g. "noun", "verb", "adjective"
  hindi: string[];
  nepali: string[];
  englishDefinition?: string;
  exampleSentence?: string;
}

export interface VocabMeaning {
  word: string;
  phonetic?: string;
  devanagariPhonetic?: string;
  senses: MeaningSense[];
}

export interface SRSState {
  interval: number; // in days
  repetition: number;
  easeFactor: number; // default 2.5
  nextReviewDate: string; // ISO date
  lastReviewedAt?: string;
}

export interface VocabEntryRecord {
  id: string; // UUID v4
  word: string;
  meanings: VocabMeaning;
  sourceSentence?: string;
  docId?: string;
  anchor?: Anchor;
  srsState?: SRSState;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
