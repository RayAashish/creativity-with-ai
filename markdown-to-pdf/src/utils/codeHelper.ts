/**
 * Code Helper: File detection, syntax highlighting language mapping, and document formatting
 */

export interface CodeLanguageInfo {
  name: string;
  langId: string;
  badge: string;
  color: string;
  category: 'code' | 'note' | 'config' | 'web' | 'data' | 'other';
}

const LANGUAGE_EXT_MAP: Record<string, CodeLanguageInfo> = {
  // Java & JVM
  java: { name: 'Java', langId: 'java', badge: 'JAVA', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', category: 'code' },
  kt: { name: 'Kotlin', langId: 'kotlin', badge: 'KT', color: 'text-violet-500 bg-violet-500/10 border-violet-500/30', category: 'code' },
  kts: { name: 'Kotlin Script', langId: 'kotlin', badge: 'KTS', color: 'text-violet-500 bg-violet-500/10 border-violet-500/30', category: 'code' },
  scala: { name: 'Scala', langId: 'scala', badge: 'SCALA', color: 'text-red-500 bg-red-500/10 border-red-500/30', category: 'code' },
  groovy: { name: 'Groovy', langId: 'groovy', badge: 'GROOVY', color: 'text-sky-500 bg-sky-500/10 border-sky-500/30', category: 'code' },
  gradle: { name: 'Gradle', langId: 'gradle', badge: 'GRADLE', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30', category: 'config' },

  // Python
  py: { name: 'Python', langId: 'python', badge: 'PY', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', category: 'code' },
  pyw: { name: 'Python GUI', langId: 'python', badge: 'PY', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', category: 'code' },
  ipynb: { name: 'Jupyter Notebook', langId: 'json', badge: 'IPYNB', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', category: 'code' },

  // JavaScript & TypeScript
  ts: { name: 'TypeScript', langId: 'typescript', badge: 'TS', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30', category: 'code' },
  tsx: { name: 'TypeScript React', langId: 'typescript', badge: 'TSX', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', category: 'code' },
  js: { name: 'JavaScript', langId: 'javascript', badge: 'JS', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', category: 'code' },
  jsx: { name: 'JavaScript React', langId: 'javascript', badge: 'JSX', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', category: 'code' },
  mjs: { name: 'JavaScript Module', langId: 'javascript', badge: 'MJS', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', category: 'code' },
  cjs: { name: 'CommonJS', langId: 'javascript', badge: 'CJS', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', category: 'code' },

  // Systems Languages
  c: { name: 'C', langId: 'c', badge: 'C', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', category: 'code' },
  h: { name: 'C Header', langId: 'c', badge: 'H', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', category: 'code' },
  cpp: { name: 'C++', langId: 'cpp', badge: 'C++', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', category: 'code' },
  cc: { name: 'C++', langId: 'cpp', badge: 'C++', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', category: 'code' },
  cxx: { name: 'C++', langId: 'cpp', badge: 'C++', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', category: 'code' },
  hpp: { name: 'C++ Header', langId: 'cpp', badge: 'HPP', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', category: 'code' },
  rs: { name: 'Rust', langId: 'rust', badge: 'RS', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30', category: 'code' },
  go: { name: 'Go', langId: 'go', badge: 'GO', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', category: 'code' },
  cs: { name: 'C#', langId: 'csharp', badge: 'C#', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', category: 'code' },
  swift: { name: 'Swift', langId: 'swift', badge: 'SWIFT', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30', category: 'code' },

  // Web & Styling
  html: { name: 'HTML', langId: 'html', badge: 'HTML', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', category: 'web' },
  htm: { name: 'HTML', langId: 'html', badge: 'HTML', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', category: 'web' },
  css: { name: 'CSS', langId: 'css', badge: 'CSS', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30', category: 'web' },
  scss: { name: 'SCSS', langId: 'scss', badge: 'SCSS', color: 'text-pink-500 bg-pink-500/10 border-pink-500/30', category: 'web' },
  sass: { name: 'SASS', langId: 'scss', badge: 'SASS', color: 'text-pink-500 bg-pink-500/10 border-pink-500/30', category: 'web' },
  less: { name: 'LESS', langId: 'less', badge: 'LESS', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', category: 'web' },
  vue: { name: 'Vue', langId: 'html', badge: 'VUE', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', category: 'web' },
  svelte: { name: 'Svelte', langId: 'html', badge: 'SVELTE', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30', category: 'web' },

  // Data, Config & DevOps
  json: { name: 'JSON', langId: 'json', badge: 'JSON', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', category: 'data' },
  yaml: { name: 'YAML', langId: 'yaml', badge: 'YAML', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', category: 'config' },
  yml: { name: 'YAML', langId: 'yaml', badge: 'YML', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', category: 'config' },
  xml: { name: 'XML', langId: 'xml', badge: 'XML', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', category: 'data' },
  toml: { name: 'TOML', langId: 'toml', badge: 'TOML', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', category: 'config' },
  ini: { name: 'INI', langId: 'ini', badge: 'INI', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', category: 'config' },
  env: { name: 'Env', langId: 'bash', badge: 'ENV', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', category: 'config' },
  properties: { name: 'Properties', langId: 'properties', badge: 'PROP', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', category: 'config' },
  sql: { name: 'SQL', langId: 'sql', badge: 'SQL', color: 'text-sky-500 bg-sky-500/10 border-sky-500/30', category: 'data' },
  sh: { name: 'Shell Script', langId: 'bash', badge: 'SH', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', category: 'code' },
  bash: { name: 'Bash', langId: 'bash', badge: 'BASH', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', category: 'code' },
  zsh: { name: 'Zsh', langId: 'bash', badge: 'ZSH', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', category: 'code' },
  dockerfile: { name: 'Dockerfile', langId: 'dockerfile', badge: 'DOCKER', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30', category: 'config' },

  // Markdown & Notes
  md: { name: 'Markdown', langId: 'markdown', badge: 'NOTE', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', category: 'note' },
  markdown: { name: 'Markdown', langId: 'markdown', badge: 'NOTE', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', category: 'note' },
  mdx: { name: 'MDX', langId: 'markdown', badge: 'MDX', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30', category: 'note' },
  txt: { name: 'Plain Text', langId: 'plaintext', badge: 'TXT', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', category: 'note' },

  // Others
  rb: { name: 'Ruby', langId: 'ruby', badge: 'RB', color: 'text-red-500 bg-red-500/10 border-red-500/30', category: 'code' },
  php: { name: 'PHP', langId: 'php', badge: 'PHP', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', category: 'code' },
  lua: { name: 'Lua', langId: 'lua', badge: 'LUA', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', category: 'code' },
  dart: { name: 'Dart', langId: 'dart', badge: 'DART', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30', category: 'code' },
  r: { name: 'R', langId: 'r', badge: 'R', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30', category: 'code' }
};

/**
 * Get language info from a file name or path
 */
export function getLanguageInfo(fileNameOrPath: string): CodeLanguageInfo {
  const clean = fileNameOrPath.trim();
  const lower = clean.toLowerCase();

  // Special full filenames
  if (lower === 'dockerfile' || lower.endsWith('/dockerfile')) {
    return LANGUAGE_EXT_MAP.dockerfile;
  }
  if (lower === 'makefile' || lower.endsWith('/makefile')) {
    return { name: 'Makefile', langId: 'makefile', badge: 'MAKE', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', category: 'config' };
  }

  const dotIdx = clean.lastIndexOf('.');
  if (dotIdx === -1) {
    return { name: 'Plain Text', langId: 'plaintext', badge: 'FILE', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', category: 'other' };
  }

  const ext = clean.slice(dotIdx + 1).toLowerCase();
  if (LANGUAGE_EXT_MAP[ext]) {
    return LANGUAGE_EXT_MAP[ext];
  }

  return {
    name: ext.toUpperCase(),
    langId: ext,
    badge: ext.toUpperCase().slice(0, 4),
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    category: 'other'
  };
}

/**
 * Check if file is a Markdown or documentation note
 */
export function isMarkdownFile(fileNameOrPath: string): boolean {
  return /\.(md|markdown|mdx|txt)$/i.test(fileNameOrPath);
}

/**
 * Check if file is a supported text-based code, config, or document file
 */
export function isSupportedTextFile(fileNameOrPath: string): boolean {
  const binaryExts = /\.(png|jpe?g|gif|webp|svg|ico|pdf|zip|tar|gz|7z|rar|jar|war|class|pyc|exe|dll|so|dylib|wasm|mp3|mp4|mov|avi|bin|iso|dmg)$/i;
  return !binaryExts.test(fileNameOrPath);
}

/**
 * Format bytes into human readable format
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Formats raw code into a publishing-grade, executive Markdown document
 */
export function formatCodeAsDocument(
  rawContent: string,
  fileName: string,
  filePath?: string,
  repoName?: string
): string {
  // If it's already a markdown note, keep as is
  if (isMarkdownFile(fileName)) {
    return rawContent;
  }

  const info = getLanguageInfo(fileName);
  const lines = rawContent.split('\n').length;
  const pathLabel = filePath || fileName;
  const sizeLabel = formatFileSize(rawContent.length);

  // Executive code document template
  return `# ${fileName}

> **Source**: \`${pathLabel}\` ${repoName ? `• **Repo**: \`${repoName}\`` : ''}  
> **Language**: ${info.name} • **Lines**: ${lines} • **Size**: ${sizeLabel}

\`\`\`${info.langId}
${rawContent}
\`\`\`
`;
}
