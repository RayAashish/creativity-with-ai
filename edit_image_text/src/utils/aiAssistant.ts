import { TextBlock } from '../types';

export interface TranslationResult {
  original: string;
  translated: string;
}

// Common offline translations for instant demo & offline use
const QUICK_TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    'ONE DOES NOT SIMPLY': 'UNO NO SIMPLEMENTE',
    'EDIT TEXT IN AN IMAGE': 'EDITA TEXTO EN UNA IMAGEN',
    'RUSTIC ROAST CAFE': 'CAFÉ TOSTADO RÚSTICO',
    'SPECIALTY COFFEE & BAKERY': 'CAFÉ DE ESPECIALIDAD Y PANADERÍA',
    'ESPRESSO BAR': 'BARRA DE ESPRESSO',
    'FRESH PASTRIES': 'REPOSTERÍA FRESCA',
    'Butter Croissant': 'Cruasán de Mantequilla',
    'Signature Flat White': 'Flat White Exclusivo',
    'MEGA SALE': 'GRAN REBAJA',
    'UP TO 60% OFF': 'HASTA 60% DE DESCUENTO',
    'LIMITED TIME ONLY': 'SÓLO POR TIEMPO LIMITADO',
    'SHOP NOW': 'COMPRAR AHORA',
    'Believe you can': 'Cree que puedes',
    "and you're halfway there.": 'y ya estás a medio camino.',
  },
  fr: {
    'ONE DOES NOT SIMPLY': 'ON NE PEUT PAS TOUT SIMPLEMENT',
    'EDIT TEXT IN AN IMAGE': 'MODIFIER DU TEXTE DANS UNE IMAGE',
    'RUSTIC ROAST CAFE': 'CAFÉ RUSTIQUE ROAST',
    'SPECIALTY COFFEE & BAKERY': 'CAFÉ DE SPÉCIALITÉ ET BOULANGERIE',
    'MEGA SALE': 'VENTE GÉANTE',
    'UP TO 60% OFF': "JUSQU'À 60% DE RÉDUCTION",
    'LIMITED TIME ONLY': 'TEMPS LIMITÉ',
    'SHOP NOW': 'ACHETER MAINTENANT',
    'Believe you can': 'Croyez en vous',
    "and you're halfway there.": 'et vous êtes déjà à mi-chemin.',
  },
  de: {
    'ONE DOES NOT SIMPLY': 'MAN KANN NICHT EINFACH',
    'EDIT TEXT IN AN IMAGE': 'TEXT IN EINEM BILD BEARBEITEN',
    'MEGA SALE': 'MEGA RABATT',
    'UP TO 60% OFF': 'BIS ZU 60% RABATT',
    'LIMITED TIME ONLY': 'NUR FÜR KURZE ZEIT',
    'SHOP NOW': 'JETZT KAUFEN',
  },
  hi: {
    'ONE DOES NOT SIMPLY': 'कोई यूं ही नहीं',
    'EDIT TEXT IN AN IMAGE': 'तस्वीर में टेक्स्ट बदलता',
    'MEGA SALE': 'महा सेल',
    'UP TO 60% OFF': '६०% तक की छूट',
    'LIMITED TIME ONLY': 'सीमित समय के लिए',
    'SHOP NOW': 'अभी खरीदें',
  },
};

export async function translateTextBlocks(
  blocks: TextBlock[],
  targetLanguage: string,
  apiKey?: string
): Promise<TextBlock[]> {
  // If user provided a Gemini API Key, use real AI translation via Gemini 2.5 Flash
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const textsToTranslate = blocks.map(b => b.text);
      const prompt = `Translate the following array of image text strings into ${targetLanguage}. Maintain the tone, style, and concise length suitable for graphic design text. Return ONLY a valid JSON array of translated strings with the exact same number of items.
Input strings: ${JSON.stringify(textsToTranslate)}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          const parsed: string[] = JSON.parse(contentText);
          if (Array.isArray(parsed) && parsed.length === blocks.length) {
            return blocks.map((b, idx) => ({
              ...b,
              text: parsed[idx] || b.text,
              isEdited: true,
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Gemini translation error, falling back to local dictionary:', err);
    }
  }

  // Local dictionary / smart fallback
  const langDict = QUICK_TRANSLATIONS[targetLanguage.toLowerCase()] || {};
  return blocks.map(b => {
    const trimmed = b.text.trim();
    const translated = langDict[trimmed];
    if (translated) {
      return {
        ...b,
        text: translated,
        isEdited: true,
      };
    }
    return b;
  });
}
