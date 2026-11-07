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
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface ExplorerItem {
  name: string;
  path: string;
  type: 'dir' | 'file';
  isMarkdown: boolean;
  size?: number;
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
    'User-Agent': 'MarkPDF-App'
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
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const response = await fetch(url, { headers: getHeaders(token) });

  if (!response.ok) {
    // If branch doesn't exist, try 'master' if we tried 'main', or vice versa
    if (branch === 'main') {
      const fallbackUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/master?recursive=1`;
      const fallbackRes = await fetch(fallbackUrl, { headers: getHeaders(token) });
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        return { tree: data.tree || [], truncated: Boolean(data.truncated) };
      }
    }
    throw new Error(`Could not load file tree for ${owner}/${repo} (HTTP ${response.status})`);
  }

  const data = await response.json();
  return { tree: data.tree || [], truncated: Boolean(data.truncated) };
}

/**
 * Filter items in a specific directory from recursive tree list
 */
export function getItemsInDirectory(tree: GitHubTreeItem[], currentPath: string): ExplorerItem[] {
  const prefix = currentPath ? (currentPath.endsWith('/') ? currentPath : `${currentPath}/`) : '';
  const dirMap = new Map<string, ExplorerItem>();

  for (const item of tree) {
    if (!item.path.startsWith(prefix)) continue;
    const rel = item.path.slice(prefix.length);
    if (!rel) continue;

    const slashIdx = rel.indexOf('/');
    if (slashIdx === -1) {
      // Direct child
      const isDir = item.type === 'tree';
      const isMarkdown = !isDir && (/\.(md|markdown|mdx|txt)$/i.test(rel));
      dirMap.set(rel, {
        name: rel,
        path: item.path,
        type: isDir ? 'dir' : 'file',
        isMarkdown,
        size: item.size
      });
    } else {
      // Subdirectory
      const subDirName = rel.slice(0, slashIdx);
      if (!dirMap.has(subDirName)) {
        dirMap.set(subDirName, {
          name: subDirName,
          path: prefix + subDirName,
          type: 'dir',
          isMarkdown: false
        });
      }
    }
  }

  // Sort: directories first, then markdown files, then other files
  return Array.from(dirMap.values()).sort((a, b) => {
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
 * Fetch raw markdown content of a file
 */
export async function fetchRawMarkdown(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  token?: string
): Promise<string> {
  // 1. Direct raw.githubusercontent.com (fast and not rate-limited)
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  try {
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      return await rawRes.text();
    }
  } catch (err) {
    console.warn('Direct raw fetch failed, trying API...', err);
  }

  // 2. Fallback to GitHub API with custom Accept header (works with tokens)
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
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
