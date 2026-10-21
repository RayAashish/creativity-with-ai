# TextMorph Studio — AI & OCR In-Image Text Editor

> Upload any image and edit its text in-place with intelligent OCR character recognition, seamless background erasing, and Canva-grade typography controls.

![TextMorph Studio](https://img.shields.io/badge/TextMorph-AI%20%26%20OCR-6366f1?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=for-the-badge)
![Tesseract.js](https://img.shields.io/badge/OCR-Tesseract.js%20WASM-059669?style=for-the-badge)

---

## ✨ Features

- **🔍 Automatic Optical Character Recognition (OCR)**
  - Runs 100% locally in your browser using WebAssembly & Web Workers (`Tesseract.js`). Zero API keys required out of the box!
  - Recognizes lines and words with bounding box precision, confidence scores, and multi-language support (English, Spanish, French, German, Hindi, Japanese, Chinese, etc.).
  - **Scan Specific Area**: Drag a box over any sub-region of an image to scan only that text.

- **🎨 Magic In-Place Background Erase & Text Replacement**
  - **Smart Background Sampling**: Samples perimeter pixels around detected text to automatically blend away the original text with zero ugly rectangles.
  - **Adjustable Patch Feathering & Padding**: Fine-tune soft edges, padding, and opacity for a natural, seamless look.
  - **Touch-up Brush**: Manual eraser and blender brush to quickly touch up blemishes or background artifacts.

- **🖌️ Figma & Canva-grade WYSIWYG Editing**
  - **Inline Editing**: Double-click any text box directly on the image to edit text in place.
  - **8-point Resize Handles**: Scale text boxes; font size adapts proportionally.
  - **Rotation Handle**: Rotate text to any angle with smooth degree snapping.
  - **Floating Quick Inspector**: Quick font size increment, color swatch, duplicate, and delete right above the active block.
  - **Pan & Zoom**: Scroll wheel to zoom, hold Spacebar to pan smoothly across the canvas.

- **🔤 Comprehensive Typography Controls**
  - **15+ Google Fonts**: Impact/Anton, Inter, Roboto, Poppins, Montserrat, Playfair Display, Bebas Neue, Oswald, Caveat, Pacifico, Dancing Script, Courier Prime, Bangers.
  - **Styling**: Bold, Italic, ALL CAPS toggle, Left/Center/Right alignment, line height, letter spacing.
  - **Text Outline / Stroke**: Essential for meme text, social media banners, and high-contrast headlines.
  - **Text Shadow**: Blur, offset X/Y, and shadow color.

- **⚡ 1-Click Style Presets**
  - **Meme Impact**: Classic bold white text with thick black stroke.
  - **Cyber Neon**: Glowing cyan futuristic neon.
  - **Golden Luxury**: Elegant champagne serif for invitations and premium certificates.
  - **Modern Sans**: Clean minimalist branding style.
  - **Sale Promo**: High-energy discount badge typography.
  - **Casual Script & Vintage Typewriter**.

- **🔎 Batch Find & Replace**
  - Search and replace words everywhere across the entire image simultaneously (e.g., updating a year, company name, or prices).

- **🌐 AI Supercharge & Multi-Language Translation**
  - Translate all detected image text into Spanish, French, German, Italian, Hindi, Japanese, etc.
  - Quick text case conversion (UPPERCASE, lowercase, Title Case, Sentence case).
  - Optional Gemini API Key integration for multimodal AI analysis and translations.

- **🖼️ Built-in Sample Image Gallery**
  - Test immediately with 1 click:
    1. **Classic Meme**: Top & bottom impact text
    2. **Cafe & Restaurant Menu**: Titles, descriptions, and prices
    3. **Cyber Sale Banner**: Discount callout and coupon code
    4. **Inspirational Nature Quote**: Serif typography on landscape
    5. **Concert / Event Tour Poster**: Dates, venue, and ticketing info
    6. **Executive Business Card**: Corporate identity and contact info

- **💾 Pro Export & Clipboard Sharing**
  - Export in **PNG** (lossless), **JPEG** (custom compression quality), **WebP** (modern high compression), or **PDF** (printable vector document).
  - **One-click Copy to Clipboard**: Paste directly into chat, Slack, or image editors.
  - **Compare Before/After**: Hold the compare button anytime to view the original unedited image.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `V` | Select & Move Tool |
| `T` | Add New Text Box |
| `S` | Scan Specific Area Tool |
| `B` | Touch-up Brush / Eraser |
| `I` | Color Eyedropper |
| `Space + Drag` | Pan Canvas |
| `Double Click` | Inline Text Editing |
| `Ctrl / Cmd + Z` | Undo |
| `Ctrl / Cmd + Shift + Z` | Redo |
| `Ctrl / Cmd + D` | Duplicate Selected Layer |
| `Backspace / Delete` | Delete Selected Layer |
| `Ctrl / Cmd + V` | Paste Image from Clipboard |
| `Esc` | Deselect Layer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node 24)
- npm or yarn

### Installation & Run

```bash
# Clone or navigate to the directory
cd edit_image_text

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

### Production Build

```bash
npm run build
npm run preview
```
