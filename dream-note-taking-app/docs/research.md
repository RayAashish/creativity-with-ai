# Jetpack Ink, Graphics & Stylus Engineering Research

**Target Device:** Motorola Moto Pad 70 Pro  
**Display:** 13-inch 3504 × 2190 LCD (IPS), 144 Hz (6.94 ms frame budget)  
**SoC & GPU:** Qualcomm Snapdragon 8s Gen 4, Adreno 825  
**Memory & OS:** 8/12 GB LPDDR5X, Android 16 (API 36)  
**Input Accessories:** Bundled Moto Pen Pro active stylus, Snap-On magnetic keyboard  

---

## 1. Jetpack Ink API (`androidx.ink`) Architecture

### 1.1 Confirmed Stable Versions & Modules (Google Maven)
From the official Google Maven repository (`https://dl.google.com/dl/android/maven2/androidx/ink/group-index.xml`):
* **Stable Core:** `1.0.0`
* **Active Alpha/Development:** `1.1.0-alpha10`
* **Core Modules:**
  * `androidx.ink:ink-authoring:1.0.0` (and `1.1.0-alpha10`): In-progress wet stroke handling, input event coordination, front-buffer integration.
  * `androidx.ink:ink-authoring-compose`: Compose wrapper for in-progress wet strokes.
  * `androidx.ink:ink-brush:1.0.0`: `Brush`, `BrushFamily`, `StockBrushes`, `BrushTip`, `BrushPaint`.
  * `androidx.ink:ink-brush-compose`: Color conversions and brush helpers for Jetpack Compose.
  * `androidx.ink:ink-geometry:1.0.0`: Bounding boxes, Affine transforms, intersection queries, distance calculations.
  * `androidx.ink:ink-rendering:1.0.0`: `CanvasStrokeRenderer` for dry ink rendering onto hardware or software `Canvas`.
  * `androidx.ink:ink-strokes:1.0.0`: Immutable `Stroke`, `PartitionedMesh`, `ImmutableStrokeInputBatch`.
  * `androidx.ink:ink-storage:1.0.0`: Serialization utilities (`StrokeInputBatchSerialization`, `BrushFamilySerialization`).
  * `androidx.ink:ink-nativeloader:1.0.0`: JNI loader for the high-performance native C++ core ink engine.

### 1.2 Two-Phase Inking Architecture (Wet vs. Dry Ink)
Jetpack Ink enforces a strict separation between active drawing and finalized strokes:
1. **Wet Ink (In-Progress Stroke):**
   * Handled by `InProgressStrokesView` (View-based) or `InProgressStrokes` (Compose).
   * Renders incoming `MotionEvent` points directly into a hardware front-buffer via `GLFrontBufferedRenderer` / `CanvasFrontBufferedRenderer`.
   * Completely bypasses the Android system `Choreographer` vsync delay (saves 1 to 2 frames = 7–14 ms of latency).
   * Dynamically constructs the mesh geometry from pen velocity, pressure, and tilt.
2. **Dry Ink (Finalized Strokes):**
   * When the stylus lifts (`ACTION_UP` or pointer up), `InProgressStrokesFinishedListener` hands off finalized immutable `Stroke` objects.
   * Finalized strokes are stored in the document model and rendered by `CanvasStrokeRenderer.create()` into a `SurfaceView` multi-buffer layer or hardware-accelerated canvas.
   * `CanvasStrokeRenderer` automatically renders high-precision vector `PartitionedMesh` geometries with antialiasing and blend modes (e.g. `BlendMode.Multiply` for highlighters).

---

## 2. Low-Latency Input & Graphics Pipeline

### 2.1 Front-Buffered Rendering (`androidx.graphics:graphics-core`)
* **Artifact:** `androidx.graphics:graphics-core:1.0.4`
* Standard Android rendering writes to a back-buffer, waits for vsync, swaps to front-buffer, and displays on the next scanline. This introduces 16–33 ms of pipeline latency.
* `GLFrontBufferedRenderer` writes directly into the display controller's active scanout buffer (the front-buffer).
* As the stylus moves, newly interpolated bezier segments and predicted points are rasterized immediately into the front-buffer.
* Once the stroke ends or multi-buffering catches up, the multi-buffered surface commits the full page content cleanly.

### 2.2 Unbuffered Event Dispatch (`requestUnbufferedDispatch`)
* By default, Android batches touch and stylus events to dispatch them once per vsync pulse.
* For a 144 Hz display, input batching delays can still introduce up to 6.9 ms of unnecessary lag.
* Calling `view.requestUnbufferedDispatch(event)` immediately upon `ACTION_DOWN` (and for `TOOL_TYPE_STYLUS`) forces the Linux input subsystem and WindowManager to deliver events to the application as soon as the hardware digitizer reports them, achieving true sub-millisecond dispatch.

### 2.3 Historical Event Batch Processing
* Digitizers often report at 240 Hz to 480 Hz (e.g., Moto Pen Pro digitizer scan rate), faster than the 144 Hz display refresh rate.
* A single `MotionEvent` delivers multiple historical points between frames.
* To prevent jagged or flattened corners, the input handler must iterate over `0 until event.historySize`:
  ```kotlin
  for (h in 0 until event.historySize) {
      val hx = event.getHistoricalX(pointerIndex, h)
      val hy = event.getHistoricalY(pointerIndex, h)
      val hp = event.getHistoricalPressure(pointerIndex, h)
      val ht = event.getHistoricalEventTime(h)
      // feed historical sample into stroke pipeline
  }
  ```

### 2.4 Motion Prediction (`androidx.input:input-motionprediction:1.0.0`)
* `MotionEventPredictor.newInstance(view)` records incoming historical and current stylus points.
* On every `ACTION_MOVE`, `predictor.predict()` uses Kalman filtering and polynomial curve extrapolation to estimate where the stylus tip will be 10–20 ms in the future.
* Jetpack Ink's `addToStroke` consumes this predicted event to extend the wet ink tip directly underneath the physical pen tip, effectively canceling out remaining photon latency.
* When the next real event arrives, the predicted tip is discarded and replaced with real digitized points.

---

## 3. Display Refresh Rate & 144 Hz Budget (Moto Pad 70 Pro)

### 3.1 144 Hz Timing Constraints
* **144 Hz Refresh Period:** $1000 / 144 = 6.944\text{ ms}$
* **Input Path Budget:** $\le 1.0\text{ ms}$ (event delivery + palm check + prediction)
* **Mesh Generation Budget:** $\le 2.0\text{ ms}$ (wet stroke tessellation)
* **GPU Rasterization:** $\le 2.5\text{ ms}$ (Adreno 825 front-buffer draw)
* **Safety Margin:** $\ge 1.4\text{ ms}$
* **Total:** $< 6.9\text{ ms}$ sustained per frame without jank.

### 3.2 Display Mode Switching API
* In Android 11+ (API 30+), high refresh rate is requested via `Window.setFrameRate`:
  ```kotlin
  window.setFrameRate(144.0f, Surface.FRAME_RATE_COMPATIBILITY_DEFAULT, Surface.CHANGE_FRAME_RATE_ALWAYS)
  ```
* Additionally, query `display.supportedModes` to find the exact mode with `mode.refreshRate >= 143.9f` and resolution $3504 \times 2190$, setting `window.attributes.preferredDisplayModeId = targetMode.modeId`.
* **Battery Conservation:** When the canvas is idle (no pen hover or down for $> 3.0$ seconds), release the frame rate request (`window.setFrameRate(0f, ...)` and clear `preferredDisplayModeId`) allowing the panel to drop down to 60 Hz or variable refresh rate (VRR).

---

## 4. Palm Rejection Layered Architecture

```
[Hardware MotionEvent / Digitizer]
               │
               ▼
   [Layer 1: Stylus Priority & Grace Window]
   - Is pen down or hovering (TOOL_TYPE_STYLUS)?
   - If YES: reject all finger/touch pointers; refresh grace timer (350 ms).
   - If NO: check if within grace window since pen lift. If YES: drop touches.
               │
               ▼
   [Layer 2: Touch Contact Geometry & Bezel Guard]
   - Evaluate TOUCH_MAJOR, TOUCH_MINOR, AXIS_SIZE.
   - If touch area > threshold (e.g. > 28 dp): classify as PALM -> discard.
   - If contact origin is within bezel margin (< 24 dp from edge): classify as PALM.
               │
               ▼
   [Layer 3: System Cancel & Disambiguation]
   - Handle ACTION_CANCEL / FLAG_CANCELED cleanly without ink artifacts.
   - Pointer classification: STYLUS_DRAW, FINGER_PAN_ZOOM, REJECTED_PALM.
   - Pen draws immediately with 0 ms wait. Finger gestures wait 30 ms disambiguation.
```

---

## 5. Storage & Persistence Architecture

* **Metadata & Index:** Room (SQLite + FTS5 full text search). Stores folder hierarchies, notebooks, section trees, problem page metadata (LeetCode link, status, tags, time, complexity).
* **Stroke Storage:** Per-page binary stroke logs.
  * Append-only record log: each stroke write is an atomic append operation.
  * Atomic file replacement (`AtomicFile`) for compaction.
  * Instant startup: opening a page reads only the stroke binary for that specific page, guaranteeing $< 100\text{ ms}$ page open whether the notebook has 1 page or 10,000 pages.
* **Thumbnails:** Low-overhead WebP rendering generated asynchronously in the background.

---

## 6. Target Device Hardware Probe Specification (Phase 0)

To accurately evaluate the Moto Pad 70 Pro digitizer and Moto Pen Pro stylus without making assumptions, Phase 0 implements an exhaustive device diagnostic probe:
1. **Stylus Protocol & Tool Types:** Probe `TOOL_TYPE_STYLUS`, `TOOL_TYPE_ERASER`, `TOOL_TYPE_FINGER`, `TOOL_TYPE_MOUSE`.
2. **Axis Resolution & Availability:**
   * Pressure: `getPressure()`, min/max range, resolution.
   * Tilt: `getAxisValue(AXIS_TILT)` in radians ($0$ to $\pi/2$).
   * Orientation: `getAxisValue(AXIS_ORIENTATION)` ($-\pi$ to $\pi$).
   * Hover Distance: `getAxisValue(AXIS_DISTANCE)` during `ACTION_HOVER_MOVE`.
3. **Buttons:**
   * Primary barrel button: `BUTTON_STYLUS_PRIMARY`
   * Secondary barrel button: `BUTTON_STYLUS_SECONDARY`
   * Eraser tail button: `BUTTON_TERTIARY` / `TOOL_TYPE_ERASER`
4. **Digitizer Sampling:**
   * Historical event batch size (`getHistorySize()`).
   * Digitizer report frequency estimation (calculated via $\Delta t$ between historical samples).
5. **Contact Geometry:**
   * `TOUCH_MAJOR`, `TOUCH_MINOR`, `TOOL_MAJOR`, `TOOL_MINOR`, `AXIS_SIZE`.
6. **Display Modes:**
   * Active display mode (`display.mode`).
   * Supported modes (`display.supportedModes`: id, width, height, refreshRate).
   * 144 Hz mode availability and verification.
