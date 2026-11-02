'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  Apple,
  Laptop,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynamicUrl: string;
}

export function AutomationModal({ isOpen, onClose, dynamicUrl }: AutomationModalProps) {
  const [activeTab, setActiveTab] = useState<'mac' | 'windows' | 'ios' | 'linux'>('mac');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2500);
  };

  const macScript = `#!/usr/bin/env bash
# StreakPaper Auto-Update for macOS
mkdir -p "$HOME/.streakpaper"
WALLPAPER_FILE="$HOME/.streakpaper/wallpaper.png"

echo "Fetching fresh developer streak wallpaper..."
curl -s -L "${dynamicUrl}" -o "$WALLPAPER_FILE"

# Apply to all macOS desktops via AppleScript
osascript -e 'tell application "System Events" to set picture of every desktop to POSIX file "'$WALLPAPER_FILE'"'
echo "Wallpaper updated successfully!"`;

  const macCronCommand = `# Run every morning at 8:00 AM:
(crontab -l 2>/dev/null; echo "0 8 * * * ~/.streakpaper/update.sh >/dev/null 2>&1") | crontab -`;

  const winScript = `# Save and run in PowerShell
$folder = "$HOME\\.streakpaper"
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$wallpaperPath = "$folder\\wallpaper.png"

Write-Host "Downloading fresh StreakPaper..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "${dynamicUrl}" -OutFile $wallpaperPath

$code = @'
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
Add-Type -TypeDefinition $code
[Wallpaper]::SystemParametersInfo(0x0014, 0, $wallpaperPath, 0x01 -bor 0x02)
Write-Host "Wallpaper updated!" -ForegroundColor Green`;

  const winTaskCommand = `# Register daily scheduled task at 8:00 AM (run in PowerShell as Admin):
$Action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-ExecutionPolicy Bypass -File "$HOME\\.streakpaper\\update.ps1"'
$Trigger = New-ScheduledTaskTrigger -Daily -At 8am
Register-ScheduledTask -Action $Action -Trigger $Trigger -TaskName "StreakPaperSync" -Description "Daily developer streak wallpaper sync"`;

  const linuxScript = `#!/usr/bin/env bash
# StreakPaper Auto-Update for Linux (GNOME / feh / KDE)
mkdir -p "$HOME/.streakpaper"
WALLPAPER="$HOME/.streakpaper/wallpaper.png"

curl -s -L "${dynamicUrl}" -o "$WALLPAPER"

# For GNOME:
if command -v gsettings &>/dev/null; then
  gsettings set org.gnome.desktop.background picture-uri "file://$WALLPAPER"
  gsettings set org.gnome.desktop.background picture-uri-dark "file://$WALLPAPER"
fi

# For feh (i3 / bspwm / X11):
if command -v feh &>/dev/null; then
  feh --bg-fill "$WALLPAPER"
fi`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">OS Auto-Sync Automation</h2>
              <p className="text-sm text-zinc-400">
                Update your desktop or lockscreen automatically every morning with fresh streaks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Endpoint Notice */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 block mb-0.5">
              Your Dynamic Persistent Sync URL:
            </span>
            <code className="text-xs text-zinc-300 font-mono block truncate select-all">
              {dynamicUrl}
            </code>
          </div>
          <button
            onClick={() => handleCopy(dynamicUrl, 'url')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition shrink-0"
          >
            {copiedScript === 'url' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>

        {/* OS Tabs */}
        <div className="flex items-center gap-2 mt-5 border-b border-zinc-800/80 pb-2">
          <button
            onClick={() => setActiveTab('mac')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'mac'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span>macOS</span>
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'windows'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Windows</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ios'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>iOS / iPadOS</span>
          </button>
          <button
            onClick={() => setActiveTab('linux')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'linux'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Linux</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {activeTab === 'mac' && (
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">1. Save sync script:</span>
                  <button
                    onClick={() => handleCopy(macScript, 'mac-script')}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    {copiedScript === 'mac-script' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Copy Script</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-900/90 rounded-xl font-mono text-xs text-zinc-300 border border-zinc-800/80 overflow-x-auto">
                  {macScript}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">
                    2. Add daily Cron schedule (8:00 AM every morning):
                  </span>
                  <button
                    onClick={() => handleCopy(macCronCommand, 'mac-cron')}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    {copiedScript === 'mac-cron' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Copy Cron Command</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-900/90 rounded-xl font-mono text-xs text-emerald-400 border border-zinc-800/80 overflow-x-auto">
                  {macCronCommand}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">
                    1. PowerShell Wallpaper Script (<code className="text-zinc-400">$HOME\.streakpaper\update.ps1</code>):
                  </span>
                  <button
                    onClick={() => handleCopy(winScript, 'win-script')}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    {copiedScript === 'win-script' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Copy PowerShell</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-900/90 rounded-xl font-mono text-xs text-zinc-300 border border-zinc-800/80 overflow-x-auto">
                  {winScript}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">2. Register Scheduled Task (Daily at 8 AM):</span>
                  <button
                    onClick={() => handleCopy(winTaskCommand, 'win-task')}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    {copiedScript === 'win-task' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Copy Task Registration</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-900/90 rounded-xl font-mono text-xs text-emerald-400 border border-zinc-800/80 overflow-x-auto">
                  {winTaskCommand}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4 text-sm text-zinc-300">
              <p className="text-zinc-400">
                You can set up automatic daily sync on iPhone and iPad using the native{' '}
                <strong className="text-white">Apple Shortcuts</strong> app:
              </p>
              <ol className="list-decimal list-inside space-y-2.5 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <li>
                  Open the <span className="text-white font-medium">Shortcuts</span> app on your iPhone or iPad.
                </li>
                <li>
                  Tap <span className="text-emerald-400 font-semibold">+</span> to create a new shortcut, name it{' '}
                  <span className="text-white font-mono">StreakPaper Sync</span>.
                </li>
                <li>
                  Add action: <strong className="text-white">Get Contents of URL</strong> &rarr; paste your Dynamic URL.
                </li>
                <li>
                  Add action: <strong className="text-white">Set Wallpaper</strong> &rarr; choose Lock Screen and/or Home Screen.
                </li>
                <li>
                  Go to the <span className="text-white font-medium">Automation</span> tab &rarr; Tap <strong className="text-white">Time of Day</strong> (e.g. 7:00 AM daily).
                </li>
                <li>
                  Choose <strong className="text-emerald-400">Run Immediately</strong> (disable &quot;Notify When Run&quot;) so it changes seamlessly every morning!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'linux' && (
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">Linux Bash Script:</span>
                  <button
                    onClick={() => handleCopy(linuxScript, 'linux-script')}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    {copiedScript === 'linux-script' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Copy Script</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-900/90 rounded-xl font-mono text-xs text-zinc-300 border border-zinc-800/80 overflow-x-auto">
                  {linuxScript}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Zero authentication needed — purely queries public contributions.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
