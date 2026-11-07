# FocusLauncher Privacy Guarantee & Architecture

FocusLauncher is built from first principles for intentionality, privacy, and minimalism. It contains **zero third-party trackers, zero advertising SDKs, zero analytics, and zero telemetry**. All data remains strictly on your device.

---

## 1. Accessibility Service (`FocusAccessibilityService`)

### Why FocusLauncher uses an Accessibility Service
To prevent dopamine-seeking bypasses (such as opening social media or distracting games from incoming notifications, recents, or deep links without going through the launch gate), FocusLauncher provides an intentional Session Warden.

### What the Service Does
1. **Window Transition Detection**: Observes when the active foreground application changes.
2. **Session Expiry Enforcement**: If the active foreground package is classified as *Distracting* and has no active intentional session, or if the approved session timer has elapsed, the service executes `GLOBAL_ACTION_HOME` with haptic feedback to return to the home screen.
3. **Expiry Warning**: Alerts the user 60 seconds before session termination with options to extend (hard capped at 2 times) or return home.

### Strict Privacy Constraints & Architectural Guarantees
- **No Screen Content Scraping (`canRetrieveWindowContent = false`)**: The service cannot read text on your screen, view messages, inspect passwords, capture screenshots, or parse view hierarchies.
- **No Keystroke / Gesture Logging**: The service does not intercept keystrokes, touch inputs, or gestures.
- **Event Scope**: Only receives `typeWindowStateChanged` events.
- **Whitelisted System Packages**: All transitions involving system UI, Settings, keyboards/IMEs, dialers, and emergency dialers are ignored immediately.
- **Zero Network Egress**: The application does not request the `INTERNET` permission in its manifest. No data ever leaves your device.

---

## 2. Usage Stats Access (`PACKAGE_USAGE_STATS`)

- Used exclusively to compute local screen-on time and keyguard unlocks for the OLED live HUD.
- Screen time calculations are computed deterministically on-device via `UsageStatsManager.queryEvents`.
- Aggregations are held in an in-memory snapshot and never transmitted.

---

## 3. Notification Listener Access (`FocusNotificationService`)

### Why FocusLauncher uses a Notification Listener
Modern notifications are engineered to trigger compulsive dopamine loops. FocusLauncher batches non-essential notifications into intentional, user-configured daily digests (default 12:00, 18:00, 21:00) so you can stay in flow.

### What the Service Does
1. **Quarantine Interception**: Non-essential notifications are persisted to a local, encrypted SQLite/Room database (`focus_quarantine.db`) and removed from the active system tray.
2. **Scheduled Batching**: At configured digest hours, a local WorkManager worker summarizes intercepted notifications in a single non-intrusive notification.
3. **Automated 7-Day Cleanup**: Quarantined notifications are automatically purged after 7 days, or immediately upon user clear.

### Strict Privacy & Security Guarantees
- **Never Intercepts Essential Alerts**: Incoming phone calls, alarms, reminders, calendar events, navigation instructions, active media playback, and the default system SMS app pass through untouched.
- **User Allowlist (`Always Allow`)**: Any application placed on your allowlist is exempted from quarantine.
- **No Interactive PendingIntent Persistence**: Interactive actions, inline replies, and pending intents are intentionally never stored (they cannot be safely serialized). Tapping a digest item opens the app directly.
- **Zero Network Egress**: The application requests zero internet permissions. All notification records remain strictly on-device in app-private storage.

---

## 4. Sideloading on Android 13+ ("Restricted Settings")

When FocusLauncher is sideloaded (installed outside Google Play) on Android 13, 14, or 15, Android automatically marks accessibility services as "Restricted Settings" to protect against malicious APKs.

To authorize FocusLauncher's Session Warden:
1. Open **System Settings** > **Apps** > **FocusLauncher**.
2. Tap the **⋮ (three dots)** menu in the top right corner.
3. Select **Allow restricted settings**.
4. Authenticate using your PIN / fingerprint.
5. Open **Accessibility** in System Settings, locate **FocusLauncher Session Warden**, and turn it on.
