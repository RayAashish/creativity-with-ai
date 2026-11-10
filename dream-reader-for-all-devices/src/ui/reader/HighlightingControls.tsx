import React, { useState } from 'react';
import { Highlighter, Underline, Strikethrough, MessageSquare, Send, Check } from 'lucide-react';
import { useAnnotationStore, HIGHLIGHT_COLORS } from '../../stores/annotation-store';
import { Anchor } from '../../types';

interface Props {
  docId: string;
  anchor?: Anchor;
  onAnnotated?: () => void;
}

export const HighlightingControls: React.FC<Props> = ({ docId, anchor, onAnnotated }) => {
  const {
    selectedColor,
    setSelectedColor,
    createHighlight,
    createComment,
  } = useAnnotationStore();

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (!anchor) return null;

  const handleAction = async (kind: 'highlight' | 'underline' | 'strikethrough') => {
    await createHighlight(docId, anchor, selectedColor, kind);
    setLastAction(kind);
    setTimeout(() => {
      setLastAction(null);
      if (onAnnotated) onAnnotated();
    }, 800);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    await createComment(docId, anchor, noteText, selectedColor);
    setNoteText('');
    setShowNoteInput(false);
    setLastAction('comment');
    setTimeout(() => {
      setLastAction(null);
      if (onAnnotated) onAnnotated();
    }, 800);
  };

  return (
    <div className="py-2 px-1 border-b border-gray-100 dark:border-zinc-800 space-y-2">
      <div className="flex items-center justify-between gap-2">
        {/* Color Palette (5 colors) */}
        <div className="flex items-center gap-1.5">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setSelectedColor(c.hex)}
              title={c.name}
              style={{ backgroundColor: c.hex }}
              className={`w-4 h-4 rounded-full border transition-transform ${
                selectedColor === c.hex
                  ? 'scale-125 ring-2 ring-gray-400 dark:ring-zinc-500 border-white'
                  : 'border-black/10 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAction('highlight')}
            title="Highlight selection"
            className="p-1 rounded text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            {lastAction === 'highlight' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Highlighter className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => handleAction('underline')}
            title="Underline selection"
            className="p-1 rounded text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            {lastAction === 'underline' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Underline className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => handleAction('strikethrough')}
            title="Strikethrough selection"
            className="p-1 rounded text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            {lastAction === 'strikethrough' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Strikethrough className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            title="Attach a comment or note"
            className={`p-1 rounded transition-colors ${
              showNoteInput
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                : 'text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note input field */}
      {showNoteInput && (
        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            placeholder="Add note to selection..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
            autoFocus
            className="flex-1 px-2.5 py-1 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-gray-400"
          />
          <button
            onClick={handleSaveNote}
            disabled={!noteText.trim()}
            className="p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg shadow-2xs"
            title="Save note"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
