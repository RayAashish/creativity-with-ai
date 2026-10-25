import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Terminal, Sparkles, MessageSquare } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

export type CodeLanguage = 'java' | 'python' | 'cpp' | 'javascript';

export interface CodeAnnotation {
  line: number;
  text: string;
}

export interface IdeCodeBlockProps {
  title?: string;
  codeMap?: {
    java?: string;
    python?: string;
    cpp?: string;
    javascript?: string;
  };
  singleCode?: string;
  singleLanguage?: CodeLanguage;
  highlightLines?: number[];
  annotations?: CodeAnnotation[];
  defaultLanguage?: CodeLanguage;
  showLanguageTabs?: boolean;
}

const LANGUAGE_CONFIG: Record<CodeLanguage, { label: string; icon: string; ext: string; prismLang: string }> = {
  java: { label: 'Java', icon: '☕', ext: '.java', prismLang: 'java' },
  python: { label: 'Python', icon: '🐍', ext: '.py', prismLang: 'python' },
  cpp: { label: 'C++', icon: '⚡', ext: '.cpp', prismLang: 'cpp' },
  javascript: { label: 'JavaScript', icon: '🟨', ext: '.js', prismLang: 'javascript' },
};

const LANG_PREF_KEY = 'dsaspace_ide_code_lang_v1';

export const IdeCodeBlock: React.FC<IdeCodeBlockProps> = ({
  title,
  codeMap,
  singleCode,
  singleLanguage = 'java',
  highlightLines = [],
  annotations = [],
  defaultLanguage = 'java',
  showLanguageTabs = true,
}) => {
  // Load persisted language preference
  const [activeLang, setActiveLang] = useState<CodeLanguage>(() => {
    try {
      const stored = localStorage.getItem(LANG_PREF_KEY) as CodeLanguage;
      if (stored && LANGUAGE_CONFIG[stored]) return stored;
    } catch (e) {
      // ignore
    }
    return defaultLanguage;
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Persist language preference
  const handleSelectLanguage = (lang: CodeLanguage) => {
    setActiveLang(lang);
    try {
      localStorage.setItem(LANG_PREF_KEY, lang);
    } catch (e) {
      // ignore
    }
  };

  // Determine current code string
  const currentCode = useMemo(() => {
    if (codeMap) {
      return codeMap[activeLang] || codeMap.java || codeMap.python || codeMap.cpp || codeMap.javascript || '';
    }
    return singleCode || '';
  }, [codeMap, activeLang, singleCode]);

  const currentLang = codeMap ? activeLang : singleLanguage;
  const config = LANGUAGE_CONFIG[currentLang] || LANGUAGE_CONFIG.java;

  // Highlight using Prism
  const highlightedHtmlLines = useMemo(() => {
    const grammar = Prism.languages[config.prismLang] || Prism.languages.clike;
    const rawHtml = Prism.highlight(currentCode.trim(), grammar, config.prismLang);
    return rawHtml.split('\n');
  }, [currentCode, config.prismLang]);

  // Create lookup for annotations by line number
  const annotationMap = useMemo(() => {
    const map = new Map<number, string>();
    annotations.forEach((a) => {
      map.set(a.line, a.text);
    });
    return map;
  }, [annotations]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const filename = title || `Solution${config.ext}`;

  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] overflow-hidden shadow-2xl transition hover:border-[#484f58]">
      {/* IDE Top Window Bar */}
      <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Window Dots & Filename */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#c9d1d9]">
            <Terminal className="w-3.5 h-3.5 text-[#8b949e]" />
            <span className="font-semibold">{filename}</span>
          </div>
        </div>

        {/* Right: Language Switcher Tabs & Copy Button */}
        <div className="flex items-center gap-2">
          {showLanguageTabs && codeMap && (
            <div className="flex items-center gap-1 p-0.5 bg-[#0d1117] rounded-xl border border-[#30363d]">
              {(['java', 'python', 'cpp', 'javascript'] as CodeLanguage[]).map((lang) => {
                const isActive = activeLang === lang;
                const langConf = LANGUAGE_CONFIG[lang];
                return (
                  <button
                    key={lang}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-[#388bfd]/20 text-[#58a6ff] border border-[#388bfd]/40 shadow-sm'
                        : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                    }`}
                  >
                    <span className="text-[11px]">{langConf.icon}</span>
                    <span>{langConf.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] rounded-xl text-xs font-semibold transition active:scale-95"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#3fb950]" />
                <span className="text-[#3fb950] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers & Annotations */}
      <div className="ide-code-block overflow-x-auto p-4 custom-scrollbar text-xs sm:text-[13px] font-mono leading-relaxed bg-[#0d1117] text-[#e6edf3]">
        <div className="min-w-fit">
          {highlightedHtmlLines.map((lineHtml, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            const annotationText = annotationMap.get(lineNum);

            return (
              <div
                key={idx}
                className={`flex items-start group transition-colors rounded ${
                  isHighlighted ? 'bg-[#388bfd]/15 border-l-2 border-[#58a6ff]' : 'hover:bg-[#161b22]/50'
                }`}
              >
                {/* Line Number Gutter */}
                <span
                  className={`select-none text-right pr-4 pl-2 w-10 flex-shrink-0 text-xs ${
                    isHighlighted ? 'text-[#58a6ff] font-bold' : 'text-[#6e7681]'
                  }`}
                >
                  {lineNum}
                </span>

                {/* Code Line */}
                <div className="flex-1 whitespace-pre pr-4 text-[#e6edf3]">
                  <span
                    dangerouslySetInnerHTML={{ __html: lineHtml || ' ' }}
                    className="inline-block text-[#e6edf3]"
                  />
                  
                  {/* Inline Annotation / Comment Badge */}
                  {annotationText && (
                    <span className="inline-flex items-center gap-1.5 ml-4 px-2 py-0.5 rounded-md bg-[#1f6feb]/25 text-[#79c0ff] border border-[#388bfd]/40 text-[11px] font-sans font-semibold">
                      <Sparkles className="w-3 h-3 text-[#58a6ff] flex-shrink-0" />
                      <span>{annotationText}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
