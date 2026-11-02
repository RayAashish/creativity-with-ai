export type ThemeType = 'github' | 'academic' | 'modern' | 'minimal' | 'executive';

export type PageFormat = 'A4' | 'Letter' | 'Legal';

export type PageOrientation = 'portrait' | 'landscape';

export type MarginSize = 'compact' | 'standard' | 'generous';

export type FontSize = 'small' | 'normal' | 'large';

export type FontFamily = 'sans' | 'serif' | 'mono';

export type CodeTheme = 'github' | 'dracula' | 'atom-one' | 'monokai';

export type AppTheme = 'dark' | 'beige' | 'light';

export interface PdfSettings {
  theme: ThemeType;
  format: PageFormat;
  orientation: PageOrientation;
  margin: MarginSize;
  fontSize: FontSize;
  fontFamily: FontFamily;
  showPageNumbers: boolean;
  showHeader: boolean;
  headerTitle: string;
  showDate: boolean;
  showToc: boolean;
  codeTheme: CodeTheme;
}

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
}

export type InputMode = 'upload' | 'url' | 'editor';

export type TabletViewMode = 'split' | 'editor' | 'preview';
