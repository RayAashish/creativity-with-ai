import React, { useState } from 'react';
import { Github, Trash2, Clock, Check } from 'lucide-react';
import { DocumentRecord } from '../../types';
import { useReaderStore } from '../../stores/reader-store';
import { useLibraryStore } from '../../stores/library-store';

interface Props {
  document: DocumentRecord;
}

export const DocumentCard: React.FC<Props> = ({ document: doc }) => {
  const { openDocument } = useReaderStore();
  const { deleteDocument } = useLibraryStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPositionText = () => {
    if (!doc.lastPosition) return 'Unread';
    if (doc.lastPosition.type === 'pdf') {
      return `Page ${doc.lastPosition.page}`;
    }
    if (doc.lastPosition.type === 'md' && doc.lastPosition.scrollRatio) {
      return `${Math.round(doc.lastPosition.scrollRatio * 100)}% read`;
    }
    return 'In progress';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteDocument(doc.id);
  };

  return (
    <div
      onClick={() => openDocument(doc.id)}
      className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-md hover:border-amber-400/60 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                doc.type === 'pdf'
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60'
                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
              }`}
            >
              {doc.type.toUpperCase()}
            </span>

            {doc.source === 'github' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                <Github className="w-3 h-3" /> GitHub
              </span>
            )}
          </div>

          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete document'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white font-medium flex items-center gap-1 px-2'
                : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100'
            }`}
          >
            {confirmDelete ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Confirm</span>
              </>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        <h3 className="font-medium text-sm text-gray-900 dark:text-zinc-100 line-clamp-2 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {doc.title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-zinc-500 truncate mb-3">
          {doc.fileName}
        </p>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
        <span className="font-medium text-amber-600 dark:text-amber-400">
          {getPositionText()}
        </span>
        <div className="flex items-center gap-2 text-[11px]">
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};
