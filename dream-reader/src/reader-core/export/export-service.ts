import { AnnotationRecord, DocumentRecord, VocabEntryRecord } from '../../types';

export class ExportService {
  /**
   * Generates Obsidian and Notion-friendly Markdown with YAML frontmatter,
   * highlights, comments, and a vocabulary study table.
   */
  generateMarkdownExport(
    document: DocumentRecord,
    annotations: AnnotationRecord[],
    vocab: VocabEntryRecord[]
  ): string {
    const now = new Date().toISOString().split('T')[0];

    const lines: string[] = [
      '---',
      `title: "${document.title}"`,
      `source: "${document.source}"`,
      `document_type: "${document.type}"`,
      `exported_date: "${now}"`,
      `total_annotations: ${annotations.length}`,
      `total_vocabulary: ${vocab.length}`,
      'tags:',
      '  - readmaster',
      '  - reading-notes',
      '---',
      '',
      `# ${document.title} — Reading Notes & Annotations`,
      '',
      `*Exported from ReadMaster on ${new Date().toLocaleDateString()}*`,
      '',
      '---',
      '',
      '## 📑 Annotations & Highlights',
      '',
    ];

    if (annotations.length === 0) {
      lines.push('*No annotations recorded for this document.*', '');
    } else {
      annotations.forEach((ann, idx) => {
        const pageLabel =
          ann.anchor.type === 'pdf' ? `Page ${ann.anchor.page}` : 'Markdown';
        const kindBadge = ann.kind.toUpperCase();

        lines.push(`### ${idx + 1}. [${kindBadge}] ${pageLabel}`);

        if (ann.anchor.textQuote) {
          lines.push(`> "${ann.anchor.textQuote}"`);
          lines.push('');
        }

        if (ann.noteText && ann.noteText.trim()) {
          lines.push(`**Note:** ${ann.noteText.trim()}`);
          lines.push('');
        }

        if (ann.strokes && ann.strokes.length > 0) {
          lines.push(`*Ink drawing with ${ann.strokes.length} vector stroke(s).*`);
          lines.push('');
        }

        lines.push(`*(Created: ${new Date(ann.createdAt).toLocaleString()})*`);
        lines.push('');
      });
    }

    lines.push('---', '', '## 📖 Vocabulary & Glossary', '');

    if (vocab.length === 0) {
      lines.push('*No vocabulary entries saved for this document.*', '');
    } else {
      lines.push('| Word | Phonetic | Hindi Meaning | Nepali Meaning | Context Sentence |');
      lines.push('| :--- | :--- | :--- | :--- | :--- |');

      vocab.forEach((v) => {
        const sense = v.meanings.senses[0];
        const hindi = sense?.hindi.join('; ') || '-';
        const nepali = sense?.nepali.join('; ') || '-';
        const phonetic = v.meanings.devanagariPhonetic || v.meanings.phonetic || '-';
        const sentence = v.sourceSentence ? v.sourceSentence.replace(/\|/g, '/') : '-';

        lines.push(`| **${v.word}** | ${phonetic} | ${hindi} | ${nepali} | ${sentence} |`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generates Anki-ready CSV with UTF-8 BOM encoding for Hindi/Nepali Devanagari script.
   */
  generateAnkiCsv(vocab: VocabEntryRecord[], documentTitle: string): string {
    const rows = [
      ['Front', 'Back', 'Context Sentence', 'Document', 'Tags'],
    ];

    vocab.forEach((v) => {
      const senses = v.meanings.senses
        .map((s) => {
          const hi = s.hindi.length ? `<b>Hindi:</b> ${s.hindi.join('; ')}` : '';
          const ne = s.nepali.length ? `<b>Nepali:</b> ${s.nepali.join('; ')}` : '';
          const def = s.englishDefinition ? `<i>${s.englishDefinition}</i>` : '';
          return [hi, ne, def].filter(Boolean).join('<br>');
        })
        .join('<hr>');

      const pronunciation = v.meanings.devanagariPhonetic
        ? `<div style="color: #d97706;">[${v.meanings.devanagariPhonetic}]</div>`
        : '';

      const front = `<b>${v.word}</b>${pronunciation}`;
      const back = senses;
      const context = v.sourceSentence || '';
      const tags = 'readmaster technical-english';

      rows.push([
        front.replace(/"/g, '""'),
        back.replace(/"/g, '""'),
        context.replace(/"/g, '""'),
        documentTitle.replace(/"/g, '""'),
        tags,
      ]);
    });

    // Format with quotes and UTF-8 BOM
    const csvContent = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(','))
      .join('\r\n');

    return '\uFEFF' + csvContent; // \uFEFF ensures Excel and Anki detect UTF-8 properly
  }

  /**
   * Generates a complete JSON backup of document annotations and vocabulary.
   */
  generateJsonExport(
    document: DocumentRecord,
    annotations: AnnotationRecord[],
    vocab: VocabEntryRecord[]
  ): string {
    return JSON.stringify(
      {
        version: '1.0',
        app: 'ReadMaster',
        exportedAt: new Date().toISOString(),
        document,
        annotations,
        vocabulary: vocab,
      },
      null,
      2
    );
  }

  /**
   * Triggers a browser download of the content string.
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
