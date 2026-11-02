# MarkPDF — Markdown & GitHub to PDF Converter
### Optimized for Desktop & Tablets (Moto Pad 70 Pro 2K Ready)

**MarkPDF** is a full-featured application (available as a modern Web App and a native **Android APK**) that transforms Markdown files or markdown URLs (GitHub READMEs, Gists, and raw web documentation) into publication-ready, beautifully formatted PDF documents.

---

## 📱 Android App (Moto Pad 70 Pro & Tablet Optimized)

The standalone Android APK has been built and is ready to install:
- **Direct APK Location**: [`apk/MarkPDF-v1.0-MotoPad70Pro.apk`](file:///Users/aashishkumarray/Desktop/creativity-with-ai/markdown-to-pdf/apk/MarkPDF-v1.0-MotoPad70Pro.apk) (also accessible at [`apk/MarkPDF.apk`](file:///Users/aashishkumarray/Desktop/creativity-with-ai/markdown-to-pdf/apk/MarkPDF.apk))
- **File Size**: ~7.0 MB
- **Package Name**: `com.markpdf.app`

### 🎯 Moto Pad 70 Pro & Dynamic Screen Adaptations
- **2K High-DPI Canvas Rendering**: Tuned for the ~11" 2000x1200 2K display with crisp KaTeX mathematical formulas, Mermaid diagrams, and typography.
- **Adaptive View Modes**:
  - **Dual Pane View**: Split view between Markdown input and live PDF preview, ideal for landscape productivity with keyboard or kickstand.
  - **Editor Focus View**: Maximizes writing space for distraction-free typing.
  - **Preview Focus View**: Maximizes document preview for reading and reviewing.
- **Stylus & Touch Ergonomics**: Minimum 44px touch targets on buttons and toolbars for effortless finger or stylus taps.
- **100% Offline & Standalone PDF Generation**:
  - **Client-Side PDF Engine**: Direct `.pdf` file generation onto the tablet's Downloads folder without requiring an active backend server.
  - **Android System Print Integration**: Direct integration with Android's system Print Spooler ("Save as PDF" to device or cloud storage).
  - **Direct GitHub Fetch**: Fetches directly from raw GitHub repositories without CORS blocks.

---

## ✨ Web App Features

- **Multi-Source Markdown Input**:
  - 📁 **File Upload**: Drag-and-drop or browse `.md`, `.markdown`, or `.txt` files with instantaneous parsing.
  - 🔗 **GitHub / Web Link**: Paste any GitHub repo URL (`github.com/user/repo`), file blob URL (`github.com/user/repo/blob/main/README.md`), Gist URL, or arbitrary markdown link.
  - ✍️ **Live Markdown Editor**: Interactive editor with syntax toolbar, word count, line count, character count, and estimated reading time.
- **Rich Document Rendering**:
  - 📐 **Mathematical Formulas (KaTeX)**: Full support for inline equations `$E=mc^2$` and block formulas `$$\int_{-\infty}^\infty f(x) dx$$`.
  - 📊 **Architecture Diagrams (Mermaid)**: Renders flowcharts, sequence diagrams, state diagrams, and ER diagrams directly into scalable vector SVGs.
  - 💻 **Syntax Highlighting**: Code blocks powered by Highlight.js with language badges.
  - 💡 **GitHub Callout Alerts**: Full support for `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, and `> [!CAUTION]`.
  - 📋 **GFM Tables & Tasklists**: Structured comparison tables with zebra striping and interactive task checklists (`- [x]`).
- **Customizable Themes & Layouts**:
  - 🎨 **5 Distinct Themes**: GitHub Light, Academic Paper, Modern Tech, Minimalist, Executive Report.
  - 📄 **Page Geometry**: `A4`, `US Letter`, `US Legal`, Portrait/Landscape, Margins (Compact, Standard, Generous).
  - 📑 **Document Enhancements**: Table of Contents, Page numbers (`Page X of Y`), Header titles, and CSS page-break prevention.

---

## 🚀 Running & Building

### Web App (Development)
\`\`\`bash
npm run dev
\`\`\`
Visit **http://localhost:5173** in your browser.

### Web App (Production)
\`\`\`bash
npm run build
npm start
\`\`\`
Visit **http://localhost:3001** in your browser.

### Rebuilding Android APK
\`\`\`bash
# 1. Build and sync web assets to Android
npm run build
npx cap sync android

# 2. Build Debug APK with Gradle
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@21/21.0.10/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
cd android && ./gradlew assembleDebug
\`\`\`
The resulting APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 📲 How to Install on Moto Pad 70 Pro

1. **Transfer the APK to your tablet**:
   - Connect your Moto Pad 70 Pro via USB and copy [`apk/MarkPDF-v1.0-MotoPad70Pro.apk`](file:///Users/aashishkumarray/Desktop/creativity-with-ai/markdown-to-pdf/apk/MarkPDF-v1.0-MotoPad70Pro.apk) to the tablet's `Download` folder.
   - Or transfer via Google Drive, Bluetooth, or local network.
2. **Install**:
   - On your tablet, open the **Files** app, tap `MarkPDF-v1.0-MotoPad70Pro.apk`, and tap **Install** (allow "Install unknown apps" if prompted).
3. **Launch & Enjoy**:
   - Launch **MarkPDF** from your app drawer. Rotate between landscape and portrait, enjoy full 2K crispness, live preview, and direct PDF generation.
