# StreakPaper 🔥

> **Dynamic, Resolution-Aware Developer Streak & Heatmap Wallpapers with Daily Auto-Sync**

Turn your **GitHub** and **LeetCode** activity heatmaps and contribution streaks into aesthetic, ultra-sharp desktop and mobile wallpapers.

---

## ✨ Features

- **Multi-Platform Activity Tracking**:
  - **GitHub**: Total contributions, active days, current streak, longest streak, and 53-week activity heatmap. Zero authentication required.
  - **LeetCode**: GraphQL `userCalendar` queries with parsed timestamp matrices, current streak, and daily submission density.
- **Dynamic Wallpaper Engine (`@napi-rs/canvas`)**:
  - **Resolution Independence**: Generates crisp, high-definition wallpapers on the fly at any resolution (4K UHD `3840x2160`, 2K QHD `2560x1440`, 1080p `1920x1080`, Ultrawide `3440x1440`, and mobile portrait `1080x2400` / `1179x2556`).
  - **Aesthetic Curated Themes**:
    - *OLED True Black* (Pitch black `#000000` with vibrant emerald/neon green heat points)
    - *Catppuccin Mocha* (Deep mauve/slate with pastel purple/teal accents)
    - *Nord Frost* (Polar night blue with frosty cyan activity dots)
    - *Dracula Vampire* (Dark vampire theme with pink/green accents)
    - *Tokyo Night* (Deep neon indigo palette)
    - *Cyberpunk 2077* (Neon yellow/cyan/magenta palette)
    - *Solarized Dark* (Muted teal/amber palette)
    - *Forest Minimal* (Deep evergreen shades)
  - **Widget Positioning Engine**:
    - `center`: Centered in the middle of the screen.
    - `bottom-right`: Placed in the lower-right area (leaving desktop icons clear).
    - `top-center`: Clean top banner style (macOS Dock / Windows taskbar friendly).
    - `minimal`: Condensed 3-month mini-heatmap with streak summary badges.
  - **Visual Polishing**:
    - Ambient radial neon glow matching the theme palette.
    - Subtle developer coordinate dot grid.
    - 4 streak metric chips (Current Streak, Longest Streak, Total Contributions, Active Days).
- **Interactive Web Studio**:
  - Live scale-to-fit canvas simulation reflecting actual screen aspect ratio.
  - Mock Desktop Overlays (Test readability against mock desktop icons or macOS Dock).
  - One-click "Detect My Screen" using device pixel ratios.
  - Direct PNG download.
  - One-click copy for dynamic persistent API URLs.
- **OS Auto-Update Automation**:
  - Ready-to-use scripts for **macOS** (cron + osascript / AppleScript), **Windows** (PowerShell Scheduled Task), **iOS / iPadOS** (Apple Shortcuts recipe), and **Linux** (bash + gsettings/feh).

---

## 🚀 Quick Start

### 1. Install & Run Locally

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Optional Environment Variables

Create a `.env.local` file (optional):

```env
# Optional: Higher GitHub GraphQL API rate limits (works without it using public scraper)
GITHUB_TOKEN=ghp_your_github_token_here
```

---

## 📡 Dynamic Wallpaper API

The persistent auto-sync endpoint serves raw PNG images with 4-hour cache headers:

```http
GET /api/wallpaper?github={username}&leetcode={username}&theme={theme}&w={width}&h={height}&pos={position}
```

### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `github` | string | `torvalds` | Public GitHub username |
| `leetcode` | string | `""` | Public LeetCode username |
| `theme` | string | `oled` | `oled`, `catppuccin`, `nord`, `dracula`, `tokyo-night`, `cyberpunk`, `solarized`, `forest` |
| `w` or `width` | number | `1920` | Target wallpaper width in pixels (320 to 7680) |
| `h` or `height` | number | `1080` | Target wallpaper height in pixels (240 to 4320) |
| `pos` or `position`| string | `center` | `center`, `bottom-right`, `top-center`, `minimal` |
| `glow` | boolean | `true` | Show ambient theme glow behind the card (`1` or `0`) |
| `grid` | boolean | `true` | Show subtle dot grid background (`1` or `0`) |
| `stats` | boolean | `true` | Show streak metric chips (`1` or `0`) |
| `download` | boolean | `false` | Sets `Content-Disposition: attachment` for direct download |

---

## 🖥️ OS Automation Setup

### macOS (Terminal / Cron)

1. Save the update script:
```bash
mkdir -p "$HOME/.streakpaper"
cat << 'EOF' > "$HOME/.streakpaper/update.sh"
#!/usr/bin/env bash
WALLPAPER_FILE="$HOME/.streakpaper/wallpaper.png"
curl -s -L "YOUR_DYNAMIC_API_URL" -o "$WALLPAPER_FILE"
osascript -e 'tell application "System Events" to set picture of every desktop to POSIX file "'$WALLPAPER_FILE'"'
EOF
chmod +x "$HOME/.streakpaper/update.sh"
```

2. Add a daily cron job (runs at 8:00 AM):
```bash
(crontab -l 2>/dev/null; echo "0 8 * * * ~/.streakpaper/update.sh >/dev/null 2>&1") | crontab -
```

### Windows (PowerShell)

Save to `$HOME\.streakpaper\update.ps1`:
```powershell
$folder = "$HOME\.streakpaper"
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$wallpaperPath = "$folder\wallpaper.png"
Invoke-WebRequest -Uri "YOUR_DYNAMIC_API_URL" -OutFile $wallpaperPath

$code = @'
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
Add-Type -TypeDefinition $code
[Wallpaper]::SystemParametersInfo(0x0014, 0, $wallpaperPath, 0x01 -bor 0x02)
```

Register daily scheduled task at 8:00 AM:
```powershell
$Action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-ExecutionPolicy Bypass -File "$HOME\.streakpaper\update.ps1"'
$Trigger = New-ScheduledTaskTrigger -Daily -At 8am
Register-ScheduledTask -Action $Action -Trigger $Trigger -TaskName "StreakPaperSync"
```

---

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, TypeScript)
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Image Generation**: `@napi-rs/canvas` (High-speed hardware-accelerated Skia 2D rendering)
- **Caching**: In-Memory LRU Cache (`lru-cache`) with 4-hour TTL and HTTP Cache-Control headers
- **Validation**: Zod schema validation
