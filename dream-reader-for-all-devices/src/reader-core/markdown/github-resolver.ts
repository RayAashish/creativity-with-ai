import { GitHubRepoRef } from '../../types';

/**
 * Normalizes relative path segments like `a/b/../c/./d` to `a/c/d`.
 */
export function resolveRelativePath(basePath: string, relativePath: string): string {
  // If already absolute or URL
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('//')) {
    return relativePath;
  }

  // If path starts with slash, it is repo root relative
  if (relativePath.startsWith('/')) {
    return relativePath.slice(1);
  }

  // Get base directory
  const baseParts = basePath.split('/').filter(Boolean);
  // Remove filename from base path
  if (baseParts.length > 0) {
    baseParts.pop();
  }

  const relParts = relativePath.split('/');
  for (const part of relParts) {
    if (part === '.' || part === '') {
      continue;
    } else if (part === '..') {
      if (baseParts.length > 0) {
        baseParts.pop();
      }
    } else {
      baseParts.push(part);
    }
  }

  return baseParts.join('/');
}

/**
 * Parses GitHub repository, tree, or blob URLs.
 * Examples:
 * - https://github.com/facebook/react
 * - https://github.com/rust-lang/rust/tree/master/src
 * - https://github.com/facebook/react/blob/main/README.md
 */
export function parseGitHubUrl(url: string): GitHubRepoRef | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');

    if (parts.length === 2) {
      // Root of repo
      return { owner, repo, branch: 'HEAD', path: '' };
    }

    const type = parts[2]; // 'tree' or 'blob'
    if (type === 'tree' || type === 'blob') {
      const branch = parts[3] || 'main';
      const path = parts.slice(4).join('/');
      return { owner, repo, branch, path };
    }

    return { owner, repo, branch: 'HEAD', path: parts.slice(2).join('/') };
  } catch {
    return null;
  }
}

/**
 * Generates a GitHub raw content URL for images and raw files.
 */
export function getGitHubRawUrl(owner: string, repo: string, branch: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
}

/**
 * Resolves an image URL inside markdown, converting relative paths to raw GitHub URLs if GitHub metadata exists.
 */
export function resolveMarkdownImageSrc(
  src: string | undefined,
  githubMeta?: { owner: string; repo: string; branch: string; path: string }
): string {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  if (githubMeta) {
    const resolvedPath = resolveRelativePath(githubMeta.path, src);
    return getGitHubRawUrl(githubMeta.owner, githubMeta.repo, githubMeta.branch, resolvedPath);
  }

  return src;
}
