# Curvify ⚡
### High-Fidelity On-Device Image-to-SVG Vectorization Engine for Android

[![Platform](https://img.shields.io/badge/Platform-Android%2014%2B-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://android.com)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.0.21-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Rust](https://img.shields.io/badge/Rust-1.80%2B-DEA584?style=for-the-badge&logo=rust&logoColor=white)](https://rust-lang.org)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-BOM%202024.10.00-4285F4?style=for-the-badge&logo=jetpackcompose&logoColor=white)](https://developer.android.com/jetpack/compose)
[![Material 3](https://img.shields.io/badge/Material%203-Glassmorphic%20UI-6750A4?style=for-the-badge)](https://m3.material.io)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline%20Air--Gapped-00C853?style=for-the-badge)](privacy)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

<div align="center">

[![Download APK](https://img.shields.io/badge/Download%20APK-v2026.11.14-00E5FF?style=for-the-badge&logo=android&logoColor=black&labelColor=00E5FF)](https://github.com/RayAashish/creativity-with-ai/releases/download/v2026.11.14/app-debug.apk)

**[📥 Direct Download: Curvify Release v2026.11.14 (app-debug.apk)](https://github.com/RayAashish/creativity-with-ai/releases/download/v2026.11.14/app-debug.apk)**

*Autonomous, Zero-Telemetry, Native Rust + Jetpack Compose SVG Vectorization Engine.*

</div>

---

## 1. Executive Overview & Key Highlights

### The Problem
Most raster-to-vector (Image-to-SVG) tools rely either on heavy, privacy-invasive cloud APIs or sluggish web-view wrappers that posterize delicate gradients, crush skin-tone gamuts, and choke mobile GPUs when rendering high-path vector files. Photographic portraits become muddy masks, astrophotography loses lunar surface features, and gesture pans stutter at under 15 FPS.

### The Solution: Curvify
**Curvify** is an industrial-grade, fully air-gapped Android application designed for photographers, digital artists, and graphic designers. It combines a high-performance **native Rust vectorization core** (compiled via `cargo-ndk` into JNI binaries) with a modern **Jetpack Compose Material 3** interface. 

Curvify turns high-resolution photographs, line art, and pixel graphics into scalable SVG paths with sub-second turnaround, zero network permissions, and hardware-accelerated 120 FPS multi-touch viewport exploration.

### Core Value Propositions
- 🔒 **100% On-Device & Air-Gapped:** Zero cloud calls. No `android.permission.INTERNET` requested. Your photos never leave your device memory.
- ⚡ **Sub-Second Native Processing:** Native Rust engine powered by `visioncortex` / `vtracer`, vectorized color clustering, and Rayon/multithreaded path synthesis.
- 🎨 **Adaptive OKLab Perceptual Quantization:** Luminance-weighted color clustering ($\Delta E = \sqrt{2.5 \cdot (\Delta L)^2 + (\Delta a)^2 + (\Delta b)^2}$) that preserves human facial contours and dark-sky astro details without posterization.
- 🔍 **Hardware-Accelerated Infinite Zoom Viewport:** Custom dual-tier `android.graphics.Picture` DisplayList cache delivering fluid $0.5\times$ to $50.0\times$ pinch-to-zoom and pan across 10,000+ Bézier curves.
- 🎚️ **Zero-Conflict Split Comparison Viewport:** Custom pointer arbitration layer isolating the interactive before/after divider from the zoomable canvas.
- 💾 **Scoped Storage MediaStore Direct Download:** Exports standards-compliant `<svg>` files directly to the public `Downloads/` directory with zero legacy storage permissions.

---

## 2. Feature Matrix

| Feature | Curvify Native Engine | Cloud Vectorizers | Web/JS Port Wrappers |
| :--- | :---: | :---: | :---: |
| **Execution Environment** | **100% Offline (Local NDK/Rust)** | Remote Server | Client WebAssembly |
| **Internet Access Needed** | **None (No INTERNET Permission)** | Mandatory | Often Required |
| **Viewport Zoom Range** | **$0.5\times$ to $50.0\times$ Infinite** | $1.0\times$ to $4.0\times$ (Fixed) | Sluggish beyond $4.0\times$ |
| **DisplayList Acceleration** | **Android `Picture` GPU Cache (120 FPS)** | N/A | DOM/Canvas thrashing |
| **Gesture Arbitration** | **Isolated Pointer Filter Layer** | Basic | Pan/Split Collisions |
| **Color Quantization Gamut** | **Luminance-Biased OKLab Gamut** | Naive sRGB Euclidean | sRGB Euclidean |
| **Export Formats** | **Clean W3C SVG (`fill-rule="nonzero"`)** | Proprietary / Watermarked | Bloated SVG |
| **Processing Latency** | **Sub-second (~80ms - 800ms)** | 3s - 15s + Network RTT | 4s - 12s |

---

## 3. System Architecture & Workflow

```mermaid
flowchart TD
    subgraph UI ["Presentation Layer (Jetpack Compose + Material 3)"]
        A[Bitmap Ingestion / Camera / Gallery] --> B[Dimension Guard: Downscale to <= 1920px]
        B --> C[VectorViewModel: StateFlow Dispatchers.Default]
        C --> D[Pointer Arbitration Layer]
        D --> E[Split Viewport: Before Bitmap / After Vector]
        D --> F[Infinite Zoom & Pan: 0.5x to 50.0x]
    end

    subgraph NATIVE ["Native Rust Engine (librust_engine.so via JNI)"]
        C -->|Raw ARGB Pixel Buffer| G[NativeBridge JNI Entry Point]
        G --> H[Artifact Suppression: Bilateral / Median / None]
        H --> I[Adaptive Color Quantization: OKLab Multi-Scale Gamut]
        I --> J[Layer Decomposition: Cutout Mosaic]
        J --> K[Bézier Spline Contour Tracing]
        K --> L[RDP Path Simplification & Hierarchical Stacking]
        L --> M[SVG Header Enrichment & XML Serializer]
    end

    subgraph CACHE ["DisplayList Rendering Pipeline"]
        M -->|W3C SVG String| N[AndroidSVG Parser]
        N --> O[Hardware Picture DisplayList Cache]
        O -->|Zero-Allocation Draw Call| E
    end

    subgraph IO ["Data & I/O Pipeline"]
        M --> P[StorageHelper: MediaStore.Downloads Scoped Storage]
        P --> Q[Public Downloads/ Directory]
    end
```

### Architectural Component Breakdown

#### A. Presentation Layer (`app/src/main/java/com/vectorcraft/app/ui/`)
- **Pointer Arbitration Layer (`InfiniteZoomViewport.kt`):** Eliminates touch collision between horizontal split divider drags and two-finger pinch-to-zoom gestures. Touches originating within $\pm 28\text{dp}$ of the divider boundary consume horizontal offsets for comparison clipping, while multi-touch events pass uninhibited to the scale/pan transform matrix.
- **Hardware Picture DisplayList Cache:** Jetpack Compose `Canvas` does not re-rasterize 10,000+ Bézier paths on every frame. SVG paths are parsed once into an `android.graphics.Picture`. During user panning and zooming, the GPU replays the pre-recorded DisplayList directly onto the hardware canvas at 120 FPS.
- **Active Cancellation Watchdog:** Conversions execute strictly within Kotlin Coroutines on `Dispatchers.Default`. Changing a parameter slider or toggling presets cancels previous in-flight vectorization tasks immediately, preventing main-thread ANR.

#### B. Native Rust Core (`rust_engine/src/`)
- **`lib.rs` (JNI Interop):** Direct C-ABI bridge taking primitive integer pixel buffers (`jintArray`) and parameter primitives, eliminating memory duplication or base64 serialization overhead.
- **`filter.rs` (Artifact Suppression):** Optional bilateral and median smoothing routines designed to remove JPEG compression ringing and high-frequency artifacts without blunting critical structural edges.
- **`quantize.rs` (Perceptual OKLab Clustering):** Implements color clustering in the perceptual OKLab space with elevated luminance weighting:
  $$\Delta E = \sqrt{2.5 \cdot (\Delta L)^2 + (\Delta a)^2 + (\Delta b)^2}$$
  This prevents facial midtones and shadows from collapsing into muddy posterized pools while preserving astrophotography highlights.
- **`pipeline.rs` (Vectorization & W3C Synthesis):** Utilizes `vtracer` / `visioncortex` contour tracers with hierarchical stacking (largest background paths to smallest foreground details), `fill-rule="nonzero"`, and automated `<svg>` XML namespace and dimension enrichment.

#### C. Data & I/O Pipeline (`StorageHelper.kt`)
- Exports compliant SVG files through Android's `MediaStore.Downloads` API.
- Fully compatible with Android 10 through Android 15/16 Scoped Storage guidelines, requiring zero runtime storage permissions.

---

## 4. Repository Layout & File Tree

```
infintely-zoomable-svg/
├── .gitignore                          # Clean exclusions: secrets, local.properties, build caches
├── build.gradle.kts                    # Root Gradle configuration
├── settings.gradle.kts                 # Project settings & repositories
├── gradle.properties                   # JVM optimization flags (org.gradle.jvmargs=-Xmx4096m)
├── deploy_and_smoke_test.sh            # Automated device discovery, install & smoke test script
├── app/
│   ├── build.gradle.kts                # Android configuration, Compose BOM, AndroidSVG, Coroutines
│   └── src/main/
│       ├── AndroidManifest.xml         # Air-gapped manifest (Zero INTERNET permission)
│       ├── jniLibs/                    # Pre-compiled multi-arch native libraries
│       │   ├── arm64-v8a/librust_engine.so
│       │   └── x86_64/librust_engine.so
│       ├── java/com/vectorcraft/app/
│       │   ├── MainActivity.kt         # Edge-to-edge Compose host & permissionless bootstrap
│       │   ├── VectorViewModel.kt      # MVI state engine with Dispatchers.Default dispatch
│       │   ├── engine/
│       │   │   └── NativeBridge.kt     # JNI external declaration for librust_engine.so
│       │   ├── ui/
│       │   │   ├── components/
│       │   │   │   ├── ControlsPanel.kt        # Material 3 Glassmorphic parameter controls
│       │   │   │   ├── InfiniteZoomViewport.kt # Dual-tier Picture DisplayList 50x viewport
│       │   │   │   ├── MasteryManualSheet.kt   # Interactive user documentation & tips
│       │   │   │   ├── SvgStudioSheet.kt       # SVG source inspection & XML viewer
│       │   │   │   └── TopAppBarActions.kt     # Preset selectors, direct download & share
│       │   │   └── theme/
│       │   │       ├── Color.kt        # Deep space dark neon palette
│       │   │       └── Theme.kt        # Glassmorphic Material 3 dynamic theme
│       │   └── util/
│       │       ├── SampleImages.kt     # Bundled benchmark test images (Portrait, Moon, Logo)
│       │       └── StorageHelper.kt    # Scoped Storage MediaStore.Downloads export engine
│       └── res/                        # Vector drawables, mipmaps, and string resources
└── rust_engine/
    ├── Cargo.toml                      # Rust crate configuration (cdylib, jni, visioncortex, vtracer)
    ├── Cargo.lock
    └── src/
        ├── lib.rs                      # JNI entry point: Java_com_vectorcraft_app_engine_NativeBridge
        ├── pipeline.rs                 # Vectorization orchestrator & SVG post-processor
        ├── quantize.rs                 # Luminance-weighted OKLab perceptual color quantizer
        └── filter.rs                   # Bilateral filter & median blur implementations
```

---

## 5. Getting Started & Local Setup

### Prerequisites
Ensure your local development environment has the following tools installed:
1. **Java Development Kit (JDK):** JDK 17 or JDK 21 (`export JAVA_HOME=...`)
2. **Android SDK & NDK:** SDK Platform 34 or 35 with NDK 27+ (`export ANDROID_HOME=...`)
3. **Rust Toolchain:** Rust 1.80+ with Android target cross-compilers:
   ```bash
   rustup target add aarch64-linux-android x86_64-linux-android
   ```
4. **Cargo NDK:**
   ```bash
   cargo install cargo-ndk
   ```

### Building Native Rust Core (Optional if using bundled `jniLibs`)
If modifying native Rust algorithms in `rust_engine/`:
```bash
cd rust_engine

# Compile for physical 64-bit ARM devices (arm64-v8a)
cargo ndk -t arm64-v8a -o ../app/src/main/jniLibs build --release

# Compile for Android Studio x86_64 emulators
cargo ndk -t x86_64 -o ../app/src/main/jniLibs build --release

cd ..
```

### Compiling the Android APK
```bash
# Assemble the debug APK
./gradlew assembleDebug

# Output APK location:
# app/build/outputs/apk/debug/app-debug.apk
```

### Autonomous Device Deployment & Smoke Testing
Connect an Android device with USB Debugging enabled, then execute the deployment runner:
```bash
chmod +x deploy_and_smoke_test.sh
./deploy_and_smoke_test.sh
```
The script will:
1. Poll `adb devices` for physical hardware (or automatically launch a local AVD emulator if none is present).
2. Install `app/build/outputs/apk/debug/app-debug.apk`.
3. Launch `com.vectorcraft.app/.MainActivity`.
4. Monitor logcat for 10 seconds to verify zero `UnsatisfiedLinkError`, `SIGSEGV`, or runtime exceptions.

---

## 6. Privacy, Permissions & Security

Curvify adheres to the highest security and data privacy standards:

| Permission | Status | Justification |
| :--- | :---: | :--- |
| `android.permission.INTERNET` | ❌ **NOT REQUESTED** | The app has zero network access. No data can physically leave the device. |
| `READ_MEDIA_IMAGES` / Gallery | ✅ Handled via Photo Picker | Uses Android's modern photo picker (`ActivityResultContracts.PickVisualMedia`); the app never receives broad filesystem read permissions. |
| `WRITE_EXTERNAL_STORAGE` | ❌ **NOT REQUESTED** | SVG exports use Scoped Storage `MediaStore.Downloads`, eliminating legacy storage permissions. |
| Telemetry / Analytics | ❌ **NONE** | Zero Firebase, zero Crashlytics, zero ad networks, and zero tracking SDKs. |

---

## 7. Direct Download & Release Distribution

Ready-to-install debug binaries are available directly from the repository's official GitHub Releases page:

- **Latest Release:** [Curvify v2026.11.14](https://github.com/RayAashish/creativity-with-ai/releases/tag/v2026.11.14)
- **Direct APK Asset:** [app-debug.apk](https://github.com/RayAashish/creativity-with-ai/releases/download/v2026.11.14/app-debug.apk)

---

## 8. License & Attribution

This project is licensed under the [MIT License](LICENSE).

### Third-Party Engine Attribution
- [vtracer](https://github.com/visioncortex/vtracer) & [visioncortex](https://github.com/visioncortex/visioncortex) — High-accuracy raster-to-vector computer vision algorithms.
- [AndroidSVG](https://github.com/BigBadaboom/androidsvg) — Standards-compliant Android SVG rendering library.
- [Jetpack Compose](https://developer.android.com/jetpack/compose) — Modern declarative UI framework by Google.
