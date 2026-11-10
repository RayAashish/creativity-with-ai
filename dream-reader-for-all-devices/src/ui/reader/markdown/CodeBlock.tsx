import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<Props> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/90 text-sm font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-800/80 bg-gray-100/70 dark:bg-zinc-800/50 text-xs text-gray-500 dark:text-zinc-400 select-none">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  );
};
