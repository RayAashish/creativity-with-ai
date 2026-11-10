import React from 'react';
import { useReaderStore } from '../../stores/reader-store';
import { PdfViewer } from './pdf/PdfViewer';
import { MarkdownViewer } from './markdown/MarkdownViewer';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ReaderView: React.FC = () => {
  const { activeDocument, isLoading, error, closeDocument } = useReaderStore();

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-medium">Opening document...</p>
      </div>
    );
  }

  if (error || !activeDocument) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-6">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-base mb-1">
          Unable to open document
        </h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md text-center mb-6">
          {error || 'The requested document could not be found or read.'}
        </p>
        <button
          onClick={closeDocument}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>
      </div>
    );
  }

  return activeDocument.type === 'pdf' ? <PdfViewer /> : <MarkdownViewer />;
};
