# Lipi (लिपि) — Universal Bilingual PDF Reader & Precision Stylus Annotation Engine

> **A high-performance, adaptive Android reading and study platform engineered for seamless responsiveness across all form factors: from compact 5.0" smartphones (Xiaomi 14, Pixel 9, Galaxy S24) to ultra-large 14.6" tablets (Samsung Galaxy Tab S9/S10 Ultra & Moto Pad 70 Pro 144Hz).**

---

## 📖 Executive Summary

**Lipi (लिपि)** is an advanced bilingual study and document annotation platform built from the ground up on modern Android technologies (**Jetpack Compose**, **AndroidX Ink**, **Room DB**, **Google ML Kit OCR**, and **Text-to-Speech**). 

Unlike standard PDF viewers that suffer from sluggish rasterization, rigid layouts, or ink latency, Lipi delivers a hardware-accelerated, paper-like reading and writing experience. It features zero-latency vector inking (<2ms with hardware motion prediction), realistic 3D book-curl physics, continuous vertical scrolling, hierarchical topic management (folders inside folders), and an instant bilingual dictionary (English, Hindi, Nepali) with spaced-repetition flashcard retention.

---

## 📱 Universal Device Matrix & Responsive Architecture

Lipi implements an adaptive layout engine conforming to modern Android window size classes:

| Form Factor | Screen Width (`dp`) | Representative Devices | Layout Behavior |
| :--- | :--- | :--- | :--- |
| **Compact Phones** | `< 600 dp` | Xiaomi 14 (400dp), Pixel 9 (411dp), Galaxy S24 (360–412dp) | Clean, uncrowded branding; responsive horizontal action strip for quick tools (Notebook, Flashcards, Resume toggle, PDF import); 2-column folder grid with compact aspect ratio (1.18:1); stacked banner actions; single-column full-width document cards. |
| **Medium Tablets & Foldables** | `600 dp – 839 dp` | Galaxy Z Fold (unfolded), iPad Mini, 7–9" tablets | Inline TopAppBar actions; 3–4 column adaptive folder grid; 2-column document cards; expanded secondary navigation bar. |
| **Expanded & Ultra Tablets** | `≥ 840 dp` | Moto Pad 70 Pro 144Hz, Samsung Galaxy Tab S9/S10 Ultra (14.6"), Pixel Tablet | Wide desktop-class toolbars; 5–7 column adaptive folder grid; 3-column document cards; dual-pane modal dialogs; extended stylus palm rest margin. |

```
                                      +------------------------------------+
                                      |      Lipi Adaptive Shell           |
                                      +------------------------------------+
                                                        |
                        +-------------------------------+-------------------------------+
                        |                                                               |
              [ Compact Phone (<600dp) ]                                   [ Large / Ultra Tablet (>=600dp) ]
                        |                                                               |
       +----------------+----------------+                            +-----------------+-----------------+
       |                                 |                            |                                   |
TopAppBar (Branding Only)       Action Pill Strip           TopAppBar (Inline Actions)          Spacious Grid Layout
       |                                 |                            |                                   |
2-Column Adaptive Folders      Full-Width Book Cards        4-7 Column Dynamic Folders         Multi-Column Book Cards
```

---

## 🏛️ System Architecture

```
com.readmaster.app
├── data/
│   ├── db/
│   │   ├── ReadMasterDatabase.kt      # Room DB instance with MIGRATION_1_2 and MIGRATION_2_3
│   │   └── Daos.kt                    # DocumentDao, FolderDao, VocabularyDao (Flow-based)
│   ├── model/
│   │   ├── Entities.kt                # DocumentEntity, FolderEntity, VocabularyEntity
│   │   └── FolderIcons.kt             # 100+ SVG/Unicode iconography catalog categorized by topics
│   └── dictionary/
│       └── BilingualDictionary.kt     # Offline tri-lingual lexicon (English, Hindi, Nepali)
├── engine/
│   ├── canvas/
│   │   ├── InkCanvasView.kt           # Master touch router, gesture arbiter & 144Hz fling physics
│   │   ├── DryInkCanvasView.kt        # High-DPI committed vector ink & PDF text rendering
│   │   ├── CanvasTransform.kt         # Matrix zoom, pan, clamp, and boundary calculations
│   │   └── ReadingMode.kt             # BOOK_FLIP (page curl) vs CONTINUOUS_SCROLL
│   ├── pdf/
│   │   ├── PdfPageEngine.kt           # Native PdfRenderer wrapper, cache management, page sizing
│   │   └── PdfTiler.kt                # Ultra-sharp dynamic tile rasterizer for deep zoom
│   ├── palm/
│   │   ├── PalmRejectionFilter.kt     # Hardware stylus vs finger arbitration & edge rejection
│   │   └── PalmRejectionConfig.kt     # Configurable touch bounds, pressure sensitivity & palm thresholds
│   ├── lasso/
│   │   └── LassoTool.kt               # Freehand lasso selection, bounding box, hit test, transform & recolor
│   └── eraser/
│       ├── PrecisionEraser.kt         # Segment cutting & whole-stroke vector eraser
│       └── SpatialStrokeIndex.kt      # R-tree spatial indexing for instantaneous collision checks
├── speech/
│   └── TtsManager.kt                  # Android Text-To-Speech engine with language routing
└── ui/
    ├── library/
    │   └── LibraryScreen.kt           # Adaptive library: hierarchical drill-down, quick search & management
    ├── reader/
    │   └── ReaderScreen.kt            # Full-featured PDF reader, floating ink bar, Zen Mode, translation
    ├── dialogs/
    │   ├── CreateOrEditFolderDialog.kt# Dynamic icon/color customizer with CS/Dev subtopic presets
    │   ├── MoveDocumentFolderDialog.kt# Hierarchical topic tree selector for books
    │   ├── VocabNotebookDialog.kt     # Offline vocabulary bank with pronunciation
    │   ├── FlashcardReviewDialog.kt   # Leitner/SM-2 spaced repetition card engine
    │   └── WordLookupDialog.kt        # Instant OCR word lookup with Hindi/Nepali definitions
    └── theme/
        └── Theme.kt                   # Modern Material 3 slate/indigo dark & light design system
```

---

## ⚡ Key Technical Features & Implementation Details

### 1. Ultra-Low Latency Inking Pipeline (<2ms)
* **AndroidX Ink Engine**: Powered by `androidx.ink.authoring.InProgressStrokesView` and Stock Brushes for real-time stroke calculation.
* **Hardware Motion Prediction**: Integrates `androidx.input.motionprediction.MotionEventPredictor` to predict stylus trajectory up to 25ms ahead, eliminating perceived stylus lag.
* **Double-Buffered High-DPI Commits**: Upon stylus lift (`ACTION_UP`), in-flight strokes are committed to `DryInkCanvasView` as permanent vector `Stroke` objects, maintaining razor-sharp rendering at all zoom scales without pixelation or blur.
* **144Hz Display Synchronization**: Automatically requests `Window.attributes.preferredRefreshRate = 144.0f` on high-refresh displays like the Moto Pad 70 Pro and Xiaomi 14.

### 2. Dual Reading Engines
* **Book Flip Mode (Realistic 3D Page Curl)**: Provides an authentic book-reading experience with corner-turn curl physics, page turn animations, and edge-tap navigation.
* **Continuous Vertical Scroll Mode**: Renders pages in an uninterrupted vertical ribbon with dynamic off-screen caching, momentum fling physics (`OverScroller`), and sticky page indicators.
* **Fixed Screen Lock**: A dedicated viewport constraint mode that anchors the document to the display bounds, preventing accidental page drift while furiously taking handwritten notes.

### 3. Hierarchical Subject & Topic Organization
* **Folders Inside Folders**: Support for arbitrary nested depth (e.g., `Java` → `Multithreading`, `Spring Boot` → `Data JPA`, `System Design` → `HLD`).
* **Visual Icon Catalog**: Over 100+ topic-specific logos across categories like CS Core, Frameworks, Cloud, Algorithms, and Language study.
* **Smart Cascading Management**: Deleting a folder cleanly reassigns documents to the parent folder without data loss.

### 4. Vector Manipulation & Precision Editing
* **Freehand Lasso Tool**: Select any group of vector strokes with a hand-drawn marquee. Move, duplicate, recolor, or delete strokes with high-DPI visual dashed outlines visible across all zoom levels and reading modes.
* **Precision Segment Cutting & Stroke Eraser**: Dual-mode vector eraser powered by an internal `SpatialStrokeIndex` (R-tree spatial indexing) for instant $O(\log N)$ hit detection without frame drops.
* **Translucent Highlighter Engine**: Leverages proper alpha blending and luminance compositing so that multiple overlapping highlighter passes create a glowing study mark without blacking out underlying text.

### 5. Hardware Palm Rejection & Multi-Touch Arbitration
* **Pointer Type Discrimination**: Actively separates `TOOL_TYPE_STYLUS` from `TOOL_TYPE_FINGER`.
* **Configurable Input Modes**:
  1. *Pen Draws, Fingers Pan & Zoom*: Stylus is reserved exclusively for annotation, while finger gestures manipulate the viewport (pinch-to-zoom, pan, page flip).
  2. *Finger Draw Mode*: Allows full stylus-free drawing on phones or when stylus is unavailable.

### 6. Bilingual Study & Offline Flashcard Retention
* **Google ML Kit OCR**: Tapping or selecting any word in the PDF triggers instant optical character recognition.
* **Offline Bilingual Lexicon**: High-speed dictionary mapping English technical terms to Hindi and Nepali definitions with grammatical context.
* **Spaced Repetition Flashcards**: Implements the SuperMemo (SM-2) retention algorithm with graded intervals (1 to 4) and review scheduling.
* **Offline Text-to-Speech**: Crystal-clear pronunciation powered by Android's localized TTS engine.

---

## 🛠️ Building & Running

### Prerequisites
* **Android Studio Ladybug (2024.2.1)** or newer
* **Android SDK**: API 34+ (Compile SDK: 35, Min SDK: 28)
* **JDK**: OpenJDK 17 or 21
* **Gradle**: 8.7+

### Command-Line Build
```bash
# Clone repository
git clone https://github.com/RayAashish/creativity-with-ai.git
cd creativity-with-ai/dream-reader-for-all-devices/android

# Build Debug APK
./gradlew assembleDebug

# Install on target device (e.g. Xiaomi 14 or Moto Pad 70 Pro)
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Launch App
adb shell am start -n com.readmaster.app/.MainActivity
```

---

## 📄 License
This project is proprietary and developed as part of the **Creativity With AI** suite by [Aashish Kumar Ray](https://github.com/RayAashish). All rights reserved.
