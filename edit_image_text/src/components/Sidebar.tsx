import React, { useState } from 'react';
import { 
  Type, 
  Layers, 
  Search, 
  Wand2, 
  Globe, 
  Sliders, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Plus, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Sparkles, 
  ChevronUp, 
  ChevronDown,
  Palette,
  ShieldCheck,
  Check
} from 'lucide-react';
import { TextBlock, StylePreset } from '../types';
import { AVAILABLE_FONTS, STYLE_PRESETS, COLOR_PALETTE } from '../utils/constants';
import { translateTextBlocks } from '../utils/aiAssistant';

interface SidebarProps {
  textBlocks: TextBlock[];
  setTextBlocks: React.Dispatch<React.SetStateAction<TextBlock[]>>;
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  onScanImage: () => void;
  geminiApiKey: string;
  recordHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  textBlocks,
  setTextBlocks,
  activeBlockId,
  setActiveBlockId,
  onScanImage,
  geminiApiKey,
  recordHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'layers' | 'replace' | 'presets' | 'ai'>('text');
  
  // Find & Replace state
  const [findText, setFindText] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [replaceMessage, setReplaceMessage] = useState<string | null>(null);

  // Layers search state
  const [layersSearch, setLayersSearch] = useState('');

  // AI translation state
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  const activeBlock = textBlocks.find((b) => b.id === activeBlockId) || null;

  // Helper to update active block
  const updateActiveBlock = (updates: Partial<TextBlock>) => {
    if (!activeBlockId) return;
    recordHistory();
    setTextBlocks((prev) =>
      prev.map((b) => (b.id === activeBlockId ? { ...b, ...updates, isEdited: true } : b))
    );
  };

  // Helper to update specific block by ID
  const updateBlockById = (id: string, updates: Partial<TextBlock>) => {
    recordHistory();
    setTextBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, isEdited: true } : b))
    );
  };

  // Delete block
  const deleteBlock = (id: string) => {
    recordHistory();
    setTextBlocks((prev) => prev.filter((b) => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  // Move layer order
  const moveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= textBlocks.length) return;
    recordHistory();
    const updated = [...textBlocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setTextBlocks(updated);
  };

  // Find & Replace Handler
  const handleReplaceAll = () => {
    if (!findText.trim()) return;
    recordHistory();
    let count = 0;
    setTextBlocks((prev) =>
      prev.map((b) => {
        const regex = new RegExp(
          findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          matchCase ? 'g' : 'gi'
        );
        if (regex.test(b.text)) {
          count++;
          return {
            ...b,
            text: b.text.replace(regex, replaceWith),
            isEdited: true,
          };
        }
        return b;
      })
    );
    setReplaceMessage(`Replaced ${count} occurrence${count === 1 ? '' : 's'}!`);
    setTimeout(() => setReplaceMessage(null), 3500);
  };

  // Apply Preset
  const handleApplyPreset = (preset: StylePreset) => {
    if (!activeBlock) return;
    recordHistory();
    updateActiveBlock(preset.styles);
  };

  // Translate all blocks
  const handleTranslateAll = async () => {
    setIsTranslating(true);
    try {
      recordHistory();
      const updated = await translateTextBlocks(textBlocks, targetLang, geminiApiKey);
      setTextBlocks(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Filtered layers for layers tab
  const filteredBlocks = textBlocks.filter((b) =>
    layersSearch ? b.text.toLowerCase().includes(layersSearch.toLowerCase()) : true
  );

  return (
    <aside className="w-80 md:w-88 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col z-20 select-none">
      {/* Sidebar Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg flex flex-col items-center justify-center transition-all ${
            activeTab === 'text'
              ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
          title="Typography & Background Patch"
        >
          <Type className="w-4 h-4 mb-0.5" />
          <span>Style</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg flex flex-col items-center justify-center transition-all ${
            activeTab === 'layers'
              ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
          title="All Detected & Added Layers"
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Layers ({textBlocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg flex flex-col items-center justify-center transition-all ${
            activeTab === 'presets'
              ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
          title="1-Click Styling Presets"
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>Presets</span>
        </button>

        <button
          onClick={() => setActiveTab('replace')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg flex flex-col items-center justify-center transition-all ${
            activeTab === 'replace'
              ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
          title="Find & Replace Text"
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>Replace</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg flex flex-col items-center justify-center transition-all ${
            activeTab === 'ai'
              ? 'bg-slate-800 text-indigo-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
          title="AI Translation & Tools"
        >
          <Globe className="w-4 h-4 mb-0.5" />
          <span>AI &amp; Lang</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: TEXT & STYLE */}
        {activeTab === 'text' && (
          <>
            {activeBlock ? (
              <div className="space-y-5">
                {/* Text Content Editor */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Edit Text Content</span>
                    {activeBlock.confidence && (
                      <span className="text-[10px] text-slate-500 font-normal">
                        OCR Conf: {activeBlock.confidence}%
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    value={activeBlock.text}
                    onChange={(e) => updateActiveBlock({ text: e.target.value })}
                    placeholder="Enter text..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                  />
                  {activeBlock.originalText && activeBlock.text !== activeBlock.originalText && (
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span className="truncate max-w-[190px]">Original: "{activeBlock.originalText}"</span>
                      <button
                        onClick={() => updateActiveBlock({ text: activeBlock.originalText })}
                        className="text-indigo-400 hover:text-indigo-300 text-[10px] underline"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Font Family
                  </label>
                  <select
                    value={activeBlock.fontFamily}
                    onChange={(e) => updateActiveBlock({ fontFamily: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {AVAILABLE_FONTS.map((font) => (
                      <option key={font.name} value={font.family}>
                        {font.name} ({font.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Font Size ({activeBlock.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="140"
                      value={activeBlock.fontSize}
                      onChange={(e) =>
                        updateActiveBlock({
                          fontSize: Number(e.target.value),
                          height: Math.max(16, Number(e.target.value) * 1.25),
                        })
                      }
                      className="w-full h-1.5 accent-indigo-500 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Weight
                    </label>
                    <select
                      value={activeBlock.fontWeight}
                      onChange={(e) => updateActiveBlock({ fontWeight: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                </div>

                {/* Alignment, Italic, Uppercase */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Formatting
                  </label>
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => updateActiveBlock({ textAlign: 'left' })}
                      className={`flex-1 py-1 rounded text-xs flex justify-center ${
                        activeBlock.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateActiveBlock({ textAlign: 'center' })}
                      className={`flex-1 py-1 rounded text-xs flex justify-center ${
                        activeBlock.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateActiveBlock({ textAlign: 'right' })}
                      className={`flex-1 py-1 rounded text-xs flex justify-center ${
                        activeBlock.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-800" />
                    <button
                      onClick={() =>
                        updateActiveBlock({
                          fontStyle: activeBlock.fontStyle === 'italic' ? 'normal' : 'italic',
                        })
                      }
                      className={`flex-1 py-1 rounded text-xs flex justify-center ${
                        activeBlock.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateActiveBlock({ isUpperCase: !activeBlock.isUpperCase })}
                      className={`flex-1 py-1 rounded text-xs font-bold flex justify-center ${
                        activeBlock.isUpperCase ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Toggle ALL CAPS"
                    >
                      AA
                    </button>
                  </div>
                </div>

                {/* Text Color & Palette */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Text Color</label>
                    <span className="font-mono text-xs text-slate-400">{activeBlock.color}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={activeBlock.color}
                      onChange={(e) => updateActiveBlock({ color: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {COLOR_PALETTE.slice(0, 10).map((c) => (
                        <button
                          key={c}
                          onClick={() => updateActiveBlock({ color: c })}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded border transition-transform ${
                            activeBlock.color.toLowerCase() === c.toLowerCase()
                              ? 'scale-110 border-indigo-400 ring-1 ring-indigo-400'
                              : 'border-slate-700/60 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Stroke / Meme Outline */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Outline / Stroke ({activeBlock.strokeWidth}px)
                    </label>
                    <input
                      type="color"
                      value={activeBlock.strokeColor || '#000000'}
                      onChange={(e) => updateActiveBlock({ strokeColor: e.target.value })}
                      className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={activeBlock.strokeWidth || 0}
                    onChange={(e) => updateActiveBlock({ strokeWidth: Number(e.target.value) })}
                    className="w-full h-1.5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                {/* Text Shadow */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Text Shadow Blur ({activeBlock.shadowBlur}px)
                    </label>
                    <input
                      type="color"
                      value={activeBlock.shadowColor !== 'transparent' ? activeBlock.shadowColor : '#000000'}
                      onChange={(e) => updateActiveBlock({ shadowColor: e.target.value })}
                      className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={activeBlock.shadowBlur || 0}
                    onChange={(e) =>
                      updateActiveBlock({
                        shadowBlur: Number(e.target.value),
                        shadowColor: Number(e.target.value) > 0 ? activeBlock.shadowColor || 'rgba(0,0,0,0.8)' : 'transparent',
                      })
                    }
                    className="w-full h-1.5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                {/* MAGIC BACKGROUND ERASE / INPAINT PATCH */}
                <div className="p-3.5 rounded-xl bg-gradient-to-b from-indigo-950/30 to-slate-950 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Wand2 className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">Smart Background Erase</span>
                    </div>
                    <select
                      value={activeBlock.patchType}
                      onChange={(e) => updateActiveBlock({ patchType: e.target.value as any })}
                      className="bg-slate-900 border border-indigo-500/30 text-indigo-200 text-xs rounded-md px-2 py-0.5"
                    >
                      <option value="auto-solid">Solid Match</option>
                      <option value="custom">Custom Color</option>
                      <option value="none">Disabled (Overlay)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Seamlessly covers the original text on the image with the sampled background color.
                  </p>

                  {activeBlock.patchType !== 'none' && (
                    <>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-300">Patch Color</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-slate-400">{activeBlock.patchColor}</span>
                          <input
                            type="color"
                            value={activeBlock.patchColor}
                            onChange={(e) => updateActiveBlock({ patchColor: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-700 bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Patch Padding</span>
                          <span>{activeBlock.patchPadding}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={activeBlock.patchPadding}
                          onChange={(e) => updateActiveBlock({ patchPadding: Number(e.target.value) })}
                          className="w-full h-1.5 accent-indigo-500 rounded cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Edge Feather / Softness</span>
                          <span>{activeBlock.patchFeather}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={activeBlock.patchFeather}
                          onChange={(e) => updateActiveBlock({ patchFeather: Number(e.target.value) })}
                          className="w-full h-1.5 accent-indigo-500 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <Type className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300 mb-1">No Text Selected</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                  Click any detected text box directly on the image, or choose one from the Layers tab to customize.
                </p>
                <button
                  onClick={() => {
                    if (textBlocks.length > 0) {
                      setActiveBlockId(textBlocks[0].id);
                    }
                  }}
                  disabled={textBlocks.length === 0}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-colors disabled:opacity-40"
                >
                  Select First Block
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB 2: LAYERS */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search layers..."
                  value={layersSearch}
                  onChange={(e) => setLayersSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={onScanImage}
                title="Rescan Image OCR"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </button>
            </div>

            {/* List of text blocks */}
            <div className="space-y-1.5">
              {filteredBlocks.map((b, idx) => {
                const isSelected = b.id === activeBlockId;
                return (
                  <div
                    key={b.id}
                    onClick={() => setActiveBlockId(b.id)}
                    className={`group p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden flex-1 mr-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                      <div className="overflow-hidden">
                        <p className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'text-slate-300'}`}>
                          {b.text || '<Empty>'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {b.fontFamily.split(',')[0].replace(/['"]/g, '')} • {b.fontSize}px
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateBlockById(b.id, { isVisible: !b.isVisible });
                        }}
                        className="p-1 text-slate-500 hover:text-slate-300"
                        title={b.isVisible ? 'Hide' : 'Show'}
                      >
                        {b.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateBlockById(b.id, { isLocked: !b.isLocked });
                        }}
                        className="p-1 text-slate-500 hover:text-slate-300"
                        title={b.isLocked ? 'Unlock' : 'Lock'}
                      >
                        {b.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(b.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredBlocks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  {textBlocks.length === 0
                    ? 'No text detected yet. Click "Scan Text" above or upload an image.'
                    : 'No matching layers found.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FIND & REPLACE */}
        {activeTab === 'replace' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Find Text
              </label>
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="e.g. 2024, Coffee, Sale..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Replace With
              </label>
              <input
                type="text"
                value={replaceWith}
                onChange={(e) => setReplaceWith(e.target.value)}
                placeholder="e.g. 2026, Latte, Discount..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Match case</span>
            </label>

            <button
              onClick={handleReplaceAll}
              disabled={!findText.trim()}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Replace All Across Image
            </button>

            {replaceMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{replaceMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-2">
              Select a text block on canvas and apply any typography preset with one click:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  disabled={!activeBlock}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeBlock
                      ? 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/80 hover:bg-slate-850 cursor-pointer'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{preset.name}</span>
                    <span className="text-[10px] text-slate-500">Preset</span>
                  </div>
                  <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 text-center my-1.5 ${preset.previewClass}`}>
                    Sample Text
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AI & TRANSLATION */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-tr from-indigo-950/40 to-slate-950 border border-indigo-500/20 space-y-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Translate Image Text</h4>
              </div>
              <p className="text-[11px] text-slate-400">
                Translate all detected text blocks in place while preserving fonts, colors, and layout positions.
              </p>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Target Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="it">Italian (Italiano)</option>
                  <option value="ja">Japanese (日本語)</option>
                  <option value="zh">Chinese (中文)</option>
                </select>
              </div>

              <button
                onClick={handleTranslateAll}
                disabled={isTranslating || textBlocks.length === 0}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isTranslating ? 'Translating...' : 'Translate All Text Blocks'}
              </button>
            </div>

            {/* Quick Case Transformations */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Quick Text Transform</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    recordHistory();
                    setTextBlocks((prev) =>
                      prev.map((b) => ({ ...b, text: b.text.toUpperCase(), isEdited: true }))
                    );
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center"
                >
                  ALL CAPS
                </button>
                <button
                  onClick={() => {
                    recordHistory();
                    setTextBlocks((prev) =>
                      prev.map((b) => ({ ...b, text: b.text.toLowerCase(), isEdited: true }))
                    );
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center"
                >
                  lowercase
                </button>
                <button
                  onClick={() => {
                    recordHistory();
                    setTextBlocks((prev) =>
                      prev.map((b) => ({
                        ...b,
                        text: b.text.replace(/\b\w/g, (c) => c.toUpperCase()),
                        isEdited: true,
                      }))
                    );
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center"
                >
                  Title Case
                </button>
                <button
                  onClick={() => {
                    recordHistory();
                    setTextBlocks((prev) =>
                      prev.map((b) => ({
                        ...b,
                        text: b.text.charAt(0).toUpperCase() + b.text.slice(1).toLowerCase(),
                        isEdited: true,
                      }))
                    );
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center"
                >
                  Sentence case
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
