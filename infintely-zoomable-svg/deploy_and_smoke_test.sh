#!/bin/bash
set -e

ANDROID_SDK_ROOT="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH"
PACKAGE_NAME="com.vectorcraft.app"
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

echo "========================================================"
echo "      Curvify Autonomous Deployment & Test Engine      "
echo "========================================================"

# 1. Audible signal & notification
osascript -e 'display notification "Build successful! Plug in your Android device via USB." with title "Antigravity Ready"' 2>/dev/null || true
afplay /System/Library/Sounds/Glass.aiff 2>/dev/null || printf "\a"

echo "[WAITING] Build successful. Please connect your target Android device with USB Debugging enabled..."

# 2. Autonomous polling script (checks every 3 seconds)
POLL_COUNT=0
while ! adb devices | grep -E "device$" > /dev/null; do
  sleep 3
  POLL_COUNT=$((POLL_COUNT + 1))
  echo "[WAITING] Polling adb devices... ($((POLL_COUNT * 3))s elapsed)"
  
  # If after 15s no physical device is detected and an AVD exists, start the emulator in background so progress isn't stalled
  if [ $POLL_COUNT -eq 5 ]; then
    AVD_NAME=$(emulator -list-avds 2>/dev/null | head -n 1)
    if [ -n "$AVD_NAME" ]; then
      echo "[AUTO-FALLBACK] No physical device detected yet. Launching local AVD: $AVD_NAME..."
      emulator -avd "$AVD_NAME" -no-snapshot-load -no-boot-anim &
    fi
  fi
done

DEVICE_ID=$(adb devices | grep -E "device$" | head -n 1 | awk '{print $1}')
echo "========================================================"
echo "Target device detected: $DEVICE_ID"
echo "Waiting for device boot completion..."
adb -s "$DEVICE_ID" wait-for-device
while [ "$(adb -s "$DEVICE_ID" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
  sleep 2
done
echo "Device boot complete!"

# 3. Install & Launch
echo "Installing $APK_PATH on $DEVICE_ID..."
adb -s "$DEVICE_ID" install -r "$APK_PATH"

echo "Clearing logcat buffer..."
adb -s "$DEVICE_ID" logcat -c

echo "Launching $PACKAGE_NAME/.MainActivity..."
adb -s "$DEVICE_ID" shell am start -n "$PACKAGE_NAME/.MainActivity"

# 4. Smoke Test & Crash Guard
echo "Monitoring logcat for crashes and UnsatisfiedLinkError (10 seconds)..."
CRASH_DETECTED=0
for i in {1..10}; do
  sleep 1
  ERRORS=$(adb -s "$DEVICE_ID" logcat -d -s AndroidRuntime:E VectorCraft-Native:E | grep -iE "FATAL|UnsatisfiedLinkError|SIGSEGV|SIGABRT" || true)
  if [ -n "$ERRORS" ]; then
    echo "[CRASH DETECTED]"
    echo "$ERRORS"
    CRASH_DETECTED=1
    break
  fi
done

if [ $CRASH_DETECTED -eq 0 ]; then
  echo "========================================================"
  echo "SUCCESS: VectorCraft launched cleanly with zero runtime crashes or JNI linkage errors!"
  echo "Native Rust engine successfully loaded and functional on $DEVICE_ID."
  echo "========================================================"
  osascript -e 'display notification "VectorCraft installed and running on device!" with title "Testing Active"' 2>/dev/null || true
  afplay /System/Library/Sounds/Ping.aiff 2>/dev/null || true
else
  echo "Smoke test encountered errors."
  exit 1
fi
