import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GitBranch,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  ChevronRight,
  Search,
  Key,
  Star,
  RefreshCw,
  Check,
  AlertCircle,
  BookOpen,
  X,
  ArrowLeft,
  Code2,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import {
  GitHubRepo,
  GitHubTreeItem,
  ExplorerItem,
  fetchUserRepos,
  fetchRepoTree,
  fetchDirectoryContents,
  getItemsInDirectory,
  fetchRawFileContent,
  extractGitHubUsername
} from '../utils/githubService';
import {
  formatCodeAsDocument,
  getLanguageInfo,
  isMarkdownFile,
  isSupportedTextFile,
  formatFileSize
} from '../utils/codeHelper';

interface GitHubExplorerProps {
  onSelectNote: (content: string, fileName: string, title: string, sourceUrl?: string) => void;
  activeFileName?: string;
  onNavigateToPreview?: () => void;
}

interface RecentFile {
  name: string;
  path: string;
  repo: string;
  owner: string;
  branch: string;
  category: string;
}

const STORAGE_KEYS = {
  USERNAME: 'markforge_github_username',
  LEGACY_USERNAME: 'markpdf_github_username',
  TOKEN: 'markforge_github_token',
  REPO: 'markforge_github_selected_repo',
  PATH: 'markforge_github_current_path',
  FILE: 'markforge_github_selected_file',
  FILTER: 'markforge_github_filter_mode',
  RECENTS: 'markforge_github_recents'
};

export const GitHubExplorer: React.FC<GitHubExplorerProps> = ({
  onSelectNote,
  activeFileName,
  onNavigateToPreview
}) => {
  // Username state (Default to RayAashish or saved)
  const [username, setUsername] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.USERNAME) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_USERNAME) ||
      'RayAashish'
    );
  });

  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
  });
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  // Repos state
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [repoFilter, setRepoFilter] = useState<string>('');

  // Selected Repo state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEYS.REPO) ||
        localStorage.getItem('markpdf_github_selected_repo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tree & Folder state
  const [tree, setTree] = useState<GitHubTreeItem[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false);
  const [isTreeTruncated, setIsTreeTruncated] = useState<boolean>(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  // Direct contents fallback items (for truncated trees or API sync)
  const [directApiItems, setDirectApiItems] = useState<ExplorerItem[] | null>(null);
  const [isLoadingDirectApi, setIsLoadingDirectApi] = useState<boolean>(false);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.PATH) ||
      localStorage.getItem('markpdf_github_current_path') ||
      ''
    );
  });

  const [selectedFilePath, setSelectedFilePath] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.FILE) ||
      localStorage.getItem('markpdf_github_selected_file') ||
      ''
    );
  });

  const [fileSearch, setFileSearch] = useState<string>('');
  // Filter mode: 'all' (default, shows all code & notes), 'notes' (.md only), 'code' (code only)
  const [filterMode, setFilterMode] = useState<'all' | 'notes' | 'code'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILTER) as any;
    return saved === 'notes' || saved === 'code' ? saved : 'all';
  });

  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  // Recent files shelf
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistence
  useEffect(() => {
    if (username.trim()) {
      localStorage.setItem(STORAGE_KEYS.USERNAME, username.trim());
    }
  }, [username]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, [token]);

  useEffect(() => {
    if (selectedRepo) {
      localStorage.setItem(STORAGE_KEYS.REPO, JSON.stringify(selectedRepo));
    } else {
      localStorage.removeItem(STORAGE_KEYS.REPO);
    }
  }, [selectedRepo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATH, currentPath);
    // Reset direct API cache when path changes
    setDirectApiItems(null);
  }, [currentPath]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILE, selectedFilePath);
  }, [selectedFilePath]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTER, filterMode);
  }, [filterMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(recentFiles.slice(0, 8)));
    } catch (_) {}
  }, [recentFiles]);

  // Load repositories for current username
  const handleFetchRepos = async (userToFetch?: string) => {
    const user = extractGitHubUsername(userToFetch || username);
    if (!user) return;

    setIsLoadingRepos(true);
    setRepoError(null);

    try {
      const fetchedRepos = await fetchUserRepos(user, token);
      setRepos(fetchedRepos);

      if (selectedRepo && !selectedRepo.full_name.toLowerCase().startsWith(user.toLowerCase())) {
        setSelectedRepo(null);
        setTree([]);
        setCurrentPath('');
      }
    } catch (err: any) {
      setRepoError(err.message || 'Failed to fetch repositories.');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // Load tree for selected repository
  const handleLoadRepoTree = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setIsLoadingTree(true);
    setTreeError(null);
    setDirectApiItems(null);

    const owner = repo.full_name.split('/')[0];
    const branch = repo.default_branch || 'main';

    try {
      const { tree: fullTree, truncated } = await fetchRepoTree(owner, repo.name, branch, token);
      setTree(fullTree);
      setIsTreeTruncated(truncated);
    } catch (err: any) {
      setTreeError(err.message || 'Failed to load repository folder structure.');
      // Auto-fallback: try contents API for root
      handleFetchDirectContents(owner, repo.name, currentPath, branch);
    } finally {
      setIsLoadingTree(false);
    }
  };

  // Direct GitHub API contents fallback (for specific folder or truncated trees)
  const handleFetchDirectContents = async (
    owner: string,
    repoName: string,
    path: string,
    branch?: string
  ) => {
    setIsLoadingDirectApi(true);
    try {
      const items = await fetchDirectoryContents(owner, repoName, path, branch, token);
      setDirectApiItems(items);
    } catch (err: any) {
      console.warn('Direct contents API fallback failed:', err);
    } finally {
      setIsLoadingDirectApi(false);
    }
  };

  // Initial auto-fetch on mount if username exists
  useEffect(() => {
    if (username.trim() && repos.length === 0) {
      handleFetchRepos(username);
    }
  }, []);

  // Auto-load tree if selectedRepo is already loaded on mount/refresh
  useEffect(() => {
    if (selectedRepo && tree.length === 0) {
      handleLoadRepoTree(selectedRepo);
    }
  }, [selectedRepo]);

  // Handle clicking a folder
  const handleOpenFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setFileSearch('');
  };

  // Handle navigating up one folder
  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  // Handle clicking a breadcrumb segment
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentPath('');
      return;
    }
    const parts = currentPath.split('/').filter(Boolean);
    const newPath = parts.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  // Handle clicking a file (Code or Markdown) to load into editor & preview
  const handleSelectFile = async (item: ExplorerItem | GitHubTreeItem) => {
    if (!selectedRepo) return;
    const filePath = item.path;
    const owner = selectedRepo.full_name.split('/')[0];
    const repoName = selectedRepo.name;
    const branch = selectedRepo.default_branch || 'main';

    setLoadingFile(filePath);
    try {
      const rawContent = await fetchRawFileContent(owner, repoName, branch, filePath, token);
      setSelectedFilePath(filePath);

      const fileName = filePath.split('/').pop() || 'file';
      const isMd = isMarkdownFile(fileName);

      let finalContent = rawContent;
      let title = fileName;

      if (isMd) {
        // Extract title from markdown heading or filename
        const titleMatch = rawContent.match(/^#\s+(.+)$/m);
        title = titleMatch ? titleMatch[1].trim() : fileName.replace(/\.md$/i, '');
      } else {
        // CODE FILE: Format code into publication-grade executive markdown document
        finalContent = formatCodeAsDocument(rawContent, fileName, filePath, repoName);
        title = fileName;
      }

      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${filePath}`;

      // Track in recent files
      const langInfo = getLanguageInfo(fileName);
      setRecentFiles((prev) => {
        const filtered = prev.filter((r) => !(r.repo === repoName && r.path === filePath));
        return [
          {
            name: fileName,
            path: filePath,
            repo: repoName,
            owner,
            branch,
            category: isMd ? 'note' : langInfo.category
          },
          ...filtered
        ].slice(0, 8);
      });

      onSelectNote(finalContent, fileName, title, rawUrl);
    } catch (err: any) {
      alert(`Could not load file: ${err.message}`);
    } finally {
      setLoadingFile(null);
    }
  };

  // Handle clicking a recent file pill
  const handleSelectRecent = async (rf: RecentFile) => {
    // If not in this repo, set repo first
    if (!selectedRepo || selectedRepo.name !== rf.repo) {
      const matchingRepo = repos.find((r) => r.name === rf.repo);
      if (matchingRepo) {
        setSelectedRepo(matchingRepo);
        handleLoadRepoTree(matchingRepo);
      }
    }
    handleSelectFile({
      name: rf.name,
      path: rf.path,
      type: 'file',
      isMarkdown: isMarkdownFile(rf.name),
      category: isMarkdownFile(rf.name) ? 'note' : 'code'
    } as any);
  };

  // Filtered repositories
  const filteredRepos = useMemo(() => {
    if (!repoFilter.trim()) return repos;
    const q = repoFilter.toLowerCase().trim();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.language && r.language.toLowerCase().includes(q))
    );
  }, [repos, repoFilter]);

  // Current folder items or search results across the whole repo
  const { folderItems, isGlobalSearch } = useMemo(() => {
    if (fileSearch.trim()) {
      // Global search across the whole tree!
      const q = fileSearch.toLowerCase().trim();
      const matched = tree.filter((item) => {
        if (item.type !== 'blob') return false;
        const fileName = item.path.split('/').pop() || item.path;
        const isMd = isMarkdownFile(fileName);

        if (filterMode === 'notes' && !isMd) return false;
        if (filterMode === 'code' && isMd) return false;

        return item.path.toLowerCase().includes(q);
      });

      const explorerItems: ExplorerItem[] = matched.map((m) => {
        const name = m.path.split('/').pop() || m.path;
        const isMd = isMarkdownFile(name);
        const langInfo = getLanguageInfo(name);

        return {
          name,
          path: m.path,
          type: 'file',
          isMarkdown: isMd,
          category: isMd ? 'note' : langInfo.category,
          language: langInfo.name,
          badge: isMd ? 'NOTE' : langInfo.badge,
          badgeColor: isMd ? undefined : langInfo.color,
          size: m.size,
          formattedSize: m.size !== undefined ? formatFileSize(m.size) : undefined
        };
      });

      return { folderItems: explorerItems, isGlobalSearch: true };
    }

    // Direct API fallback active
    if (directApiItems && directApiItems.length > 0) {
      let filtered = directApiItems;
      if (filterMode === 'notes') {
        filtered = filtered.filter((i) => i.type === 'dir' || i.isMarkdown);
      } else if (filterMode === 'code') {
        filtered = filtered.filter((i) => i.type === 'dir' || !i.isMarkdown);
      }
      return { folderItems: filtered, isGlobalSearch: false };
    }

    // Normal folder view from recursive tree
    let items = getItemsInDirectory(tree, currentPath);

    if (filterMode === 'notes') {
      items = items.filter((item) => item.type === 'dir' || item.isMarkdown);
    } else if (filterMode === 'code') {
      items = items.filter((item) => item.type === 'dir' || !item.isMarkdown);
    }

    return { folderItems: items, isGlobalSearch: false };
  }, [tree, currentPath, fileSearch, filterMode, directApiItems]);

  // Metrics: Count markdown notes and code files
  const { totalMarkdownCount, totalCodeCount } = useMemo(() => {
    let md = 0;
    let code = 0;
    for (const item of tree) {
      if (item.type === 'blob') {
        if (isMarkdownFile(item.path)) md++;
        else code++;
      }
    }
    return { totalMarkdownCount: md, totalCodeCount: code };
  }, [tree]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-subtle)] text-[var(--text-primary)] font-mono text-xs overflow-hidden select-text">
      {/* ── Top Header / User Input Bar ── */}
      <div className="p-3 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchRepos();
          }}
          className="flex items-center gap-1.5"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub username (e.g. RayAashish)"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-3 py-2 pl-8 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition shadow-sm"
            />
            <GitBranch className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={isLoadingRepos || !username.trim()}
            className="px-3 py-2 bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold rounded-xl text-xs transition disabled:opacity-50 flex items-center space-x-1.5 shrink-0 shadow-sm active:scale-95"
            title="Fetch user repositories"
          >
            {isLoadingRepos ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Fetch</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className={`p-2 rounded-xl border transition shrink-0 ${
              token
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
            title="GitHub Personal Access Token (Optional: Increases rate limit)"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Collapsible GitHub Token Input */}
        {showTokenInput && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 animate-in fade-in duration-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">
                GitHub Token (Optional)
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">Rate limit: 5000/hr</span>
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        )}

        {/* Recent Files Shelf (If any exist) */}
        {recentFiles.length > 0 && !selectedRepo && (
          <div className="pt-1">
            <div className="flex items-center space-x-1.5 text-[10px] text-[var(--text-muted)] mb-1">
              <Clock className="w-3 h-3" />
              <span>Recent Documents:</span>
            </div>
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              {recentFiles.map((rf, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectRecent(rf)}
                  className="px-2 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center space-x-1 shrink-0 transition"
                  title={`${rf.repo} / ${rf.path}`}
                >
                  <FileCode className="w-3 h-3 text-sky-400" />
                  <span className="max-w-[120px] truncate">{rf.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {repoError && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{repoError}</span>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT: Repo List OR Folder & Note Explorer ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {!selectedRepo ? (
          /* ══════════════════════════════════════════════════
             STATE 1: REPOSITORY LIST VIEW
             ══════════════════════════════════════════════════ */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Repos filter bar */}
            {repos.length > 0 && (
              <div className="px-3 py-2 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={repoFilter}
                    onChange={(e) => setRepoFilter(e.target.value)}
                    placeholder={`Filter ${repos.length} repositories...`}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 pl-7 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                  />
                  <Search className="w-3 h-3 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                  {filteredRepos.length} repos
                </span>
              </div>
            )}

            {/* Repos List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoadingRepos && (
                <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-xs">Fetching repositories for @{username}...</p>
                </div>
              )}

              {!isLoadingRepos && repos.length === 0 && !repoError && (
                <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">Ready to explore</p>
                  <p className="text-[11px]">Enter a GitHub username and tap &quot;Fetch&quot; to explore repositories, code & notes.</p>
                </div>
              )}

              {!isLoadingRepos &&
                filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleLoadRepoTree(repo)}
                    className="w-full text-left p-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition group flex flex-col space-y-1.5 shadow-sm active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <span className="truncate">{repo.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition" />
                    </div>

                    {repo.description && (
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 text-[10px] text-[var(--text-muted)] pt-1">
                      {repo.language && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          {repo.language}
                        </span>
                      )}
                      {repo.stargazers_count > 0 && (
                        <span className="flex items-center space-x-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{repo.stargazers_count}</span>
                        </span>
                      )}
                      <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════
             STATE 2: REPOSITORY FOLDER & CODE EXPLORER VIEW
             ══════════════════════════════════════════════════ */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Repo Subheader & Back Button */}
            <div className="p-2.5 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedRepo(null);
                    setCurrentPath('');
                    setFileSearch('');
                    setDirectApiItems(null);
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-lg hover:bg-[var(--bg-card)] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Repos</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    {totalMarkdownCount} notes
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/30">
                    {totalCodeCount} code
                  </span>
                  <button
                    onClick={() => handleLoadRepoTree(selectedRepo)}
                    disabled={isLoadingTree}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition"
                    title="Reload file tree"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTree ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Breadcrumb Path Navigator */}
              <div className="flex items-center space-x-1 text-[11px] font-mono overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => handleBreadcrumbClick(-1)}
                  className={`px-1.5 py-0.5 rounded hover:bg-[var(--bg-card)] transition truncate ${
                    !currentPath ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {selectedRepo.name}
                </button>

                {currentPath.split('/').filter(Boolean).map((seg, idx, arr) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                    <button
                      onClick={() => handleBreadcrumbClick(idx)}
                      className={`px-1.5 py-0.5 rounded hover:bg-[var(--bg-card)] transition truncate ${
                        idx === arr.length - 1
                          ? 'font-bold text-[var(--text-primary)] underline decoration-[var(--border-strong)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {seg}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Search Bar + 3-Way Filter Pills (All / Notes / Code) */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    placeholder="Search all files & code in repo..."
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 pl-7 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                  />
                  <Search className="w-3 h-3 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  {fileSearch && (
                    <button
                      onClick={() => setFileSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                      filterMode === 'all'
                        ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    All Files
                  </button>
                  <button
                    onClick={() => setFilterMode('notes')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                      filterMode === 'notes'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    Notes (.md)
                  </button>
                  <button
                    onClick={() => setFilterMode('code')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                      filterMode === 'code'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    Code Files
                  </button>
                </div>
              </div>

              {/* Truncated Tree Warning & API Sync Button */}
              {isTreeTruncated && (
                <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] flex items-center justify-between">
                  <span>Large repository tree (100k+ files).</span>
                  <button
                    onClick={() =>
                      handleFetchDirectContents(
                        selectedRepo.full_name.split('/')[0],
                        selectedRepo.name,
                        currentPath,
                        selectedRepo.default_branch
                      )
                    }
                    disabled={isLoadingDirectApi}
                    className="underline font-semibold hover:text-amber-400"
                  >
                    {isLoadingDirectApi ? 'Syncing...' : 'Sync Current Folder'}
                  </button>
                </div>
              )}
            </div>

            {/* Folder & Files List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
              {(isLoadingTree || isLoadingDirectApi) && (
                <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-xs">Reading repository folders & files...</p>
                </div>
              )}

              {treeError && !directApiItems && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs space-y-2">
                  <p>{treeError}</p>
                  <button
                    onClick={() =>
                      handleFetchDirectContents(
                        selectedRepo.full_name.split('/')[0],
                        selectedRepo.name,
                        currentPath,
                        selectedRepo.default_branch
                      )
                    }
                    className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[11px] font-semibold"
                  >
                    Load Folder via GitHub API
                  </button>
                </div>
              )}

              {!isLoadingTree && !isLoadingDirectApi && (
                <>
                  {/* Up one folder button (if inside a subfolder and not searching globally) */}
                  {currentPath && !isGlobalSearch && (
                    <button
                      onClick={handleGoUp}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center space-x-2 text-xs font-semibold"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>.. (Back to parent folder)</span>
                    </button>
                  )}

                  {/* List directory items */}
                  {folderItems.map((item) => {
                    const isDir = item.type === 'dir';
                    const isSelected = selectedFilePath === item.path;
                    const isLoadingThisFile = loadingFile === item.path;

                    if (isDir) {
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleOpenFolder(item.path)}
                          className="w-full text-left px-3 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition flex items-center justify-between group shadow-xs active:scale-[0.99]"
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            {item.childCount !== undefined && item.childCount > 0 && (
                              <span className="text-[9px] text-[var(--text-muted)]">
                                {item.childCount} items
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition" />
                          </div>
                        </button>
                      );
                    }

                    // File item (Notes & Code Files)
                    const isNote = item.isMarkdown;
                    const badgeText = item.badge || (isNote ? 'NOTE' : 'CODE');
                    const badgeClass =
                      item.badgeColor ||
                      (isNote
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : 'text-sky-400 bg-sky-500/10 border-sky-500/30');

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelectFile(item)}
                        disabled={isLoadingThisFile}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition flex items-center justify-between group shadow-xs active:scale-[0.99] ${
                          isSelected
                            ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-semibold shadow-md'
                            : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate pr-2">
                          {isLoadingThisFile ? (
                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                          ) : isNote ? (
                            <FileText
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-[var(--accent-contrast)]' : 'text-emerald-400'
                              }`}
                            />
                          ) : (
                            <FileCode
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-[var(--accent-contrast)]' : 'text-sky-400'
                              }`}
                            />
                          )}

                          <div className="truncate">
                            <p className="text-xs truncate">{item.name}</p>
                            {isGlobalSearch && (
                              <p
                                className={`text-[9px] truncate ${
                                  isSelected ? 'opacity-80' : 'text-[var(--text-muted)]'
                                }`}
                              >
                                {item.path}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {item.formattedSize && (
                            <span
                              className={`text-[9px] ${
                                isSelected ? 'opacity-80' : 'text-[var(--text-muted)]'
                              }`}
                            >
                              {item.formattedSize}
                            </span>
                          )}

                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md border ${
                              isSelected
                                ? 'bg-black/20 text-current border-transparent'
                                : badgeClass
                            }`}
                          >
                            {badgeText}
                          </span>

                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}

                  {folderItems.length === 0 && (
                    <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
                      <p className="text-xs">No matching files found in this folder</p>
                      {filterMode !== 'all' && (
                        <button
                          onClick={() => setFilterMode('all')}
                          className="text-[11px] underline text-[var(--accent)]"
                        >
                          Show all files
                        </button>
                      )}
                      <div>
                        <button
                          onClick={() =>
                            handleFetchDirectContents(
                              selectedRepo.full_name.split('/')[0],
                              selectedRepo.name,
                              currentPath,
                              selectedRepo.default_branch
                            )
                          }
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-lg text-[11px] text-[var(--text-secondary)] transition"
                        >
                          Sync from GitHub API
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
