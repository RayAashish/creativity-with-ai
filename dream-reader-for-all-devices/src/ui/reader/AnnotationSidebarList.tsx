import React, { useState } from 'react';
import {
  Highlighter,
  Underline,
  Strikethrough,
  MessageSquare,
  PenTool,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  Filter,
} from 'lucide-react';
import { useAnnotationStore } from '../../stores/annotation-store';
import { useReaderStore } from '../../stores/reader-store';
import { AnnotationKind } from '../../types';

export const AnnotationSidebarList: React.FC = () => {
  const { annotations, deleteAnnotation, updateComment, activeAnnotationId, setActiveAnnotationId } =
    useAnnotationStore();
  const { setCurrentPage } = useReaderStore();

  const [kindFilter, setKindFilter] = useState<'all' | AnnotationKind>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const filtered = annotations.filter((a) => {
    if (kindFilter === 'all') return true;
    return a.kind === kindFilter;
  });

  const jumpToAnnotation = (page?: number, id?: string) => {
    if (page) {
      setCurrentPage(page);
    }
    if (id) {
      setActiveAnnotationId(id);
      setTimeout(() => {
        const el = document.getElementById(`annotation-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  const handleStartEdit = (id: string, currentNote = '') => {
    setEditingId(id);
    setEditText(currentNote);
  };

  const handleSaveEdit = async (id: string) => {
    await updateComment(id, editText);
    setEditingId(null);
  };

  const getKindIcon = (kind: AnnotationKind) => {
    switch (kind) {
      case 'highlight':
        return <Highlighter className="w-3.5 h-3.5 text-amber-500" />;
      case 'underline':
        return <Underline className="w-3.5 h-3.5 text-blue-500" />;
      case 'strikethrough':
        return <Strikethrough className="w-3.5 h-3.5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-500" />;
      case 'ink':
        return <PenTool className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 text-xs">
      {/* Filter Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3 h-3 text-gray-400 shrink-0 mr-1" />
        {(['all', 'highlight', 'comment', 'ink', 'underline', 'strikethrough'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors ${
              kindFilter === k
                ? 'bg-amber-500 text-white font-medium shadow-2xs'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length > 0 ? (
          filtered.map((ann) => {
            const page = ann.anchor.type === 'pdf' ? ann.anchor.page : undefined;
            const isEditing = editingId === ann.id;
            const isSelected = activeAnnotationId === ann.id;

            return (
              <div
                key={ann.id}
                onClick={() => jumpToAnnotation(page, ann.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-400'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium">
                    {getKindIcon(ann.kind)}
                    <span className="capitalize text-[11px] text-gray-700 dark:text-zinc-300">
                      {ann.kind}
                    </span>
                    {page && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold px-1 rounded bg-amber-50 dark:bg-amber-950/50">
                        P. {page}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Color indicator */}
                    <span
                      style={{ backgroundColor: ann.color }}
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                    />

                    {/* Edit Note */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(ann.id, ann.noteText);
                      }}
                      title="Edit note"
                      className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(ann.id);
                      }}
                      title="Delete annotation"
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Quote */}
                {ann.anchor.textQuote && (
                  <p className="line-clamp-2 text-[11px] text-gray-600 dark:text-zinc-400 italic bg-gray-50 dark:bg-zinc-800/50 p-1.5 rounded">
                    "{ann.anchor.textQuote}"
                  </p>
                )}

                {/* Ink stroke summary */}
                {ann.strokes && ann.strokes.length > 0 && (
                  <p className="text-[11px] text-gray-500 italic">
                    Freehand ink ({ann.strokes.length} stroke{ann.strokes.length > 1 ? 's' : ''})
                  </p>
                )}

                {/* Note Text or Edit input */}
                {isEditing ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 pt-1"
                  >
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(ann.id)}
                      autoFocus
                      className="flex-1 px-2 py-0.5 text-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded"
                    />
                    <button
                      onClick={() => handleSaveEdit(ann.id)}
                      className="p-1 bg-amber-500 text-white rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  ann.noteText && (
                    <p className="text-gray-900 dark:text-zinc-100 font-medium text-[11px] pt-0.5">
                      {ann.noteText}
                    </p>
                  )
                )}

                {/* Deep Link URL */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-zinc-800/60">
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>#annotation-{ann.id.slice(0, 6)}</span>
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Highlighter className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <span>No annotations matching filter.</span>
          </div>
        )}
      </div>
    </div>
  );
};
