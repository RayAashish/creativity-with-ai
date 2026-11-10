import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FileText,
  Bookmark,
  Highlighter,
  ArrowRight,
} from 'lucide-react';
import { globalSearchService, GlobalSearchResultItem } from '../../services/global-search-service';
import { useReaderStore } from '../../stores/reader-store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResultItem[]>([]);
  const { openDocument, setCurrentPage } = useReaderStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      globalSearchService.search(query).then(setResults);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectResult = async (item: GlobalSearchResultItem) => {
    onClose();
    if (item.docId) {
      await openDocument(item.docId);
      if (item.page) {
        setCurrentPage(item.page);
        setTimeout(() => {
          document
            .getElementById(`pdf-page-${item.page}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }
  };

  const getCategoryBadge = (cat: GlobalSearchResultItem['category']) => {
    switch (cat) {
      case 'document':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
            <FileText className="w-3 h-3" /> DOC
          </span>
        );
      case 'annotation':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
            <Highlighter className="w-3 h-3" /> NOTE
          </span>
        );
      case 'vocab':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
            <Bookmark className="w-3 h-3" /> VOCAB
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-zinc-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Global search across documents, highlights, notes, and vocabulary..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-gray-900 dark:text-zinc-100 placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-between group text-xs"
              >
                <div className="min-w-0 pr-3 space-y-1">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(item.category)}
                    <h4 className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </h4>
                    {item.page && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        Page {item.page}
                      </span>
                    )}
                  </div>
                  {item.snippet && (
                    <p className="text-gray-500 dark:text-zinc-400 truncate text-[11px]">
                      {item.snippet}
                    </p>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 group-hover:text-amber-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            ))
          ) : query.trim() ? (
            <div className="text-center py-12 text-xs text-gray-400">
              No matching documents, notes, or vocabulary found.
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400 space-y-1">
              <p>Type to search across your entire offline library.</p>
              <p className="text-[11px] text-gray-400">
                Tip: Press <kbd className="px-1 rounded bg-gray-100 dark:bg-zinc-800 font-mono">Esc</kbd> anytime to close.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
