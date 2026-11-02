import { describe, it, expect } from 'vitest';
import {
  parseGitHubUrl,
  resolveRelativePath,
  getGitHubRawUrl,
  resolveMarkdownImageSrc,
} from '../reader-core/markdown/github-resolver';

describe('GitHub URL & Relative Path Resolver', () => {
  it('parses repository root URL', () => {
    const res = parseGitHubUrl('https://github.com/facebook/react');
    expect(res).toEqual({
      owner: 'facebook',
      repo: 'react',
      branch: 'HEAD',
      path: '',
    });
  });

  it('parses repository blob URL with branch and file path', () => {
    const res = parseGitHubUrl('https://github.com/rust-lang/book/blob/main/src/ch01-00-getting-started.md');
    expect(res).toEqual({
      owner: 'rust-lang',
      repo: 'book',
      branch: 'main',
      path: 'src/ch01-00-getting-started.md',
    });
  });

  it('parses repository tree URL', () => {
    const res = parseGitHubUrl('https://github.com/torvalds/linux/tree/master/Documentation');
    expect(res).toEqual({
      owner: 'torvalds',
      repo: 'linux',
      branch: 'master',
      path: 'Documentation',
    });
  });

  it('resolves relative path segments with . and ..', () => {
    expect(resolveRelativePath('docs/guide/index.md', './setup.md')).toBe('docs/guide/setup.md');
    expect(resolveRelativePath('docs/guide/index.md', '../api/client.md')).toBe('docs/api/client.md');
    expect(resolveRelativePath('README.md', 'images/arch.png')).toBe('images/arch.png');
    expect(resolveRelativePath('docs/deep/nested/page.md', '../../root.md')).toBe('docs/root.md');
  });

  it('generates GitHub raw URL for images', () => {
    const raw = getGitHubRawUrl('facebook', 'react', 'main', 'fixtures/test.png');
    expect(raw).toBe('https://raw.githubusercontent.com/facebook/react/main/fixtures/test.png');
  });

  it('resolves markdown image sources with GitHub metadata', () => {
    const meta = {
      owner: 'facebook',
      repo: 'react',
      branch: 'main',
      path: 'packages/react-dom/README.md',
    };

    const resolved = resolveMarkdownImageSrc('./banner.png', meta);
    expect(resolved).toBe('https://raw.githubusercontent.com/facebook/react/main/packages/react-dom/banner.png');

    // External image should remain unchanged
    const external = 'https://example.com/logo.svg';
    expect(resolveMarkdownImageSrc(external, meta)).toBe(external);
  });
});
