import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Link2,
  Edit3,
  FileText,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Bold,
  Italic,
  Heading2,
  Quote,
  Code,
  Table as TableIcon,
  Sigma,
  GitBranch,
  ListCheck,
  Trash2,
  FolderTree
} from 'lucide-react';
import { InputMode } from '../types';
import { POPULAR_GITHUB_LINKS } from '../utils/githubUrlHelper';
import { GitHubExplorer } from './GitHubExplorer';

interface InputPanelProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  markdown: string;
  onMarkdownChange: (value: string) => void;
  onUrlFetch: (url: string) => Promise<void>;
  isFetchingUrl: boolean;
  fileName: string;
  onFileUpload: (file: File) => void;
  onSelectNote: (content: string, fileName: string, title: string, sourceUrl?: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  mode,
  onModeChange,
  markdown,
  onMarkdownChange,
  onUrlFetch,
  isFetchingUrl,
  fileName,
  onFileUpload,
  onSelectNote
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore editor scroll position
  useEffect(() => {
    const savedScroll = localStorage.getItem('markpdf_editor_scroll_top');
    if (savedScroll && textareaRef.current) {
      const top = parseFloat(savedScroll);
      if (!isNaN(top) && top > 0) {
        textareaRef.current.scrollTop = top;
      }
    }
  }, [markdown]);

  // File stats
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const lineCount = markdown ? markdown.split('\n').length : 0;
  const charCount = markdown.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  };

  // Handle URL fetch submit
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setUrlError(null);
    try {
      await onUrlFetch(urlInput.trim());
    } catch (err: any) {
      setUrlError(err.message || 'Failed to fetch markdown from URL.');
    }
  };

  const handleQuickLinkClick = async (url: string) => {
    setUrlInput(url);
    setUrlError(null);
    try {
      await onUrlFetch(url);
    } catch (err: any) {
      setUrlError(err.message || 'Failed to fetch markdown.');
    }
  };

  // Insert markdown snippet at cursor
  const insertSnippet = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newMarkdown = markdown.substring(0, start) + replacement + markdown.substring(end);
    onMarkdownChange(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-subtle)] text-[var(--text-primary)] font-mono">
      {/* Input Mode Tabs - DSASpace Style (Horizontally scrollable on narrow screens) */}
      <div className="flex items-center p-1.5 sm:p-2 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] gap-1 sm:gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onModeChange('editor')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-xl transition shrink-0 ${
            mode === 'editor'
              ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => onModeChange('github')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-xl transition shrink-0 ${
            mode === 'github'
              ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
          title="Browse GitHub Profile, Repositories & Folders"
        >
          <FolderTree className="w-3.5 h-3.5 text-sky-400" />
          <span>GitHub Explorer</span>
        </button>

        <button
          onClick={() => onModeChange('url')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-xl transition shrink-0 ${
            mode === 'url'
              ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>URL</span>
        </button>

        <button
          onClick={() => onModeChange('upload')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-xl transition shrink-0 ${
            mode === 'upload'
              ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* Tab: GitHub Explorer Mode */}
      {mode === 'github' && (
        <div className="flex-1 min-h-0 flex flex-col">
          <GitHubExplorer onSelectNote={onSelectNote} activeFileName={fileName} />
        </div>
      )}

      {/* Tab 1: Upload File Mode */}
      {mode === 'upload' && (
        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
              isDragOver
                ? 'border-[var(--accent)] bg-[var(--bg-card-hover)]'
                : 'border-[var(--border-strong)] hover:border-[var(--accent)] bg-[var(--bg-card)]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onFileUpload(e.target.files[0]);
                }
              }}
              accept=".md,.markdown,.txt,.mdown,.mkdn"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[var(--badge-bg)] text-[var(--text-primary)] flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)] text-xs">
                Drop your Markdown file here, or <span className="underline">browse</span>
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Supports .md, .markdown, .txt
              </p>
            </div>
          </div>

          {fileName && (
            <div className="mt-4 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <FileText className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{fileName}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {lineCount} lines • {wordCount} words
                  </p>
                </div>
              </div>
              <button
                onClick={() => onModeChange('editor')}
                className="text-xs font-medium px-2.5 py-1 bg-[var(--accent)] text-[var(--accent-contrast)] rounded-lg shrink-0"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: URL / GitHub Mode */}
      {mode === 'url' && (
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start overflow-y-auto space-y-4">
          <form onSubmit={handleUrlSubmit} className="space-y-2.5">
            <label className="block text-xs font-semibold text-[var(--text-primary)]">
              GitHub Repo, Gist, or Markdown URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. github.com/owner/repo/blob/main/README.md"
                className="flex-1 text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={isFetchingUrl || !urlInput.trim()}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] transition disabled:opacity-50 flex items-center space-x-1.5 shrink-0"
              >
                {isFetchingUrl ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>Fetch</span>
              </button>
            </div>
          </form>

          {urlError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{urlError}</span>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Popular Examples
            </p>
            <div className="space-y-1.5">
              {POPULAR_GITHUB_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleQuickLinkClick(link.url)}
                  disabled={isFetchingUrl}
                  className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {link.label}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{link.description}</p>
                  </div>
                  <GitBranch className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Markdown Editor Mode */}
      {mode === 'editor' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Format Toolbar (Horizontally scrollable single line on mobile & compact devices) */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => insertSnippet('**', '**', 'bold')}
              title="Bold"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('*', '*', 'italic')}
              title="Italic"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('## ', '', 'Heading')}
              title="Heading 2"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('> ', '', 'Quote')}
              title="Blockquote"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('```typescript\n', '\n```', '// code')}
              title="Code Block"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                insertSnippet('| Col 1 | Col 2 |\n| :--- | :--- |\n| Val 1 | Val 2 |\n')
              }
              title="Table"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('$$\n', '\n$$', 'E = mc^2')}
              title="Math Equation (KaTeX)"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <Sigma className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                insertSnippet('```mermaid\nflowchart TD\n  A[Start] --> B[Finish]\n```\n')
              }
              title="Mermaid Diagram"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition text-[11px] font-bold shrink-0"
            >
              Chart
            </button>
            <button
              onClick={() => insertSnippet('- [ ] ', '', 'Task')}
              title="Task item"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition shrink-0"
            >
              <ListCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('> [!NOTE]\n> ', '', 'Actionable note')}
              title="GitHub Alert"
              className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition shrink-0"
            >
              [!NOTE]
            </button>
            <div className="ml-auto shrink-0 pl-1">
              <button
                onClick={() => onMarkdownChange('')}
                title="Clear"
                className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea Editor */}
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => onMarkdownChange(e.target.value)}
            onScroll={(e) => {
              try {
                localStorage.setItem('markpdf_editor_scroll_top', String(e.currentTarget.scrollTop));
              } catch (_) {}
            }}
            placeholder="Type or paste Markdown here..."
            className="flex-1 w-full bg-[var(--bg-card)] text-[var(--text-primary)] p-4 text-xs font-mono resize-none focus:outline-none focus:ring-0 leading-relaxed selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]"
          />

          {/* Stats Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-page)] border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] shrink-0">
            <span>{fileName || 'Untitled.md'}</span>
            <div className="flex items-center space-x-3">
              <span>{charCount} chars</span>
              <span>{wordCount} words</span>
              <span>~{readingTime} min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
