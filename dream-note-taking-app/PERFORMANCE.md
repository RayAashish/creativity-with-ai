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
| **Phase 2** | Document Model, Undo/Redo, Crash-safe Storage | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | 11 points/event | Pending Gate |
| **Phase 3** | Library Tree, Notebooks, DSA Problem Page | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | 11 points/event | Pending Gate |
| **Phase 4** | PDF/Image Tiling, Lasso, Vector Shapes | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | 11 points/event | Pending Gate |
| **Phase 5** | Offline ML Kit Recognition, Spaced Repetition | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | 11 points/event | Pending Gate |
| **Phase 6** | Export, Audio Sync, Multi-Window Polish | $< 400\text{ ms}$ | $\le 10\text{ ms}$ | 144 fps | 11 points/event | Pending Gate |

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
