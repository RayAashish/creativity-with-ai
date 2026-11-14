# Creativity with AI

<p align="center">
  <em>A high-performance monorepo of native, privacy-first mobile and intelligent applications engineered with Kotlin, Jetpack Compose, Web, and AI systems.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-Android_%7C_Web-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/Language-Kotlin_•_TypeScript-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white" alt="Languages" />
  <img src="https://img.shields.io/badge/UI-Jetpack_Compose_%26_React-4285F4?style=for-the-badge&logo=jetpackcompose&logoColor=white" alt="UI" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## Featured Application: MindForge (Brain Games)

<p align="center">
  <!-- PRIMARY ACTION BUTTONS -->
  <a href="https://github.com/RayAashish/creativity-with-ai/releases/download/v2026.11.14/MindForge-release.apk">
    <img src="https://img.shields.io/badge/Download_MindForge-Release_APK_(2.2MB)-25D366?style=for-the-badge&logo=android&logoColor=white" alt="Download Release APK" />
  </a>
  <a href="https://github.com/RayAashish/creativity-with-ai/releases/download/v2026.11.14/MindForge-debug.apk">
    <img src="https://img.shields.io/badge/Download_MindForge-Debug_APK_(20MB)-007ACC?style=for-the-badge&logo=android&logoColor=white" alt="Download Debug APK" />
  </a>
</p>

### Overview & Key Highlights
- **Problem Statement:** Students, competitive exam candidates, and professionals need rapid 30–120 second daily cognitive warm-ups, but mainstream apps are laden with subscriptions, cloud accounts, slow loading screens, and ad trackers.
- **Core Value Proposition:** **MindForge** is an offline-first cognitive conditioning suite with zero internet permission, sub-millisecond on-device problem generation, Matiks-style auto-submit, horizontal spring shake feedback on errors, and 50 data-driven difficulty tiers across 25 games.
- **Feature Matrix:**
  - **25 Mini-Games** across Mental Math (9), Memory (5), Focus & Speed (5), Logic (4), and Language (2).
  - **50 Scaled Algorithmic Levels** per game (1,250 total progressions).
  - **Tactile Fast Keypad:** Instant auto-submission on correct match; prefix-guarded multi-digit input; 350ms spring shake and 2-beat error vibration on wrong inputs with automatic clearing.
  - **100% On-Device:** Zero cloud telemetry, SQLite Room database, Jetpack DataStore preferences, SAF JSON backup/restore, and anti-clock-tamper streak engine.

### MindForge System Architecture

```mermaid
graph TD
    subgraph UI ["Presentation Layer (Jetpack Compose M3)"]
        NavHost["MindForgeNavGraph (Type-Safe Navigation Compose)"]
        HomeScreen["HomeScreen (Streak Ring, Daily Hero, 25 Game Cards)"]
        InstructionScreen["GameInstructionsScreen (50-Level Carousel, Rules, Tips)"]
        PlayScreen["GamePlayScreen (Center Stage, Tactile Shake, Fast Keypad)"]
        ResultsScreen["GameResultsScreen (Star Breakdown, XP, Leaderboard)"]
    end

    subgraph Core ["Engine & Algorithmic Domain"]
        Registry["GameRegistry (Hilt Multi-Binding)"]
        Engines["25 GameEngine Implementations (Math, Memory, Focus, Logic, Language)"]
        PrefixGuard["Prefix-Guard Input Controller (Auto-Submit / Shake)"]
        StreakEng["Anti-Tamper Streak Engine (Monotonic Clock Guards)"]
    end

    subgraph Data ["Local-First Persistence (No Network)"]
        RoomDB[("MindForgeDatabase (SQLite Room)")]
        DataStore["Jetpack DataStore Preferences (Theme, Sound, Haptics, Profile)"]
        SAF["Storage Access Framework (JSON Backup & Restore)"]
    end

    HomeScreen --> NavHost
    NavHost --> InstructionScreen
    InstructionScreen --> PlayScreen
    PlayScreen --> ResultsScreen

    PlayScreen --> PrefixGuard
    PrefixGuard --> Registry
    Registry --> Engines
    PlayScreen --> RoomDB
    PlayScreen --> DataStore
    ResultsScreen --> StreakEng
    StreakEng --> RoomDB
```

---

## Monorepo Project Directory

| Project Module | Architecture | Stack | Description |
| :--- | :--- | :--- | :--- |
| **`brain-games/`** | Android Native | Kotlin 2.0, Compose M3, Room, Hilt, DataStore | MindForge: Offline cognitive training suite (25 games, 50 levels). |
| **`dream-reader-for-all-devices/`** | Hybrid / Responsive | Capacitor, React, TypeScript, PDF.js, Tailwind | Universal digital reading environment optimized for 5.0" to 14.6" screens. |
| **`dream-note-taking-app/`** | Android Native | Kotlin, Jetpack Compose, Room, Ink Engine | High-precision vector stylus note-taking system. |
| **`anti-addication-launcher/`** | Android Native | Kotlin, AccessibilityService, Compose, Rust JNI | Focus and anti-distraction launcher with grayscale mode and stealth sessions. |
| **`private-clipboard-manager/`** | Android Native | Kotlin, Room, SQLCipher, Jetpack Compose | Air-gapped, encrypted clipboard history vault. |
| **`pdf-offline-toolkit/`** | Android Native | Kotlin, PdfDocument, Compose | Offline PDF merge, split, compress, and watermark tools. |
| **`dream-wallpaper/`** | Web Application | Next.js, React, Tailwind CSS | Curated aesthetic dynamic wallpaper platform. |

---

## Security Scrubbing & Credential Audit

- **Zero Sensitive Tokens:** Audited all source trees; zero API keys, private credentials, or secrets committed.
- **Air-Gapped Android Architecture:** MindForge strictly excludes `android.permission.INTERNET`.
- **Git Hygiene:** Build caches, `.gradle`, `**/build/`, `local.properties`, and keystores are strictly excluded via `.gitignore`.

---

## Getting Started

### Clone & Build MindForge

```bash
# 1. Clone the monorepo
git clone https://github.com/RayAashish/creativity-with-ai.git
cd creativity-with-ai/brain-games

# 2. Run unit tests across all 50 levels
./gradlew testDebugUnitTest

# 3. Build optimized release APK (2.2MB via R8)
./gradlew assembleRelease

# 4. Install onto connected Android device
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## License

Distributed under the **MIT License**. Created by [Aashish Kumar Ray](https://github.com/RayAashish).
