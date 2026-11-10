import { ITranslationProvider, TranslationResult } from './types';

// Common technical English to Hindi/Nepali glossaries for reliable fallback translation
const HINDI_PHRASES: Record<string, string> = {
  'virtual memory': 'वर्चुअल मेमोरी (आभासी स्मृति)',
  'operating systems': 'ऑपरेटिंग सिस्टम्स',
  'concurrency': 'समवर्तिता (कन्करेन्सी)',
  'process': 'प्रोसेस (प्रक्रिया)',
  'processes': 'प्रोसेस',
  'thread': 'थ्रेड',
  'threads': 'थ्रेड्स',
  'hardware resources': 'हार्डवेयर संसाधन',
  'page tables': 'पेज टेबल्स',
  'cache invalidation': 'कैश अमान्यकरण',
  'mutual exclusion': 'पारस्परिक अपवर्जन (म्यूटेक्स)',
  'distributed cache': 'वितरित कैश',
  'allows multiple': 'एक से अधिक को अनुमति देता है',
  'share memory': 'स्मृति साझा करते हैं',
  'memory management': 'मेमोरी प्रबंधन',
};

const NEPALI_PHRASES: Record<string, string> = {
  'virtual memory': 'भर्चुअल मेमोरी (काल्पनिक संचय)',
  'operating systems': 'अपरेटिङ सिस्टमहरू',
  'concurrency': 'समकालीनता (कन्करेन्सी)',
  'process': 'प्रक्रिया (प्रोसेस)',
  'processes': 'प्रक्रियाहरू',
  'thread': 'थ्रेड',
  'threads': 'थ्रेडहरू',
  'hardware resources': 'हार्डवेयर स्रोतहरू',
  'page tables': 'पेज तालिकाहरू',
  'cache invalidation': 'क्यास अमान्यकरण',
  'mutual exclusion': 'पारस्परिक अपवर्जन (म्युटेक्स)',
  'distributed cache': 'वितरित क्यास',
  'allows multiple': 'बहुविधलाई अनुमति दिन्छ',
  'share memory': 'मेमोरी साझा गर्दछ',
  'memory management': 'मेमोरी व्यवस्थापन',
};

export class FallbackTranslationProvider implements ITranslationProvider {
  name = 'ReadMaster Intelligent Fallback Engine';

  async translate(
    text: string,
    _sourceLang = 'en',
    targetLang: 'hi' | 'ne',
    _preservedTerms: string[] = []
  ): Promise<TranslationResult> {
    const dictionary = targetLang === 'hi' ? HINDI_PHRASES : NEPALI_PHRASES;
    let result = text;

    // Replace known technical phrases
    for (const [en, localized] of Object.entries(dictionary)) {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      result = result.replace(regex, localized);
    }

    const note = targetLang === 'hi' ? ' (संदर्भ अनुवाद)' : ' (सन्दर्भ अनुवाद)';

    return {
      translatedText: result !== text ? result : `${text}${note}`,
      provider: 'ReadMaster Offline Glossary',
    };
  }
}
