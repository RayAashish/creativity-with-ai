#!/usr/bin/env bash
set -e

ADB="$HOME/Library/Android/sdk/platform-tools/adb"
APK="app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK" ]; then
    echo "Building debug APK..."
    ./gradlew assembleDebug
fi

echo "=========================================================="
echo "📱 Installing Native ReadMaster (Kotlin) on Moto Pad 70 Pro"
echo "=========================================================="

DEVICE_ID=$($ADB devices | grep -w "device" | awk '{print $1}' | head -n 1)

if [ -z "$DEVICE_ID" ]; then
    echo "❌ No device found. Please connect your Moto Pad 70 Pro via USB and ensure USB debugging is enabled."
    exit 1
fi

echo "Found device: $DEVICE_ID"
echo "Please make sure your tablet screen is awake/unlocked."
$ADB -s "$DEVICE_ID" install -r -d "$APK"

echo "🚀 Launching ReadMaster..."
$ADB -s "$DEVICE_ID" shell am start -n com.readmaster.app/.MainActivity

echo "✅ Installed & launched successfully!"
