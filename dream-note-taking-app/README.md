# Dream Note App

A high-performance, native Android handwriting and note-taking application designed for the **Motorola Moto Pad 70 Pro** (13-inch 3504×2190 IPS, 144 Hz, Snapdragon 8s Gen 4, Adreno 825, Moto Pen Pro).

Built with **Jetpack Ink API** (`androidx.ink`), **Jetpack Graphics Low-Latency** (`androidx.graphics`), and **Motion Prediction** (`androidx.input:input-motionprediction`).

---

## Performance Targets & Budgets (144 Hz = 6.94 ms Frame Budget)

* **Pen-down → First Ink Pixel:** $\le 10\text{ ms}$ perceived latency (via front-buffered rendering + `MotionEventPredictor`).
* **Sustained Frame Rate:** 144 fps sustained, $\le 1.0\%$ janky frames under continuous drawing, panning, and zooming.
* **Cold Start → Interactive Canvas:** $< 400\text{ ms}$ (enforced via Baseline Profile and Startup Profile).
* **Page Open Latency:** $< 100\text{ ms}$ (independent of notebook size via per-page stroke file virtualization).
* **Undo / Redo / Page Flip:** Single frame ($\le 6.9\text{ ms}$).
* **Memory Footprint:** Controlled via tile virtualization and offscreen bitmap purging.

For detailed benchmarks and phase tracking, see [PERFORMANCE.md](file:///Users/aashishkumarray/Desktop/creativity-with-ai/dream-note-taking-app/PERFORMANCE.md).

---

## Architectural Principles

1. **Jetpack Compose for Chrome Only:** Compose manages sidebars, toolbars, dialogs, and navigation. Stylus pointer events never route through Compose state or recomposition.
2. **Dedicated SurfaceView Layer:** The ink canvas is backed by a native `SurfaceView` and front-buffered rendering (`GLFrontBufferedRenderer` / `CanvasFrontBufferedRenderer`).
3. **Motion Prediction & Unbuffered Dispatch:** Uses `requestUnbufferedDispatch` to bypass system vsync batching and `MotionEventPredictor` to extrapolate the stylus tip coordinates.
4. **Adaptive Refresh Rate:** Forces 144 Hz display mode (`preferredDisplayModeId` & `preferredRefreshRate = 144.0f`) during active inking, and releases to 60 Hz when idle to conserve battery.
5. **Layered Palm Rejection:** Pen priority with 350 ms post-lift hysteresis grace window, contact geometry checks (`TOUCH_MAJOR`), and edge zone rejection.
6. **Local-First Crash-Safe Storage:** Room + FTS5 for metadata and fast search; append-only binary stroke logs with atomic file compaction.

For full architectural breakdown, see [ARCHITECTURE.md](file:///Users/aashishkumarray/Desktop/creativity-with-ai/dream-note-taking-app/ARCHITECTURE.md) and [docs/research.md](file:///Users/aashishkumarray/Desktop/creativity-with-ai/dream-note-taking-app/docs/research.md).

---

## Multi-Module Structure

* `:app`: Application entry point, Baseline Profile installer, "Device & Pen Capabilities" probe screen, navigation.
* `:ink-engine`: Front-buffered canvas, low-latency in-progress strokes, palm rejection filters, motion predictor, 144 Hz controller.
* `:document`: Immutable stroke models, binary append-only page persistence, undo/redo command stack, spatial index.
* `:library`: Hierarchical tree (Folders, Notebooks, Sections, Pages), Room database + FTS5 search, DSA Problem Page model.
* `:design-system`: Material 3 theme, dark/light paper palettes, typography, adaptive layout tokens.

---

## Phase 0: Device & Pen Capabilities Probe Screen

Phase 0 provides an exhaustive real-time diagnostic probe to discover hardware digitizer capabilities without making assumptions about stylus protocols (active vs. EMR):
* **Display Mode Discovery:** Probes active refresh rate, resolution (3504×2190), and all supported display modes; toggles 144 Hz mode.
* **Stylus Hardware Capabilities:** Discovers device name, supported axes (pressure, tilt, orientation, hover distance, touch-major contact size).
* **Live Pointer Telemetry:** Real-time gauges for pressure ($0.0 - 1.0$), tilt degrees ($0 - 90^\circ$), orientation ($-180^\circ - +180^\circ$), hover distance, barrel buttons, and eraser tail.
* **Historical Batch Processing:** Measures digitizer sample count per `MotionEvent` batch and estimates hardware sampling frequency (Hz).
* **Interactive Diagnostic Pad:** Touch pad with zero-allocation rendering showing contact bounding ellipses and historical micro-samples.

---

## Building & Running

```bash
# Compile and build debug APK
./gradlew assembleDebug

# Run unit tests
./gradlew test

# Install to connected device via adb
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
