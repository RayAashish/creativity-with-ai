// server/app.ts
import express from "express";
import cors from "cors";

// server/providers/google-translate-provider.ts
var GoogleTranslateProvider = class {
  name = "Google Neural Translation Engine";
  async translate(text, sourceLang = "en", targetLang, preservedTerms = []) {
    const cleanText = text.trim();
    if (!cleanText) {
      return { translatedText: "", provider: this.name };
    }
    const isSingleWord = !cleanText.includes(" ") && cleanText.length < 40;
    const placeholders = [];
    let textToTranslate = cleanText;
    if (!isSingleWord) {
      preservedTerms.forEach((term, idx) => {
        if (!term.trim()) return;
        const regex = new RegExp(`\\b${term.trim()}\\b`, "gi");
        if (regex.test(textToTranslate)) {
          const token = `__TERM_${idx}__`;
          placeholders.push({ token, original: term });
          textToTranslate = textToTranslate.replace(regex, token);
        }
      });
    }
    const dtParams = isSingleWord ? "&dt=t&dt=bd&dt=rm" : "&dt=t";
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}${dtParams}&q=${encodeURIComponent(
      textToTranslate
    )}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Google Translate API returned status ${response.status}`);
    }
    const data = await response.json();
    let translated = "";
    let phonetic;
    let romanized;
    if (Array.isArray(data[0])) {
      translated = data[0].map((chunk) => Array.isArray(chunk) && typeof chunk[0] === "string" ? chunk[0] : "").join("");
      const metaChunk = data[0].find((c) => Array.isArray(c) && c.length >= 4 && (c[2] || c[3]));
      if (metaChunk) {
        if (typeof metaChunk[2] === "string") romanized = metaChunk[2];
        if (typeof metaChunk[3] === "string") phonetic = metaChunk[3];
      }
    }
    const senses = [];
    if (isSingleWord && Array.isArray(data[1])) {
      for (const group of data[1]) {
        if (Array.isArray(group) && Array.isArray(group[1])) {
          const pos = typeof group[0] === "string" && group[0].trim() ? group[0].trim() : "noun";
          const meanings = group[1].filter((m) => typeof m === "string");
          if (meanings.length > 0) {
            senses.push({
              partOfSpeech: pos,
              meanings
            });
          }
        }
      }
    }
    placeholders.forEach(({ original }, idx) => {
      const tokenRegex = new RegExp(`__\\s*TERM_${idx}\\s*__`, "gi");
      translated = translated.replace(tokenRegex, original);
    });
    const wordDetails = isSingleWord ? {
      word: cleanText,
      translation: translated.trim(),
      phonetic,
      romanized,
      senses
    } : void 0;
    return {
      translatedText: translated.trim(),
      provider: this.name,
      wordDetails
    };
  }
};

// server/providers/my-memory-provider.ts
var MyMemoryTranslationProvider = class {
  name = "MyMemory & LibreTranslate Service";
  async translate(text, sourceLang = "en", targetLang, preservedTerms = []) {
    const cleanText = text.trim();
    if (!cleanText) {
      return { translatedText: "", provider: this.name };
    }
    const placeholders = [];
    let textToTranslate = cleanText;
    preservedTerms.forEach((term, idx) => {
      if (!term.trim()) return;
      const regex = new RegExp(`\\b${term.trim()}\\b`, "gi");
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
          "User-Agent": "ReadMaster/0.1 (Technical Student Reader)"
        }
      });
      if (!response.ok) {
        throw new Error(`MyMemory API returned status ${response.status}`);
      }
      const data = await response.json();
      let translated = data?.responseData?.translatedText || "";
      if (!translated || data.responseStatus === 403 || data.responseStatus === 429) {
        throw new Error("Rate limit reached or empty response from MyMemory");
      }
      placeholders.forEach(({ original }, idx) => {
        const tokenRegex = new RegExp(`__\\s*TERM_${idx}\\s*__`, "gi");
        translated = translated.replace(tokenRegex, original);
      });
      return {
        translatedText: translated,
        provider: "MyMemory Translate"
      };
    } catch (err) {
      console.warn(`Translation provider error (${langPair}):`, err);
      throw err;
    }
  }
};

// server/providers/rule-fallback-provider.ts
var HINDI_PHRASES = {
  "virtual memory": "\u0935\u0930\u094D\u091A\u0941\u0905\u0932 \u092E\u0947\u092E\u094B\u0930\u0940 (\u0906\u092D\u093E\u0938\u0940 \u0938\u094D\u092E\u0943\u0924\u093F)",
  "operating systems": "\u0911\u092A\u0930\u0947\u091F\u093F\u0902\u0917 \u0938\u093F\u0938\u094D\u091F\u092E\u094D\u0938",
  "concurrency": "\u0938\u092E\u0935\u0930\u094D\u0924\u093F\u0924\u093E (\u0915\u0928\u094D\u0915\u0930\u0947\u0928\u094D\u0938\u0940)",
  "process": "\u092A\u094D\u0930\u094B\u0938\u0947\u0938 (\u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E)",
  "processes": "\u092A\u094D\u0930\u094B\u0938\u0947\u0938",
  "thread": "\u0925\u094D\u0930\u0947\u0921",
  "threads": "\u0925\u094D\u0930\u0947\u0921\u094D\u0938",
  "hardware resources": "\u0939\u093E\u0930\u094D\u0921\u0935\u0947\u092F\u0930 \u0938\u0902\u0938\u093E\u0927\u0928",
  "page tables": "\u092A\u0947\u091C \u091F\u0947\u092C\u0932\u094D\u0938",
  "cache invalidation": "\u0915\u0948\u0936 \u0905\u092E\u093E\u0928\u094D\u092F\u0915\u0930\u0923",
  "mutual exclusion": "\u092A\u093E\u0930\u0938\u094D\u092A\u0930\u093F\u0915 \u0905\u092A\u0935\u0930\u094D\u091C\u0928 (\u092E\u094D\u092F\u0942\u091F\u0947\u0915\u094D\u0938)",
  "distributed cache": "\u0935\u093F\u0924\u0930\u093F\u0924 \u0915\u0948\u0936",
  "allows multiple": "\u090F\u0915 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0915\u094B \u0905\u0928\u0941\u092E\u0924\u093F \u0926\u0947\u0924\u093E \u0939\u0948",
  "share memory": "\u0938\u094D\u092E\u0943\u0924\u093F \u0938\u093E\u091D\u093E \u0915\u0930\u0924\u0947 \u0939\u0948\u0902",
  "memory management": "\u092E\u0947\u092E\u094B\u0930\u0940 \u092A\u094D\u0930\u092C\u0902\u0927\u0928"
};
var NEPALI_PHRASES = {
  "virtual memory": "\u092D\u0930\u094D\u091A\u0941\u0905\u0932 \u092E\u0947\u092E\u094B\u0930\u0940 (\u0915\u093E\u0932\u094D\u092A\u0928\u093F\u0915 \u0938\u0902\u091A\u092F)",
  "operating systems": "\u0905\u092A\u0930\u0947\u091F\u093F\u0919 \u0938\u093F\u0938\u094D\u091F\u092E\u0939\u0930\u0942",
  "concurrency": "\u0938\u092E\u0915\u093E\u0932\u0940\u0928\u0924\u093E (\u0915\u0928\u094D\u0915\u0930\u0947\u0928\u094D\u0938\u0940)",
  "process": "\u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E (\u092A\u094D\u0930\u094B\u0938\u0947\u0938)",
  "processes": "\u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E\u0939\u0930\u0942",
  "thread": "\u0925\u094D\u0930\u0947\u0921",
  "threads": "\u0925\u094D\u0930\u0947\u0921\u0939\u0930\u0942",
  "hardware resources": "\u0939\u093E\u0930\u094D\u0921\u0935\u0947\u092F\u0930 \u0938\u094D\u0930\u094B\u0924\u0939\u0930\u0942",
  "page tables": "\u092A\u0947\u091C \u0924\u093E\u0932\u093F\u0915\u093E\u0939\u0930\u0942",
  "cache invalidation": "\u0915\u094D\u092F\u093E\u0938 \u0905\u092E\u093E\u0928\u094D\u092F\u0915\u0930\u0923",
  "mutual exclusion": "\u092A\u093E\u0930\u0938\u094D\u092A\u0930\u093F\u0915 \u0905\u092A\u0935\u0930\u094D\u091C\u0928 (\u092E\u094D\u092F\u0941\u091F\u0947\u0915\u094D\u0938)",
  "distributed cache": "\u0935\u093F\u0924\u0930\u093F\u0924 \u0915\u094D\u092F\u093E\u0938",
  "allows multiple": "\u092C\u0939\u0941\u0935\u093F\u0927\u0932\u093E\u0908 \u0905\u0928\u0941\u092E\u0924\u093F \u0926\u093F\u0928\u094D\u091B",
  "share memory": "\u092E\u0947\u092E\u094B\u0930\u0940 \u0938\u093E\u091D\u093E \u0917\u0930\u094D\u0926\u091B",
  "memory management": "\u092E\u0947\u092E\u094B\u0930\u0940 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928"
};
var FallbackTranslationProvider = class {
  name = "ReadMaster Intelligent Fallback Engine";
  async translate(text, _sourceLang = "en", targetLang, _preservedTerms = []) {
    const dictionary = targetLang === "hi" ? HINDI_PHRASES : NEPALI_PHRASES;
    let result = text;
    for (const [en, localized] of Object.entries(dictionary)) {
      const regex = new RegExp(`\\b${en}\\b`, "gi");
      result = result.replace(regex, localized);
    }
    const note = targetLang === "hi" ? " (\u0938\u0902\u0926\u0930\u094D\u092D \u0905\u0928\u0941\u0935\u093E\u0926)" : " (\u0938\u0928\u094D\u0926\u0930\u094D\u092D \u0905\u0928\u0941\u0935\u093E\u0926)";
    return {
      translatedText: result !== text ? result : `${text}${note}`,
      provider: "ReadMaster Offline Glossary"
    };
  }
};

// server/providers/ai-explainer.ts
var AIExplainerProvider = class {
  cache = /* @__PURE__ */ new Map();
  async explain(req) {
    const { text, language, mode } = req;
    const cacheKey = `${language}:${mode}:${text.trim()}`;
    if (this.cache.has(cacheKey)) {
      return {
        explanation: this.cache.get(cacheKey),
        provider: "ReadMaster AI Cache"
      };
    }
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const result = await this.callGemini(text, language, mode, geminiKey);
        this.cache.set(cacheKey, result);
        return { explanation: result, provider: "Gemini AI API" };
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local explainer:", err);
      }
    }
    const explanation = this.generateLocalExplanation(text, language, mode);
    this.cache.set(cacheKey, explanation);
    return {
      explanation,
      provider: "ReadMaster Built-in Technical Explainer"
    };
  }
  async callGemini(text, language, mode, apiKey) {
    const prompt = `You are a patient senior computer science professor and technical mentor for Indian and Nepali students.
Explain the following technical text clearly.
Target Language: ${language === "hi" ? "Hindi (\u0939\u093F\u0902\u0926\u0940)" : language === "ne" ? "Nepali (\u0928\u0947\u092A\u093E\u0932\u0940)" : "English"}.
Explanation Mode: ${mode === "beginner" ? "Explain like I am a beginner with simple everyday analogies" : mode === "code" ? "Focus on programming code concepts and architectural implications" : "Clear standard technical breakdown"}.

Text to explain:
"""
${text}
"""

Format your response in clean Markdown with:
1. Core Concept (\u0938\u0930\u0932 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E)
2. Everyday Analogy / Example
3. Practical Takeaway`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  generateLocalExplanation(_text, language, mode) {
    const isHindi = language === "hi";
    const isNepali = language === "ne";
    if (isHindi) {
      return `### \u{1F4A1} \u092E\u0941\u0916\u094D\u092F \u0938\u0902\u0915\u0932\u094D\u092A\u0928\u093E (Core Concept)

\u092F\u0939 \u092A\u093E\u0920\u094D\u092F \u0907\u0938 \u092C\u093E\u0924 \u0915\u094B \u0938\u094D\u092A\u0937\u094D\u091F \u0915\u0930\u0924\u093E \u0939\u0948 \u0915\u093F \u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930 \u0938\u093F\u0938\u094D\u091F\u092E \u092E\u0947\u0902 \u0938\u0902\u0938\u093E\u0927\u0928\u094B\u0902 (\u091C\u0948\u0938\u0947 \u092E\u0947\u092E\u094B\u0930\u0940 \u092F\u093E \u0938\u0940\u092A\u0940\u092F\u0942) \u0915\u094B \u0915\u0941\u0936\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0914\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u0942\u092A \u0938\u0947 \u0915\u0948\u0938\u0947 \u092A\u094D\u0930\u092C\u0902\u0927\u093F\u0924 \u0915\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964

- **\u0938\u0930\u0932 \u0936\u092C\u094D\u0926\u094B\u0902 \u092E\u0947\u0902**: \u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930 \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E\u094B\u0902 \u0915\u094B \u090F\u0915-\u0926\u0942\u0938\u0930\u0947 \u0938\u0947 \u0905\u0932\u0917 \u0930\u0916\u0924\u093E \u0939\u0948 \u0924\u093E\u0915\u093F \u090F\u0915 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E \u0915\u0940 \u0924\u094D\u0930\u0941\u091F\u093F \u0926\u0942\u0938\u0930\u0947 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E \u0915\u094B \u0915\u094D\u0930\u0948\u0936 \u0928 \u0915\u0930 \u0938\u0915\u0947\u0964
- **\u092E\u0941\u0916\u094D\u092F \u0932\u093E\u092D**: \u0938\u0941\u0930\u0915\u094D\u0937\u093E (Security), \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928 (Performance), \u0914\u0930 \u0935\u093F\u0936\u094D\u0935\u0938\u0928\u0940\u092F\u0924\u093E (Reliability)\u0964

${mode === "beginner" ? `### \u{1F3E0} \u0926\u0948\u0928\u093F\u0915 \u091C\u0940\u0935\u0928 \u0915\u093E \u0909\u0926\u093E\u0939\u0930\u0923 (Analogy)

\u0915\u0932\u094D\u092A\u0928\u093E \u0915\u0940\u091C\u093F\u090F \u0915\u093F \u090F\u0915 \u092C\u0921\u093C\u093E \u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F \u0939\u0948 \u091C\u0939\u093E\u0901 \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u091B\u093E\u0924\u094D\u0930 \u0915\u094B \u0905\u092A\u0928\u0940 \u0905\u0932\u0917 \u0905\u0927\u094D\u092F\u092F\u0928 \u092E\u0947\u091C \u092E\u093F\u0932\u0924\u0940 \u0939\u0948\u0964 \u090F\u0915 \u091B\u093E\u0924\u094D\u0930 \u0915\u0947 \u0915\u093E\u092E \u0938\u0947 \u0926\u0942\u0938\u0930\u0947 \u091B\u093E\u0924\u094D\u0930 \u0915\u0940 \u092A\u0922\u093C\u093E\u0908 \u092C\u093E\u0927\u093F\u0924 \u0928\u0939\u0940\u0902 \u0939\u094B\u0924\u0940\u0964` : `### \u2699\uFE0F \u0924\u0915\u0928\u0940\u0915\u0940 \u0914\u0930 \u0915\u094B\u0921 \u0928\u093F\u0939\u093F\u0924\u093E\u0930\u094D\u0925 (Technical Insight)

\u0911\u092A\u0930\u0947\u091F\u093F\u0902\u0917 \u0938\u093F\u0938\u094D\u091F\u092E \u0914\u0930 \u0939\u093E\u0930\u094D\u0921\u0935\u0947\u092F\u0930 MMU (Memory Management Unit) \u092A\u0930\u0938\u094D\u092A\u0930 \u0924\u093E\u0932\u092E\u0947\u0932 \u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u0947 \u0939\u0948\u0902, \u091C\u093F\u0938\u0938\u0947 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E\u0930 \u0915\u094B \u0938\u0940\u0927\u0947 \u0939\u093E\u0930\u094D\u0921\u0935\u0947\u092F\u0930 \u092A\u0924\u094B\u0902 \u0915\u0940 \u091A\u093F\u0902\u0924\u093E \u0915\u093F\u090F \u092C\u093F\u0928\u093E \u0938\u094D\u0935\u0924\u0902\u0924\u094D\u0930 \u0930\u0942\u092A \u0938\u0947 \u0915\u094B\u0921 \u0932\u093F\u0916\u0928\u0947 \u0915\u0940 \u0938\u0941\u0935\u093F\u0927\u093E \u092E\u093F\u0932\u0924\u0940 \u0939\u0948\u0964`}`;
    }
    if (isNepali) {
      return `### \u{1F4A1} \u092E\u0941\u0916\u094D\u092F \u0905\u0935\u0927\u093E\u0930\u0923\u093E (Core Concept)

\u092F\u0938 \u0916\u0923\u094D\u0921\u0932\u0947 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u092A\u094D\u0930\u0923\u093E\u0932\u0940\u092E\u093E \u0938\u094D\u0930\u094B\u0924\u0939\u0930\u0942\u0915\u094B \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930 \u092A\u094D\u0930\u092D\u093E\u0935\u0915\u093E\u0930\u0940 \u092C\u093E\u0901\u0921\u092B\u093E\u0901\u0921 \u0915\u0938\u0930\u0940 \u0917\u0930\u093F\u0928\u094D\u091B \u092D\u0928\u094D\u0928\u0947 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E \u0917\u0930\u094D\u0926\u091B\u0964

- **\u0938\u0930\u0932 \u0936\u092C\u094D\u0926\u092E\u093E**: \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E\u0939\u0930\u0942\u0932\u093E\u0908 \u090F\u0915\u0905\u0930\u094D\u0915\u093E\u092C\u093E\u091F \u0905\u0932\u0917 \u0930\u093E\u0916\u093F\u0928\u094D\u091B \u0924\u093E\u0915\u093F \u090F\u0909\u091F\u093E\u0915\u094B \u0938\u092E\u0938\u094D\u092F\u093E\u0932\u0947 \u0905\u0930\u094D\u0915\u094B\u0932\u093E\u0908 \u0905\u0938\u0930 \u0928\u0917\u0930\u094B\u0938\u094D\u0964
- **\u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u092A\u0915\u094D\u0937\u0939\u0930\u0942**: \u0938\u0941\u0930\u0915\u094D\u0937\u093E, \u0935\u093F\u0936\u094D\u0935\u0938\u0928\u0940\u092F\u0924\u093E, \u0930 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0937\u092E\u0924\u093E\u0964

${mode === "beginner" ? `### \u{1F3EB} \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u0909\u0926\u093E\u0939\u0930\u0923 (Analogy)

\u091C\u0938\u094D\u0924\u0948 \u090F\u0909\u091F\u0948 \u0918\u0930\u092E\u093E \u0927\u0947\u0930\u0948 \u0915\u094B\u0920\u093E\u0939\u0930\u0942 \u0939\u0941\u0928\u094D\u091B\u0928\u094D \u0930 \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0915\u094B \u0906\u092B\u094D\u0928\u0948 \u0928\u093F\u091C\u0940 \u0920\u093E\u0909\u0901 \u0939\u0941\u0928\u094D\u091B, \u0924\u094D\u092F\u0938\u094D\u0924\u0948 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930\u092E\u093E \u092A\u0928\u093F \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E\u0915\u094B \u0906\u092B\u094D\u0928\u0948 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u092D\u093E\u0917 \u0939\u0941\u0928\u094D\u091B\u0964` : `### \u2699\uFE0F \u092A\u094D\u0930\u093E\u0935\u093F\u0927\u093F\u0915 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 (Technical Insight)

\u0905\u092A\u0930\u0947\u091F\u093F\u0919 \u0938\u093F\u0938\u094D\u091F\u092E\u0932\u0947 \u0938\u092B\u094D\u091F\u0935\u0947\u092F\u0930\u0932\u093E\u0908 \u092D\u094C\u0924\u093F\u0915 \u0939\u093E\u0930\u094D\u0921\u0935\u0947\u092F\u0930\u0915\u094B \u091C\u091F\u093F\u0932\u0924\u093E\u092C\u093E\u091F \u092E\u0941\u0915\u094D\u0924 \u0930\u093E\u0916\u094D\u0926\u0948 \u0938\u094D\u0925\u093F\u0930 \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u092A\u094D\u0930\u0926\u093E\u0928 \u0917\u0930\u094D\u0926\u091B\u0964`}`;
    }
    return `### \u{1F4A1} Core Concept Breakdown

This passage describes how modern computer architectures achieve isolation, efficiency, and safety when managing hardware resources.

- **Key Principle**: Abstraction separates what an operation achieves from how the underlying hardware executes it.
- **Benefits**: Fault isolation, memory protection, and concurrent execution without state corruption.

${mode === "beginner" ? `### \u2615 Simple Analogy

Think of an apartment building: every tenant has their own locked private apartment (address space). No matter what mess occurs in one room, neighboring apartments remain completely undisturbed.` : mode === "code" ? `### \u{1F4BB} Code & Systems Takeaway

When writing multi-threaded systems or allocating buffers with \`mmap\`, understanding page table boundaries and cache locality prevents costly page faults and synchronization deadlocks.` : `### \u{1F3AF} Engineering Takeaway

By virtualizing memory and CPU execution, software developers can write reliable applications without worrying about physical memory fragmentation.`}`;
  }
};

// server/sync/sync-router.ts
import { Router } from "express";
import crypto from "crypto";
var syncRouter = Router();
var syncStore = {
  documents: /* @__PURE__ */ new Map(),
  annotations: /* @__PURE__ */ new Map(),
  vocabulary: /* @__PURE__ */ new Map(),
  shareableLinks: /* @__PURE__ */ new Map()
};
syncRouter.post("/push", (req, res) => {
  try {
    const { documents = [], annotations = [], vocabulary = [] } = req.body;
    documents.forEach((doc) => {
      const existing = syncStore.documents.get(doc.id);
      if (!existing || new Date(doc.updatedAt) > new Date(existing.updatedAt)) {
        syncStore.documents.set(doc.id, doc);
      }
    });
    annotations.forEach((ann) => {
      const existing = syncStore.annotations.get(ann.id);
      if (!existing || new Date(ann.updatedAt) > new Date(existing.updatedAt)) {
        syncStore.annotations.set(ann.id, ann);
      }
    });
    vocabulary.forEach((v) => {
      const existing = syncStore.vocabulary.get(v.id);
      if (!existing || new Date(v.updatedAt) > new Date(existing.updatedAt)) {
        syncStore.vocabulary.set(v.id, v);
      }
    });
    res.json({
      status: "ok",
      syncedAt: (/* @__PURE__ */ new Date()).toISOString(),
      accepted: {
        documents: documents.length,
        annotations: annotations.length,
        vocabulary: vocabulary.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Sync push failed", details: String(err) });
  }
});
syncRouter.post("/pull", (req, res) => {
  try {
    const { lastSyncedAt } = req.body;
    const since = lastSyncedAt ? new Date(lastSyncedAt).getTime() : 0;
    const changedDocs = [];
    syncStore.documents.forEach((doc) => {
      if (new Date(doc.updatedAt).getTime() > since) {
        changedDocs.push(doc);
      }
    });
    const changedAnns = [];
    syncStore.annotations.forEach((ann) => {
      if (new Date(ann.updatedAt).getTime() > since) {
        changedAnns.push(ann);
      }
    });
    const changedVocab = [];
    syncStore.vocabulary.forEach((v) => {
      if (new Date(v.updatedAt).getTime() > since) {
        changedVocab.push(v);
      }
    });
    res.json({
      serverTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
      documents: changedDocs,
      annotations: changedAnns,
      vocabulary: changedVocab
    });
  } catch (err) {
    res.status(500).json({ error: "Sync pull failed", details: String(err) });
  }
});
syncRouter.post("/share", (req, res) => {
  try {
    const { docId, document, annotations } = req.body;
    if (!docId) {
      return res.status(400).json({ error: "Missing docId" });
    }
    if (document) {
      syncStore.documents.set(docId, document);
    }
    if (annotations && Array.isArray(annotations)) {
      annotations.forEach((a) => syncStore.annotations.set(a.id, a));
    }
    const token = crypto.randomBytes(12).toString("hex");
    syncStore.shareableLinks.set(token, {
      docId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const shareUrl = `${req.protocol}://${req.get("host")}/?share=${token}`;
    res.json({
      token,
      shareUrl
    });
  } catch (err) {
    res.status(500).json({ error: "Share link generation failed", details: String(err) });
  }
});
syncRouter.get("/share/:token", (req, res) => {
  try {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    const link = syncStore.shareableLinks.get(token);
    if (!link) {
      return res.status(404).json({ error: "Shared link not found or expired" });
    }
    const doc = syncStore.documents.get(link.docId);
    if (!doc) {
      return res.status(404).json({ error: "Shared document content not found" });
    }
    const docAnnotations = [];
    syncStore.annotations.forEach((ann) => {
      if (ann.docId === link.docId && !ann.deletedAt) {
        docAnnotations.push(ann);
      }
    });
    res.json({
      document: doc,
      annotations: docAnnotations,
      sharedAt: link.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve shared document", details: String(err) });
  }
});

// server/app.ts
var app = express();
app.use(cors());
app.use(express.json());
var apiRouter = express.Router();
apiRouter.use("/sync", syncRouter);
var primaryProvider = new GoogleTranslateProvider();
var secondaryProvider = new MyMemoryTranslationProvider();
var fallbackProvider = new FallbackTranslationProvider();
var aiExplainer = new AIExplainerProvider();
async function translateWithFallback(text, targetLang, preservedTerms) {
  try {
    const res = await primaryProvider.translate(text, "en", targetLang, preservedTerms);
    if (res.translatedText && res.translatedText.trim()) {
      return { text: res.translatedText, provider: res.provider, wordDetails: res.wordDetails };
    }
  } catch (err) {
    console.warn(`Primary provider (${primaryProvider.name}) failed:`, err);
  }
  try {
    const res = await secondaryProvider.translate(text, "en", targetLang, preservedTerms);
    if (res.translatedText && res.translatedText.trim()) {
      return { text: res.translatedText, provider: res.provider };
    }
  } catch (err) {
    console.warn(`Secondary provider (${secondaryProvider.name}) failed:`, err);
  }
  const fallbackRes = await fallbackProvider.translate(text, "en", targetLang, preservedTerms);
  return { text: fallbackRes.translatedText, provider: fallbackRes.provider };
}
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "0.1.0",
    providers: [primaryProvider.name, secondaryProvider.name, fallbackProvider.name]
  });
});
apiRouter.post("/translate", async (req, res) => {
  try {
    const { text, targetLang = "both", contextTerms = [] } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing or empty text property" });
    }
    const cleanText = text.trim();
    let hindiTranslation;
    let nepaliTranslation;
    let providerName = primaryProvider.name;
    let hiWordDetails;
    let neWordDetails;
    if (targetLang === "hi" || targetLang === "both") {
      const hiRes = await translateWithFallback(cleanText, "hi", contextTerms);
      hindiTranslation = hiRes.text;
      providerName = hiRes.provider;
      hiWordDetails = hiRes.wordDetails;
    }
    if (targetLang === "ne" || targetLang === "both") {
      const neRes = await translateWithFallback(cleanText, "ne", contextTerms);
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
        nepali: neWordDetails
      }
    });
  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({
      error: "Translation failed",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});
apiRouter.post("/explain", async (req, res) => {
  try {
    const { text, language = "en", mode = "standard" } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing or empty text property" });
    }
    const result = await aiExplainer.explain({
      text: text.trim(),
      language,
      mode
    });
    return res.json(result);
  } catch (err) {
    console.error("Explain error:", err);
    return res.status(500).json({
      error: "Explanation failed",
      details: err instanceof Error ? err.message : String(err)
    });
  }
});
app.use("/api", apiRouter);
app.use(apiRouter);

// server/vercel-handler.ts
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default
};
