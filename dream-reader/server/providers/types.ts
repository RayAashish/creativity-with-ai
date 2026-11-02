export interface TranslationResult {
  translatedText: string;
  provider: string;
}

export interface ITranslationProvider {
  name: string;
  translate(
    text: string,
    sourceLang: string,
    targetLang: 'hi' | 'ne',
    preservedTerms?: string[]
  ): Promise<TranslationResult>;
}
