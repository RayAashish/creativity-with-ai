export interface QuickLink {
  label: string;
  url: string;
  description: string;
}

export const POPULAR_GITHUB_LINKS: QuickLink[] = [
  {
    label: 'React README',
    url: 'https://github.com/facebook/react/blob/main/README.md',
    description: 'The library for web and native user interfaces'
  },
  {
    label: 'Next.js README',
    url: 'https://github.com/vercel/next.js/blob/canary/README.md',
    description: 'The React Framework for the Web'
  },
  {
    label: 'Tailwind CSS',
    url: 'https://github.com/tailwindlabs/tailwindcss/blob/main/README.md',
    description: 'A utility-first CSS framework for rapid UI development'
  },
  {
    label: 'FastAPI README',
    url: 'https://github.com/fastapi/fastapi/blob/master/README.md',
    description: 'Modern, fast (high-performance) web framework for Python'
  },
  {
    label: 'TypeScript Docs',
    url: 'https://raw.githubusercontent.com/microsoft/TypeScript/main/README.md',
    description: 'TypeScript language specification & core readme'
  }
];

export function parseMarkdownUrl(rawInput: string): {
  normalizedUrl: string;
  suggestedFilename: string;
  displayTitle: string;
} {
  let url = rawInput.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const parts = parsed.pathname.split('/').filter(Boolean);

    // GitHub repository root: github.com/owner/repo
    if (host === 'github.com' && parts.length === 2) {
      const [owner, repo] = parts;
      return {
        normalizedUrl: `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
        suggestedFilename: `${repo}-README.md`,
        displayTitle: `${owner}/${repo}`
      };
    }

    // GitHub blob: github.com/owner/repo/blob/branch/path...
    if (host === 'github.com' && parts.length >= 4 && (parts[2] === 'blob' || parts[2] === 'raw')) {
      const owner = parts[0];
      const repo = parts[1];
      const branch = parts[3];
      const filePath = parts.slice(4).join('/');
      const filename = parts[parts.length - 1] || `${repo}.md`;
      return {
        normalizedUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
        suggestedFilename: filename,
        displayTitle: `${repo} - ${filename}`
      };
    }

    // Raw GitHub URL
    if (host === 'raw.githubusercontent.com') {
      const filename = parts[parts.length - 1] || 'document.md';
      return {
        normalizedUrl: url,
        suggestedFilename: filename,
        displayTitle: filename.replace(/\.md$/i, '')
      };
    }

    // GitHub Gist: gist.github.com/user/gist_id
    if (host === 'gist.github.com' && parts.length >= 2) {
      const gistId = parts[1];
      return {
        normalizedUrl: `https://gist.githubusercontent.com/${parts[0]}/${gistId}/raw`,
        suggestedFilename: `gist-${gistId}.md`,
        displayTitle: `Gist ${gistId}`
      };
    }

    // Default
    const lastPart = parts[parts.length - 1] || 'document.md';
    const filename = lastPart.includes('.') ? lastPart : `${lastPart}.md`;

    return {
      normalizedUrl: url,
      suggestedFilename: filename,
      displayTitle: filename.replace(/\.md$/i, '')
    };
  } catch {
    return {
      normalizedUrl: url,
      suggestedFilename: 'document.md',
      displayTitle: 'Document'
    };
  }
}

/**
 * Robust fetcher that tries local server proxy first, and falls back to direct client-side fetch
 * (essential for standalone offline/online Android tablets where backend is not running locally)
 */
export async function fetchMarkdownContent(url: string): Promise<{
  content: string;
  filename: string;
  title: string;
  sourceUrl: string;
}> {
  const parsed = parseMarkdownUrl(url);

  // 1. Try local server proxy if available
  try {
    const proxyRes = await fetch('/api/fetch-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return data;
    }
  } catch (e) {
    // Backend proxy not reachable (e.g. running standalone on Android device)
    console.log('Backend proxy unavailable, fetching directly client-side...');
  }

  // 2. Direct client-side fetch from raw URL
  const targetUrl = parsed.normalizedUrl;
  const directRes = await fetch(targetUrl);
  if (!directRes.ok) {
    throw new Error(`Failed to fetch markdown (HTTP ${directRes.status})`);
  }

  const text = await directRes.text();
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const docTitle = titleMatch ? titleMatch[1].trim() : parsed.displayTitle;

  return {
    content: text,
    filename: parsed.suggestedFilename,
    title: docTitle,
    sourceUrl: targetUrl
  };
}
