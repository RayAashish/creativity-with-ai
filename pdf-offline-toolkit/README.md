# Ledger — Offline-Only Air-Gapped Android PDF Toolkit

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android%208.0%2B%20(API%2026--35)-green.svg)]()
[![Air-Gapped: Zero Internet](https://img.shields.io/badge/Network-0%20Internet%20Permissions-red.svg)]()

**Ledger** is an air-gapped, open-source Android PDF toolkit engineered for high-security environments, legal professionals, journalists, and privacy-conscious users. Every single byte of PDF processing happens locally on-device.

- **Zero Network Capability**: Neither `android.permission.INTERNET` nor network state permissions exist in the application manifest. It is physically impossible for the app to phone home.
- **Zero Telemetry**: No Firebase, no Google Play Services dependencies, no crash SDKs, no trackers, no advertising.
- **Pure Storage Access Framework (SAF)**: Ledger never requests broad storage permissions (`MANAGE_EXTERNAL_STORAGE` or `READ_EXTERNAL_STORAGE`). Files are accessed exclusively via user-authorized SAF URIs with persistable permissions.
- **Ephemeral Scratch Isolation**: Temporary processing files live in an app-private cache directory, wiped immediately on task completion and scrubbed at every app boot.
- **Dense Document Design**: A custom high-information design system inspired by precision file managers and engineering tools. No default Material 3 templates, no rounded pill cards, no gradients.

---

## Architecture & Technology Stack

| Component | Implementation |
|---|---|
| **Language** | Kotlin 2.0+ with modern Coroutines and Kotlin Flow |
| **UI Framework** | Jetpack Compose with custom design system tokens (Paper Light `#F5F2EB` & Charcoal Dark `#141414`, Oxblood `#9B3A2E`) |
| **Typography** | Real Monospace (`JetBrains Mono`) for filenames, page counts, hex hashes; System Sans for chrome |
| **Dependency Injection** | Hilt DI (`@HiltAndroidApp`, `@AndroidEntryPoint`, `@HiltViewModel`, `@HiltWorker`) |
| **Structural PDF Engine** | `PdfBox-Android` (document assembly, split, merge, dictionary manipulation, XMP metadata scrub) |
| **Native Preview Engine** | C++ NDK & CMake layer (`libledger_pdf.so`) with `AndroidBitmap` direct pixel buffer rendering and system `PdfRenderer` fallback |
| **Offline OCR** | Bundled `Tesseract 4 Android` (`cz.adaptech.tesseract4android`) running in a foreground `WorkManager` job with per-page progress notification and cancel |
| **Digital Signatures** | `BouncyCastle` PAdES (`org.bouncycastle:bcpkix-jdk18on`, `bcprov-jdk18on`), in-app self-signed RSA-2048 X.509 cert generator, PKCS#12 import |
| **Local Persistence** | AndroidX `Room` database for persisted SAF document bookmarks |
| **Build System** | Gradle Kotlin DSL (`build.gradle.kts`), Gradle Version Catalogs (`libs.versions.toml`), ProGuard/R8 minify |

---

## Core Features

### 1. Merge PDFs
- Multi-select documents via SAF (`OpenMultipleDocuments`).
- Drag-and-drop reordering.
- **Interleave Mode**: Round-robin page combination across documents (ideal for assembling alternating front and back duplex scans).

### 2. Split PDFs
- **By Page Range**: Flexible syntax parser supporting comma-separated lists and ranges (e.g. `1-3, 5, 8-12`).
- **Every N Pages**: Automated chunk partitioning.
- **At Bookmarks**: Introspects PDF outlines and splits into chapter files.

### 3. Compress PDFs
- Quality presets:
  - **Email / Ultra-Compact**: 72 DPI, 45% JPEG quality.
  - **Web / Balanced**: 144 DPI, 70% JPEG quality.
  - **Print / High Quality**: 200 DPI, 85% JPEG quality.
- **Target KB Mode**: Iterative resolution and quantization adjustment to reach a specific byte budget.
- Technical size delta readout: `"2.4 MB → 780 KB (-67.5%)"`.

### 4. Air-Gapped OCR
- Rasterizes target pages at 200 DPI.
- Feeds pages into embedded Tesseract engine.
- Generates an invisible searchable text layer positioned precisely over glyphs.
- Managed by foreground `WorkManager` service with real-time notification progress and cancel action.

### 5. Strip Metadata
- One-tap inspection and wipe.
- Diff preview table identifying:
  - Document Info dictionary (Title, Author, Creator, Producer, Creation/Mod Dates, Keywords, Subject).
  - XMP metadata stream.
  - Annotations, comments, and form tracking IDs.
  - Embedded thumbnails and optional bookmark scrub.

### 6. Sign Document
- **Visual Signature**: Touch/stylus canvas with smooth quadratic Bezier curve interpolation, undo, and transparent stamp placement with page flattening.
- **Digital PAdES Signature**: Cryptographic PDF signature with SHA-256 digest using self-signed RSA-2048 keypair or imported `.p12` / `.pfx` certificates.
- **Signature Verification**: Validates certificate chains, checks byte ranges, and detects tampering.

### 7. Page Operations & Workspace
- Rotate individual or multi-selected pages by 90°, 180°, 270°.
- Reorder pages.
- Delete or extract selected pages.

### 8. Batch Queue
- Chain automated pipelines (e.g. `[Strip Metadata] → [Compress: Web] → [Sign]`) into a reusable workflow.

---

## Security Model & Air-Gapped Guarantee

1. **Manifest Restrictions**:
   The release build has **zero** network permissions declared. The `airgapped` build flavor includes an explicit removal node:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" tools:node="remove" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" tools:node="remove" />
   ```
   Even if a transitive dependency requested internet access, the manifest merger strictly aborts it.

2. **Scoped Storage & SAF**:
   Ledger never requests broad storage access (`READ_EXTERNAL_STORAGE` or `MANAGE_EXTERNAL_STORAGE`). Documents are opened using Android's system file picker (`ActivityResultContracts.OpenDocument`). Persistable URI permissions are maintained only for user-chosen files.

3. **Scratch File Lifecycle**:
   Intermediate processing files are stored in `context.cacheDir/ledger_scratch/` and wrapped inside scoped lambdas that guarantee deletion in `finally {}` blocks. In addition, the application performs an automated scrub of the scratch directory at every cold launch.

---

## Building from Source

### Prerequisites
- JDK 21 (LTS)
- Android SDK 35 (Android 15)
- Android NDK (r25c or higher) & CMake 3.22.1+

### Build Commands

```bash
# Clone repository
git clone https://github.com/ledger-pdf/ledger.git
cd ledger

# Run JVM Unit Tests (RangeParser, MetadataScrub, ScratchCleanup, CertGenerator, SignatureVerifier)
./gradlew test

# Build Air-Gapped Release APK
./gradlew assembleAirgappedRelease

# Build Debug APK
./gradlew assembleStandardDebug
```

Output APK will be generated at:
`app/build/outputs/apk/airgapped/release/app-airgapped-release-unsigned.apk`

---

## License & Support

- **License**: [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
- **Donate**: [Buy Me a Coffee](https://buymeacoffee.com/ledgerpdf).
