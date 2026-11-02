import { GitHubTreeItem } from '../types';

export class GitHubService {
  private apiBase = 'https://api.github.com';

  async getRepoInfo(owner: string, repo: string): Promise<{ defaultBranch: string; description?: string }> {
    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
      }
      if (res.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please wait a moment.');
      }
      throw new Error(`GitHub error: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      defaultBranch: data.default_branch || 'main',
      description: data.description,
    };
  }

  async getLatestCommitSha(owner: string, repo: string, branch: string, path?: string): Promise<string> {
    const url = new URL(`${this.apiBase}/repos/${owner}/${repo}/commits`);
    url.searchParams.set('sha', branch);
    if (path) {
      url.searchParams.set('path', path);
    }
    url.searchParams.set('per_page', '1');

    const res = await fetch(url.toString());
    if (!res.ok) return '';
    const commits = await res.json();
    return commits[0]?.sha || '';
  }

  async getRepoTree(owner: string, repo: string, treeSha: string): Promise<GitHubTreeItem[]> {
    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
    if (!res.ok) {
      throw new Error(`Failed to load repository tree: ${res.statusText}`);
    }
    const data = await res.json();
    return data.tree || [];
  }

  async fetchRawFile(owner: string, repo: string, branch: string, path: string): Promise<{ content: string; sha: string }> {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(rawUrl);
    if (!res.ok) {
      throw new Error(`Failed to download file from GitHub (${res.status}): ${path}`);
    }
    const content = await res.text();
    const sha = await this.getLatestCommitSha(owner, repo, branch, path);
    return { content, sha };
  }

  async checkRemoteChanged(
    owner: string,
    repo: string,
    branch: string,
    path: string,
    pinnedCommitSha: string
  ): Promise<{ changed: boolean; latestSha: string }> {
    try {
      const latestSha = await this.getLatestCommitSha(owner, repo, branch, path);
      if (!latestSha || !pinnedCommitSha) return { changed: false, latestSha: latestSha || pinnedCommitSha };
      return {
        changed: latestSha !== pinnedCommitSha,
        latestSha,
      };
    } catch {
      return { changed: false, latestSha: pinnedCommitSha };
    }
  }
}

export const githubService = new GitHubService();
