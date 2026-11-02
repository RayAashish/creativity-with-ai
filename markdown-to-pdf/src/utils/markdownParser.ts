import { Marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';
import mermaid from 'mermaid';
import { HeadingItem } from '../types';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif'
});

/**
 * Creates clean slug for heading IDs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Extracts headings from raw markdown for Table of Contents
 */
export function extractHeadings(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim().replace(/[*_`]/g, '');
      const id = slugify(rawText);
      headings.push({ id, level, text: rawText });
    }
  }

  return headings;
}

/**
 * Processes GitHub callouts: > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
 */
function processCallouts(markdown: string): string {
  const alertRegex = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*(?:\n|$))*)/gim;

  return markdown.replace(alertRegex, (_match, type, content) => {
    const cleanType = type.toUpperCase();
    const cleanContent = content
      .split('\n')
      .map((line: string) => line.replace(/^>\s?/, ''))
      .join('\n')
      .trim();

    return `<div class="callout callout-${cleanType.toLowerCase()}">
  <div class="callout-header">
    <span class="callout-indicator"></span>
    <span class="callout-title">${cleanType}</span>
  </div>
  <div class="callout-body">

${cleanContent}

  </div>
</div>\n\n`;
  });
}

const marked = new Marked({
  gfm: true,
  breaks: false
});

marked.use({
  renderer: {
    heading(this: any, token: any): string {
      const text: string = token.text || '';
      const cleanText = text.replace(/<[^>]+>/g, '');
      const id = slugify(cleanText);
      const parsedText = token.tokens ? this.parser.parseInline(token.tokens) : text;
      return `<h${token.depth} id="${id}" class="heading-anchor-group">
        <span class="heading-text">${parsedText}</span>
        <a href="#${id}" class="heading-anchor" aria-hidden="true">#</a>
      </h${token.depth}>`;
    },

    code(this: any, token: any): string {
      const language = (token.lang || '').trim().toLowerCase();
      let highlightedCode = '';

      if (language && hljs.getLanguage(language)) {
        try {
          highlightedCode = hljs.highlight(token.text, { language, ignoreIllegals: true }).value;
        } catch {
          highlightedCode = hljs.highlightAuto(token.text).value;
        }
      } else {
        try {
          highlightedCode = hljs.highlightAuto(token.text).value;
        } catch {
          highlightedCode = token.text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        }
      }

      const displayLang = language || 'code';

      return `<div class="code-block-wrapper">
  <div class="code-block-header">
    <span class="code-lang-badge">${displayLang}</span>
  </div>
  <pre><code class="hljs language-${language}">${highlightedCode}</code></pre>
</div>`;
    }
  }
});

/**
 * Parses markdown to rich HTML with KaTeX, syntax highlighting, and mermaid placeholders
 */
export async function parseMarkdownToHtml(markdown: string): Promise<{ html: string; headings: HeadingItem[] }> {
  const headings = extractHeadings(markdown);

  // 1. Math placeholders to prevent markdown mangling
  // Use strictly alphanumeric tokens with NO underscores so marked parser does not turn them into <em> or <strong>
  const mathPlaceholders: { id: string; math: string; display: boolean }[] = [];
  let placeholderCounter = 0;

  // Protect block math: $$ ... $$
  let protectedMarkdown = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (_match, math) => {
    const id = `KATEXBLOCKTOKEN${placeholderCounter++}ENDTOKEN`;
    mathPlaceholders.push({ id, math: math.trim(), display: true });
    return `\n\n${id}\n\n`;
  });

  // Protect inline math: $ ... $
  protectedMarkdown = protectedMarkdown.replace(/(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g, (_match, math) => {
    const id = `KATEXINLINETOKEN${placeholderCounter++}ENDTOKEN`;
    mathPlaceholders.push({ id, math: math.trim(), display: false });
    return id;
  });

  // 2. Process GitHub Callouts
  protectedMarkdown = processCallouts(protectedMarkdown);

  // 3. Process Mermaid Diagrams
  const mermaidPlaceholders: { id: string; code: string }[] = [];
  let mermaidCounter = 0;

  protectedMarkdown = protectedMarkdown.replace(/```mermaid\s*\n([\s\S]+?)```/g, (_match, code) => {
    const id = `mermaidchart${mermaidCounter++}${Math.random().toString(36).substring(2, 7)}`;
    mermaidPlaceholders.push({ id, code: code.trim() });
    return `\n\n<div class="mermaid-container" id="${id}-wrapper"><div class="mermaid-raw" data-id="${id}">${code.trim()}</div></div>\n\n`;
  });

  // Parse markdown to HTML
  let parsedHtml = await marked.parse(protectedMarkdown);

  // 4. Restore KaTeX math
  for (const item of mathPlaceholders) {
    try {
      const renderedMath = katex.renderToString(item.math, {
        displayMode: item.display,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
      const replacement = item.display
        ? `<div class="katex-display-wrapper">${renderedMath}</div>`
        : `<span class="katex-inline-wrapper">${renderedMath}</span>`;

      parsedHtml = parsedHtml.split(item.id).join(replacement);
    } catch (e) {
      console.error('KaTeX render error:', e);
      parsedHtml = parsedHtml.split(item.id).join(`<code class="math-error">${item.math}</code>`);
    }
  }

  // 5. Render Mermaid charts if running in browser
  if (typeof window !== 'undefined' && mermaidPlaceholders.length > 0) {
    for (const item of mermaidPlaceholders) {
      try {
        const { svg } = await mermaid.render(item.id, item.code);
        parsedHtml = parsedHtml.replace(
          `<div class="mermaid-raw" data-id="${item.id}">${item.code}</div>`,
          `<div class="mermaid-svg">${svg}</div>`
        );
      } catch (err) {
        console.warn('Mermaid render error for chart:', err);
        parsedHtml = parsedHtml.replace(
          `<div class="mermaid-raw" data-id="${item.id}">${item.code}</div>`,
          `<div class="mermaid-error"><p>Could not render diagram</p><pre><code>${item.code}</code></pre></div>`
        );
      }
    }
  }

  return { html: parsedHtml, headings };
}
