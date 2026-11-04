#!/usr/bin/env bash
set -e

export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"

if [ "$1" = "debug" ]; then
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
elif [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
elif [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
elif [ -n "$1" ] && [ -f "$1" ]; then
    APK_PATH="$1"
else
    echo "ERROR: No APK found. Run ./gradlew assembleRelease or assembleDebug first."
    exit 1
fi

echo "=========================================================="
echo "🛡️ INKFLOW SAFE INSTALL: Always using 'adb install -r'"
echo "Preserves all notes and user databases on Moto Pad 70 Pro"
echo "=========================================================="
adb install -r "$APK_PATH"
