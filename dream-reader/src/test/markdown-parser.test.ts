import { describe, it, expect } from 'vitest';
import { extractMarkdownHeadings, slugifyHeading } from '../reader-core/markdown/markdown-parser';

describe('Markdown Parser & Outline Extractor', () => {
  it('slugifies headings reliably', () => {
    expect(slugifyHeading('Getting Started with React')).toBe('getting-started-with-react');
    expect(slugifyHeading('Chapter 1: The Basics (v2.0)')).toBe('chapter-1-the-basics-v20');
  });

  it('extracts table of contents hierarchy from markdown', () => {
    const md = `
# System Architecture
Overview of the core system.

## Memory Management
Virtual memory and paging.

### Page Tables
Multi-level page tables.

## Process Scheduling
Round robin and priority queues.
    `;

    const outline = extractMarkdownHeadings(md);
    expect(outline.length).toBe(4);
    expect(outline[0]).toMatchObject({
      title: 'System Architecture',
      slug: 'system-architecture',
      level: 1,
    });
    expect(outline[1]).toMatchObject({
      title: 'Memory Management',
      slug: 'memory-management',
      level: 2,
    });
    expect(outline[2]).toMatchObject({
      title: 'Page Tables',
      slug: 'page-tables',
      level: 3,
    });
    expect(outline[3]).toMatchObject({
      title: 'Process Scheduling',
      slug: 'process-scheduling',
      level: 2,
    });
  });

  it('disambiguates identical headings with suffixes', () => {
    const md = `
# Introduction
## Details
# Introduction
## Details
    `;

    const outline = extractMarkdownHeadings(md);
    expect(outline[0].slug).toBe('introduction');
    expect(outline[1].slug).toBe('details');
    expect(outline[2].slug).toBe('introduction-1');
    expect(outline[3].slug).toBe('details-1');
  });
});
