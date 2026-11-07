import React, { useState, useEffect, useMemo } from 'react';
import {
  GitBranch,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
  Key,
  Star,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  BookOpen,
  X,
  ArrowLeft
} from 'lucide-react';
import {
  GitHubRepo,
  GitHubTreeItem,
  ExplorerItem,
  fetchUserRepos,
  fetchRepoTree,
  getItemsInDirectory,
  fetchRawMarkdown,
  extractGitHubUsername
} from '../utils/githubService';

interface GitHubExplorerProps {
  onSelectNote: (content: string, fileName: string, title: string, sourceUrl?: string) => void;
  activeFileName?: string;
  onNavigateToPreview?: () => void;
}

const STORAGE_KEYS = {
  USERNAME: 'markpdf_github_username',
  TOKEN: 'markpdf_github_token',
  REPO: 'markpdf_github_selected_repo',
  PATH: 'markpdf_github_current_path',
  FILE: 'markpdf_github_selected_file'
};

export const GitHubExplorer: React.FC<GitHubExplorerProps> = ({
  onSelectNote,
  activeFileName,
  onNavigateToPreview
}) => {
  // Username state (Default to RayAashish or saved)
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || 'RayAashish';
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
      const saved = localStorage.getItem(STORAGE_KEYS.REPO);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tree & Folder state
  const [tree, setTree] = useState<GitHubTreeItem[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PATH) || '';
  });

  const [selectedFilePath, setSelectedFilePath] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.FILE) || '';
  });

  const [fileSearch, setFileSearch] = useState<string>('');
  const [onlyMarkdown, setOnlyMarkdown] = useState<boolean>(true);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  // Save username & token to localStorage
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
  }, [currentPath]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILE, selectedFilePath);
  }, [selectedFilePath]);

  // Load repositories for current username
  const handleFetchRepos = async (userToFetch?: string) => {
    const user = extractGitHubUsername(userToFetch || username);
    if (!user) return;

    setIsLoadingRepos(true);
    setRepoError(null);

    try {
      const fetchedRepos = await fetchUserRepos(user, token);
      setRepos(fetchedRepos);

      // If we don't have a selected repo or the user changed, reset repo selection
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

    try {
      const { tree: fullTree } = await fetchRepoTree(
        repo.full_name.split('/')[0],
        repo.name,
        repo.default_branch || 'main',
        token
      );
      setTree(fullTree);
    } catch (err: any) {
      setTreeError(err.message || 'Failed to load repository folder structure.');
    } finally {
      setIsLoadingTree(false);
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

  // Handle clicking a file to load into MarkPDF editor & preview
  const handleSelectFile = async (item: ExplorerItem | GitHubTreeItem) => {
    if (!selectedRepo) return;
    const filePath = item.path;
    const owner = selectedRepo.full_name.split('/')[0];
    const repoName = selectedRepo.name;
    const branch = selectedRepo.default_branch || 'main';

    setLoadingFile(filePath);
    try {
      const content = await fetchRawMarkdown(owner, repoName, branch, filePath, token);
      setSelectedFilePath(filePath);

      const fileName = filePath.split('/').pop() || 'note.md';
      // Extract title from markdown heading or filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : fileName.replace(/\.md$/i, '');
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${filePath}`;

      onSelectNote(content, fileName, title, rawUrl);
    } catch (err: any) {
      alert(`Could not load note: ${err.message}`);
    } finally {
      setLoadingFile(null);
    }
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
        const isMd = /\.(md|markdown|mdx|txt)$/i.test(item.path);
        if (onlyMarkdown && !isMd) return false;
        return item.path.toLowerCase().includes(q);
      });

      const explorerItems: ExplorerItem[] = matched.map((m) => {
        const name = m.path.split('/').pop() || m.path;
        return {
          name,
          path: m.path,
          type: 'file',
          isMarkdown: /\.(md|markdown|mdx|txt)$/i.test(m.path),
          size: m.size
        };
      });

      return { folderItems: explorerItems, isGlobalSearch: true };
    }

    // Normal folder view
    let items = getItemsInDirectory(tree, currentPath);
    if (onlyMarkdown) {
      items = items.filter((item) => item.type === 'dir' || item.isMarkdown);
    }
    return { folderItems: items, isGlobalSearch: false };
  }, [tree, currentPath, fileSearch, onlyMarkdown]);

  // All markdown files count in this repo
  const totalMarkdownCount = useMemo(() => {
    return tree.filter((t) => t.type === 'blob' && /\.(md|markdown|mdx|txt)$/i.test(t.path)).length;
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
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-3 py-2 pl-8 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition"
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
            className={`p-2 rounded-xl border transition ${
              token
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
            title="GitHub Personal Access Token (Optional)"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Collapsible GitHub Token Input */}
        {showTokenInput && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 animate-in fade-in duration-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">
                GitHub Token (Optional)
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">Increases API limit to 5000/hr</span>
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
                  <p className="text-[11px]">Enter a GitHub username and tap "Fetch" to explore repositories & notes.</p>
                </div>
              )}

              {!isLoadingRepos &&
                filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleLoadRepoTree(repo)}
                    className="w-full text-left p-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition group flex flex-col space-y-1.5 shadow-sm"
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
             STATE 2: REPOSITORY FOLDER & NOTE EXPLORER VIEW
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
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-lg hover:bg-[var(--bg-card)] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Repos</span>
                </button>

                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    {totalMarkdownCount} notes
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

              {/* Note Search & Markdown Toggle Bar */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    placeholder="Search notes in this repo..."
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

                <button
                  onClick={() => setOnlyMarkdown(!onlyMarkdown)}
                  className={`px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition shrink-0 ${
                    onlyMarkdown
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Show only markdown files"
                >
                  MD Only
                </button>
              </div>
            </div>

            {/* Folder & Files List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
              {isLoadingTree && (
                <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-xs">Reading repository structure...</p>
                </div>
              )}

              {treeError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
                  {treeError}
                </div>
              )}

              {!isLoadingTree && !treeError && (
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
                          className="w-full text-left px-3 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition flex items-center justify-between group shadow-sm"
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                              {item.name}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition shrink-0" />
                        </button>
                      );
                    }

                    // File item (Markdown files styled prominently as notes)
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelectFile(item)}
                        disabled={isLoadingThisFile}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition flex items-center justify-between group shadow-sm ${
                          isSelected
                            ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] font-semibold shadow-md'
                            : item.isMarkdown
                            ? 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-primary)]'
                            : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate pr-2">
                          {isLoadingThisFile ? (
                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                          ) : (
                            <FileText
                              className={`w-4 h-4 shrink-0 ${
                                isSelected
                                  ? 'text-[var(--accent-contrast)]'
                                  : item.isMarkdown
                                  ? 'text-sky-500'
                                  : 'text-[var(--text-muted)]'
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
                          {item.isMarkdown && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                                isSelected
                                  ? 'bg-black/20 text-current'
                                  : 'bg-[var(--badge-bg)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                              }`}
                            >
                              NOTE
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}

                  {folderItems.length === 0 && (
                    <div className="py-12 text-center text-[var(--text-muted)] space-y-1">
                      <p className="text-xs">No files found in this folder</p>
                      {onlyMarkdown && (
                        <button
                          onClick={() => setOnlyMarkdown(false)}
                          className="text-[11px] underline text-[var(--accent)]"
                        >
                          Show all files
                        </button>
                      )}
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
