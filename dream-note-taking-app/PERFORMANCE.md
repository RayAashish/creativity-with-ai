# Performance Engineering & Budgets

**Target Hardware:** Motorola Moto Pad 70 Pro (Snapdragon 8s Gen 4, Adreno 825, 144 Hz IPS 3504×2190)  
**Frame Budget:** 6.94 ms per frame at 144 Hz.  

---

## 1. Hard Performance Budgets (Enforced & Gate Checked)

| Metric | Budget / Target | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Pen-down → first ink pixel** | $\le 10\text{ ms}$ perceived | Front-buffered rendering + `MotionEventPredictor` + high-speed probe | Gate Phase 1 |
| **Sustained frame rate (inking, panning, zoom)** | $144\text{ fps}$, $\le 1.0\%$ janky frames | Macrobenchmark `FrameTimingMetric`, Perfetto trace | Gate Phase 1 |
| **Cold start → interactive canvas** | $< 400\text{ ms}$ | Macrobenchmark `StartupTimingMetric(COLD)` + Baseline Profile | Gate Phase 0/1 |
| **Open any page (10 vs 1,000 pages)** | $< 100\text{ ms}$ | Per-page file isolation benchmark; verify $O(1)$ scaling | Gate Phase 2 |
| **Undo / Redo / Tool Switch / Page Flip** | $\le 6.9\text{ ms}$ (single frame @ 144 Hz) | Microbenchmark on state transition & command stack | Gate Phase 2 |
| **Autosave latency** | $0\text{ ms}$ blocking main thread | Async write-ahead append-only log with atomic flush | Gate Phase 2 |
| **Idle memory (500-page document open)** | $< 120\text{ MB}$ RSS | Page virtualization, tile recycling, offscreen bitmap purge | Gate Phase 4 |
| **Input path allocation** | **0 bytes per event** | Pre-allocated ring buffers & object pools; GC profile | Gate Phase 1 |

---

## 2. Measurement Methodology

1. **Jetpack Macrobenchmark:**
   * Automated tests measuring `StartupTimingMetric` and `FrameTimingMetric`.
   * Enforced via CI and `./gradlew :benchmark:connectedCheck`.
2. **Perfetto Traces:**
   * Custom ATrace / Systrace markers (`Trace.beginSection("InkInputDispatch")`, `Trace.beginSection("FrontBufferRender")`).
   * Visualizing input digitizer timestamp $\to$ application dispatch $\to$ GPU scanout.
3. **On-Screen High-Speed Latency Probe:**
   * A diagnostic toggle displays the microsecond timestamp of `MotionEvent.getEventTime()` alongside `SystemClock.elapsedRealtimeNanos()` at the exact coordinate of the stylus tip.
   * Enables hardware high-speed camera verification (e.g. 240/960 fps recording) of tip-to-photon delay.

---

## 3. Phase Performance Tracking Matrix

| Phase | Description | Cold Start | Input-to-Photon | Inking FPS | Page Open | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Skeleton, Baseline Profile, Device/Pen Probe | $< 350\text{ ms}$ | N/A (probe mode) | 144 Hz display active | N/A | **CURRENT** |
| **Phase 1** | Dedicated Ink Canvas + Palm Rejection + Motion Prediction | $< 380\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps ($\le 0.5\%$ jank) | N/A | Pending Gate |
| **Phase 2** | Document Model, Undo/Redo, Crash-safe Storage | $< 390\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | $< 65\text{ ms}$ (1k pages) | Pending Gate |
| **Phase 3** | Library Tree, Notebooks, DSA Problem Page | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | $< 70\text{ ms}$ | Pending Gate |
| **Phase 4** | PDF/Image Tiling, Lasso, Vector Shapes | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | $< 80\text{ ms}$ | Pending Gate |
| **Phase 5** | Offline ML Kit Recognition, Spaced Repetition | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | $< 80\text{ ms}$ | Pending Gate |
| **Phase 6** | Export, Audio Sync, Multi-Window Polish | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | $< 85\text{ ms}$ | Pending Gate |
