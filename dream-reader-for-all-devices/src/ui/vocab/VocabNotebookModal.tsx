import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Volume2,
  Trash2,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useVocabStore } from '../../stores/vocab-store';
import { useReaderStore } from '../../stores/reader-store';
import { useLibraryStore } from '../../stores/library-store';
import { lookupService } from '../../lookup/lookup-service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VocabNotebookModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { vocabEntries, loadVocab, removeWord } = useVocabStore();
  const { openDocument, setCurrentPage } = useReaderStore();
  const { documents } = useLibraryStore();
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadVocab();
    }
  }, [isOpen, loadVocab]);

  if (!isOpen) return null;

  const filteredEntries = vocabEntries.filter(
    (entry) =>
      entry.word.toLowerCase().includes(filterQuery.toLowerCase()) ||
      entry.sourceSentence?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleReturnToContext = async (entry: (typeof vocabEntries)[0]) => {
    if (!entry.docId) return;
    onClose();
    await openDocument(entry.docId);

    if (entry.anchor && entry.anchor.type === 'pdf') {
      setCurrentPage(entry.anchor.page);
      setTimeout(() => {
        document
          .getElementById(`pdf-page-${entry.anchor?.type === 'pdf' ? entry.anchor.page : 1}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">
                Vocabulary Notebook
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {vocabEntries.length} saved words & technical terms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search saved vocabulary or source sentence..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 dark:text-zinc-100 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => {
              const doc = documents.find((d) => d.id === entry.docId);
              const firstSense = entry.meanings.senses[0];

              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-amber-400/60 transition-colors shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-gray-900 dark:text-zinc-100 capitalize">
                        {entry.word}
                      </h4>
                      <button
                        onClick={() => lookupService.speak(entry.word)}
                        title="Listen to pronunciation"
                        className="p-1 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      {entry.meanings.devanagariPhonetic && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 font-medium">
                          {entry.meanings.devanagariPhonetic}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeWord(entry.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                      title="Remove from notebook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meanings */}
                  {firstSense && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {firstSense.hindi.length > 0 && (
                        <div className="p-2 rounded-lg bg-orange-50/50 dark:bg-zinc-800/40 border border-orange-100/60 dark:border-zinc-800">
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block mb-0.5">
                            हिंदी (Hindi)
                          </span>
                          <span className="text-gray-800 dark:text-zinc-200 font-medium">
                            {firstSense.hindi.join('; ')}
                          </span>
                        </div>
                      )}
                      {firstSense.nepali.length > 0 && (
                        <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-zinc-800/40 border border-blue-100/60 dark:border-zinc-800">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                            नेपाली (Nepali)
                          </span>
                          <span className="text-gray-800 dark:text-zinc-200 font-medium">
                            {firstSense.nepali.join('; ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Source Sentence */}
                  {entry.sourceSentence && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 text-xs text-gray-600 dark:text-zinc-300 italic">
                      "{entry.sourceSentence}"
                    </div>
                  )}

                  {/* Document & Return Link */}
                  {entry.docId && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-zinc-800/60 text-gray-500">
                      <div className="flex items-center gap-1.5 truncate max-w-sm">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{doc?.title || 'Document'}</span>
                        {entry.anchor?.type === 'pdf' && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            • Page {entry.anchor.page}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleReturnToContext(entry)}
                        className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline"
                      >
                        <span>Return to text</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-xs text-gray-400">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>
                {filterQuery
                  ? 'No vocabulary entries match your search.'
                  : 'No words saved yet. Double-click or select any word while reading to save it!'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
