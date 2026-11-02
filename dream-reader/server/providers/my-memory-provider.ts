import { ITranslationProvider, TranslationResult } from './types';

export class MyMemoryTranslationProvider implements ITranslationProvider {
  name = 'MyMemory & LibreTranslate Service';

  async translate(
    text: string,
    sourceLang = 'en',
    targetLang: 'hi' | 'ne',
    preservedTerms: string[] = []
  ): Promise<TranslationResult> {
    const cleanText = text.trim();
    if (!cleanText) {
      return { translatedText: '', provider: this.name };
    }

    // 1. Term preservation: Replace technical terms with placeholders
    const placeholders: { token: string; original: string }[] = [];
    let textToTranslate = cleanText;

    preservedTerms.forEach((term, idx) => {
      if (!term.trim()) return;
      const regex = new RegExp(`\\b${term.trim()}\\b`, 'gi');
      if (regex.test(textToTranslate)) {
        const token = `__TERM_${idx}__`;
        placeholders.push({ token, original: term });
        textToTranslate = textToTranslate.replace(regex, token);
      }
    });

    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      textToTranslate
    )}&langpair=${langPair}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ReadMaster/0.1 (Technical Student Reader)',
        },
      });

      if (!response.ok) {
        throw new Error(`MyMemory API returned status ${response.status}`);
      }

      const data = await response.json();
      let translated = data?.responseData?.translatedText || '';

      if (!translated || data.responseStatus === 403 || data.responseStatus === 429) {
        throw new Error('Rate limit reached or empty response from MyMemory');
      }

      // Restore preserved terms (case-insensitive and whitespace tolerant)
      placeholders.forEach(({ original }, idx) => {
        const tokenRegex = new RegExp(`__\\s*TERM_${idx}\\s*__`, 'gi');
        translated = translated.replace(tokenRegex, original);
      });

      return {
        translatedText: translated,
        provider: 'MyMemory Translate',
      };
    } catch (err: unknown) {
      console.warn(`Translation provider error (${langPair}):`, err);
      throw err;
    }
  }
}
