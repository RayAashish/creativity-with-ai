#!/usr/bin/env bash
set -e

ADB="/Users/aashishkumarray/Library/Android/sdk/platform-tools/adb"
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
PACKAGE_NAME="com.antigravity.note.debug"
MAIN_ACTIVITY="com.antigravity.note.MainActivity"

echo "=== Dream Note App: Moto Pad 70 Pro Runner ==="

# Check ADB
if [ ! -f "$ADB" ]; then
    echo "Error: adb not found at $ADB"
    exit 1
fi

# Check device connection
DEVICE_COUNT=$("$ADB" devices | grep -v "List" | grep -v "^$" | wc -l | tr -d ' ')

if [ "$DEVICE_COUNT" -eq "0" ]; then
    echo ""
    echo "⚠️  No authorized device detected yet by adb."
    echo "macOS sees the hardware ('moto pad 70 pro' on USB), but USB Debugging needs to be enabled:"
    echo "  1. On your Moto Pad 70 Pro: Go to Settings -> About tablet -> tap 'Build number' 7 times."
    echo "  2. Go to Settings -> System -> Developer options -> toggle 'USB Debugging' ON."
    echo "  3. When the prompt 'Allow USB debugging?' appears on the tablet, check 'Always allow' and tap 'Allow'."
    echo ""
    exit 1
fi

# Check if unauthorized
if "$ADB" devices | grep -q "unauthorized"; then
    echo ""
    echo "⚠️  Device is detected but UNAUTHORIZED."
    echo "Look at your Moto Pad 70 Pro screen and tap 'Allow' on the USB Debugging prompt."
    echo ""
    exit 1
fi

DEVICE_ID=$("$ADB" devices | grep -v "List" | grep -v "^$" | awk '{print $1}' | head -n 1)
echo "✓ Connected device: $DEVICE_ID"

# Build APK if missing
if [ ! -f "$APK_PATH" ]; then
    echo "Building debug APK..."
    export JAVA_HOME="/opt/homebrew/Cellar/openjdk@21/21.0.10/libexec/openjdk.jdk/Contents/Home"
    ./gradlew assembleDebug
fi

echo "Installing APK to Moto Pad 70 Pro..."
"$ADB" install -r "$APK_PATH"

echo "Launching MainActivity..."
"$ADB" shell am start -n "$PACKAGE_NAME/$MAIN_ACTIVITY"

echo ""
echo "✓ App is running on Moto Pad 70 Pro!"
echo "Streaming live probe logs (Press Ctrl+C to stop)..."
echo "----------------------------------------------------"
"$ADB" logcat -c
"$ADB" logcat -v time -s DreamNoteApp:V AndroidRuntime:E
