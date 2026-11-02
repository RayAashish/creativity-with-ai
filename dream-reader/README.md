# ReadMaster (पढाई-मास्टर)

> Offline-first web application for reading technical PDFs and GitHub Markdown files, with built-in English → Hindi & Nepali lookup, Spaced Repetition vocabulary review, and rich annotation.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js v18+ (tested on Node v24)
- npm v9+

### 2. Install & Run
```bash
# Clone and enter directory
cd dream-reader

# Install dependencies
npm install

# Start development servers (Vite frontend on :5180 + Translation proxy on :3050)
npm run start

# Run test suite (43 automated tests across 11 suites)
npm test

# Build for production
npm run build
```

The application is live at:
- **Web App**: `http://localhost:5180`
- **Translation & Sync Proxy**: `http://localhost:3050` (`/api/health`, `/api/translate`, `/api/explain`, `/api/sync/pull`, `/api/sync/push`, `/api/sync/share`)

---

## 🌟 Complete Feature Roadmap (Phases 1 through 5)

| Phase | Milestone | Status | Key Deliverables |
|---|---|---|---|
| **Phase 1** | Reader Foundations | ✅ Completed | PDF & GitHub Markdown reader, virtualized PDF scroll, themes, reading position persistence. |
| **Phase 2** | Instant Lookup & Vocab | ✅ Completed | Hindi & Nepali word/sentence popover, Web Speech audio, offline dictionary, proxy with glossary preservation. |
| **Phase 3** | Rich Annotations & Ink | ✅ Completed | 5-color highlights, comments with deep links, stylus ink (`perfect-freehand`), notes sidebar, export (Obsidian/Anki/JSON). |
| **Phase 4** | Advanced Learning & PWA | ✅ Completed | SRS Flashcards (SM-2), "Explain this" AI helper, Bilingual side-by-side mode, Read-Aloud with synced highlighting, Universal search (`Cmd+K`), Reading insights, PWA installable. |
| **Phase 5** | Sync, Sharing & Android | ✅ Completed | PostgreSQL schema, bidirectional sync (`/push`, `/pull`), shareable read-only links (`/share`), Capacitor Android config. |

---

## 🧠 Phase 4 Features (Advanced Learning & Offline Polish)

### 1. Spaced Repetition Flashcards (SM-2 Algorithm)
- **SuperMemo-2 (SM-2) Engine**: Calculates ease factor ($EF \ge 1.3$), repetition count, and interval in days based on user rating:
  - `Again` (Grade 0): Resets interval to 1 day.
  - `Hard` (Grade 3): Slightly decreases ease factor.
  - `Good` (Grade 4): Standard interval growth ($I = I \times EF$).
  - `Easy` (Grade 5): Boosts ease factor and expands review interval.
- **Interactive 3D Flip Card**: Displays word, IPA phonetics, source sentence quote on front; reveals Hindi & Nepali meanings on flip.
- **Daily Review Streak**: Tracks continuous reading and review streaks with visual flame counters.

### 2. "Explain This" AI Assistant
- **Accessible from Lookup**: Click **"✨ Explain"** on any selected phrase or sentence in a PDF or Markdown file.
- **Multi-language explanations**: English, Hindi (हिंदी), and Nepali (नेपाली).
- **Targeted Modes**:
  - `Beginner Mode`: Breaks down complex concepts with intuitive daily life analogies.
  - `Standard Mode`: Concise, direct, technical summary.
  - `Code Mode`: Breaks down code snippets, data flow, parameters, and complexity.
- **Hybrid Architecture**: Uses Google Gemini API when `GEMINI_API_KEY` is present; seamlessly switches to ReadMaster's built-in intelligent technical explainer when offline or unconfigured.

### 3. Bilingual Side-by-Side Parallel Reader
- Toggle via the **"Bilingual"** button in PDF/Markdown toolbars.
- Synchronized reading view showing original paragraphs alongside sentence-by-sentence Hindi or Nepali translations.
- Preserves technical keywords (`thread`, `mutex`, `virtual memory`, `heap`, `cache`) in English / Devanagari transliteration.

### 4. Read-Aloud with Synced Word Highlighting
- Powered by `SpeechSynthesis` with `onboundary` word event tracking.
- Floating playback bar with Play / Pause / Resume, Next / Previous sentence skipping, and adjustable reading speeds (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
- Automatically scrolls with the active speech boundary.

### 5. Universal Global Search (`Cmd+K` / `Ctrl+K`)
- Instant fuzzy search across:
  - **Documents**: Titles, file names, GitHub repository paths.
  - **Annotations**: Highlighted quotes, comment notes, and deep link pins.
  - **Vocabulary**: Words, source sentences, Hindi meanings, Nepali meanings.
- Direct jump: clicking a search result navigates directly to the document and page.

### 6. Reading Insights & Habit Tracker
- Tracks total reading time in minutes and hours, pages read, and words mastered.
- Visual 7-day activity graph and consecutive-day reading streak badge in the top navbar.

### 7. Progressive Web App (PWA)
- Full `manifest.json` with theme colors, display standalone, and icons.
- Service worker (`sw.js`) precaching reader shell for offline capability.

---

## ☁️ Phase 5 Features (Accounts, PostgreSQL Sync, Sharing & Android)

### 1. PostgreSQL Schema (`server/schema.sql`)
- Multi-user data model ready for cloud deployment:
  - `users`: User identity, email, password hash, created/updated timestamps.
  - `documents` & `document_blobs`: Portable sync-ready document metadata and binary storage.
  - `annotations`: Sync-tracked text anchors, vector strokes, and comment notes.
  - `vocabulary`: Spaced repetition states (`repetitions`, `interval_days`, `ease_factor`, `next_review_at`).
  - `shareable_links`: Cryptographic tokens for public read-only document sharing.

### 2. Cloud Sync Endpoints
- `POST /api/sync/push`: Accepts locally modified documents, annotations, and vocabulary records, resolving conflicts using timestamp comparison.
- `POST /api/sync/pull`: Returns changes committed after `lastSyncedAt`.
- `POST /api/sync/share`: Generates a public shareable URL with a secure 24-character hexadecimal token.
- `GET /api/sync/share/:token`: Public read-only viewer for shared annotated documents.

### 3. Android Port Preparation (Capacitor)
- Pre-configured `capacitor.config.json` with:
  - App ID: `com.readmaster.app`
  - Name: `ReadMaster`
  - Web directory: `dist`
  - Android schemes and stylus input capture settings.
- Build instructions for Android:
  ```bash
  # 1. Build the production web bundle
  npm run build

  # 2. Add and sync Capacitor Android platform
  npx cap add android
  npx cap sync android

  # 3. Open in Android Studio to build APK or run on emulator/device
  npx cap open android
  ```

---

## 📖 Phase 2 Features (Instant Lookup & Vocabulary Notebook)

### 1. Instant Lookup Popover
- **Word Lookup**: Double-click or select any English word to open an immediate floating popover.
- **Bilingual Meanings**: Displays Hindi (हिंदी) and Nepali (नेपाली) definitions with parts of speech.
- **Audio Pronunciation**: Click the speaker icon to hear the English pronunciation via the Web Speech API (`speechSynthesis`).
- **Phonetics**: IPA phonetics + Devanagari transliteration (e.g. `वर्चुअलाइजेशन`, `थ्रेड`).
- **Sentence / Paragraph Translation**: Select a full sentence to get sentence translation with Hindi / Nepali / Both toggle.
- **Context-Aware Technical Term Preservation**: Prevents translation mistranslating terms like `thread`, `process`, `virtual memory`, `mutex`, `API`.
- **Keyboard Dismiss**: Press `Esc` or click anywhere outside to close without interrupting reading flow.

### 2. Vocabulary Notebook
- Click **"Save Word"** in the popup to store the word, meanings, and source sentence.
- Accessible via the **"Notebook"** button in the top navbar with a live count badge.
- Words are pinned to their source document and page number with a **"Return to text"** link that scrolls back to the exact location.
- Search and filter across saved words and source sentences.
- Sync-ready data structure initialized with Spaced Repetition (SM-2) review states.

---

## 🎨 Phase 3 Features (Rich Annotations, Stylus Ink & Export)

### 1. Text Annotations & Palette
- **5-Color Palette**: Yellow (`#fef08a`), Green (`#bbf7d0`), Blue (`#bae6fd`), Pink (`#fbcfe8`), Purple (`#e9d5ff`).
- **Highlight, Underline & Strikethrough**: One-click actions right inside the floating selection bar.
- **Comments with Deep Links**: Attach notes to any phrase. Each comment creates a clickable pin on the text and has a unique deep link (e.g. `#annotation-abc123`) that scrolls directly to it.
- **Editable & Deletable**: Edit comment notes inline or delete them with instant reactivity.

### 2. Freehand Stylus & Touch Ink
- **Powered by `perfect-freehand`**: Pressure sensitivity, organic thinning, and smooth spline tapering for pen and highlighter strokes.
- **Hardware Agnostic**: Works with Wacom styluses, Apple Pencils, Samsung S-Pen, or mouse.
- **Palm Rejection**: Filters non-primary touch events when using an active stylus.
- **Normalized Vector Strokes**: Coordinates are stored as `(0-1)` ratios relative to page dimensions, guaranteeing that ink scales crisply and positions accurately across any zoom level (50% to 300%).
- **Floating Inking Toolbar**: Quick tool toggle (Pen vs. Highlighter), color selection, 3 stroke thicknesses, and single-click stroke Undo.

### 3. Annotation Sidebar
- Dedicated **"Notes"** tab inside the reader sidebar.
- Filter by kind: All, Highlights, Underlines, Strikethroughs, Comments, or Ink drawings.
- Displays quotes, notes, creation dates, and page badges.
- Click any entry to jump straight to the page and center the annotation.

### 4. Rich Exporting
- **Obsidian & Notion Markdown**: Formatted note with YAML frontmatter, quote blocks, notes, and a structured vocabulary study table.
- **Anki CSV**: Pre-formatted deck with UTF-8 BOM encoding for Hindi & Nepali Devanagari script, word fronts, and rich back definitions.
- **JSON Backup**: Complete document backup containing text anchors, vector strokes, and metadata.

---

## 🏗️ Phase 1 Architecture Overview

```
src/
├── types/                 # Portable data models & JSON schemas (sync-ready)
│   ├── document.ts        # DocumentRecord, DocumentPosition, OutlineItem, GitHubMetadata
│   ├── annotation.ts      # AnnotationRecord, PdfAnchor, MarkdownAnchor, InkStroke
│   ├── vocab.ts           # VocabEntryRecord, MeaningSense, SRSState
│   ├── lookup.ts          # LookupCacheRecord, LookupResult, TargetLanguage
│   ├── settings.ts        # ReaderSettingsRecord, ThemeMode, FontSize
│   └── github.ts          # GitHubRepoRef, GitHubTreeItem
│
├── storage/               # IndexedDB storage abstraction via Dexie
│   ├── db.ts              # ReadMasterDB schema definition (versioned)
│   ├── DocumentRepository.ts # Document & blob persistence, position updates, soft delete
│   └── SettingsRepository.ts # Reader configuration & theme persistence
│
├── reader-core/           # Rendering, navigation & text anchoring engines
│   ├── pdf/
│   │   ├── pdf-init.ts    # PDF.js worker setup (local offline bundle)
│   │   ├── pdf-loader.ts  # Document parsing, metadata & outline/TOC extraction
│   │   ├── pdf-search.ts  # Multi-page fast text search engine with sentence extraction
│   │   └── pdf-thumbnail.ts # Low-overhead page thumbnail rendering
│   ├── markdown/
│   │   ├── markdown-parser.ts # Heading TOC extraction & slug generation
│   │   ├── github-resolver.ts # GitHub URL parsing, raw link & image resolution
│   │   └── ...
│   └── anchoring/
│       ├── text-quote.ts  # W3C TextQuoteSelector generator & matcher (prefix/exact/suffix)
│       └── pdf-rects.ts   # Normalized 0-1 coordinates relative to page dimensions
│
├── services/              # Business logic & external API interfaces
│   ├── library-service.ts # File imports, SHA-256 deduplication, position tracking
│   ├── github-service.ts  # GitHub REST API client, tree fetching, commit change detection
│   └── theme-service.ts   # Light / Sepia / Dark theme application
│
├── stores/                # Global UI state (Zustand)
│   ├── library-store.ts   # Library documents, active filter, import states
│   ├── reader-store.ts    # Active document, virtualized pages, zoom, TOC, search
│   └── settings-store.ts  # Theme, font sizes, target languages
│
└── ui/                    # React UI components
    ├── layout/            # Navbar, KeyboardShortcutsModal
    ├── library/           # LibraryView, FileDropzone, DocumentCard, GitHubImportModal
    └── reader/
        ├── pdf/           # PdfViewer (virtualized), PdfPage (canvas+textLayer), PdfToolbar, PdfSidebar
        └── markdown/      # MarkdownViewer, MarkdownToolbar, CodeBlock
```

---

## 📦 Data Model (Sync-Ready JSON Schema)

Every record contains:
- `id`: UUID v4
- `updatedAt`: ISO 8601 timestamp
- `deletedAt`: nullable ISO 8601 timestamp (soft-delete for eventual bidirectional sync with Phase 4/5 backend)

### Key Entities
1. **DocumentRecord**:
   ```typescript
   {
     id: string;
     type: "pdf" | "md";
     source: "local" | "github";
     hash: string; // SHA-256 of file content
     title: string;
     fileName: string;
     fileSize: number;
     lastPosition?: { type: "pdf", page: number } | { type: "md", scrollRatio: number };
     metadata?: { github?: GitHubMetadata, ... };
     createdAt: string;
     updatedAt: string;
     deletedAt?: string | null;
   }
   ```
2. **Anchor**:
   - PDF: Normalized bounding boxes `(0-1)` relative to the page viewport + selected text quote
   - Markdown: W3C TextQuoteSelector (`exact`, `prefix`, `suffix`, `headingPath`)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| `j` / `↓` / `Space` | Next page / scroll down |
| `k` / `↑` | Previous page / scroll up |
| `+` / `-` | Zoom in / Zoom out |
| `0` | Reset zoom to 100% |
| `f` | Toggle Fit Width / Fit Page |
| `t` | Cycle Theme (Light → Sepia → Dark) |
| `b` | Toggle Navigation Sidebar |
| `Cmd/Ctrl + F` | Search inside active document |
| `?` | Keyboard shortcuts cheat-sheet |
| `Esc` | Close modal / return |

---

## 🧪 Testing

Run automated tests:
```bash
npm test
```
Includes:
- **Anchoring**: W3C TextQuoteSelector matching, duplicate phrase disambiguation, PDF rect normalization & denormalization across zoom.
- **GitHub Resolver**: URL parsing, relative path resolution (`./` and `../`), raw image URL transformation.
- **Markdown Parser**: Heading hierarchy extraction and slug generation.
- **Storage Layer**: IndexedDB CRUD, reading position persistence, content deduplication via SHA-256, and soft delete.
- **PDF Engine**: PDF loading, page extraction, outline/TOC extraction, and multi-page text search with snippets.
