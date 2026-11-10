import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useLibraryStore } from '../../stores/library-store';
import { useReaderStore } from '../../stores/reader-store';

export const FileDropzone: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFile, isImporting } = useLibraryStore();
  const { openDocument } = useReaderStore();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const doc = await importFile(file);
      await openDocument(doc.id);
    } catch (err) {
      console.error('File import error:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragOver
          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 scale-[1.01]'
          : 'border-gray-200 dark:border-zinc-800 hover:border-amber-400/80 dark:hover:border-zinc-700 bg-white/60 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.markdown,text/markdown,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
            isDragOver
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-amber-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isImporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm mb-1">
          {isImporting ? 'Importing file...' : 'Drop your technical PDF or Markdown file here'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
          Supports PDF research papers, textbooks, and Markdown files
        </p>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
            <FileText className="w-3 h-3 text-red-500" /> PDF
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
            <FileText className="w-3 h-3 text-blue-500" /> Markdown (.md)
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-1">Browse files →</span>
        </div>
      </div>
    </div>
  );
};
