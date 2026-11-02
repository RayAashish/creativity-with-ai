import { ITranslationProvider, TranslationResult } from './types';

export interface DetailedWordSense {
  partOfSpeech: string;
  meanings: string[];
}

export interface DetailedWordTranslation {
  word: string;
  translation: string;
  phonetic?: string;
  romanized?: string;
  senses?: DetailedWordSense[];
}

export class GoogleTranslateProvider implements ITranslationProvider {
  name = 'Google Neural Translation Engine';

  async translate(
    text: string,
    sourceLang = 'en',
    targetLang: 'hi' | 'ne',
    preservedTerms: string[] = []
  ): Promise<TranslationResult & { wordDetails?: DetailedWordTranslation }> {
    const cleanText = text.trim();
    if (!cleanText) {
      return { translatedText: '', provider: this.name };
    }

    const isSingleWord = !cleanText.includes(' ') && cleanText.length < 40;

    // 1. Term preservation: Replace technical terms with placeholders
    const placeholders: { token: string; original: string }[] = [];
    let textToTranslate = cleanText;

    if (!isSingleWord) {
      preservedTerms.forEach((term, idx) => {
        if (!term.trim()) return;
        const regex = new RegExp(`\\b${term.trim()}\\b`, 'gi');
        if (regex.test(textToTranslate)) {
          const token = `__TERM_${idx}__`;
          placeholders.push({ token, original: term });
          textToTranslate = textToTranslate.replace(regex, token);
        }
      });
    }

    // Use dictionary-enabled client for rich senses
    const dtParams = isSingleWord ? '&dt=t&dt=bd&dt=rm' : '&dt=t';
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}${dtParams}&q=${encodeURIComponent(
      textToTranslate
    )}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Translate API returned status ${response.status}`);
    }

    const data = await response.json();

    // Extract translated sentences/paragraphs
    let translated = '';
    let phonetic: string | undefined;
    let romanized: string | undefined;

    if (Array.isArray(data[0])) {
      translated = data[0]
        .map((chunk: any) => (Array.isArray(chunk) && typeof chunk[0] === 'string' ? chunk[0] : ''))
        .join('');

      // Check for phonetic and romanization in trailing chunk
      const metaChunk = data[0].find((c: any) => Array.isArray(c) && c.length >= 4 && (c[2] || c[3]));
      if (metaChunk) {
        if (typeof metaChunk[2] === 'string') romanized = metaChunk[2];
        if (typeof metaChunk[3] === 'string') phonetic = metaChunk[3];
      }
    }

    // Extract dictionary senses if single word
    const senses: DetailedWordSense[] = [];
    if (isSingleWord && Array.isArray(data[1])) {
      for (const group of data[1]) {
        if (Array.isArray(group) && Array.isArray(group[1])) {
          const pos = typeof group[0] === 'string' && group[0].trim() ? group[0].trim() : 'noun';
          const meanings = group[1].filter((m: any) => typeof m === 'string');
          if (meanings.length > 0) {
            senses.push({
              partOfSpeech: pos,
              meanings,
            });
          }
        }
      }
    }

    // Restore preserved terms
    placeholders.forEach(({ original }, idx) => {
      const tokenRegex = new RegExp(`__\\s*TERM_${idx}\\s*__`, 'gi');
      translated = translated.replace(tokenRegex, original);
    });

    const wordDetails: DetailedWordTranslation | undefined = isSingleWord
      ? {
          word: cleanText,
          translation: translated.trim(),
          phonetic,
          romanized,
          senses,
        }
      : undefined;

    return {
      translatedText: translated.trim(),
      provider: this.name,
      wordDetails,
    };
  }
}
