# Cliplocker 🔒

> **An Android clipboard manager for people who actually care.**  
> Offline-only, open-source, on-device encrypted, with local history, instant full-text search, pinning, and heuristic auto-expiry for secrets. No accounts, no telemetry, no cloud sync.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android_8.0+_(API_26–35)-green.svg)](https://developer.android.com)
[![Offline Guarantee](https://img.shields.io/badge/Network-0%20Permissions_(Offline)-success.svg)](#zero-network-guarantee)
[![Support](https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg)](https://buymeacoffee.com/cliplocker)

---

## Table of Contents
1. [Philosophy](#philosophy)
2. [Design Language & UI Anatomy](#design-language--ui-anatomy)
3. [Android Clipboard Architecture & Per-Version Caveats](#android-clipboard-architecture--per-version-caveats)
4. [Security Architecture & Key Management](#security-architecture--key-management)
5. [Sensitive Content Detection Engine](#sensitive-content-detection-engine)
6. [Core Features](#core-features)
7. [Zero-Network Guarantee & Build Variants](#zero-network-guarantee--build-variants)
8. [Building from Source](#building-from-source)
9. [Project Structure](#project-structure)
10. [License & Support](#license--support)

---

## Philosophy

Most Android clipboard managers are bloated with ad trackers, analytics SDKs, cloud backup logins, and oversized Material 3 bubble shapes. 

**Cliplocker** was engineered with a different set of priorities:
- **Zero Network**: Not a single HTTP client, Firebase dependency, or tracking pixel. The `noInternet` build variant does not even declare `android.permission.INTERNET`.
- **Encrypted at Rest**: All history, search index entries, and metadata live inside a SQLCipher database encrypted with AES-256. The master encryption key is generated in and protected by the hardware-backed **Android KeyStore**.
- **Dense, Tool-Like UI**: Designed like a developer's notebook crossed with a keyboard launcher. Monospace typography for clip text and timestamps, warm paper background (`#F4F1EA`), near-black ink (`#1A1A1A`), and a single restrained burnt-orange accent (`#C4541E`).
- **Secret Ephemerality**: Clips flagged as secret (passwords, JWTs, API tokens, payment cards) are masked by default, protected by biometric gates, and automatically purged on expiration — with an option to wipe the system clipboard as well.

---

## Design Language & UI Anatomy

The user interface is built entirely in **Jetpack Compose** using a custom design system with custom tokens:

### Palette
| Token | Paper Light | Charcoal Dark | Purpose |
|---|---|---|---|
| `background` | `#F4F1EA` (Warm paper) | `#141413` (Deep charcoal) | Screen background |
| `surface` | `#EAE6DC` | `#1E1D1B` | Row items, toolbars, dialogs |
| `border` | `#D0CABC` | `#383632` | 1dp borders, dividers |
| `inkPrimary` | `#1A1A1A` | `#EDEAE3` | Monospace clip previews & primary text |
| `inkSecondary`| `#5C5A55` | `#A6A39D` | Source app labels, captions |
| `inkMuted` | `#8C8880` | `#706E69` | Subtle icons, empty state notes |
| `accent` | `#C4541E` (Burnt Orange) | `#D9652B` | Pins, secret badges, active indicators |
| `accentSubtle`| `#F5E6DD` | `#332219` | Copied ink stamp badge, selection highlight |

### Row Anatomy (~56–64dp Compact Height)
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [TXT]  export DATABASE_URL="postgresql://user:pass@localhost:5432"  Terminal · 2m│
└──────────────────────────────────────────────────────────────────────────────────┘
   ▲                                 ▲                                     ▲
Type Badge                   Monospace Preview                     Source App · Time
```

### Micro-Details
- **No Floating Action Button**: A fixed bottom search bar is the primary anchor of the screen, with type filters directly accessible above it.
- **Haptic Ticks**: Subtle haptic pulse upon tapping a clip to copy back to the system clipboard.
- **Ink-Stamp Copied Badge**: A rotated transient badge appears for 900ms confirming copy with zero noisy toast spam.
- **Live Dot**: A tiny indicator in the top bar displays a glowing green dot when capture is live, turning amber when paused.
- **Match Highlighting**: Real-time FTS query terms are highlighted inline within monospace preview rows.

---

## Android Clipboard Architecture & Per-Version Caveats

Capturing the Android clipboard requires navigating different OS security models across versions. Cliplocker provides dedicated native pathways:

```
                      ┌─────────────────────────────────────────┐
                      │          OS Clipboard Event             │
                      └────────────────────┬────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
          Android 8.0 – Android 9                       Android 10 – Android 15
      ┌───────────────────────────────┐             ┌───────────────────────────────┐
      │ ClipboardCaptureService       │             │ Restricted Background Access  │
      │ (Foreground Service with      │             │ (READ_CLIPBOARD restricted)   │
      │  OnPrimaryClipChangedListener)│             └──────────────┬────────────────┘
      └──────────────┬────────────────┘                            │
                     │                 ┌───────────────────────────┼───────────────────────────┐
                     │                 ▼                           ▼                           ▼
                     │       Quick Settings Tile        Floating Search Bubble       Optional Accessibility
                     │       (CliplockerTileService)    (ClipboardBubbleService)     (ClipboardAccessibilityService)
                     │       One-tap capture from       Instant overlay focus        Passive hands-free background
                     │       system pull-down           over any running app         capture of copy events
                     │                 │                           │                           │
                     └─────────────────┴─────────────┬─────────────┴───────────────────────────┘
                                                     ▼
                                      ┌─────────────────────────────┐
                                      │   Ignore App & Duplicate    │
                                      │          Filters            │
                                      └──────────────┬──────────────┘
                                                     ▼
                                      ┌─────────────────────────────┐
                                      │  Sensitive Content Detector │
                                      │  (Regex + Luhn + Entropy)   │
                                      └──────────────┬──────────────┘
                                                     ▼
                                      ┌─────────────────────────────┐
                                      │ SQLCipher Encrypted DB      │
                                      │ (Hardware KeyStore Sealed)  │
                                      └─────────────────────────────┘
```

### Per-Version Matrix

| Android Version | System Behavior | Cliplocker Capture Path |
|---|---|---|
| **Android 8.0 – 9 (Oreo, Pie)** | Foreground services can listen to `OnPrimaryClipChangedListener` globally in the background. | `ClipboardCaptureService` runs with persistent low-priority notification, capturing primary clips across all apps seamlessly. |
| **Android 10 – 15 (Q, R, S, T, U, V)** | Google restricts `READ_CLIPBOARD` in the background unless the application has current input focus or is the default IME. | **Three Complementary Paths:**<br>1. **Quick Settings Tile (`CliplockerTileService`)**: Pull down notifications and tap the Cliplocker tile. The system focuses Cliplocker, captures the active clip, and flashes a confirmation.<br>2. **Floating Search Bubble (`ClipboardBubbleService`)**: A lightweight overlay toggle via `SYSTEM_ALERT_WINDOW`. Tapping or dragging focuses an overlay window for 150ms, capturing clipboard content instantly and pulling up fast search.<br>3. **Accessibility Service (`ClipboardAccessibilityService`)**: An optional, zero-network service for power users wanting 100% passive background capture without manual touches. Monitors `TYPE_VIEW_CLICKED` / `TYPE_VIEW_TEXT_SELECTION_CHANGED` and syncs clipboard changes. |

---

## Security Architecture & Key Management

### Encrypted-at-Rest Database (Room + SQLCipher)
1. **Passphrase Generation**: When Cliplocker first starts, `DatabaseKeyManager` generates a 256-bit cryptographically secure random passphrase via `java.security.SecureRandom`.
2. **Master Key Sealing**: Cliplocker generates an AES-256-GCM master key (`CliplockerMasterKey`) inside the hardware-backed **Android KeyStore** (`AndroidKeyStore`).
3. **Passphrase Vault**: The database passphrase is encrypted with AES/GCM/NoPadding (including a unique 12-byte initialization vector) and saved into private app storage (`files/vault/cliplocker_db.vault`).
4. **Room SQLCipher Injection**: On application launch, the passphrase is decrypted via the KeyStore and supplied to `net.sqlcipher.database.SupportFactory(passphraseBytes)` to open the Room database.

### Cryptographic Backups (PBKDF2 + AES-GCM)
- Backups are exported as a self-contained binary payload:
  - Header: `CLPLCK1` (7 ASCII bytes)
  - Salt: 16-byte random salt
  - IV: 12-byte random initialization vector
  - Key Derivation: **PBKDF2WithHmacSHA256** with **100,000 iterations**
  - Ciphertext: **AES-256-GCM** with 128-bit authentication tag
- Importing a backup decrypts the payload, validates the authentication tag, and performs an incremental deduplication merge using SHA-256 content hashes.

### App-Level Hardening
- **FLAG_SECURE**: Optional setting to prevent screenshots, screen recordings, and mask app previews in the Android Recent Apps switcher.
- **Biometric Unlock**: BiometricPrompt authentication required each time the app is launched.
- **Wipe on Screen Off**: Clears the system clipboard when the device screen turns off via `ScreenStateReceiver`.
- **Wipe on Expiry**: When secret clips reach their TTL, WorkManager (`ExpiryWorker`) purges them from the database and clears the system clipboard if it still holds the expired secret.

---

## Sensitive Content Detection Engine

Cliplocker runs an on-device heuristic scanner (`SensitiveContentDetector`) over all incoming clips before saving. **No data ever leaves the device.**

### Heuristics Table
| Classification | Detection Mechanism | Suggested TTL |
|---|---|---|
| **AWS Access Key** | Prefixes `AKIA`, `ASIA`, `AGPA`, `AIDA`, `AROA`, `AIPA` + 16 alphanumeric characters | 1 hour |
| **GitHub PAT** | Prefixes `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_` + 36–255 characters | 1 hour |
| **Google API Key** | Prefix `AIza` + 30–40 base64 URL-safe characters | 1 hour |
| **Stripe Key** | Prefixes `sk_live_`, `rk_live_`, `sk_test_` + 24–99 characters | 1 hour |
| **Slack Token** | Prefixes `xoxb-`, `xoxp-`, `xoxa-`, `xoxr-`, `xoxs-` | 1 hour |
| **Private Keys** | PEM headers: `-----BEGIN [RSA\|EC\|DSA] PRIVATE KEY-----` | 1 hour |
| **JSON Web Token** | Standard 3-segment base64url pattern: `[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}` | 1 hour |
| **Payment Cards** | 13–19 digits validated with the **Luhn mod-10 checksum algorithm** and card prefix matching (Visa, MasterCard, Amex, Discover, Diners) | 5 minutes |
| **Password Strings** | Key-value pairs (`password:`, `db_pass=`, `secret_key=`) or standalone tokens with length 12–64, >= 3 character classes, and Shannon entropy $\ge 3.2$ bits/char | 5 minutes |

---

## Core Features

- **Capture History**: Captures copied text and images, recording source application package, app label, character/word counts, and timestamp.
- **Instant FTS4 Search**: Local SQLite Full-Text Search index over all stored clips. Prefix queries match instantly with 250ms debounce.
- **Pinned Shelf**: Pinned clips are displayed in a dedicated horizontal shelf at the top of history and are permanently immune to pruning.
- **Secret Ephemerality**: Clips marked secret are masked with dots (`••••••••••••••••`) in both list and detail views until unmasked via biometric authentication.
- **Per-App Ignore List**: Pre-seeded with common password managers (1Password, Bitwarden, KeePass, Dashlane, LastPass) and authenticators. Users can add any custom package name.
- **Bulk Actions**: Long-press enters multi-selection mode to delete, pin, mark secret, or export multiple clips at once.
- **Image Support**: Automatically stores downscaled thumbnails for quick rendering while saving original images in private app storage. Provides copy-back using a secure `FileProvider`.
- **History Retention**: Auto-prunes oldest non-pinned clips when reaching user-defined thresholds (e.g. 500 clips, 30 days).

---

## Zero-Network Guarantee & Build Variants

Cliplocker provides two build variants:

1. **`standard`**: Full local utility features (SQLCipher, Biometric, TileService, Bubble, Widget, FileProvider).
2. **`noInternet`**: Identical local feature set with explicit removal of network permissions in the AndroidManifest:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" tools:node="remove" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" tools:node="remove" />
   ```

Verify this on any built APK:
```bash
aapt dump permissions app/build/outputs/apk/noInternet/release/app-noInternet-release.apk
```
*Notice: `android.permission.INTERNET` is completely absent from the manifest.*

---

## Building from Source

### Prerequisites
- **JDK 21** (LTS)
- **Android SDK** with Platform API 35 (`compileSdk = 35`, `minSdk = 26`)
- Android Build-Tools 35.0.0+

### Build Commands

```bash
# 1. Clone repository
git clone https://github.com/cliplocker/cliplocker.git
cd cliplocker

# 2. Run all unit tests (Luhn algorithm, sensitive detector, expiry logic, backup encryption)
./gradlew testStandardDebugUnitTest

# 3. Build debug APKs (standard and noInternet)
./gradlew assembleStandardDebug assembleNoInternetDebug

# 4. Build minified, R8-optimized release APK (noInternet variant)
./gradlew assembleNoInternetRelease
```

The resulting release APK will be located at:
`app/build/outputs/apk/noInternet/release/app-noInternet-release.apk`

---

## Project Structure

```
cliplocker/
├── app/
│   ├── build.gradle.kts                # Build config, R8 rules, dependencies
│   ├── proguard-rules.pro              # R8 minification & keep rules
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml     # Services, Tile, Widget, FileProvider
│       │   ├── kotlin/com/cliplocker/app/
│       │   │   ├── CliplockerApp.kt    # Application class, SQLCipher init
│       │   │   ├── core/
│       │   │   │   ├── crypto/         # KeyStore helper, DB passphrase vault, backup encryption
│       │   │   │   ├── detector/       # SensitiveContentDetector, LuhnValidator
│       │   │   │   └── model/          # ClipItem, ClipType, SecretTtl, FilterOptions, Preferences
│       │   │   ├── data/
│       │   │   │   ├── local/          # AppDatabase, ClipDao, IgnoreAppDao, ClipEntity, ClipFtsEntity
│       │   │   │   ├── preferences/    # PreferencesManager (StateFlow reactive settings)
│       │   │   │   ├── repository/     # ClipRepository & ClipRepositoryImpl
│       │   │   │   └── storage/        # ImageStorageManager (thumbnails, FileProvider)
│       │   │   ├── di/                 # Hilt Modules (DatabaseModule, RepositoryModule)
│       │   │   ├── service/            # CaptureService, TileService, BubbleService, AccessibilityService
│       │   │   ├── widget/             # CliplockerWidgetProvider & AppWidget views
│       │   │   ├── worker/             # ExpiryWorker & RetentionWorker
│       │   │   └── ui/
│       │   │       ├── MainActivity.kt # Single-Activity, biometric gate, FLAG_SECURE
│       │   │       ├── theme/          # Custom Color, Type, Shape, Theme tokens (No Material 3 defaults)
│       │   │       ├── components/     # TopBar, SearchBar, ClipRowItem, FilterChipBar, PinnedShelf, CopiedBadge
│       │   │       ├── main/           # MainScreen, MainViewModel, MainUiState
│       │   │       ├── detail/         # ClipDetailScreen, ClipDetailViewModel
│       │   │       └── settings/       # SettingsScreen, SettingsViewModel
│       │   └── res/                    # Widget layouts, accessibility config, colors, file_paths
│       └── test/kotlin/com/cliplocker/app/
│           ├── SensitiveContentDetectorTest.kt # Comprehensive token & regex detector tests
│           ├── LuhnValidatorTest.kt            # Credit card Luhn checksum tests
│           ├── ExpiryLogicTest.kt              # Secret TTL & pruning logic tests
│           └── BackupEncryptionTest.kt         # PBKDF2 + AES-GCM roundtrip & tampering tests
├── gradle/
│   ├── libs.versions.toml              # Gradle version catalog
│   └── wrapper/                        # Gradle wrapper (8.13)
├── build.gradle.kts                    # Root build script
├── settings.gradle.kts                 # Project settings & repositories
├── LICENSE                             # GNU General Public License v3.0
└── README.md                           # Documentation
```

---

## License & Support

Cliplocker is released under the **GNU General Public License v3.0 (GPL-3.0)**. See the [LICENSE](LICENSE) file for the full license text.

If you find Cliplocker useful and appreciate offline-first, private software, consider supporting ongoing development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/cliplocker)
