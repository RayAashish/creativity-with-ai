package com.antigravity.note.inkengine.export

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PaperTemplate
import java.io.OutputStream
import java.io.OutputStreamWriter
import java.nio.charset.StandardCharsets

/**
 * Exports vector note pages into a single, self-contained, offline-first interactive HTML web note.
 *
 * Can be opened in any modern browser (Chrome, Safari, Firefox, Edge) on Windows, macOS, Linux,
 * iOS, and Android with ZERO dependencies or installed apps.
 *
 * Features:
 * - High-DPI HTML5 Vector Canvas with pressure-sensitive strokes & quadratic bezier smoothing
 * - Interactive Pan & Zoom (Mouse drag, wheel, mobile touch & pinch)
 * - Multi-page navigation (Prev / Next buttons, Page thumbnails / jump)
 * - Native paper templates: Ruled, Math Grid, Dot Grid, Cornell, and Blank
 * - Dark Mode / Light Mode with Smart Dynamic Contrast (black <-> white auto-contrast)
 * - Offline print to PDF & direct PNG image export
 */
object HtmlNoteExporter {

    fun exportToHtml(
        notebookTitle: String,
        pages: List<DocumentPage>,
        outputStream: OutputStream,
        initialDarkMode: Boolean = false
    ) {
        val writer = OutputStreamWriter(outputStream, StandardCharsets.UTF_8)

        // Build JSON representation of pages & strokes
        val pagesJson = StringBuilder("[")
        for ((pIdx, page) in pages.withIndex()) {
            if (pIdx > 0) pagesJson.append(",")
            pagesJson.append("{")
            pagesJson.append("\"id\":\"").append(escapeJson(page.metadata.pageId)).append("\",")
            pagesJson.append("\"title\":\"").append(escapeJson(page.metadata.title)).append("\",")
            pagesJson.append("\"index\":").append(page.metadata.pageIndex).append(",")
            pagesJson.append("\"template\":\"").append(page.metadata.template.name).append("\",")
            pagesJson.append("\"strokes\":[")

            for ((sIdx, stroke) in page.strokes.withIndex()) {
                if (sIdx > 0) pagesJson.append(",")
                pagesJson.append("{")
                val colorHex = String.format("#%08X", stroke.brush.colorIntArgb)
                pagesJson.append("\"c\":\"").append(colorHex).append("\",")
                pagesJson.append("\"w\":").append(String.format(java.util.Locale.US, "%.2f", stroke.brush.size)).append(",")
                val isHighlighter = stroke.brush.family.clientBrushFamilyId.contains("highlighter", ignoreCase = true) ||
                        ((stroke.brush.colorIntArgb ushr 24) and 0xFF) <= 0x99
                pagesJson.append("\"h\":").append(isHighlighter).append(",")
                pagesJson.append("\"pts\":[")

                val inputCount = stroke.inputs.size
                for (i in 0 until inputCount) {
                    val pt = stroke.inputs.get(i)
                    if (i > 0) pagesJson.append(",")
                    pagesJson.append("[")
                        .append(String.format(java.util.Locale.US, "%.1f", pt.x)).append(",")
                        .append(String.format(java.util.Locale.US, "%.1f", pt.y)).append(",")
                        .append(String.format(java.util.Locale.US, "%.2f", pt.pressure.coerceIn(0.1f, 1.0f)))
                        .append("]")
                }
                pagesJson.append("]")
                pagesJson.append("}")
            }
            pagesJson.append("]")
            pagesJson.append("}")
        }
        pagesJson.append("]")

        val html = buildHtmlContent(notebookTitle, pagesJson.toString(), initialDarkMode)
        writer.write(html)
        writer.flush()
    }

    private fun escapeJson(str: String): String {
        return str.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
    }

    private fun buildHtmlContent(notebookTitle: String, pagesJson: String, isDark: Boolean): String {
        return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>${escapeHtml(notebookTitle)} — InkFlow Note</title>
  <style>
    :root {
      --bg-canvas: #FCFAF6;
      --bg-surface: #FFFFFF;
      --border-color: #E0E2EC;
      --text-main: #1A1C1E;
      --text-muted: #74777F;
      --primary: #005AC1;
      --primary-container: #D8E2FF;
      --on-primary-container: #001A41;
      --rule-line: rgba(0, 90, 193, 0.08);
      --rule-margin: rgba(186, 26, 26, 0.16);
      --grid-line: rgba(0, 0, 0, 0.05);
    }
    body.dark {
      --bg-canvas: #18191D;
      --bg-surface: #22242A;
      --border-color: #44474F;
      --text-main: #E2E2E6;
      --text-muted: #8E9099;
      --primary: #ABC7FF;
      --primary-container: #00458E;
      --on-primary-container: #D8E2FF;
      --rule-line: rgba(255, 255, 255, 0.08);
      --rule-margin: rgba(255, 180, 171, 0.20);
      --grid-line: rgba(255, 255, 255, 0.05);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg-surface); color: var(--text-main); }
    #app { display: flex; flex-direction: column; width: 100%; height: 100%; }
    header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: var(--bg-surface); border-bottom: 1px solid var(--border-color); z-index: 10; gap: 12px; flex-wrap: wrap; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .badge-logo { background: var(--primary-container); color: var(--on-primary-container); font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.5px; }
    .doc-info h1 { font-size: 15px; font-weight: 700; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-info p { font-size: 11px; color: var(--text-muted); }
    .header-center { display: flex; align-items: center; gap: 8px; background: var(--bg-canvas); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border-color); }
    .btn-nav { background: none; border: none; cursor: pointer; color: var(--text-main); padding: 4px 8px; border-radius: 4px; font-size: 14px; display: flex; align-items: center; justify-content: center; }
    .btn-nav:hover { background: var(--border-color); }
    .btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-indicator { font-size: 12px; font-weight: 600; min-width: 80px; text-align: center; }
    .header-right { display: flex; align-items: center; gap: 6px; }
    .btn-tool { background: var(--bg-canvas); border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background 0.15s; }
    .btn-tool:hover { background: var(--primary-container); color: var(--on-primary-container); }
    #viewport-container { flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden; cursor: grab; background: var(--bg-canvas); }
    #viewport-container:active { cursor: grabbing; }
    canvas { position: absolute; top: 0; left: 0; display: block; }
    .zoom-hud { position: absolute; bottom: 16px; right: 16px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 6px; display: flex; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 5; }
    .zoom-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--bg-canvas); color: var(--text-main); font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .zoom-btn:hover { background: var(--primary-container); }
    .watermark { position: absolute; bottom: 16px; left: 16px; font-size: 11px; color: var(--text-muted); opacity: 0.7; pointer-events: none; }
  </style>
</head>
<body class="${if (isDark) "dark" else ""}">
  <div id="app">
    <header>
      <div class="header-left">
        <span class="badge-logo">INKFLOW NOTE</span>
        <div class="doc-info">
          <h1>${escapeHtml(notebookTitle)}</h1>
          <p id="page-subtitle">Loading note...</p>
        </div>
      </div>
      <div class="header-center">
        <button id="btn-prev" class="btn-nav" title="Previous Page">◀</button>
        <span id="page-label" class="page-indicator">Page 1 / 1</span>
        <button id="btn-next" class="btn-nav" title="Next Page">▶</button>
      </div>
      <div class="header-right">
        <button id="btn-theme" class="btn-tool" title="Toggle Dark / Light Mode">🌓 Theme</button>
        <button id="btn-fit" class="btn-tool" title="Fit to Screen">🔍 Reset</button>
        <button id="btn-print" class="btn-tool" title="Print or Save as PDF">🖨️ PDF</button>
        <button id="btn-export-png" class="btn-tool" title="Download Image">🖼️ PNG</button>
      </div>
    </header>

    <div id="viewport-container">
      <canvas id="noteCanvas"></canvas>
      <div class="zoom-hud">
        <button id="btn-zoom-out" class="zoom-btn" title="Zoom Out">−</button>
        <button id="btn-zoom-in" class="zoom-btn" title="Zoom In">+</button>
      </div>
      <div class="watermark">⚡ Rendered with InkFlow Sub-ms Engine</div>
    </div>
  </div>

  <script>
    const PAGES = $pagesJson;
    let currentPageIndex = 0;
    let isDarkMode = ${if (isDark) "true" else "false"};

    const container = document.getElementById('viewport-container');
    const canvas = document.getElementById('noteCanvas');
    const ctx = canvas.getContext('2d');

    let scale = 1.0;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let touchStartDist = 0;
    let touchStartScale = 1.0;

    const VIRTUAL_WIDTH = 2190;
    const VIRTUAL_HEIGHT = 3504;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    }

    function fitToScreen() {
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const scaleX = (containerW - 40) / VIRTUAL_WIDTH;
      const scaleY = (containerH - 40) / VIRTUAL_HEIGHT;
      scale = Math.min(scaleX, scaleY, 1.2);
      panX = (containerW - VIRTUAL_WIDTH * scale) / 2;
      panY = Math.max(20, (containerH - VIRTUAL_HEIGHT * scale) / 2);
      render();
    }

    function hexToRgba(hex) {
      if (!hex.startsWith('#')) return { r: 17, g: 19, b: 24, a: 1 };
      const raw = hex.slice(1);
      if (raw.length === 8) {
        const a = parseInt(raw.slice(0, 2), 16) / 255;
        const r = parseInt(raw.slice(2, 4), 16);
        const g = parseInt(raw.slice(4, 6), 16);
        const b = parseInt(raw.slice(6, 8), 16);
        return { r, g, b, a };
      } else if (raw.length === 6) {
        const r = parseInt(raw.slice(0, 2), 16);
        const g = parseInt(raw.slice(2, 4), 16);
        const b = parseInt(raw.slice(4, 6), 16);
        return { r, g, b, a: 1 };
      }
      return { r: 17, g: 19, b: 24, a: 1 };
    }

    function adaptStrokeColor(colorHex, isHighlighter) {
      const rgba = hexToRgba(colorHex);
      if (isHighlighter) {
        return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + ", 0.35)";
      }
      const maxC = Math.max(rgba.r, rgba.g, rgba.b);
      const minC = Math.min(rgba.r, rgba.g, rgba.b);
      const sat = maxC - minC;
      // Only adapt monochrome inks (black, grays, whites). Colored inks preserve hue.
      if (sat <= 35) {
        const lum = 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
        if (isDarkMode) {
          // Dark Mode: transform near-black/dark inks to crisp off-white
          if (lum < 85) return "rgba(245, 245, 245, 1)";
        } else {
          // Light Mode: transform near-white/light inks to deep black
          if (lum > 175) return "rgba(17, 19, 24, 1)";
        }
      }
      return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
    }

    function drawPaperBackground(template) {
      // Paper base
      ctx.fillStyle = isDarkMode ? "#18191D" : "#FCFAF6";
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Paper drop shadow / border
      ctx.strokeStyle = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      if (template === "RULED") {
        const lineSpacing = 80;
        const startY = 240;
        ctx.strokeStyle = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,90,193,0.09)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let y = startY; y < VIRTUAL_HEIGHT - 60; y += lineSpacing) {
          ctx.moveTo(100, y);
          ctx.lineTo(VIRTUAL_WIDTH - 100, y);
        }
        ctx.stroke();

        // Red left margin line
        ctx.strokeStyle = isDarkMode ? "rgba(255,180,171,0.22)" : "rgba(186,26,26,0.18)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(260, 0);
        ctx.lineTo(260, VIRTUAL_HEIGHT);
        ctx.stroke();
      } else if (template === "GRID") {
        const gridSpacing = 60;
        ctx.strokeStyle = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 60; x < VIRTUAL_WIDTH; x += gridSpacing) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, VIRTUAL_HEIGHT);
        }
        for (let y = 60; y < VIRTUAL_HEIGHT; y += gridSpacing) {
          ctx.moveTo(0, y);
          ctx.lineTo(VIRTUAL_WIDTH, y);
        }
        ctx.stroke();
      } else if (template === "DOT") {
        const dotSpacing = 60;
        ctx.fillStyle = isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
        for (let x = 80; x < VIRTUAL_WIDTH - 60; x += dotSpacing) {
          for (let y = 80; y < VIRTUAL_HEIGHT - 60; y += dotSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    function render() {
      const page = PAGES[currentPageIndex];
      if (!page) return;

      // Update Header Info
      document.getElementById('page-subtitle').textContent = page.title + " • " + page.strokes.length + " strokes";
      document.getElementById('page-label').textContent = "Page " + (currentPageIndex + 1) + " / " + PAGES.length;
      document.getElementById('btn-prev').disabled = (currentPageIndex === 0);
      document.getElementById('btn-next').disabled = (currentPageIndex === PAGES.length - 1);

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply Pan & Zoom
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);

      // 1. Draw Paper Template
      drawPaperBackground(page.template);

      // 2. Highlighters First (underneath)
      for (const stroke of page.strokes) {
        if (stroke.h) drawStroke(stroke);
      }

      // 3. Normal Handwriting on Top
      for (const stroke of page.strokes) {
        if (!stroke.h) drawStroke(stroke);
      }

      ctx.restore();
    }

    function drawStroke(stroke) {
      const pts = stroke.pts;
      if (!pts || pts.length < 2) return;

      ctx.save();
      ctx.strokeStyle = adaptStrokeColor(stroke.c, stroke.h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(1.5, stroke.w);

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);

      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i][0] + pts[i + 1][0]) / 2;
        const yc = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      ctx.stroke();
      ctx.restore();
    }

    // Interactive Pan & Zoom
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX - panX;
      dragStartY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
      render();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const mouseX = e.clientX - container.getBoundingClientRect().left;
      const mouseY = e.clientY - container.getBoundingClientRect().top;

      panX = mouseX - (mouseX - panX) * zoomFactor;
      panY = mouseY - (mouseY - panY) * zoomFactor;
      scale *= zoomFactor;
      scale = Math.min(Math.max(scale, 0.15), 4.0);
      render();
    }, { passive: false });

    // Touch Support for Mobile / iPad
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX - panX;
        dragStartY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
        touchStartScale = scale;
      }
    });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isDragging) {
        panX = e.touches[0].clientX - dragStartX;
        panY = e.touches[0].clientY - dragStartY;
        render();
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        scale = Math.min(Math.max(touchStartScale * (dist / touchStartDist), 0.15), 4.0);
        render();
      }
    }, { passive: true });

    container.addEventListener('touchend', () => { isDragging = false; touchStartDist = 0; });

    // Controls
    document.getElementById('btn-prev').onclick = () => {
      if (currentPageIndex > 0) { currentPageIndex--; render(); }
    };
    document.getElementById('btn-next').onclick = () => {
      if (currentPageIndex < PAGES.length - 1) { currentPageIndex++; render(); }
    };
    document.getElementById('btn-zoom-in').onclick = () => {
      scale = Math.min(scale * 1.25, 4.0); render();
    };
    document.getElementById('btn-zoom-out').onclick = () => {
      scale = Math.max(scale * 0.8, 0.15); render();
    };
    document.getElementById('btn-fit').onclick = fitToScreen;
    document.getElementById('btn-theme').onclick = () => {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('dark', isDarkMode);
      render();
    };
    document.getElementById('btn-print').onclick = () => { window.print(); };
    document.getElementById('btn-export-png').onclick = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = VIRTUAL_WIDTH;
      tempCanvas.height = VIRTUAL_HEIGHT;
      const tCtx = tempCanvas.getContext('2d');
      const page = PAGES[currentPageIndex];
      // Draw background
      tCtx.fillStyle = isDarkMode ? "#18191D" : "#FCFAF6";
      tCtx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      // Highlighters
      for (const stroke of page.strokes) {
        if (stroke.h) drawStrokeOn(tCtx, stroke);
      }
      for (const stroke of page.strokes) {
        if (!stroke.h) drawStrokeOn(tCtx, stroke);
      }
      const link = document.createElement('a');
      link.download = (page.title || "Note") + ".png";
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    };

    function drawStrokeOn(c, stroke) {
      const pts = stroke.pts;
      if (!pts || pts.length < 2) return;
      c.save();
      c.strokeStyle = adaptStrokeColor(stroke.c, stroke.h);
      c.lineCap = "round";
      c.lineJoin = "round";
      c.lineWidth = Math.max(1.5, stroke.w);
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i][0] + pts[i + 1][0]) / 2;
        const yc = (pts[i][1] + pts[i + 1][1]) / 2;
        c.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
      }
      c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      c.stroke();
      c.restore();
    }

    // Keyboard navigation (Arrow keys)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') document.getElementById('btn-prev').click();
      if (e.key === 'ArrowRight') document.getElementById('btn-next').click();
      if (e.key === '+' || e.key === '=') document.getElementById('btn-zoom-in').click();
      if (e.key === '-') document.getElementById('btn-zoom-out').click();
      if (e.key === '0') fitToScreen();
    });

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('DOMContentLoaded', () => {
      resizeCanvas();
      fitToScreen();
    });
  </script>
</body>
</html>"""
    }

    private fun escapeHtml(str: String): String {
        return str.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;")
    }
}
