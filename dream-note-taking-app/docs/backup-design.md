# InkFlow: GitHub Backup & Restore Architecture & Design

## 1. System Overview & Principles
InkFlow's backup and restore subsystem provides reliable, encrypted, and human-readable backups of note libraries to user-owned private GitHub repositories.

### Core Principles
1. **Writing Path Inviolability (Speed Rule)**:
   - Writing, ink rendering, shape detection, and gesture handling run on isolated low-latency pipelines (144 Hz display target).
   - Backup dirty-checking, file serialization, SHA-256 hashing, encryption, and network communication execute strictly on background worker threads via `WorkManager`. Zero ink thread or UI thread blocking.
2. **Local-First, One-Way Safety Net**:
   - The device is the primary source of truth. GitHub functions as a durable safety net and versioned snapshot store.
3. **Pure REST Git Data API (Zero JGit)**:
   - Uses OkHttp and `kotlinx.serialization` directly against GitHub's Git Data API (`/git/blobs`, `/git/trees`, `/git/commits`, `/git/refs`).
   - No JGit, no JNI Git wrappers, minimal APK size overhead, total control over memory and concurrency.
4. **Atomic Snapshots**:
   - Every backup run produces exactly **one atomic Git commit** containing all added, modified, and deleted files.
   - Never uses force push (`"force": false`).
5. **Human-Readable GitHub Mirror**:
   - Alongside proprietary binary files (`.inkflow`, `.webp`), InkFlow creates an `exports/` directory containing clean GitHub-flavored Markdown (`.md`) with problem metadata (LeetCode link, difficulty, tags, time/space complexity, code) and OCR handwriting text, making notes immediately readable on GitHub.com.
6. **Zero-Knowledge Encryption (Optional)**:
   - Optional AES-256-GCM encryption with Argon2id passphrase derivation.
   - Passphrase never leaves the device. Session key is wrapped in the hardware-backed Android Keystore.

---

## 2. Remote Repository Data Layout

```
<repo>/
  backup-meta.json                                # Schema, app version, device id, encryption params, timestamp
  library.json                                    # Hierarchy: folders, notebooks, tags, page ordering, statuses
  notebooks/
    <notebook-id>/
      pages/
        <page-id>.inkflow                         # Raw lossless stroke serialization
        <page-id>.thumb.webp                      # Page visual thumbnail
      assets/
        <sha256>.<ext>                            # Referenced images / diagrams / attachments
  exports/
    <Folder-Path>/
      <Sanitized-Notebook-Title>/
        <Page-Slug>.md                            # Markdown export (Typed text, Problem card info, OCR text)
        <Page-Slug>.pdf                           # Optional exported PDF
```

### Path Sanitization Rules
- Path components mapped from user folder/notebook names:
  - Replace illegal filesystem characters (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`) with `-`.
  - Collapse sequential spaces and hyphens.
  - Enforce maximum 64 characters per path segment.
  - Page file conflicts resolved via page UUID suffix (e.g. `Q1-Two-Sum-8f4b.md`).

---

## 3. Architecture & Data Flow

```mermaid
flowchart TD
    subgraph UI & Inking ["Writing Layer (144 Hz Fast Path)"]
        Canvas[Ink Canvas & Shape Engine] -->|Stroke Drawn / Page Saved| PageDisk[Local File Storage (.inkflow)]
    end

    subgraph ChangeTracker ["Debounced Change Tracking (Background)"]
        PageDisk -->|Debounced Notification| HashWorker[Hash & Dirty Evaluator]
        HashWorker -->|Compute SHA-256| ManifestDB[(Room BackupManifest)]
    end

    subgraph BackupOrchestrator ["Backup Engine (WorkManager)"]
        Trigger[Triggers: Idle + Unmetered / Manual / Background] --> BackupWorker[BackupWorker]
        ManifestDB -->|Fetch Dirty & Deleted Items| BackupWorker
        BackupWorker --> NetCheck{Network & Rate Limits OK?}
        NetCheck -->|Yes| GitBlobs[Upload Blobs (Max 4 Parallel)]
        GitBlobs --> GitTree[Create Tree with base_tree & Deletions]
        GitTree --> GitCommit[Create Commit]
        GitCommit --> GitRef[Update Ref /refs/heads/main]
        GitRef -->|Success| UpdateManifest[Update BackupManifest in Single Room Tx]
        GitRef -->|Conflict / Out-of-date| ConflictResolver[Conflict Resolution: Fetch Remote, Keep Both]
    end

    subgraph GitHubServer ["GitHub Infrastructure"]
        GitBlobs --> RESTAPI[(GitHub Git Database)]
        GitTree --> RESTAPI
        GitCommit --> RESTAPI
        GitRef --> RESTAPI
    end
```

---

## 4. Detailed Component Design

### 4.1. Step 1 — Change Tracking & Manifest Database
- **Room Entity `BackupManifestEntity`**:
  - `path: String` (Primary Key, e.g. `notebooks/123/pages/456.inkflow`)
  - `contentHash: String` (SHA-256 hex string)
  - `sizeBytes: Long`
  - `lastBackedUpCommitSha: String?`
  - `state: ManifestState` (`CLEAN`, `DIRTY`, `DELETED`)
  - `updatedAt: Long`
- **Dirty Hash Evaluator**:
  - Hooked into `PageRepository.savePage()`.
  - Dispatched to `Dispatchers.IO` with 2-second debounce per page.
  - If calculated SHA-256 matches `contentHash` in manifest, marked `CLEAN` (avoids no-op commits).
  - If deleted locally, marked `DELETED` (tombstone).

### 4.2. Step 2 — Authentication (Device Flow & Android Keystore)
- **Flow**:
  1. App calls `POST https://github.com/login/device/code` with `client_id` and `scope=repo`.
  2. Displays `user_code` and opens `https://github.com/login/device` in browser or Custom Tab.
  3. Polls `POST https://github.com/login/oauth/access_token` respecting `interval` and `slow_down`.
  4. On completion, retrieves `access_token`.
- **Security & Keystore Storage**:
  - Token encrypted with hardware-backed `MasterKey` via AndroidX Security `EncryptedSharedPreferences`.
  - OkHttp `AuthInterceptor` attaches `Authorization: Bearer <token>` to requests and scrubs headers in logcat.
  - On HTTP `401 Unauthorized`, clears cached credentials and emits `BackupAuthStatus.ReconnectionRequired`.

### 4.3. Step 3 — Repository Provisioning & Initialization
- **Repository Setup Dialog**:
  - Option A: "Create a new private repository (recommended)" with default name `inkflow-notes-backup`.
  - Option B: "Connect to existing repository".
- **Empty Repo Initialization**:
  - Repos created with `auto_init: true` to avoid Git Data API 409 errors.
  - Initial `backup-meta.json` committed to establish baseline tree.
  - Checks `repo.private == true`. If public, warns the user prominently with confirmation required.

### 4.4. Step 4 — The Backup Engine (`BackupWorker`)
- **Worker Configuration**:
  - Scheduled via `WorkManager` with constraints: `NetworkType.UNMETERED`, `BatteryNotLow`, `RequiresDeviceIdle` (optional user toggle for Wi-Fi only and charging only).
  - Coalesce limit: at most one commit every 3 minutes, maximum 6 pushes/minute.
- **Commit Pipeline**:
  1. Query `BackupManifestEntity` for items where `state != CLEAN`.
  2. Read branch ref `refs/heads/{default_branch}` to obtain latest remote commit SHA.
  3. If remote commit SHA != local last known commit SHA, enter **Conflict Resolution**.
  4. Upload modified/new files as blobs via `POST /git/blobs` (bounded concurrency with Kotlin Coroutine `Semaphore(4)`).
  5. Post tree via `POST /git/trees` with `base_tree = remote_tree_sha`, providing changed blobs and `{ sha: null }` for tombstones.
  6. Post commit via `POST /git/commits` with human-readable summary: `Backup YYYY-MM-DD HH:mm — N items changed`.
  7. Patch ref via `PATCH /git/refs/heads/{default_branch}` with `"force": false`.
  8. Update `BackupManifest` entities to `state = CLEAN` and store new commit SHA in a single Room database transaction.

### 4.5. Step 5 — Human-Readable Exports (Markdown & PDF)
- **Markdown Generator**:
  - Converts notes to standardized Markdown (`.md`):
    - Problem Card metadata: `# <Title>`, link, difficulty badge, tags, time/space complexity, status, approach, formatted code block.
    - Typed text blocks.
    - Handwriting strokes converted to OCR / transcript text.
    - Diagrams / images linked with relative paths to `notebooks/<id>/assets/<hash>.<ext>`.
- **Golden-File Unit Tests**:
  - Comprehensive unit tests comparing sample DSA notes against known golden `.md` files.

### 4.6. Step 6 — Conflicts & Remote Divergence
- **Detection**:
  - Remote `refs/heads/{branch}` commit SHA != local `lastKnownHeadSha`.
- **Resolution Strategy ("Keep Both — Never Silently Overwrite")**:
  - Download remote tree and diff paths against local dirty files.
  - If a file was changed on remote AND edited locally:
    - Push local version at default path.
    - Pull remote version and save locally as `<Page-Title> (Conflicted copy from remote <Date>).inkflow`.
    - Present alert banner in note library: "Conflict resolved: Conflicted copy added to notebook".
  - If remote update was rejected due to racing push: re-fetch remote tree, merge trees without file-level conflict, retry once.

### 4.7. Step 7 — Optional Zero-Knowledge Encryption
- **Algorithm**:
  - Key Derivation: **Argon2id** (iterations = 3, memory = 64MB, parallelism = 4) using user passphrase + unique 16-byte random salt.
  - Cipher: **AES-256-GCM** (12-byte random IV per file, 16-byte authentication tag).
  - Associated Data (AAD): SHA-256 of file path.
- **Passphrase Handling**:
  - Passphrase is never stored in plaintext or database.
  - Derived master key is wrapped with an Android Keystore key and kept in encrypted session memory.
  - If user enables encryption, `backup-meta.json` specifies `"encryption": { "enabled": true, "algorithm": "AES-256-GCM", "kdf": "Argon2id", "salt": "..." }`.
  - Filenames in `notebooks/` and `assets/` encrypted or hashed, and `.md` exports can be omitted or encrypted based on user selection.

### 4.8. Step 8 — Restore Engine
- **Full Restore**:
  - User signs in on new or reset device.
  - Selects backup repository and provides decryption passphrase (if enabled).
  - Downloads `backup-meta.json` and `library.json`.
  - Reconstructs notebook/folder hierarchy.
  - Downloads stroke `.inkflow` and `.thumb.webp` files.
  - Rebuilds Room database and `BackupManifest` with `CLEAN` status.
- **Selective / Lazy Restore**:
  - Previews remote notebook tree.
  - Allows user to restore individual notebooks or pages without full library download.

### 4.9. Step 9 — User Interface
- **Settings Screen ("GitHub Backup")**:
  - Account state (Connected user profile, Sign Out button).
  - Target repository selector & privacy indicator (Lock icon: Private).
  - Backup toggles: "Wi-Fi only", "Only while charging", "Client-side encryption".
  - "Back Up Now" (expedited button with progress spinner).
  - "Restore from GitHub" wizard.
- **Library Sync Status**:
  - Top bar icon / chip showing status: `Synced`, `Backing up...`, `Offline`, `Reconnection needed`, `Conflict`.

### 4.10. Step 10 — Size Warnings & Compaction
- Warns if repository approaches 1 GB.
- Warns before uploading files > 50 MiB; blocks standard upload and offers Git LFS opt-in.
- History compaction guidance: recommends creating a fresh snapshot branch or squash if Git history exceeds 1.5 GB.

---

## 5. Implementation Roadmap (Phases)
1. **Phase 1**: Research & Setup (Step 0 & 1) — Docs, Key generation, `local.properties`, Room `BackupManifest`.
2. **Phase 2**: Networking & Auth (Step 2 & 3) — OkHttp GitHub client, Device Flow, Repo init.
3. **Phase 3**: Engine & Workers (Step 4 & 5) — `BackupWorker`, Git Data API pipeline, Markdown exporter.
4. **Phase 4**: Robustness & Security (Step 6 & 7) — Conflict resolution, AES-256-GCM / Argon2id encryption.
5. **Phase 5**: Restore & UI (Step 8 & 9) — Restore engine, Settings UI, Sync Status chip.
6. **Phase 6**: Benchmarks & Verification (Step 10) — Inking latency benchmark regression test (< 2% rule), APK build & test on Moto Pad 70 Pro.
