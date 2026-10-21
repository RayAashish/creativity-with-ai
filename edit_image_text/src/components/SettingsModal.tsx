import React, { useState } from 'react';
import { X, Key, Keyboard, HelpCircle, Check, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  geminiApiKey,
  setGeminiApiKey,
}) => {
  const [keyInput, setKeyInput] = useState(geminiApiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(keyInput.trim());
    localStorage.setItem('textmorph_gemini_key', keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const shortcuts = [
    { key: 'V', desc: 'Select & Move / Edit Text' },
    { key: 'T', desc: 'Add New Text Box' },
    { key: 'S', desc: 'Scan Specific Area (Box OCR)' },
    { key: 'B', desc: 'Touch-up Brush / Eraser' },
    { key: 'I', desc: 'Color Eyedropper' },
    { key: 'Space + Drag', desc: 'Pan Canvas' },
    { key: 'Double Click', desc: 'Inline Text Editing' },
    { key: 'Ctrl / Cmd + Z', desc: 'Undo' },
    { key: 'Ctrl / Cmd + Shift + Z', desc: 'Redo' },
    { key: 'Ctrl / Cmd + D', desc: 'Duplicate Selected Layer' },
    { key: 'Delete / Backspace', desc: 'Delete Selected Layer' },
    { key: 'Esc', desc: 'Deselect / Exit Editing' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <h3 className="text-base font-bold text-white">Settings &amp; Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* AI Settings Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Optional Gemini API Key</h4>
            </div>
            <p className="text-xs text-slate-400">
              The built-in WebAssembly OCR &amp; offline translations run 100% locally with zero setup. Adding a Gemini API key enables supercharged multimodal AI translations and grammar enhancement.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <span>Save</span>}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Your key is stored securely in your browser's localStorage.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>Get a free key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Keyboard Shortcuts Sheet */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-bold text-white">Keyboard Shortcuts</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {shortcuts.map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs"
                >
                  <span className="text-slate-400">{sc.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] shadow-sm">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
