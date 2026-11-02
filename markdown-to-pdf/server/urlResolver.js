/**
 * Normalizes input URLs to direct raw content URLs
 */
export function normalizeMarkdownUrl(inputUrl) {
  let url = inputUrl.trim();

  // If missing protocol, prepend https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch (err) {
    throw new Error('Invalid URL provided');
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  // 1. GitHub blob URL: github.com/owner/repo/blob/branch/path/to/file.md
  // -> https://raw.githubusercontent.com/owner/repo/branch/path/to/file.md
  if (hostname === 'github.com') {
    const parts = pathname.split('/').filter(Boolean);

    // Repository root: github.com/owner/repo
    if (parts.length === 2) {
      const [owner, repo] = parts;
      return {
        isRepoRoot: true,
        owner,
        repo,
        candidateUrls: [
          `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
          `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
          `https://raw.githubusercontent.com/${owner}/${repo}/main/readme.md`,
          `https://raw.githubusercontent.com/${owner}/${repo}/master/readme.md`
        ],
        rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
        filename: `${repo}-README.md`
      };
    }

    // Blob URL: github.com/owner/repo/blob/branch/path/to/file.md
    if (parts.length >= 4 && parts[2] === 'blob') {
      const owner = parts[0];
      const repo = parts[1];
      const branch = parts[3];
      const filePath = parts.slice(4).join('/');
      const filename = parts[parts.length - 1] || 'document.md';
      return {
        rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
        filename
      };
    }

    // Raw URL pasted with github.com domain: github.com/owner/repo/raw/branch/path
    if (parts.length >= 4 && parts[2] === 'raw') {
      const owner = parts[0];
      const repo = parts[1];
      const branch = parts[3];
      const filePath = parts.slice(4).join('/');
      const filename = parts[parts.length - 1] || 'document.md';
      return {
        rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
        filename
      };
    }
  }

  // 2. Already raw.githubusercontent.com
  if (hostname === 'raw.githubusercontent.com') {
    const parts = pathname.split('/').filter(Boolean);
    const filename = parts[parts.length - 1] || 'document.md';
    return {
      rawUrl: url,
      filename
    };
  }

  // 3. GitHub Gist: gist.github.com/username/gist_id
  if (hostname === 'gist.github.com') {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const gistId = parts[1];
      return {
        isGist: true,
        rawUrl: `https://gist.githubusercontent.com/${parts[0]}/${gistId}/raw`,
        filename: `gist-${gistId}.md`
      };
    }
  }

  if (hostname === 'gist.githubusercontent.com') {
    const parts = pathname.split('/').filter(Boolean);
    const filename = parts[parts.length - 1] || 'gist.md';
    return {
      rawUrl: url,
      filename
    };
  }

  // 4. GitLab: gitlab.com/owner/repo/-/blob/branch/file.md -> -/raw/
  if (hostname.includes('gitlab.com') && pathname.includes('/-/blob/')) {
    const rawUrl = url.replace('/-/blob/', '/-/raw/');
    const filename = pathname.split('/').pop() || 'document.md';
    return { rawUrl, filename };
  }

  // 5. Bitbucket: bitbucket.org/owner/repo/src/branch/file.md -> /raw/
  if (hostname.includes('bitbucket.org') && pathname.includes('/src/')) {
    const rawUrl = url.replace('/src/', '/raw/');
    const filename = pathname.split('/').pop() || 'document.md';
    return { rawUrl, filename };
  }

  // Default fallback: any URL directly
  const parts = pathname.split('/').filter(Boolean);
  let filename = parts.length > 0 ? parts[parts.length - 1] : 'document.md';
  if (!filename.includes('.')) {
    filename += '.md';
  }

  return {
    rawUrl: url,
    filename
  };
}
