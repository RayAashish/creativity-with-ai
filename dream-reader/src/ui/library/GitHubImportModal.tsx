import React, { useState } from 'react';
import { X, Github, ArrowRight, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { useLibraryStore } from '../../stores/library-store';
import { useReaderStore } from '../../stores/reader-store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { importGitHub, isImporting } = useLibraryStore();
  const { openDocument } = useReaderStore();

  if (!isOpen) return null;

  const handleImport = async (targetUrl?: string) => {
    const importUrl = (targetUrl || url).trim();
    if (!importUrl) {
      setLocalError('Please enter a GitHub repository or file URL.');
      return;
    }

    setLocalError(null);
    try {
      const doc = await importGitHub(importUrl);
      onClose();
      // Immediately open document in reader
      await openDocument(doc.id);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Failed to import repository.');
    }
  };

  const sampleRepos = [
    {
      name: 'React README',
      desc: 'The library for web and native user interfaces',
      url: 'https://github.com/facebook/react/blob/main/README.md',
    },
    {
      name: 'Rust Book (Ch 1)',
      desc: 'Getting started with Rust programming',
      url: 'https://github.com/rust-lang/book/blob/main/src/ch01-00-getting-started.md',
    },
    {
      name: 'TypeScript Handbook',
      desc: 'TypeScript basic types & handbook',
      url: 'https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/handbook-v2/The%20Basics.md',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-zinc-800 text-white flex items-center justify-center">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">Open GitHub Markdown</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Import READMEs, docs, and papers with live links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
              GitHub Repository or File URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://github.com/owner/repo or /blob/main/README.md"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setLocalError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && !isImporting && handleImport()}
                className="flex-1 px-3.5 py-2 text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-zinc-100 placeholder-gray-400"
              />
              <button
                onClick={() => handleImport()}
                disabled={isImporting || !url.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Import</span>
              </button>
            </div>
          </div>

          {localError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2">Or try one of these technical docs:</p>
            <div className="space-y-1.5">
              {sampleRepos.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => handleImport(sample.url)}
                  disabled={isImporting}
                  className="w-full text-left p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-amber-200 dark:hover:border-zinc-700 hover:bg-amber-50/50 dark:hover:bg-zinc-800/50 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800 dark:text-zinc-200 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500" />
                      <span>{sample.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-500 truncate">{sample.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
