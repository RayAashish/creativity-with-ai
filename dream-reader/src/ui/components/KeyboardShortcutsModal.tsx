import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'j / ↓ / Space', desc: 'Next page / scroll down' },
    { key: 'k / ↑', desc: 'Previous page / scroll up' },
    { key: '+ / -', desc: 'Zoom in / Zoom out' },
    { key: '0', desc: 'Reset zoom to 100%' },
    { key: 'f', desc: 'Toggle Fit Width / Fit Page' },
    { key: 't', desc: 'Cycle Theme (Light → Sepia → Dark)' },
    { key: 'b', desc: 'Toggle Navigation Sidebar' },
    { key: 'Cmd/Ctrl + F', desc: 'Search text inside document' },
    { key: 'Esc', desc: 'Dismiss popup / close sidebar' },
    { key: '?', desc: 'Show this keyboard shortcuts cheat-sheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
          {shortcuts.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-zinc-800/50 last:border-0">
              <span className="text-sm text-gray-600 dark:text-zinc-400">{item.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-medium text-gray-800 dark:text-zinc-200 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-gray-50 dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 text-xs text-center text-gray-500 dark:text-zinc-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 font-mono">Esc</kbd> to close anytime
        </div>
      </div>
    </div>
  );
};
