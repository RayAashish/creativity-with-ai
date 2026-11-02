# System Architecture & Technical Design

## 1. Modular Structure

```
dream-note-taking-app/
├── :app              # Application entry, DI wiring, Baseline Profile installer, main activity
├── :ink-engine       # Low-latency SurfaceView canvas, front-buffered renderer, motion prediction, palm rejection
├── :document         # Page/stroke models, undo/redo command stack, binary serialization, spatial indexing
├── :library          # Folders/Notebooks/Pages Room DB + FTS5 search, DSA problem page model, spaced repetition
├── :pdf              # PDFium/PdfRenderer background tiled tile-cache virtualizer
├── :recognition      # Offline ML Kit Digital Ink Recognition & text OCR
├── :export           # .inkflow zip bundle, PDF vector exporter, Markdown exporter
├── :design-system    # Material 3 typography, adaptive large-screen layout tokens, custom icons
└── :benchmark        # Macrobenchmark suite, startup metrics, frame timing metrics
```

---

## 2. Inking Pipeline (Zero-Allocation Hot Path)

```
[Stylus Digitizer HW]
         │ (requestUnbufferedDispatch)
         ▼
[InkCanvasView (SurfaceView)]
         │
         ├──► [Palm Rejection Filter]
         │         │ (Stylus priority, touch_major check, cancel handler)
         │         ▼
         ├──► [MotionEventPredictor] ──► Extrapolates future coordinates
         │
         ▼
[GLFrontBufferedRenderer / InProgressStrokes] (Wet Ink)
         │ Writes directly to scanout front-buffer
         ▼
[Display Controller (Adreno 825 @ 144 Hz)]  (Total latency ≤ 10 ms)
         │
         ▼ (Stylus Lift / ACTION_UP)
[Document Command Stack] ──► Finalized Stroke committed (Dry Ink)
         │
         ├──► [CanvasStrokeRenderer] (Renders to persistent layer)
         ├──► [Spatial Index (R-Tree / Grid)] (Instant lasso/eraser queries)
         └──► [Async Append-Only Disk Worker] (Non-blocking binary log write)
```

---

## 3. Concurrency & Threading Model

* **Main Thread (UI/Chrome):** Jetpack Compose renders toolbars, sidebar file tree, dialogs, and navigation. Never touches per-point touch streaming.
* **Input / Render Thread:** Direct event processing on `SurfaceView`. Uses pre-allocated event pools and ring buffers to ensure zero memory allocations during stroke authoring.
* **Storage Worker (`Dispatchers.IO`):** Non-blocking append-only disk writer for strokes and asynchronous database operations.
* **Tiling & OCR Worker (`Dispatchers.Default`):** Asynchronous background thread pool for generating PDF zoom tiles and on-device ML Kit handwriting recognition.

---

## 4. Crash-Safety & Storage Guarantees

* Notebook metadata is managed via SQLite in WAL (Write-Ahead Logging) mode with `PRAGMA synchronous = NORMAL`.
* Each page's stroke stream is stored in an independent file (`notebooks/<id>/pages/<pageId>.ink`).
* Append-only format: appending new strokes does not rewrite existing data.
* If the app is killed or loses power mid-stroke, only the incomplete stroke tail is discarded; all previous strokes remain 100% intact.
* Periodic background compaction removes erased strokes and repacks into an atomic file swap (`AtomicFile`).
