import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleTranslateProvider, DetailedWordTranslation } from './providers/google-translate-provider';
import { MyMemoryTranslationProvider } from './providers/my-memory-provider';
import { FallbackTranslationProvider } from './providers/rule-fallback-provider';
import { AIExplainerProvider } from './providers/ai-explainer';
import { syncRouter } from './sync/sync-router';

export const app = express();

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();
apiRouter.use('/sync', syncRouter);

const primaryProvider = new GoogleTranslateProvider();
const secondaryProvider = new MyMemoryTranslationProvider();
const fallbackProvider = new FallbackTranslationProvider();
const aiExplainer = new AIExplainerProvider();

async function translateWithFallback(
  text: string,
  targetLang: 'hi' | 'ne',
  preservedTerms: string[]
): Promise<{ text: string; provider: string; wordDetails?: DetailedWordTranslation }> {
  // 1. Try Google Neural Translation
  try {
    const res = await primaryProvider.translate(text, 'en', targetLang, preservedTerms);
    if (res.translatedText && res.translatedText.trim()) {
      return { text: res.translatedText, provider: res.provider, wordDetails: res.wordDetails };
    }
  } catch (err) {
    console.warn(`Primary provider (${primaryProvider.name}) failed:`, err);
  }

  // 2. Try MyMemory
  try {
    const res = await secondaryProvider.translate(text, 'en', targetLang, preservedTerms);
    if (res.translatedText && res.translatedText.trim()) {
      return { text: res.translatedText, provider: res.provider };
    }
  } catch (err) {
    console.warn(`Secondary provider (${secondaryProvider.name}) failed:`, err);
  }

  // 3. Fallback glossary
  const fallbackRes = await fallbackProvider.translate(text, 'en', targetLang, preservedTerms);
  return { text: fallbackRes.translatedText, provider: fallbackRes.provider };
}

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    providers: [primaryProvider.name, secondaryProvider.name, fallbackProvider.name],
  });
});

// Machine translation & dictionary lookup endpoint
apiRouter.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLang = 'both', contextTerms = [] } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or empty text property' });
    }

    const cleanText = text.trim();
    let hindiTranslation: string | undefined;
    let nepaliTranslation: string | undefined;
    let providerName = primaryProvider.name;
    let hiWordDetails: DetailedWordTranslation | undefined;
    let neWordDetails: DetailedWordTranslation | undefined;

    if (targetLang === 'hi' || targetLang === 'both') {
      const hiRes = await translateWithFallback(cleanText, 'hi', contextTerms);
      hindiTranslation = hiRes.text;
      providerName = hiRes.provider;
      hiWordDetails = hiRes.wordDetails;
    }

    if (targetLang === 'ne' || targetLang === 'both') {
      const neRes = await translateWithFallback(cleanText, 'ne', contextTerms);
      nepaliTranslation = neRes.text;
      providerName = neRes.provider;
      neWordDetails = neRes.wordDetails;
    }

    return res.json({
      originalText: cleanText,
      hindi: hindiTranslation,
      nepali: nepaliTranslation,
      provider: providerName,
      wordDetails: {
        hindi: hiWordDetails,
        nepali: neWordDetails,
      },
    });
  } catch (err: unknown) {
    console.error('Translation error:', err);
    return res.status(500).json({
      error: 'Translation failed',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// AI "Explain this" endpoint
apiRouter.post('/explain', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en', mode = 'standard' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or empty text property' });
    }

    const result = await aiExplainer.explain({
      text: text.trim(),
      language,
      mode,
    });

    return res.json(result);
  } catch (err: unknown) {
    console.error('Explain error:', err);
    return res.status(500).json({
      error: 'Explanation failed',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Mount router under both /api and root to handle any rewrite variations
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
