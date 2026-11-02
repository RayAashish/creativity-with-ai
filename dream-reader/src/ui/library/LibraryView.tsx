import React, { useEffect, useState } from 'react';
import { Github, Search, BookOpen, Sparkles, Filter } from 'lucide-react';
import { useLibraryStore } from '../../stores/library-store';
import { useReaderStore } from '../../stores/reader-store';
import { FileDropzone } from './FileDropzone';
import { DocumentCard } from './DocumentCard';
import { GitHubImportModal } from './GitHubImportModal';

export const LibraryView: React.FC = () => {
  const { documents, loadDocuments, isLoading, importSample } = useLibraryStore();
  const { openDocument } = useReaderStore();
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'md' | 'github'>('all');

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleOpenSample = async () => {
    try {
      const doc = await importSample();
      await openDocument(doc.id);
    } catch (err) {
      console.error('Failed to load sample doc:', err);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesQuery =
      doc.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(filterQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (typeFilter === 'all') return true;
    if (typeFilter === 'pdf') return doc.type === 'pdf';
    if (typeFilter === 'md') return doc.type === 'md';
    if (typeFilter === 'github') return doc.source === 'github';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Reading Library</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/60">
              Offline First
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Read technical books, papers, and GitHub docs with built-in English → Hindi & Nepali lookup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Open GitHub Doc</span>
          </button>
        </div>
      </div>

      {/* File Dropzone */}
      <div className="mb-8">
        <FileDropzone />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-900 dark:text-zinc-100 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400 hidden sm:block mr-1" />
          {(['all', 'pdf', 'md', 'github'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTypeFilter(filter)}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                typeFilter === filter
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {filter === 'md' ? 'Markdown' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-gray-500 dark:text-zinc-400">
          Loading library...
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/30 p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-zinc-200 text-sm mb-1">
            {filterQuery ? 'No documents match your search' : 'Your reading library is empty'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
            Drag and drop a PDF textbook or import a GitHub repository documentation to start reading.
          </p>
          <button
            onClick={handleOpenSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Sample Technical Docs</span>
          </button>
        </div>
      )}

      {/* GitHub Import Modal */}
      <GitHubImportModal isOpen={isGitHubModalOpen} onClose={() => setIsGitHubModalOpen(false)} />
    </div>
  );
};
