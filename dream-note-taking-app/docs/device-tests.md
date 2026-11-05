# Device Test Checklist (Moto Pad 70 Pro)

> **Rule 0.1 Tracking**: Checked `adb devices` at start of Master Task (2026-11-05 23:44). Device was not connected (`List of devices attached` empty). Per Rule 0.1, we stopped polling immediately, marked on-device tests `BLOCKED: needs device`, and are executing all audit, unit test, format verification, emulator tests, and viewer implementation steps first. When a natural stopping point arrives, we will send one clear batched request to the user to reconnect the tablet.

| Test ID | Area | Description | Status | Prerequisites |
|---|---|---|---|---|
| `DEV-01` | Ink Latency & 144Hz | Hardware digitizer touch-to-pixel latency budget (<1ms, 144 fps, 0 jank) with Moto Pen Pro | `BLOCKED: needs device` | Physical stylus + 144Hz screen |
| `DEV-02` | Palm Rejection | Edge-zone and contact area (`TOUCH_MAJOR`) palm rejection during resting hand write | `BLOCKED: needs device` | Physical hand on digitizer |
| `DEV-03` | On-Device Restore | Full restore from `/storage/emulated/0/Documents/InkFlow/` on fresh app install profile | `BLOCKED: needs device` | Tablet storage access |
| `DEV-04` | 100 Close/Open Cycles | Automated activity relaunch 100x cycling stroke hash verification on Moto Pad 70 Pro | `BLOCKED: needs device` | Connected tablet |
| `DEV-05` | Tablet Browser Viewer | Opening reader site in tablet browser, pinch-to-zoom, touch scrolling & reading mode | `BLOCKED: needs device` | Mobile/Tablet Chrome on device |
| `DEV-06` | Live Page Repair | Visual check of repaired dark-theme "Page 2 / 3" deformed circles on device | `BLOCKED: needs device` | Connected tablet |
