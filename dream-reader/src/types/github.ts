export interface GitHubRepoRef {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubFileMetadata {
  sha: string;
  name: string;
  path: string;
  size: number;
  downloadUrl: string;
}
