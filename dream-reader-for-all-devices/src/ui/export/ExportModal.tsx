import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Database, Sparkles } from 'lucide-react';
import { useReaderStore } from '../../stores/reader-store';
import { useAnnotationStore } from '../../stores/annotation-store';
import { useVocabStore } from '../../stores/vocab-store';
import { exportService } from '../../reader-core/export/export-service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeDocument } = useReaderStore();
  const { annotations } = useAnnotationStore();
  const { vocabEntries } = useVocabStore();

  const [activeTab, setActiveTab] = useState<'md' | 'anki' | 'json'>('md');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeDocument) return null;

  const docVocab = vocabEntries.filter(
    (v) => !v.docId || v.docId === activeDocument.id
  );

  const markdownContent = exportService.generateMarkdownExport(
    activeDocument,
    annotations,
    docVocab
  );

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${activeDocument.title.replace(/[^\w\s-]/g, '').trim()}-notes.md`;
    exportService.downloadFile(markdownContent, filename, 'text/markdown;charset=utf-8');
  };

  const handleDownloadAnkiCsv = () => {
    const csvContent = exportService.generateAnkiCsv(docVocab, activeDocument.title);
    const filename = `${activeDocument.title.replace(/[^\w\s-]/g, '').trim()}-anki.csv`;
    exportService.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
  };

  const handleDownloadJson = () => {
    const jsonContent = exportService.generateJsonExport(
      activeDocument,
      annotations,
      docVocab
    );
    const filename = `${activeDocument.title.replace(/[^\w\s-]/g, '').trim()}-backup.json`;
    exportService.downloadFile(jsonContent, filename, 'application/json;charset=utf-8');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">
                Export Notes & Vocabulary
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {annotations.length} annotation(s) • {docVocab.length} vocabulary term(s)
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

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
          <button
            onClick={() => setActiveTab('md')}
            className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 font-medium text-xs transition-colors ${
              activeTab === 'md'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown (Obsidian / Notion)</span>
          </button>

          <button
            onClick={() => setActiveTab('anki')}
            className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 font-medium text-xs transition-colors ${
              activeTab === 'anki'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Anki CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 font-medium text-xs transition-colors ${
              activeTab === 'json'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>JSON Backup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'md' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                Exports all highlights, comments, and vocabulary terms formatted with YAML frontmatter,
                ready to drop into Obsidian, Notion, Logseq, or GitHub.
              </p>

              <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 max-h-48 overflow-y-auto font-mono text-[11px] text-gray-700 dark:text-zinc-300 leading-relaxed">
                <pre>{markdownContent.slice(0, 500)}...</pre>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'anki' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                Generates a flashcard deck CSV with UTF-8 BOM encoding for seamless Anki import,
                featuring word fronts and bilingual Hindi & Nepali senses on the back.
              </p>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                Ready to export <strong>{docVocab.length}</strong> vocabulary flashcards from this document.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleDownloadAnkiCsv}
                  disabled={docVocab.length === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Anki Deck (.csv)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                Full portable backup containing document data, text anchors, vector ink drawings,
                and vocabulary for synchronization and archiving.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
