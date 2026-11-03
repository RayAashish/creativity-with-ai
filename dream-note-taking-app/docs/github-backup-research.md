# GitHub Backup & Restore: Technical Research Note

This document evaluates the GitHub REST API capabilities, limits, quotas, and behaviors for implementing a robust, local-first backup and restore engine for the InkFlow Android note-taking application.

---

## 1. Authentication: GitHub Device Flow (RFC 8628)
- **Official Documentation**: [GitHub Device Authorization Grant](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
- **Endpoints**:
  - Code Request: `POST https://github.com/login/device/code`
    - Request: `client_id`, `scope` (`repo`)
    - Response: `device_code`, `user_code`, `verification_uri`, `expires_in` (typically 900s), `interval` (typically 5s)
  - Token Polling: `POST https://github.com/login/oauth/access_token`
    - Request: `client_id`, `device_code`, `grant_type=urn:ietf:params:oauth:grant-type:device_code`
    - Response States:
      - `200 OK` with `access_token`, `token_type`, `scope` upon user confirmation.
      - `authorization_pending`: user has not approved yet; continue polling after `interval` seconds.
      - `slow_down`: polling too quickly; must add +5 seconds to current `interval`.
      - `expired_token`: code has expired; prompt user to restart authentication.
      - `access_denied`: user denied request; cancel flow gracefully.
- **Client Security**:
  - Device flow requires an OAuth App `client_id` (public identifier).
  - **No Client Secret is ever required or stored on the Android client.**
  - Required OAuth Scope: `repo` (Full control of private repositories). Necessary to read/write commits, trees, and refs in private backup repositories.
  - Runtime Token Storage: Wrapped using the **Android Keystore** in EncryptedSharedPreferences / MasterKey (AES-256-GCM).

---

## 2. Low-Level Git Data API (Blobs, Trees, Commits, Refs)
- **Official Documentation**: [Git Database REST API](https://docs.github.com/en/rest/git)
- InkFlow uses pure **OkHttp + kotlinx.serialization** (no heavy JGit dependency or JNI wrappers):
  1. **Blobs (`POST /repos/{owner}/{repo}/git/blobs`)**:
     - Binary files (e.g., `.inkflow`, `.webp`, `.pdf`, assets) uploaded as Base64 (`"encoding": "base64"`).
     - Text files (e.g., `backup-meta.json`, `library.json`, `.md` exports) uploaded as UTF-8.
     - Returns Git blob SHA-1.
  2. **Trees (`POST /repos/{owner}/{repo}/git/trees`)**:
     - Accepts `base_tree` (SHA of previous commit's tree) for incremental diffs.
     - Array of tree items: `{ "path": "...", "mode": "100644", "type": "blob", "sha": "<blob_sha>" }`.
     - File deletions: specified by passing `{ "path": "...", "mode": "100644", "type": "blob", "sha": null }`.
     - Returns created tree SHA.
  3. **Commits (`POST /repos/{owner}/{repo}/git/commits`)**:
     - Accepts `message`, `tree`, `parents: ["<current_head_commit_sha>"]`.
     - One single atomic commit generated per backup session.
     - Returns created commit SHA.
  4. **References (`PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}`)**:
     - Updates branch pointer (e.g., `refs/heads/main`) to the newly created commit.
     - `"force": false`: Enforces fast-forward update. If rejected due to remote changes, triggers non-destructive conflict handling.

### Empty Repository Behavior & Workaround
- **Quirk**: Brand new repositories created without commits lack a `HEAD` ref, default branch, or tree. Attempting to call `GET /git/refs/heads/main` or `POST /git/trees` against an empty repository fails with HTTP `409 Conflict` ("Git repository is empty") or `404 Not Found`.
- **Mitigation**:
  - When creating a repo via `POST /user/repos`, always set `"auto_init": true`, or
  - If attaching to an existing empty repo, write the initial `backup-meta.json` using the Contents API (`PUT /repos/{owner}/{repo}/contents/backup-meta.json`), which initializes the commit tree and creates the default branch.

---

## 3. GitHub Quotas & Rate Limits
- **REST Rate Limits**:
  - Authenticated requests: **5,000 requests per hour** per user account.
  - Tracked via response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- **Secondary Rate Limits & Throttling**:
  - Pushing too fast: GitHub recommends $\le 6$ pushes/commits per minute per repository.
  - Concurrency: Limit concurrent HTTP connections to $\le 4$ parallel blob uploads.
  - Coalescing: Debounce backup worker triggers so consecutive backups commit at most once every ~3 minutes during active writing sessions.
  - Exponential Backoff: Respect HTTP `429 Too Many Requests` or HTTP `403` with `Retry-After` headers; implement jittered exponential backoff (e.g. 1s, 2s, 4s, 8s).
- **File and Repository Size Limits**:
  - GitHub blocks standard files $> 100\text{ MiB}$ with a hard push error.
  - GitHub warns on files $> 50\text{ MiB}$. InkFlow skips and logs warnings for any single note or asset $> 50\text{ MiB}$.
  - Repository Size: GitHub recommends keeping repositories $\le 1\text{ GB}$; soft limits/notices trigger above $5\text{ GB}$.
- **Git LFS Free Quotas**:
  - GitHub Free accounts include 1 GiB storage and 1 GiB/month bandwidth.
  - Because strokes (`.inkflow`) are compactly binary-packed and notes are incremental, standard Git blobs are dramatically better suited than LFS for normal note-taking. Git LFS is strictly opt-in with user warnings for large PDFs.

---

## 4. Encryption & Security Analysis
- **Key Derivation**: Passphrase-derived master encryption key using **Argon2id** (memory-hard, resistant to GPU/ASIC brute forcing) with unique 16-byte salt stored in `backup-meta.json`.
- **Payload Cipher**: **AES-256-GCM** with authenticated associated data (AAD) tied to file path and repository id, protecting integrity and confidentiality.
- **Keystore Wrapping**: Runtime session keys cached in memory and wrapped in hardware-backed Android Keystore so the user doesn't need to re-enter their passphrase on every background backup run.
- **Log Sanitation**: Automatic OkHttp logging interceptor masking `Authorization` headers, OAuth tokens, and encryption keys.
