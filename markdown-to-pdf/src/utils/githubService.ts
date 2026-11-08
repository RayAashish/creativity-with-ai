import { getLanguageInfo, isMarkdownFile, formatFileSize } from './codeHelper';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
  language: string | null;
  private: boolean;
  html_url: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size?: number;
  url: string;
}

export interface ExplorerItem {
  name: string;
  path: string;
  type: 'dir' | 'file';
  isMarkdown: boolean;
  category: 'dir' | 'note' | 'code' | 'config' | 'web' | 'data' | 'other';
  language?: string;
  badge?: string;
  badgeColor?: string;
  size?: number;
  formattedSize?: string;
  childCount?: number;
}

/**
 * Extract clean username from input string or URL
 * Supports: "RayAashish", "github.com/RayAashish", "https://github.com/RayAashish/"
 */
export function extractGitHubUsername(input: string): string {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^github\.com\//i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  const parts = cleaned.split('/');
  return parts[0] || cleaned;
}

function getHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'CodexPress-App'
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
}

/**
 * Fetch public repositories for a GitHub user or organization
 */
export async function fetchUserRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  const cleanUser = extractGitHubUsername(username);
  if (!cleanUser) {
    throw new Error('Please enter a valid GitHub username.');
  }

  const url = `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=100&sort=updated`;
  const response = await fetch(url, { headers: getHeaders(token) });

  if (response.status === 404) {
    throw new Error(`GitHub user "${cleanUser}" was not found.`);
  }

  if (response.status === 403) {
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString() : 'soon';
    throw new Error(`GitHub API rate limit reached. Limit resets at ${resetTime}. Add a GitHub token to increase your limit.`);
  }

  if (!response.ok) {
    throw new Error(`GitHub request failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response from GitHub API.');
  }

  return data;
}

/**
 * Fetch entire git tree for a repo branch recursively
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string = 'main',
  token?: string
): Promise<{ tree: GitHubTreeItem[]; truncated: boolean }> {
  const candidateBranches = [branch, 'main', 'master', 'HEAD'].filter(
    (b, i, arr) => arr.indexOf(b) === i && Boolean(b)
  );

  let lastError = '';

  for (const b of candidateBranches) {
    try {
      const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(b)}?recursive=1`;
      const response = await fetch(url, { headers: getHeaders(token) });

      if (response.status === 409) {
        // Git Repository is empty
        return { tree: [], truncated: false };
      }

      if (response.ok) {
        const data = await response.json();
        return { tree: data.tree || [], truncated: Boolean(data.truncated) };
      }

      if (response.status === 403) {
        const rateLimitReset = response.headers.get('x-ratelimit-reset');
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString() : 'soon';
        throw new Error(`GitHub API rate limit reached. Resets at ${resetTime}. Add a Personal Access Token.`);
      }

      lastError = `HTTP ${response.status} ${response.statusText}`;
    } catch (err: any) {
      if (err.message && err.message.includes('rate limit')) throw err;
      lastError = err.message || 'Network error';
    }
  }

  throw new Error(`Could not load file tree for ${owner}/${repo}: ${lastError}`);
}

/**
 * Fallback to direct GitHub Contents API for a specific directory path
 * Ensures 100% of files and folders are accessible even if recursive tree was truncated!
 */
export async function fetchDirectoryContents(
  owner: string,
  repo: string,
  dirPath: string = '',
  branch?: string,
  token?: string
): Promise<ExplorerItem[]> {
  const cleanPath = dirPath.replace(/^\/+|\/+$/g, '');
  let url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(cleanPath)}`;
  if (branch) {
    url += `?ref=${encodeURIComponent(branch)}`;
  }

  const response = await fetch(url, { headers: getHeaders(token) });
  if (!response.ok) {
    throw new Error(`Failed to load directory contents (${response.status} ${response.statusText})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: any) => {
    const isDir = item.type === 'dir' || item.type === 'submodule';
    const isMd = isMarkdownFile(item.name);
    const langInfo = getLanguageInfo(item.name);

    return {
      name: item.name,
      path: item.path,
      type: (isDir ? 'dir' : 'file') as 'dir' | 'file',
      isMarkdown: isMd,
      category: (isDir ? 'dir' : isMd ? 'note' : langInfo.category) as ExplorerItem['category'],
      language: langInfo.name,
      badge: isDir ? undefined : langInfo.badge,
      badgeColor: isDir ? undefined : langInfo.color,
      size: item.size,
      formattedSize: item.size !== undefined ? formatFileSize(item.size) : undefined
    };
  }).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    if (a.isMarkdown !== b.isMarkdown) return a.isMarkdown ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Filter items in a specific directory from recursive tree list
 * Handles direct children, subdirectories, code files, and child count metrics
 */
export function getItemsInDirectory(tree: GitHubTreeItem[], currentPath: string): ExplorerItem[] {
  // Normalize currentPath: remove leading and trailing slashes
  const cleanPath = currentPath.replace(/^\/+|\/+$/g, '');
  const prefix = cleanPath ? `${cleanPath}/` : '';
  const dirMap = new Map<string, ExplorerItem>();
  const dirChildCounts = new Map<string, number>();

  for (const item of tree) {
    if (!item.path.startsWith(prefix)) continue;
    const rel = item.path.slice(prefix.length);
    if (!rel) continue;

    const slashIdx = rel.indexOf('/');
    if (slashIdx === -1) {
      // Direct child of currentPath
      const isDir = item.type === 'tree' || item.type === 'commit';
      const isMd = !isDir && isMarkdownFile(rel);
      const langInfo = getLanguageInfo(rel);

      dirMap.set(rel, {
        name: rel,
        path: item.path,
        type: isDir ? 'dir' : 'file',
        isMarkdown: isMd,
        category: isDir ? 'dir' : isMd ? 'note' : langInfo.category,
        language: langInfo.name,
        badge: isDir ? undefined : langInfo.badge,
        badgeColor: isDir ? undefined : langInfo.color,
        size: item.size,
        formattedSize: item.size !== undefined ? formatFileSize(item.size) : undefined
      });
    } else {
      // Subdirectory item
      const subDirName = rel.slice(0, slashIdx);
      const subDirPath = prefix + subDirName;

      // Track child counts for folders
      dirChildCounts.set(subDirName, (dirChildCounts.get(subDirName) || 0) + 1);

      if (!dirMap.has(subDirName)) {
        dirMap.set(subDirName, {
          name: subDirName,
          path: subDirPath,
          type: 'dir',
          isMarkdown: false,
          category: 'dir'
        });
      }
    }
  }

  // Attach child counts to directories
  const results = Array.from(dirMap.values()).map((item) => {
    if (item.type === 'dir') {
      const count = dirChildCounts.get(item.name) || 0;
      return { ...item, childCount: count };
    }
    return item;
  });

  // Sort: directories first, then notes, then code, then other files alphabetically
  return results.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'dir' ? -1 : 1;
    }
    if (a.isMarkdown !== b.isMarkdown) {
      return a.isMarkdown ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Fetch raw file content (Markdown, Java, Python, C++, TS, etc.)
 */
export async function fetchRawFileContent(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  token?: string
): Promise<string> {
  // 1. Direct raw.githubusercontent.com (fast and not rate-limited for public repos)
  const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${filePath}`;
  try {
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      return await rawRes.text();
    }
  } catch (err) {
    console.warn('Direct raw fetch failed, trying API...', err);
  }

  // 2. Fallback to GitHub API with raw accept header (works with private repos and tokens)
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}?ref=${encodeURIComponent(branch)}`;
  const apiRes = await fetch(apiUrl, {
    headers: {
      ...getHeaders(token),
      Accept: 'application/vnd.github.v3.raw'
    }
  });

  if (!apiRes.ok) {
    throw new Error(`Failed to load file content (${apiRes.status} ${apiRes.statusText})`);
  }

  return await apiRes.text();
}

/**
 * Backward compatibility alias for fetchRawFileContent
 */
export const fetchRawMarkdown = fetchRawFileContent;
