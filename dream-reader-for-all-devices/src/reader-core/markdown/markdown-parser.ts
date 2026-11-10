import { OutlineItem } from '../../types';

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function extractMarkdownHeadings(markdown: string): OutlineItem[] {
  const lines = markdown.split('\n');
  const items: OutlineItem[] = [];
  const slugCounts: Record<string, number> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match # Heading, ## Heading, etc. (up to 4 levels)
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawTitle = match[2].trim().replace(/[*_~`]/g, ''); // strip markdown formatting from title
      const baseSlug = slugifyHeading(rawTitle) || `heading-${i}`;

      const count = slugCounts[baseSlug] || 0;
      slugCounts[baseSlug] = count + 1;
      const slug = count > 0 ? `${baseSlug}-${count}` : baseSlug;

      items.push({
        id: `md-heading-${i}-${slug}`,
        title: rawTitle,
        slug,
        level,
      });
    }
  }

  return items;
}
