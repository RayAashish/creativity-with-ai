import React from 'react';
import {
  Palette,
  Layout,
  Type,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { PdfSettings, ThemeType, PageFormat, PageOrientation, MarginSize, FontSize, FontFamily } from '../types';

interface SettingsPanelProps {
  settings: PdfSettings;
  onSettingsChange: (settings: PdfSettings) => void;
  documentTitle: string;
  onTitleChange: (title: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  documentTitle,
  onTitleChange
}) => {
  const updateSetting = <K extends keyof PdfSettings>(key: K, value: PdfSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const themes: { id: ThemeType; label: string; desc: string }[] = [
    { id: 'github', label: 'GitHub Light', desc: 'Standard GitHub README styling' },
    { id: 'academic', label: 'Academic Paper', desc: 'Formal serif typography & centered headings' },
    { id: 'modern', label: 'Modern Tech', desc: 'Inter font with rounded card accents' },
    { id: 'minimal', label: 'Minimalist', desc: 'High-contrast clean monochrome editorial' },
    { id: 'executive', label: 'Executive Report', desc: 'Corporate deep navy headers & formal dividers' }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5 bg-[var(--bg-subtle)] text-[var(--text-primary)] font-mono space-y-5">
      {/* Document Title Header Input */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          Document Title / Header
        </label>
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. My Document"
          className="w-full text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none transition"
        />
      </div>

      {/* Theme Presets */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--text-primary)] mb-2">
          <Palette className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Document Theme</span>
        </div>
        <div className="space-y-1.5">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSetting('theme', t.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                settings.theme === t.id
                  ? 'bg-[var(--bg-card)] border-[var(--accent)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-secondary)]'
              }`}
            >
              <div>
                <p className="text-xs font-semibold">{t.label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{t.desc}</p>
              </div>
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 ${
                  settings.theme === t.id ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)]'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Page Layout Settings */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--text-primary)] mb-2">
          <Layout className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Page Geometry</span>
        </div>
        <div className="space-y-3 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-subtle)]">
          {/* Format */}
          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Paper Size</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['A4', 'Letter', 'Legal'] as PageFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => updateSetting('format', fmt)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    settings.format === fmt
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Orientation</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['portrait', 'landscape'] as PageOrientation[]).map((orient) => (
                <button
                  key={orient}
                  onClick={() => updateSetting('orientation', orient)}
                  className={`py-1.5 text-xs font-semibold capitalize rounded-lg border transition ${
                    settings.orientation === orient
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {orient}
                </button>
              ))}
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Margins</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['compact', 'standard', 'generous'] as MarginSize[]).map((m) => (
                <button
                  key={m}
                  onClick={() => updateSetting('margin', m)}
                  className={`py-1.5 text-xs font-semibold capitalize rounded-lg border transition ${
                    settings.margin === m
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Typography Settings */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--text-primary)] mb-2">
          <Type className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Typography</span>
        </div>
        <div className="space-y-3 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-subtle)]">
          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Font Family</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['sans', 'serif', 'mono'] as FontFamily[]).map((fam) => (
                <button
                  key={fam}
                  onClick={() => updateSetting('fontFamily', fam)}
                  className={`py-1.5 text-xs font-semibold capitalize rounded-lg border transition ${
                    settings.fontFamily === fam
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {fam}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Base Font Size</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['small', 'normal', 'large'] as FontSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSetting('fontSize', sz)}
                  className={`py-1.5 text-xs font-semibold capitalize rounded-lg border transition ${
                    settings.fontSize === sz
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Extras & Headers/Footers */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--text-primary)] mb-2">
          <FileCheck className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Document Extras</span>
        </div>
        <div className="space-y-2 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-subtle)]">
          <label className="flex items-center justify-between text-xs text-[var(--text-primary)] cursor-pointer">
            <span>Include Table of Contents</span>
            <input
              type="checkbox"
              checked={settings.showToc}
              onChange={(e) => updateSetting('showToc', e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] focus:ring-0 bg-[var(--bg-subtle)] border-[var(--border-subtle)]"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[var(--text-primary)] cursor-pointer">
            <span>Show Page Numbers</span>
            <input
              type="checkbox"
              checked={settings.showPageNumbers}
              onChange={(e) => updateSetting('showPageNumbers', e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] focus:ring-0 bg-[var(--bg-subtle)] border-[var(--border-subtle)]"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[var(--text-primary)] cursor-pointer">
            <span>Show Header</span>
            <input
              type="checkbox"
              checked={settings.showHeader}
              onChange={(e) => updateSetting('showHeader', e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] focus:ring-0 bg-[var(--bg-subtle)] border-[var(--border-subtle)]"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
