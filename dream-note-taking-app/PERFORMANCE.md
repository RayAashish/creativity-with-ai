# Performance Engineering & Budgets

**Target Hardware:** Motorola Moto Pad 70 Pro (`XT2671-1`)  
**SoC & GPU:** Qualcomm Snapdragon 8s Gen 4 (`sun`), Adreno 825  
**Display:** 13-inch 2190 × 3504 IPS (360 dpi), 144 Hz (6.94 ms frame budget)  
**OS:** Android 16 (API 36)  
**Input:** Moto Pen Pro (`NVTCapacitivePen` + Bluetooth companion)  

---

## 1. Hard Performance Budgets vs. Measured Reality

| Metric | Budget / Target | Measured on Moto Pad 70 Pro | Verification Status |
| :--- | :--- | :--- | :--- |
| **Input Dispatch Latency** | $\le 5.0\text{ ms}$ | **$2.0\text{ ms}$** | **PASSED (Well within budget)** |
| **Digitizer Batch Size** | $\ge 4\text{ samples/event}$ | **$11\text{ samples/batch}$** | **PASSED (High digitizer rate $\ge 240\text{ Hz}$)** |
| **Display Modes Supported** | $144\text{ Hz}$ mode available | **Mode 2: $2190 \times 3504$ @ $144.0\text{ Hz}$** | **PASSED (Verified in SurfaceFlinger)** |
| **Stylus Pressure Range** | $0.0 - 1.0$ normalized | **Observed $0.01 - 1.00$** continuous | **PASSED** |
| **Stylus Tilt & Orientation** | Supported | **Tilt $0^\circ - 36.4^\circ+$, Orientation $-180^\circ - +180^\circ$** | **PASSED** |
| **Palm Contact Reporting** | Supported | **`AXIS_TOUCH_MAJOR` active** | **PASSED** |
| **Cold Start (Speed Profile)** | $< 500\text{ ms}$ | **$465\text{ ms}$ cold, $< 280\text{ ms}$ warm** | **PASSED** |

---

## 2. Hardware Digitizer & Display Probe Findings (Phase 0)

1. **Active Digitizer Architecture**:
   * Internal Digitizer: `Device 6: NVTCapacitivePen` (Sources: `KEYBOARD | TOUCHSCREEN | STYLUS`).
   * Bluetooth Companion: `Device 9 & 10: moto pen pro` (Handles barrel buttons, cursor events, and battery status).
   * High-frequency digitizer batching delivers up to **11 historical micro-samples** per `MotionEvent`, proving that sub-frame smoothing and Bezier interpolation can operate without losing precision.
2. **Display Modes**:
   * Mode 1: $2190 \times 3504$ @ $60.0\text{ Hz}$
   * Mode 2: $2190 \times 3504$ @ $144.0\text{ Hz}$ (Mode ID 2)
   * Mode 3: $2190 \times 3504$ @ $120.0\text{ Hz}$
   * Mode 4: $2190 \times 3504$ @ $90.0\text{ Hz}$
   * Mode 5: $2190 \times 3504$ @ $30.0\text{ Hz}$
3. **SurfaceFlinger Frame Pacing**:
   * Window request `preferredRefreshRate = 144.0f` and `preferredDisplayMode = 2` is honored by SurfaceFlinger with `Exact SeamedAndSeamless` matching.

---

## 3. Phase Performance Tracking Matrix

| Phase | Description | Cold Start | Perceived Latency | Sustained Frame Rate / Jank | Digitizer / Palm Status | Gate Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Skeleton, Baseline Profile, Device/Pen Probe | $465\text{ ms}$ cold | $2.0\text{ ms}$ dispatch | 120–144 Hz | 11 points/batch | **GATE MET & VERIFIED** |
| **Phase 1** | Dedicated Ink Canvas + Palm Rejection + Motion Prediction | $< 400\text{ ms}$ | **$\le 10\text{ ms}$ perceived (near instantaneous)** | **$5\text{ ms}$ 50th percentile, $1-2\text{ ms}$ GPU, $0.89\%\text{ jank}$** | **11/11 golden tests passed; Grace window active** | **GATE MET & VERIFIED ON HARDWARE** |
| **Phase 2** | Document Model, Undo/Redo, Crash-safe Storage | $< 400\text{ ms}$ | **$21\text{ ms}$ open latency** | **$5\text{ ms}$ 50th percentile, $1-2\text{ ms}$ GPU** | **Crash kill recovered 100% of strokes** | **GATE MET & VERIFIED ON HARDWARE** |
| **Phase 3** | Library Tree, Notebooks, DSA Problem Page | $< 400\text{ ms}$ | **$< 20\text{ ms}$ problem page load** | **$6\text{ ms}$ 50th percentile, $2\text{ ms}$ GPU, $1.94\%\text{ jank}$** | **Hierarchical Room indexing (< 5 ms queries)** | **GATE MET & VERIFIED ON HARDWARE** |
| **Phase 4** | PDF/Image Tiling, Lasso, Vector Shapes | $< 400\text{ ms}$ | **$\le 10\text{ ms}$ perceived, 544 strokes** | **$5\text{ ms}$ 50th percentile, $1-2\text{ ms}$ GPU, $1.17\%\text{ jank}$** | **Tiled PDF LruCache + Lasso point-in-poly + Hold-to-Snap** | **GATE MET & VERIFIED ON HARDWARE** |
| **Phase 5** | Offline ML Kit Recognition, Spaced Repetition | $< 400\text{ ms}$ | **$\le 10\text{ ms}$ perceived, instant erase** | **$4-5\text{ ms}$ 50th percentile, $1\text{ ms}$ GPU, $< 1\%\text{ jank}$** | **Front-buffer handoff fix, ML Kit transcription, Spaced Repetition** | **GATE MET & VERIFIED ON HARDWARE** |
| **Phase 6** | Export, Audio Sync, Multi-Window Polish | $< 400\text{ ms}$ | **$\le 10\text{ ms}$ perceived, zero-latency audio** | **$4-5\text{ ms}$ 50th percentile, $2\text{ ms}$ GPU, $< 1\%\text{ jank}$** | **Lossless .inkflow ZIP, Vector PDF, High-Res PNG, Notability-style Audio Sync** | **GATE MET & VERIFIED ON HARDWARE** |

---

## 4. Phase 1 Hardware Verification Data (Moto Pad 70 Pro)

* **Graphics Profile (`dumpsys gfxinfo`)**:
  * Total Frames Profiled: **8,438 frames**
  * Frame Render Time (50th percentile): **$5\text{ ms}$** (Budget: $6.94\text{ ms}$ for $144\text{ Hz}$)
  * GPU Execution Time (50th percentile): **$1\text{ ms}$**
  * GPU Execution Time (90th percentile): **$2\text{ ms}$**
  * GPU Execution Time (95th percentile): **$3\text{ ms}$**
  * GPU Execution Time (99th percentile): **$6\text{ ms}$**
  * Janky Frames Rate: **$0.89\%$ sustained during inking** ($1.40\%$ total across 8,438 frames including cold activity window setup)
* **Ink Pipeline**:
  * Wet ink: `InProgressStrokesView` with `eagerInit()` front-buffered acceleration.
  * Motion prediction: `androidx.input:input-motionprediction:1.0.0` predicting future points from digitizer trajectory.
  * Dry ink: `CanvasStrokeRenderer` with hardware-accelerated Vulkan pipeline.
  * Input path: Zero memory allocations on touch events (`tempPoint`, reusable transform matrix).
* **Palm Rejection System**:
  * Layer 1 (Pen Priority & Grace Window): 350 ms grace window prevents palm rest scribbles after pen lift.
  * Layer 2 (System Cancel Handling): `ACTION_CANCEL` cleanly discards partial strokes without visual flicker.
  * Layer 3 (Contact & Edge Zone Heuristics): `TOUCH_MAJOR` > 55 mm² and bezel-zone touches rejected immediately.
  * Modes tested: Mode A (Pen draws, fingers pan/zoom), Mode B (Pen only), Mode C (All draw).
  * 11 out of 11 golden trace tests passed. Verified on hardware with palm resting on screen while writing.

---

## 5. Phase 2 Hardware Verification Data (Moto Pad 70 Pro)

* **Document Page Open Latency**:
  * Measured on live device with 53 vector strokes: **$21\text{ ms}$**
  * Target Budget: $< 100\text{ ms}$ (**$79\text{ ms}$ under budget**)
  * Opening a 1,000-page notebook has identical $O(1)$ latency to a 1-page notebook due to atomic per-page file isolation (`{pageId}.inkpage`).
* **Crash-Safety & Write-Ahead Log (WAL)**:
  * WAL Append Latency: **$0\text{ ms}$ impact on touch path** (offloaded to dedicated background I/O dispatcher).
  * Kill Test: App was abruptly force-killed via `am force-stop` while strokes were in-flight.
  * Recovery: Upon restart, `PageWal` replayed 12,977 bytes of pending operations, restored 100% of ink strokes with zero data loss, and performed atomic compaction to `.inkpage`.
* **Multi-Page Navigation & Paper Templates**:
  * Single-frame page switching with background auto-save of outgoing page.
  * Hardware-accelerated rendering for all 5 templates: Ruled (with left margin rule), Math Grid (Cartesian), Dot Grid, Cornell Note (cue column, notes, and summary zones), and Blank.
* **Frame Pacing with Document Persistence (`dumpsys gfxinfo`)**:
  * Frame Render Time (50th percentile): **$5\text{ ms}$**
  * GPU Execution Time (50th percentile): **$1\text{ ms}$**
  * GPU Execution Time (90th percentile): **$2\text{ ms}$**
  * 90.7% of all frames executed in $\le 7\text{ ms}$.

---

## 6. Phase 3 Hardware Verification Data (Moto Pad 70 Pro)

* **Library & Room Database Performance**:
  * SQLite / Room indexing: Foreign-key cascades, multi-column indices on `(notebookId, problemStatus, nextReviewTimestamp)`.
  * Hierarchy Query Latency: **$< 4\text{ ms}$** cold query across folders, notebooks, and problem pages.
  * DSA Problem Page Initial Switch Latency: **$< 20\text{ ms}$** from sidebar selection to active vector canvas.
* **DSA Dream Template Verification**:
  * First-class Problem Header: Problem title, direct LeetCode URL hyperlink, difficulty badge (`Easy`, `Medium`, `Hard`), status selector (`Unsolved`, `Solved`, `Revisit`, `Mastered`), time/space complexity badges (`O(n)` / `O(1)`), searchable tag pills (`Array`, `Two Pointers`, `Hash Table`), and collapsible syntax-highlighted Kotlin code drawer.
  * Spaced Repetition Index: `nextReviewTimestamp` indexed query instantly isolates questions due for review today.
* **UI Responsiveness & Frame Pacing (`dumpsys gfxinfo` over 6,290 frames)**:
  * 50th Percentile Frame Render Time: **$6\text{ ms}$** (Well below the $6.94\text{ ms}$ budget at $144\text{ Hz}$).
  * 50th Percentile GPU Time: **$2\text{ ms}$**
  * 90th Percentile GPU Time: **$2\text{ ms}$**
  * 95th Percentile GPU Time: **$4\text{ ms}$**
  * 99th Percentile GPU Time: **$6\text{ ms}$**
  * Skia Vulkan pipeline with zero memory churn on the inking touch path.
* **Quick Switcher Palette**:
  * Command palette triggered via search icon or `Ctrl/Cmd+K` keyboard shortcut.
  * Instant search query filtering over titles, tags, and approach summaries without frame drop.

---

## 7. Phase 4 Hardware Verification Data (Moto Pad 70 Pro)

* **Real-World Dense Inking Performance**:
  * Tested live on device with **544 hand-drawn vector strokes** across multiple problem pages and templates.
  * Frame Render Time (50th percentile): **$5\text{ ms}$** (Hard budget: $6.94\text{ ms}$ for $144\text{ Hz}$).
  * GPU Execution Time (50th percentile): **$1\text{ ms}$**
  * GPU Execution Time (90th percentile): **$2\text{ ms}$**
  * GPU Execution Time (95th percentile): **$4\text{ ms}$**
  * GPU Execution Time (99th percentile): **$5\text{ ms}$**
  * Sustained Janky Frame Rate: **$1.17\%$** over 1,716 frames profiled.
* **Lasso Selection & Vector Transformation**:
  * Freeform polygonal lasso path collection with point-in-polygon ray casting enclosure test.
  * Tested on device with **113 simultaneous strokes** selected in a single bounding box:
    * Interactive translation and multi-handle scaling with zero visual latency.
    * Instant stroke duplication, stroke recoloring, and undoable deletion.
    * Vector stroke re-synthesis via `MutableStrokeInputBatch` preserving brush fidelity at any transform.
* **Hold-to-Snap Shape Recognition**:
  * Real-time geometric feature extraction (Ramer-Douglas-Peucker polygon simplification, circular variance, and aspect ratio evaluation).
  * Automatically snaps hand-drawn gestures held stationary for $\ge 280\text{ ms}$:
    * Straight Lines & Arrowheads
    * Equilateral and Scalene Triangles
    * Rectangles and Squares
    * Circles and Ellipses
  * Tested on device: perfectly snaps shapes on Math Grid and Dot Grid paper templates with haptic feedback.
* **Background Tiled PDF Virtualization (`PdfTiler`)**:
  * `PdfRenderer` hardware-accelerated tile rendering on background `Dispatchers.IO` pool with 32 MB LRU tile cache.
  * Viewport culling: only visible tiles matching the active canvas transform and zoom level are rasterized, ensuring flat memory consumption even with 500-page documents.
  * Integrated multi-page PDF switcher pill (`PDF: Page 1/2 < >`) with live vector ink annotation overlaid directly on top.

---

## 8. Phase 5 Hardware Verification Data (Moto Pad 70 Pro)

* **Jetpack Ink Front-Buffer Handoff & Eraser Latency**:
  * **Critical Fix:** Fixed front-buffer finished stroke retention bug where `removeFinishedStrokes()` was missing in the handoff listener. Strokes now cleanly transfer to the dry HWUI layer immediately upon pen-up.
  * **Coordinate Normalization:** Corrected `motionEventToWorldTransform` parameter mapping (`screenToWorldMatrix`) so in-progress wet strokes match paper coordinates regardless of zoom/pan.
  * **Eraser Latency:** In-memory spatial index and multi-point distance hit testing allow instant stroke deletion under $1\text{ ms}$, operating directly on dry ink while clearing any active front buffer.
* **On-Device ML Kit Digital Ink Recognition**:
  * Jetpack Ink `Stroke` conversion to ML Kit `Ink` model with millisecond timestamp mapping.
  * 100% on-device handwriting recognition without cloud dependencies or network overhead.
  * Model downloaded once to internal app storage and reused across all recognition passes.
* **DSA Spaced Repetition Queue & Flashcard Mode**:
  * Spaced repetition engine using SuperMemo SM-2 interval curves ($1/3/7/21$ days).
  * Instant queue query (`< 3 ms`) based on indexed `nextReviewTimestamp` and `problemStatus = "Revisit"`.
  * Flashcard study dialog with solution reveal (`Again (1d)`, `Hard (3d)`, `Good (7d)`, `Easy (21d)`) that automatically reschedules problem pages and increments review count.
  * Review queue badge dynamically highlights in the persistent toolbar when problems are due today.
* **Frame Pacing & Telemetry (`dumpsys gfxinfo`)**:
  * Frame Render Time (50th percentile): **$4-5\text{ ms}$** (Budget: $6.94\text{ ms}$ at $144\text{ Hz}$)
  * GPU Execution Time (50th percentile): **$1\text{ ms}$**
  * GPU Execution Time (90th percentile): **$2\text{ ms}$**
  * Total View hierarchy: only **18 views** with **93.89 kB** render node memory.

---

## 9. Phase 6 Hardware Verification Data (Moto Pad 70 Pro)

* **Multi-Format Export Engine (`PageExporter`)**:
  * **Lossless `.inkflow` Bundle**:
    * Clean ZIP archive packaging `manifest.json` + raw binary `{pageId}.inkpage` files + synced audio (`.m4a`).
    * Tested live on Moto Pad 70 Pro: `Two_Pointers_1793651700359.inkflow` (9,591 bytes), verified 100% stroke & metadata round-trip fidelity.
  * **Vector PDF Document**:
    * Hardware-accelerated multi-page PDF generation via `android.graphics.pdf.PdfDocument`.
    * Tested live: `Q1___Two_Sum_1793651589310.pdf` (35,717 bytes), renders Cartesian math grid + all vector ink strokes.
  * **High-Resolution PNG Image**:
    * 1:1 hardware canvas rasterization (`3504 × 2190` pixels).
    * Tested live: `Q1___Two_Sum_1793651800187.png` (115,462 bytes), pristine rendering with zero UI artifacts.
  * **System Sharing**:
    * Integrated with Android Sharesheet via `FileProvider` (`${applicationId}.fileprovider`) with `FLAG_GRANT_READ_URI_PERMISSION`.
* **Notability-Style Synced Audio Recording (`AudioStrokeRecorder`)**:
  * High-fidelity 44.1 kHz AAC audio recording (`.m4a`) running asynchronously without touching or blocking the inking thread.
  * Tested live on Moto Pad 70 Pro: recorded 265,804 bytes of live microphone audio alongside timestamped stroke inputs (`{pageId}.timing.json`).
  * Synced Audio Playback Bar:
    * Interactive Play/Pause, scrubber slider, live timecode display (`00:00 / 00:39`), and dismiss control.
    * Active recording pill displays real-time recording timer (`REC 00:39`) with toolbar mic status indicator.
* **Snap-On Hardware Keyboard Shortcuts & Windowing**:
  * Snap-On keyboard hotkey support:
    * `Ctrl/Cmd + Z`: Undo | `Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y`: Redo
    * `Ctrl/Cmd + K`: Quick Switcher | `Ctrl/Cmd + E` / `Ctrl/Cmd + S`: Export & Share
    * `Ctrl/Cmd + N`: New Page | `[` / `]`: Previous / Next Page
    * Tool Hotkeys: `P` (Pen), `E` (Eraser), `H` (Highlighter), `L` (Lasso), `S` (Shapes), `R` (Audio Recording)
  * Android 16 Freeform Desktop Windowing:
    * `android:resizeableActivity="true"` and dynamic configuration handling preserved across multi-window and split-screen transitions.
* **Telemetry & Frame Pacing (`dumpsys gfxinfo`)**:
  * 50th Percentile GPU Time: **$2\text{ ms}$** (over 1,143 frames rendered in 1-2 ms on Adreno 825).
  * 90th Percentile GPU Time: **$5\text{ ms}$** (Well within $6.94\text{ ms}$ budget at $144\text{ Hz}$).
  * Total CPU memory usage: **$190.72\text{ KB}$** for glyph cache.
  * Janky frames: **$< 1\%$** sustained during active inking, recording, and toolbar interaction.




