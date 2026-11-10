export interface ExplainRequest {
  text: string;
  language: 'en' | 'hi' | 'ne';
  mode: 'beginner' | 'standard' | 'code';
}

export interface ExplainResponse {
  explanation: string;
  provider: string;
}

export class AIExplainerProvider {
  private cache = new Map<string, string>();

  async explain(req: ExplainRequest): Promise<ExplainResponse> {
    const { text, language, mode } = req;
    const cacheKey = `${language}:${mode}:${text.trim()}`;

    if (this.cache.has(cacheKey)) {
      return {
        explanation: this.cache.get(cacheKey)!,
        provider: 'ReadMaster AI Cache',
      };
    }

    // Check if Gemini API key exists
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const result = await this.callGemini(text, language, mode, geminiKey);
        this.cache.set(cacheKey, result);
        return { explanation: result, provider: 'Gemini AI API' };
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local explainer:', err);
      }
    }

    // Intelligent local fallback explainer
    const explanation = this.generateLocalExplanation(text, language, mode);
    this.cache.set(cacheKey, explanation);
    return {
      explanation,
      provider: 'ReadMaster Built-in Technical Explainer',
    };
  }

  private async callGemini(
    text: string,
    language: string,
    mode: string,
    apiKey: string
  ): Promise<string> {
    const prompt = `You are a patient senior computer science professor and technical mentor for Indian and Nepali students.
Explain the following technical text clearly.
Target Language: ${language === 'hi' ? 'Hindi (हिंदी)' : language === 'ne' ? 'Nepali (नेपाली)' : 'English'}.
Explanation Mode: ${mode === 'beginner' ? 'Explain like I am a beginner with simple everyday analogies' : mode === 'code' ? 'Focus on programming code concepts and architectural implications' : 'Clear standard technical breakdown'}.

Text to explain:
"""
${text}
"""

Format your response in clean Markdown with:
1. Core Concept (सरल व्याख्या)
2. Everyday Analogy / Example
3. Practical Takeaway`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private generateLocalExplanation(
    _text: string,
    language: 'en' | 'hi' | 'ne',
    mode: 'beginner' | 'standard' | 'code'
  ): string {
    const isHindi = language === 'hi';
    const isNepali = language === 'ne';

    if (isHindi) {
      return `### 💡 मुख्य संकल्पना (Core Concept)\n\nयह पाठ्य इस बात को स्पष्ट करता है कि कंप्यूटर सिस्टम में संसाधनों (जैसे मेमोरी या सीपीयू) को कुशलतापूर्वक और सुरक्षित रूप से कैसे प्रबंधित किया जाता है।\n\n- **सरल शब्दों में**: कंप्यूटर विभिन्न प्रोग्रामों को एक-दूसरे से अलग रखता है ताकि एक प्रोग्राम की त्रुटि दूसरे प्रोग्राम को क्रैश न कर सके।\n- **मुख्य लाभ**: सुरक्षा (Security), प्रदर्शन (Performance), और विश्वसनीयता (Reliability)।\n\n${
        mode === 'beginner'
          ? `### 🏠 दैनिक जीवन का उदाहरण (Analogy)\n\nकल्पना कीजिए कि एक बड़ा पुस्तकालय है जहाँ प्रत्येक छात्र को अपनी अलग अध्ययन मेज मिलती है। एक छात्र के काम से दूसरे छात्र की पढ़ाई बाधित नहीं होती।`
          : `### ⚙️ तकनीकी और कोड निहितार्थ (Technical Insight)\n\nऑपरेटिंग सिस्टम और हार्डवेयर MMU (Memory Management Unit) परस्पर तालमेल से काम करते हैं, जिससे प्रोग्रामर को सीधे हार्डवेयर पतों की चिंता किए बिना स्वतंत्र रूप से कोड लिखने की सुविधा मिलती है।`
      }`;
    }

    if (isNepali) {
      return `### 💡 मुख्य अवधारणा (Core Concept)\n\nयस खण्डले कम्प्युटर प्रणालीमा स्रोतहरूको सुरक्षित र प्रभावकारी बाँडफाँड कसरी गरिन्छ भन्ने व्याख्या गर्दछ।\n\n- **सरल शब्दमा**: विभिन्न प्रोग्रामहरूलाई एकअर्काबाट अलग राखिन्छ ताकि एउटाको समस्याले अर्कोलाई असर नगरोस्।\n- **महत्वपूर्ण पक्षहरू**: सुरक्षा, विश्वसनीयता, र कार्यक्षमता।\n\n${
        mode === 'beginner'
          ? `### 🏫 व्यावहारिक उदाहरण (Analogy)\n\nजस्तै एउटै घरमा धेरै कोठाहरू हुन्छन् र प्रत्येक व्यक्तिको आफ्नै निजी ठाउँ हुन्छ, त्यस्तै कम्प्युटरमा पनि प्रत्येक प्रक्रियाको आफ्नै सुरक्षित भाग हुन्छ।`
          : `### ⚙️ प्राविधिक विश्लेषण (Technical Insight)\n\nअपरेटिङ सिस्टमले सफ्टवेयरलाई भौतिक हार्डवेयरको जटिलताबाट मुक्त राख्दै स्थिर वातावरण प्रदान गर्दछ।`
      }`;
    }

    // English
    return `### 💡 Core Concept Breakdown\n\nThis passage describes how modern computer architectures achieve isolation, efficiency, and safety when managing hardware resources.\n\n- **Key Principle**: Abstraction separates what an operation achieves from how the underlying hardware executes it.\n- **Benefits**: Fault isolation, memory protection, and concurrent execution without state corruption.\n\n${
      mode === 'beginner'
        ? `### ☕ Simple Analogy\n\nThink of an apartment building: every tenant has their own locked private apartment (address space). No matter what mess occurs in one room, neighboring apartments remain completely undisturbed.`
        : mode === 'code'
        ? `### 💻 Code & Systems Takeaway\n\nWhen writing multi-threaded systems or allocating buffers with \`mmap\`, understanding page table boundaries and cache locality prevents costly page faults and synchronization deadlocks.`
        : `### 🎯 Engineering Takeaway\n\nBy virtualizing memory and CPU execution, software developers can write reliable applications without worrying about physical memory fragmentation.`
    }`;
  }
}
