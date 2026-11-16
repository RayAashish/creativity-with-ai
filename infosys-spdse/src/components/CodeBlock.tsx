import React, { useState } from 'react';
import { Check, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface CodeBlockProps {
  code: {
    java: string;
    cpp: string;
    python: string;
  };
  preferredLanguage: Language;
  onLanguageChange?: (lang: Language) => void;
  verified?: boolean;
  testsPassed?: number;
  tleWarningPython?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  preferredLanguage,
  onLanguageChange,
  verified = true,
  testsPassed = 15,
  tleWarningPython = true
}) => {
  const [activeLang, setActiveLang] = useState<Language>(preferredLanguage);
  const [copied, setCopied] = useState(false);

  // Sync with global preferred language when changed from props
  React.useEffect(() => {
    setActiveLang(preferredLanguage);
  }, [preferredLanguage]);

  const handleLangSelect = (lang: Language) => {
    setActiveLang(lang);
    if (onLanguageChange) onLanguageChange(lang);
  };

  const currentCode = code[activeLang] || code.java;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-neutral-100 overflow-hidden text-xs my-3 font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-950/80 border-b border-neutral-800">
        
        {/* Language Tabs */}
        <div className="flex items-center gap-1">
          {(['java', 'cpp', 'python'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangSelect(lang)}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                activeLang === lang
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {lang === 'java' ? 'Java (Fast I/O)' : lang === 'cpp' ? 'C++17' : 'Python 3'}
            </button>
          ))}
        </div>

        {/* Status Badge & Copy Button */}
        <div className="flex items-center gap-3">
          {verified ? (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-sans">
              <CheckCircle2 size={12} />
              <span>Verified: {testsPassed}/15 tests passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-sans">
              <AlertCircle size={12} />
              <span>Unverified</span>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-neutral-800"
            title="Copy code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

      </div>

      {/* Python TLE Advisory */}
      {activeLang === 'python' && tleWarningPython && (
        <div className="px-3 py-1.5 bg-amber-950/40 border-b border-amber-900/50 text-[11px] text-amber-300 flex items-center justify-between font-sans">
          <span>Python Note: sys.stdin.read() is used. For N &gt;= 2*10^5, Python interpreter overhead may risk TLE on HackerEarth; Java/C++ recommended for optimal pass rate.</span>
        </div>
      )}

      {/* Code Text Area */}
      <div className="p-3.5 overflow-x-auto max-h-96">
        <pre className="leading-relaxed text-[12px] whitespace-pre">
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
};
