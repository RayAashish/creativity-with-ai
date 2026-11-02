import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { useReaderStore } from '../../../stores/reader-store';
import { useSettingsStore } from '../../../stores/settings-store';
import { MarkdownToolbar } from './MarkdownToolbar';
import { CodeBlock } from './CodeBlock';
import { resolveMarkdownImageSrc } from '../../../reader-core/markdown/github-resolver';
import { slugifyHeading } from '../../../reader-core/markdown/markdown-parser';
import { getSelectionDetails } from '../../../reader-core/selection-handler';
import { useLookupStore } from '../../../stores/lookup-store';
import { AnnotationSidebarList } from '../AnnotationSidebarList';
import { BilingualPane } from '../BilingualPane';
import { ReadAloudBar } from '../ReadAloudBar';
import { insightsService } from '../../../services/insights-service';
import { X, BookOpen } from 'lucide-react';

export const MarkdownViewer: React.FC = () => {
  const {
    documentContent,
    activeDocument,
    outline,
    isZenMode,
    isSidebarOpen,
    sidebarTab,
    setSidebarOpen,
    saveMarkdownScroll,
  } = useReaderStore();

  const { triggerLookup } = useLookupStore();
  const { settings } = useSettingsStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isBilingualOpen, setIsBilingualOpen] = useState(false);
  const [isReadAloudOpen, setIsReadAloudOpen] = useState(false);

  // Track active reading time (15 seconds increment)
  useEffect(() => {
    const timer = setInterval(() => {
      insightsService.recordReadingSeconds(15);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectionCheck = () => {
    setTimeout(() => {
      const details = getSelectionDetails();
      if (details && details.text.trim()) {
        triggerLookup(details);
      }
    }, 40);
  };

  // Listen to mobile / tablet selectionchange
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleSelectionChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
          const details = getSelectionDetails();
          if (details && details.text.trim()) {
            triggerLookup(details);
          }
        }
      }, 250);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [triggerLookup]);

  // Restore scroll position
  useEffect(() => {
    if (activeDocument?.lastPosition?.type === 'md' && activeDocument.lastPosition.scrollRatio) {
      const container = scrollContainerRef.current;
      if (container) {
        const timer = setTimeout(() => {
          const maxScroll = container.scrollHeight - container.clientHeight;
          container.scrollTop = maxScroll * (activeDocument.lastPosition as { scrollRatio: number }).scrollRatio;
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [activeDocument]);

  // Track scroll position debounced
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0) {
      const ratio = container.scrollTop / maxScroll;
      saveMarkdownScroll(ratio);
    }
  };

  const jumpToHeading = (slug?: string) => {
    if (!slug) return;
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fontClass =
    settings.fontFamily === 'serif'
      ? 'font-[Merriweather,serif]'
      : settings.fontFamily === 'mono'
      ? 'font-[Fira_Code,monospace]'
      : 'font-[Inter,sans-serif]';

  const sizeClass =
    settings.fontSize === 'sm'
      ? 'text-sm leading-relaxed'
      : settings.fontSize === 'lg'
      ? 'text-lg leading-loose'
      : settings.fontSize === 'xl'
      ? 'text-xl leading-loose'
      : 'text-base leading-relaxed';

  const rawMarkdown = typeof documentContent === 'string' ? documentContent : '';

  // Sanitize schema allowing code highlighting classnames and ids
  const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [...(defaultSchema.attributes?.code || []), ['className', /^hljs-?/]],
      span: [...(defaultSchema.attributes?.span || []), ['className', /^hljs-?/]],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
    },
  };

  return (
    <div className={`flex flex-col ${isZenMode ? 'h-screen' : 'h-[calc(100vh-3.5rem)]'} overflow-hidden bg-white dark:bg-zinc-950`}>
      <MarkdownToolbar
        onToggleBilingual={() => setIsBilingualOpen(!isBilingualOpen)}
        isBilingualOpen={isBilingualOpen}
        onToggleReadAloud={() => setIsReadAloudOpen(!isReadAloudOpen)}
        isReadAloudOpen={isReadAloudOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 sm:w-80 h-full border-r border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex flex-col z-20 shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {sidebarTab === 'annotations' ? 'Document Notes' : 'Table of Contents'}
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {sidebarTab === 'annotations' ? (
                <AnnotationSidebarList />
              ) : outline.length > 0 ? (
                <div className="space-y-1">
                  {outline.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => jumpToHeading(item.slug)}
                      className="w-full text-left py-1.5 px-2 rounded-lg text-xs text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors truncate"
                      style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                      title={item.title}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>No headings found in this document.</span>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Markdown Content Canvas */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseUp={handleSelectionCheck}
          onPointerUp={handleSelectionCheck}
          onTouchEnd={handleSelectionCheck}
          className="flex-1 overflow-y-auto px-6 py-10 flex justify-center selection:bg-amber-200 selection:text-amber-900"
        >
          <article className={`max-w-3xl w-full select-text prose prose-zinc dark:prose-invert ${fontClass} ${sizeClass}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight]}
              components={{
                h1: ({ children }) => {
                  const title = String(children);
                  const id = slugifyHeading(title);
                  return (
                    <h1 id={id} className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-4 border-b border-gray-200 dark:border-zinc-800 pb-2">
                      {children}
                    </h1>
                  );
                },
                h2: ({ children }) => {
                  const title = String(children);
                  const id = slugifyHeading(title);
                  return (
                    <h2 id={id} className="text-xl sm:text-2xl font-bold tracking-tight mt-6 mb-3 border-b border-gray-100 dark:border-zinc-800/60 pb-1.5">
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const title = String(children);
                  const id = slugifyHeading(title);
                  return (
                    <h3 id={id} className="text-lg font-semibold mt-4 mb-2">
                      {children}
                    </h3>
                  );
                },
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const isInline = !match && !codeString.includes('\n');

                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded font-mono text-[0.9em] bg-gray-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 border border-gray-200/60 dark:border-zinc-700/60" {...props}>
                        {children}
                      </code>
                    );
                  }

                  return (
                    <CodeBlock
                      language={match ? match[1] : undefined}
                      value={codeString}
                    />
                  );
                },
                img: ({ src, alt }) => {
                  const gh = activeDocument?.metadata?.github;
                  const resolved = resolveMarkdownImageSrc(src, gh);
                  return (
                    <img
                      src={resolved}
                      alt={alt || ''}
                      className="rounded-xl border border-gray-200 dark:border-zinc-800 my-4 max-w-full h-auto shadow-xs"
                      loading="lazy"
                    />
                  );
                },
                a: ({ href, children }) => {
                  const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
                  return (
                    <a
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-amber-600 dark:text-amber-400 underline font-medium hover:text-amber-700 transition-colors"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {rawMarkdown}
            </ReactMarkdown>
          </article>
        </div>

        {/* Parallel Bilingual Pane */}
        <BilingualPane
          isOpen={isBilingualOpen}
          onClose={() => setIsBilingualOpen(false)}
          pageOrSectionText={rawMarkdown}
        />
      </div>

      {/* Floating Read-Aloud Audio Player */}
      <ReadAloudBar
        isOpen={isReadAloudOpen}
        onClose={() => setIsReadAloudOpen(false)}
        fullText={rawMarkdown}
      />
    </div>
  );
};
