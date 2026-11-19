/**
 * InkFlow Web — Luxury Vector Note Studio
 * Application controller, viewport clamping, continuous stream rendering, gestures, and print engine.
 */

// ----------------------------------------------------
// Global State & Geometry Constants
// ----------------------------------------------------
const BASE_PAGE_WIDTH = 1600;
const BASE_PAGE_HEIGHT = 2200;
const PAGE_STREAM_GAP = 90;
const OVERSCROLL_MARGIN = 80;

let currentLibrary = { folders: [], notebooks: [] };
let activeNotebookId = null;
let activePages = [];
let currentPageIndex = 0;
let isContinuousStream = true; // Default to Infinite Continuous Stream
let activePaperTemplate = "GRID";
let isDarkMode = true;

// Transform & Viewport State
let scale = 0.65;
let panX = 100;
let panY = 40;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let touchStartDist = 0;
let touchStartScale = 1.0;
let touchStartPanX = 0;
let touchStartPanY = 0;
let touchMidX = 0;
let touchMidY = 0;

// DOM Elements
const container = document.getElementById('viewport-container');
const canvas = document.getElementById('noteCanvas');
const ctx = canvas.getContext('2d');
const sidebar = document.getElementById('sidebar');
const treeContainer = document.getElementById('library-tree');
const dropzoneOverlay = document.getElementById('dropzone-overlay');
const floatingDock = document.getElementById('floating-dock');
const modeControl = document.getElementById('mode-control');

// ----------------------------------------------------
// Sample Note Generator (Instant Preview)
// ----------------------------------------------------
function loadSampleDsaNote() {
  const samplePages = [
    {
      id: "sample_page_1",
      notebookId: "sample_nb_tree",
      index: 0,
      title: "Tree Representations & DFS Traversals",
      template: "GRID",
      strokes: [
        { c: "#E5A93C", w: 4.5, h: false, pts: [[350, 200], [352, 201], [355, 203], [360, 206], [380, 218], [420, 222], [540, 222], [620, 220]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[380, 320], [382, 335], [385, 370], [390, 420], [392, 460]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[370, 330], [420, 330], [470, 330]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[375, 400], [430, 400]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[500, 350], [500, 460]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[500, 400], [530, 380], [560, 400], [560, 460]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[600, 400], [600, 460]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[600, 420], [630, 395], [660, 420], [660, 460]] },
        { c: "#E5A93C", w: 3.5, h: false, pts: [[800, 600], [700, 750], [650, 850]] },
        { c: "#E5A93C", w: 3.5, h: false, pts: [[800, 600], [900, 750], [950, 850]] },
        { c: "#F2F1ED", w: 2.8, h: false, pts: [[800, 560], [830, 570], [840, 600], [830, 630], [800, 640], [770, 630], [760, 600], [770, 570], [800, 560]] },
        { c: "#F2F1ED", w: 2.8, h: false, pts: [[650, 810], [680, 820], [690, 850], [680, 880], [650, 890], [620, 880], [610, 850], [620, 820], [650, 810]] },
        { c: "#F2F1ED", w: 2.8, h: false, pts: [[950, 810], [980, 820], [990, 850], [980, 880], [950, 890], [920, 880], [910, 850], [920, 820], [950, 810]] },
        { c: "rgba(229, 169, 60, 0.40)", w: 22.0, h: true, pts: [[340, 215], [640, 215]] },
        { c: "#F2F1ED", w: 2.6, h: false, pts: [[350, 1050], [350, 1400], [1250, 1400], [1250, 1050], [350, 1050]] }
      ]
    },
    {
      id: "sample_page_2",
      notebookId: "sample_nb_tree",
      index: 1,
      title: "Level Order & BFS Queue Walk",
      template: "GRID",
      strokes: [
        { c: "#E5A93C", w: 4.5, h: false, pts: [[350, 200], [450, 200], [700, 200]] },
        { c: "rgba(229, 169, 60, 0.40)", w: 22.0, h: true, pts: [[340, 205], [710, 205]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[350, 400], [1200, 400]] },
        { c: "#F2F1ED", w: 3.0, h: false, pts: [[350, 520], [1200, 520]] },
        { c: "#F2F1ED", w: 2.5, h: false, pts: [[500, 400], [500, 520]] },
        { c: "#F2F1ED", w: 2.5, h: false, pts: [[650, 400], [650, 520]] },
        { c: "#F2F1ED", w: 2.5, h: false, pts: [[800, 400], [800, 520]] },
        { c: "#F2F1ED", w: 2.5, h: false, pts: [[950, 400], [950, 520]] },
        { c: "#10B981", w: 3.2, h: false, pts: [[300, 460], [340, 460]] }
      ]
    }
  ];

  currentLibrary = {
    folders: [{ folderId: "f_dsa", name: "Data Structures & Algorithms" }],
    notebooks: [
      {
        notebookId: "sample_nb_tree",
        folderId: "f_dsa",
        title: "Tree Traversals & Algorithms",
        pages: ["sample_page_1", "sample_page_2"]
      }
    ]
  };

  saveToIndexedDB("cached_library", currentLibrary);
  saveToIndexedDB("cached_pages", samplePages);

  renderLibraryTree();
  selectNotebook("sample_nb_tree");
}

// ----------------------------------------------------
// Color & Coordinate Utilities
// ----------------------------------------------------
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const cleaned = hex.replace('#', '');
  if (cleaned.length === 8) { // ARGB
    const r = parseInt(cleaned.substring(2, 4), 16);
    const g = parseInt(cleaned.substring(4, 6), 16);
    const b = parseInt(cleaned.substring(6, 8), 16);
    return { r, g, b };
  } else if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function adaptColor(hex, isHighlighter, forceDarkMode = null) {
  const useDark = forceDarkMode !== null ? forceDarkMode : isDarkMode;
  if (!hex || hex === 'none') return useDark ? '#F2F1ED' : '#1C1D21';
  if (isHighlighter) return hex;

  const rgb = hexToRgb(hex);
  if (!rgb) return useDark ? '#F2F1ED' : '#1C1D21';

  const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  if (useDark && lum < 60) return '#F2F1ED';
  if (!useDark && lum > 195) return '#1C1D21';
  return hex;
}

function computePageLayout(page) {
  let minX = 0;
  let minY = 0;
  let maxX = BASE_PAGE_WIDTH;
  let maxY = BASE_PAGE_HEIGHT;

  if (page && page.strokes && page.strokes.length > 0) {
    let sMinX = Infinity, sMinY = Infinity, sMaxX = -Infinity, sMaxY = -Infinity;
    for (const stroke of page.strokes) {
      if (!stroke.pts) continue;
      for (const pt of stroke.pts) {
        if (pt[0] < sMinX) sMinX = pt[0];
        if (pt[0] > sMaxX) sMaxX = pt[0];
        if (pt[1] < sMinY) sMinY = pt[1];
        if (pt[1] > sMaxY) sMaxY = pt[1];
      }
    }
    if (sMinX !== Infinity) {
      minX = Math.min(0, sMinX - 100);
      minY = Math.min(0, sMinY - 100);
      maxX = Math.max(BASE_PAGE_WIDTH, sMaxX + 240);
      maxY = Math.max(BASE_PAGE_HEIGHT, sMaxY + 360);
    }
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function getStreamMetrics() {
  let currentOffsetY = 0;
  const pagesMetrics = [];

  for (let i = 0; i < activePages.length; i++) {
    const p = activePages[i];
    const layout = computePageLayout(p);
    pagesMetrics.push({
      pageIndex: i,
      offsetY: currentOffsetY,
      layout: layout
    });
    currentOffsetY += layout.height + PAGE_STREAM_GAP;
  }

  return {
    pagesMetrics,
    totalHeight: Math.max(currentOffsetY - PAGE_STREAM_GAP, BASE_PAGE_HEIGHT)
  };
}

// ----------------------------------------------------
// Strict Viewport Clamping (Prevents Lost in Void)
// ----------------------------------------------------
function clampPan() {
  if (activePages.length === 0) return;

  const containerW = container.clientWidth;
  const containerH = container.clientHeight;

  if (isContinuousStream) {
    const metrics = getStreamMetrics();
    let maxContentW = BASE_PAGE_WIDTH;
    let minContentX = 0;
    for (const m of metrics.pagesMetrics) {
      if (m.layout.width > maxContentW) maxContentW = m.layout.width;
      if (m.layout.minX < minContentX) minContentX = m.layout.minX;
    }

    const renderedW = maxContentW * scale;
    if (renderedW + OVERSCROLL_MARGIN * 2 <= containerW) {
      // Center horizontally when narrower than viewport
      panX = (containerW - renderedW) / 2 - minContentX * scale;
    } else {
      // Allow panning between left and right bounds with small margin
      const minPanX = containerW - (minContentX + maxContentW) * scale - OVERSCROLL_MARGIN;
      const maxPanX = OVERSCROLL_MARGIN - minContentX * scale;
      panX = Math.max(minPanX, Math.min(maxPanX, panX));
    }

    // Vertical Clamping
    const renderedH = metrics.totalHeight * scale;
    if (renderedH + OVERSCROLL_MARGIN * 2 <= containerH) {
      panY = Math.max(OVERSCROLL_MARGIN, (containerH - renderedH) / 2);
    } else {
      const minPanY = containerH - renderedH - OVERSCROLL_MARGIN;
      const maxPanY = OVERSCROLL_MARGIN;
      panY = Math.max(minPanY, Math.min(maxPanY, panY));
    }
  } else {
    // Single Page Mode
    const page = activePages[currentPageIndex] || activePages[0];
    const layout = computePageLayout(page);

    const renderedW = layout.width * scale;
    if (renderedW + OVERSCROLL_MARGIN * 2 <= containerW) {
      panX = (containerW - renderedW) / 2 - layout.minX * scale;
    } else {
      const minPanX = containerW - (layout.minX + layout.width) * scale - OVERSCROLL_MARGIN;
      const maxPanX = OVERSCROLL_MARGIN - layout.minX * scale;
      panX = Math.max(minPanX, Math.min(maxPanX, panX));
    }

    const renderedH = layout.height * scale;
    if (renderedH + OVERSCROLL_MARGIN * 2 <= containerH) {
      panY = Math.max(OVERSCROLL_MARGIN, (containerH - renderedH) / 2);
    } else {
      const minPanY = containerH - renderedH - OVERSCROLL_MARGIN;
      const maxPanY = OVERSCROLL_MARGIN;
      panY = Math.max(minPanY, Math.min(maxPanY, panY));
    }
  }
}

// ----------------------------------------------------
// Vector Canvas Rendering Engine
// ----------------------------------------------------
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = container.clientWidth * dpr;
  canvas.height = container.clientHeight * dpr;
  canvas.style.width = container.clientWidth + 'px';
  canvas.style.height = container.clientHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  clampPan();
  render();
}
window.addEventListener('resize', resizeCanvas);

function drawPaperSheet(x, y, w, h, templateName) {
  // Paper sheet drop shadow
  ctx.save();
  ctx.shadowColor = isDarkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(35, 25, 15, 0.12)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 16;

  // Paper Background
  ctx.fillStyle = isDarkMode ? "#12141A" : "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, 14) : ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.restore();

  // Paper Border
  ctx.save();
  ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.07)" : "rgba(44, 38, 30, 0.08)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, 14) : ctx.rect(x, y, w, h);
  ctx.stroke();
  ctx.restore();

  // Paper Grid / Ruled / Dot Pattern
  const effTemplate = activePaperTemplate || templateName || "GRID";

  if (effTemplate === "RULED") {
    const lineSpacing = 54;
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let py = y + 140; py < y + h - 40; py += lineSpacing) {
      ctx.moveTo(x + 50, py);
      ctx.lineTo(x + w - 50, py);
    }
    ctx.stroke();

    // Red left margin line
    ctx.strokeStyle = isDarkMode ? "rgba(248, 113, 113, 0.22)" : "rgba(220, 38, 38, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 180, y);
    ctx.lineTo(x + 180, y + h);
    ctx.stroke();

  } else if (effTemplate === "GRID") {
    const gridSpacing = 50;
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(40, 30, 20, 0.045)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let px = x + 60; px < x + w; px += gridSpacing) {
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + h);
    }
    for (let py = y + 60; py < y + h; py += gridSpacing) {
      ctx.moveTo(x, py);
      ctx.lineTo(x + w, py);
    }
    ctx.stroke();

  } else if (effTemplate === "DOT") {
    const dotSpacing = 60;
    ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(40, 30, 20, 0.12)";
    for (let px = x + 80; px < x + w - 60; px += dotSpacing) {
      for (let py = y + 80; py < y + h - 60; py += dotSpacing) {
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function renderStroke(stroke, offsetY = 0) {
  const pts = stroke.pts;
  if (!pts || pts.length === 0) return;

  if (pts.length === 1) {
    ctx.save();
    ctx.fillStyle = adaptColor(stroke.c, stroke.h);
    ctx.beginPath();
    ctx.arc(pts[0][0], pts[0][1] + offsetY, Math.max(1.2, (stroke.w || 3.0) / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.strokeStyle = adaptColor(stroke.c, stroke.h);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.8, stroke.w || 3.0);

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1] + offsetY);

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];

    // Safeguard against stray teleportation jumps
    const stepDist = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    if (stepDist > 280) {
      ctx.moveTo(cur[0], cur[1] + offsetY);
      continue;
    }

    if (i < pts.length - 1) {
      const next = pts[i + 1];
      const xc = (cur[0] + next[0]) / 2;
      const yc = (cur[1] + next[1]) / 2 + offsetY;
      ctx.quadraticCurveTo(cur[0], cur[1] + offsetY, xc, yc);
    } else {
      ctx.lineTo(cur[0], cur[1] + offsetY);
    }
  }

  ctx.stroke();
  ctx.restore();
}

function render() {
  if (activePages.length === 0) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(panX, panY);
  ctx.scale(scale, scale);

  if (isContinuousStream) {
    // --- INFINITE CONTINUOUS STREAM RENDERING ---
    const metrics = getStreamMetrics();
    const viewportTop = -panY / scale;
    const viewportBottom = (-panY + container.clientHeight) / scale;

    for (const item of metrics.pagesMetrics) {
      const page = activePages[item.pageIndex];
      const pageTop = item.offsetY;
      const pageBottom = pageTop + item.layout.height;

      // Viewport Culling for 144Hz performance
      if (pageBottom < viewportTop - 200 || pageTop > viewportBottom + 200) {
        continue;
      }

      // Draw Paper Sheet
      drawPaperSheet(item.layout.minX, pageTop, item.layout.width, item.layout.height, page.template);

      // Page Divider Badge Header
      ctx.save();
      ctx.fillStyle = isDarkMode ? "rgba(229, 169, 60, 0.40)" : "rgba(199, 139, 42, 0.50)";
      ctx.font = "700 22px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
      ctx.fillText(`PAGE ${item.pageIndex + 1} OF ${activePages.length}  •  ${(page.title || "Note").toUpperCase()}`, item.layout.minX + 80, pageTop + 54);
      ctx.restore();

      // Render Highlighters first
      if (page.strokes) {
        for (const s of page.strokes) {
          if (s.h) renderStroke(s, pageTop);
        }
        // Render Inks second
        for (const s of page.strokes) {
          if (!s.h) renderStroke(s, pageTop);
        }
      }
    }
  } else {
    // --- SINGLE PAGE PAGER RENDERING ---
    const page = activePages[currentPageIndex];
    if (page) {
      const layout = computePageLayout(page);
      drawPaperSheet(layout.minX, 0, layout.width, layout.height, page.template);

      if (page.strokes) {
        for (const s of page.strokes) {
          if (s.h) renderStroke(s, 0);
        }
        for (const s of page.strokes) {
          if (!s.h) renderStroke(s, 0);
        }
      }
    }
  }

  ctx.restore();
  updateHeaderAndDock();
}

function updateHeaderAndDock() {
  const nb = currentLibrary.notebooks.find(n => n.notebookId === activeNotebookId);
  const titleEl = document.getElementById('hdr-active-title');
  if (activePages.length === 0) {
    if (titleEl) {
      titleEl.textContent = nb ? `${nb.title} • 0 pages` : "No Note Loaded";
    }
    return;
  }
  const page = activePages[currentPageIndex] || activePages[0];

  if (isContinuousStream) {
    titleEl.textContent = `${nb ? nb.title : "Notebook"} • ${activePages.length} pages continuous`;
  } else {
    titleEl.textContent = `${page.title || "Note Page"} • Page ${currentPageIndex + 1} of ${activePages.length}`;
  }

  document.getElementById('dock-page-label').textContent = `${currentPageIndex + 1} / ${activePages.length}`;
  document.getElementById('btn-prev-page').disabled = (currentPageIndex === 0);
  document.getElementById('btn-next-page').disabled = (currentPageIndex === activePages.length - 1);
}

function updateZoomHud() {
  document.getElementById('dock-zoom-label').textContent = Math.round(scale * 100) + '%';
}

// ----------------------------------------------------
// Wheel & Trackpad Gesture Controls
// ----------------------------------------------------
container.addEventListener('wheel', (e) => {
  e.preventDefault();

  if (e.ctrlKey || e.metaKey) {
    // === PINCH TO ZOOM (Trackpad pinch or Ctrl + Wheel) ===
    const zoomFactor = Math.exp(-e.deltaY * 0.008);
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = Math.min(Math.max(scale * zoomFactor, 0.08), 4.5);
    panX = mouseX - (mouseX - panX) * (newScale / scale);
    panY = mouseY - (mouseY - panY) * (newScale / scale);
    scale = newScale;
    clampPan();
    render();
    updateZoomHud();
  } else {
    // === TWO-FINGER SCROLL / PAN (Natural laptop scroll) ===
    panX -= e.deltaX;
    panY -= e.deltaY;
    clampPan();

    // In continuous stream, update active page indicator as user scrolls
    if (isContinuousStream && activePages.length > 0) {
      const metrics = getStreamMetrics();
      const currentViewY = -panY / scale + 200;
      for (let i = metrics.pagesMetrics.length - 1; i >= 0; i--) {
        if (currentViewY >= metrics.pagesMetrics[i].offsetY) {
          if (currentPageIndex !== i) {
            currentPageIndex = i;
            updateActivePageHighlight();
          }
          break;
        }
      }
    }
    render();
  }
}, { passive: false });

// ----------------------------------------------------
// Mouse Drag Panning
// ----------------------------------------------------
container.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX - panX;
  dragStartY = e.clientY - panY;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  panX = e.clientX - dragStartX;
  panY = e.clientY - dragStartY;
  clampPan();
  render();
});

window.addEventListener('mouseup', () => { isDragging = false; });

// ----------------------------------------------------
// Touchscreen Multi-Touch Pinch & Pan
// ----------------------------------------------------
container.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    dragStartX = e.touches[0].clientX - panX;
    dragStartY = e.touches[0].clientY - panY;
  } else if (e.touches.length === 2) {
    isDragging = false;
    const t1 = e.touches[0], t2 = e.touches[1];
    touchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    touchStartScale = scale;
    touchStartPanX = panX;
    touchStartPanY = panY;
    const rect = container.getBoundingClientRect();
    touchMidX = (t1.clientX + t2.clientX) / 2 - rect.left;
    touchMidY = (t1.clientY + t2.clientY) / 2 - rect.top;
  }
}, { passive: true });

container.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && isDragging) {
    panX = e.touches[0].clientX - dragStartX;
    panY = e.touches[0].clientY - dragStartY;
    clampPan();
    render();
  } else if (e.touches.length === 2 && touchStartDist > 0) {
    const t1 = e.touches[0], t2 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const factor = dist / touchStartDist;
    const newScale = Math.min(Math.max(touchStartScale * factor, 0.08), 4.5);

    panX = touchMidX - (touchMidX - touchStartPanX) * (newScale / touchStartScale);
    panY = touchMidY - (touchMidY - touchStartPanY) * (newScale / touchStartScale);
    scale = newScale;
    clampPan();
    render();
    updateZoomHud();
  }
}, { passive: true });

container.addEventListener('touchend', () => {
  isDragging = false;
  touchStartDist = 0;
});

// ----------------------------------------------------
// Viewport Navigation Helpers
// ----------------------------------------------------
function fitToWidth() {
  if (activePages.length === 0) return;
  const layout = computePageLayout(activePages[currentPageIndex] || activePages[0]);
  const containerW = container.clientWidth - 80;
  scale = Math.min(Math.max(containerW / layout.width, 0.1), 2.5);
  clampPan();
  render();
  updateZoomHud();
}

function fitToPage() {
  if (activePages.length === 0) return;
  const layout = computePageLayout(activePages[currentPageIndex] || activePages[0]);
  const containerW = container.clientWidth - 80;
  const containerH = container.clientHeight - 80;
  const scaleW = containerW / layout.width;
  const scaleH = containerH / layout.height;
  scale = Math.min(Math.max(Math.min(scaleW, scaleH), 0.1), 2.5);
  clampPan();
  render();
  updateZoomHud();
}

function zoomBy(factor) {
  const newScale = Math.min(Math.max(scale * factor, 0.08), 4.5);
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;
  const midX = containerW / 2;
  const midY = containerH / 2;
  panX = midX - (midX - panX) * (newScale / scale);
  panY = midY - (midY - panY) * (newScale / scale);
  scale = newScale;
  clampPan();
  render();
  updateZoomHud();
}

function prevPage() {
  if (currentPageIndex > 0) {
    selectPage(currentPageIndex - 1);
  }
}

function nextPage() {
  if (currentPageIndex < activePages.length - 1) {
    selectPage(currentPageIndex + 1);
  }
}

function selectPage(index) {
  if (index < 0 || index >= activePages.length) return;
  currentPageIndex = index;

  if (isContinuousStream) {
    const metrics = getStreamMetrics();
    const targetY = metrics.pagesMetrics[index].offsetY;
    panY = -targetY * scale + 60;
  } else {
    panY = 40;
  }
  clampPan();
  render();
  updateActivePageHighlight();
}

function updateActivePageHighlight() {
  document.querySelectorAll('.tree-page-item').forEach(el => {
    const pIdx = parseInt(el.getAttribute('data-page-index'), 10);
    if (pIdx === currentPageIndex) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  updateHeaderAndDock();
}

// ----------------------------------------------------
// Sidebar Tree Renderer
// ----------------------------------------------------
function renderLibraryTree(filterQuery = "") {
  treeContainer.innerHTML = '';
  const query = (filterQuery || "").toLowerCase().trim();

  const foldersMap = {};
  for (const f of currentLibrary.folders || []) {
    foldersMap[f.folderId] = { ...f, notebooks: [] };
  }
  const rootNotebooks = [];

  for (const nb of currentLibrary.notebooks || []) {
    if (nb.folderId && foldersMap[nb.folderId]) {
      foldersMap[nb.folderId].notebooks.push(nb);
    } else {
      rootNotebooks.push(nb);
    }
  }

  for (const folder of Object.values(foldersMap)) {
    const fNode = createTreeFolder(folder, query);
    if (fNode) treeContainer.appendChild(fNode);
  }

  for (const nb of rootNotebooks) {
    const nbNode = createTreeNotebook(nb, query);
    if (nbNode) treeContainer.appendChild(nbNode);
  }
}

function createTreeFolder(folder, query) {
  const matchingNbs = folder.notebooks.filter(nb => {
    if (!query) return true;
    return nb.title.toLowerCase().includes(query);
  });

  if (query && matchingNbs.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'tree-folder-group';

  const header = document.createElement('div');
  header.className = 'tree-folder-header';
  header.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
    <span>${escapeHtml(folder.name)} (${matchingNbs.length})</span>
  `;

  const nbList = document.createElement('div');
  nbList.style.paddingLeft = "8px";

  for (const nb of matchingNbs) {
    const nbEl = createTreeNotebook(nb, query);
    if (nbEl) nbList.appendChild(nbEl);
  }

  header.onclick = () => {
    nbList.style.display = nbList.style.display === "none" ? "block" : "none";
  };

  container.appendChild(header);
  container.appendChild(nbList);
  return container;
}

function createTreeNotebook(nb, query) {
  const container = document.createElement('div');

  const item = document.createElement('div');
  item.className = 'tree-notebook-item' + (nb.notebookId === activeNotebookId ? ' active' : '');
  item.setAttribute('data-notebook-id', nb.notebookId);

  const pageCount = (nb.pages || []).length;
  item.innerHTML = `
    <div class="tree-notebook-title">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
      <span>${escapeHtml(nb.title)}</span>
    </div>
    <span class="notebook-count-pill">${pageCount}p</span>
  `;

  const pagesList = document.createElement('div');
  pagesList.className = 'tree-page-list';
  pagesList.style.display = (nb.notebookId === activeNotebookId) ? 'block' : 'none';

  if (nb.notebookId === activeNotebookId && activePages.length > 0) {
    for (let i = 0; i < activePages.length; i++) {
      const p = activePages[i];
      const pItem = document.createElement('div');
      pItem.className = 'tree-page-item' + (i === currentPageIndex ? ' active' : '');
      pItem.setAttribute('data-page-index', i);

      const strokeCount = p.strokes ? p.strokes.length : 0;
      pItem.innerHTML = `
        <div class="tree-page-title">
          <span>${escapeHtml(p.title || `Page ${i + 1}`)}</span>
        </div>
        <span class="tree-page-strokes">${strokeCount}s</span>
      `;

      pItem.onclick = (e) => {
        e.stopPropagation();
        selectPage(i);
      };
      pagesList.appendChild(pItem);
    }
  }

  item.onclick = () => {
    selectNotebook(nb.notebookId);
  };

  container.appendChild(item);
  container.appendChild(pagesList);
  return container;
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

async function selectNotebook(notebookId) {
  activeNotebookId = notebookId;
  const nb = currentLibrary.notebooks.find(n => n.notebookId === notebookId);
  if (!nb) return;

  const cachedPages = await loadFromIndexedDB("cached_pages") || [];
  activePages = cachedPages.filter(p => p.notebookId === notebookId);
  activePages.sort((a, b) => a.index - b.index);

  currentPageIndex = 0;

  if (activePages.length === 0) {
    dropzoneOverlay.style.display = 'flex';
    floatingDock.style.display = 'none';
    modeControl.style.display = 'none';
  } else {
    dropzoneOverlay.style.display = 'none';
    floatingDock.style.display = 'flex';
    modeControl.style.display = 'flex';
  }

  renderLibraryTree(document.getElementById('search-input').value);

  if (activePages.length > 0) {
    fitToWidth();
    panY = 40;
    clampPan();
  }
  render();
}

// ----------------------------------------------------
// Multi-Page Print & PDF Engine (Supports Dark & Light)
// ----------------------------------------------------
function executePrint() {
  if (activePages.length === 0) return;

  const isDark = document.body.classList.contains('dark');
  if (isDark) {
    document.body.classList.add('dark-mode-print');
  } else {
    document.body.classList.remove('dark-mode-print');
  }

  const printStage = document.getElementById('print-stage');
  printStage.innerHTML = '';

  const pagesToPrint = isContinuousStream ? activePages : [activePages[currentPageIndex]];

  for (let pIdx = 0; pIdx < pagesToPrint.length; pIdx++) {
    const page = pagesToPrint[pIdx];
    const layout = computePageLayout(page);

    const sliceWidth = layout.width;
    const standardSliceHeight = Math.round(sliceWidth * 1.414);
    const totalHeight = layout.height;
    const sliceCount = Math.max(1, Math.ceil(totalHeight / standardSliceHeight));

    for (let s = 0; s < sliceCount; s++) {
      const sliceStartY = layout.minY + s * standardSliceHeight;
      const sliceHeight = Math.min(standardSliceHeight, layout.maxY - sliceStartY);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1800; // Crisp high-DPI print resolution
      tempCanvas.height = Math.round(1800 * (sliceHeight / sliceWidth));
      const tCtx = tempCanvas.getContext('2d');

      // Paper Background (Matches current mode: Dark Obsidian or Light Ivory)
      tCtx.fillStyle = isDark ? "#12141A" : "#FFFFFF";
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Print grid
      tCtx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(40, 30, 20, 0.05)";
      tCtx.lineWidth = 1;
      const gridStep = Math.round(60 * (tempCanvas.width / sliceWidth));
      for (let gx = 0; gx < tempCanvas.width; gx += gridStep) {
        tCtx.beginPath(); tCtx.moveTo(gx, 0); tCtx.lineTo(gx, tempCanvas.height); tCtx.stroke();
      }
      for (let gy = 0; gy < tempCanvas.height; gy += gridStep) {
        tCtx.beginPath(); tCtx.moveTo(0, gy); tCtx.lineTo(tempCanvas.width, gy); tCtx.stroke();
      }

      tCtx.save();
      const pScale = tempCanvas.width / sliceWidth;
      tCtx.scale(pScale, pScale);
      tCtx.translate(-layout.minX, -sliceStartY);

      if (page.strokes) {
        for (const stroke of page.strokes) {
          const pts = stroke.pts;
          if (!pts || pts.length === 0) continue;

          tCtx.save();
          if (stroke.h) {
            tCtx.strokeStyle = stroke.c || "rgba(229, 169, 60, 0.40)";
          } else {
            tCtx.strokeStyle = adaptColor(stroke.c, false, isDark);
          }
          tCtx.lineCap = "round";
          tCtx.lineJoin = "round";
          tCtx.lineWidth = Math.max(2.0, stroke.w || 3.0);

          tCtx.beginPath();
          tCtx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const cur = pts[i];
            if (Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) > 280) {
              tCtx.moveTo(cur[0], cur[1]);
              continue;
            }
            if (i < pts.length - 1) {
              const next = pts[i + 1];
              const xc = (cur[0] + next[0]) / 2;
              const yc = (cur[1] + next[1]) / 2;
              tCtx.quadraticCurveTo(cur[0], cur[1], xc, yc);
            } else {
              tCtx.lineTo(cur[0], cur[1]);
            }
          }
          tCtx.stroke();
          tCtx.restore();
        }
      }
      tCtx.restore();

      const sliceDiv = document.createElement('div');
      sliceDiv.className = isDark ? 'print-page-slice dark-mode-slice' : 'print-page-slice';
      sliceDiv.style.background = isDark ? '#12141A' : '#FFFFFF';
      const img = document.createElement('img');
      img.src = tempCanvas.toDataURL('image/png');
      sliceDiv.appendChild(img);
      printStage.appendChild(sliceDiv);
    }
  }

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      printStage.innerHTML = '';
      document.body.classList.remove('dark-mode-print');
    }, 2000);
  }, 150);
}

// ----------------------------------------------------
// Google Drive Cloud Sync Engine
// ----------------------------------------------------
const modalGdrive = document.getElementById('modal-gdrive');
const tokenInput = document.getElementById('gdrive-token-input');
let latestFoundDriveFile = null;

function openGoogleDriveModal() {
  modalGdrive.classList.add('open');
  const savedToken = localStorage.getItem('inkflow_gdrive_token');
  if (savedToken) {
    tokenInput.value = savedToken;
    searchGoogleDriveForNotes();
  }
}

function closeGoogleDriveModal() {
  modalGdrive.classList.remove('open');
}

async function searchGoogleDriveForNotes() {
  const token = tokenInput.value.trim();
  if (!token) {
    alert("Please enter a valid Google OAuth access token.");
    return;
  }
  localStorage.setItem('inkflow_gdrive_token', token);

  const statusTitle = document.getElementById('gdrive-status-title');
  const statusSub = document.getElementById('gdrive-status-sub');
  const downloadBtn = document.getElementById('btn-download-drive');

  statusTitle.textContent = "Searching Google Drive...";
  statusSub.textContent = "Querying for inkflow_vault_backup.zip or notes packages...";
  downloadBtn.style.display = "none";

  try {
    const query = encodeURIComponent("name contains 'inkflow' or name contains 'backup' and trashed = false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,modifiedTime)&pageSize=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Google API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const match = data.files.find(f => f.name.includes("inkflow_vault_backup.zip")) || data.files[0];
      latestFoundDriveFile = match;

      statusTitle.textContent = `Found: ${match.name}`;
      statusSub.textContent = `Size: ${(match.size / 1024 / 1024).toFixed(2)} MB • Modified: ${new Date(match.modifiedTime).toLocaleString()}`;
      downloadBtn.style.display = "inline-flex";

      document.getElementById('drive-status-dot').classList.add('connected');
      document.getElementById('drive-status-label').textContent = "Drive: Connected";
    } else {
      statusTitle.textContent = "No Backup Files Found";
      statusSub.textContent = "Could not locate inkflow_vault_backup.zip in your Google Drive root or folders.";
    }
  } catch (err) {
    statusTitle.textContent = "Connection Error";
    statusSub.textContent = err.message;
  }
}

async function fetchNoteFromDrive() {
  if (!latestFoundDriveFile) return;
  const token = localStorage.getItem('inkflow_gdrive_token');
  const downloadBtn = document.getElementById('btn-download-drive');
  downloadBtn.textContent = "Fetching 21 MB Archive...";
  downloadBtn.disabled = true;

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${latestFoundDriveFile.id}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to download file from Google Drive");

    const arrayBuffer = await res.arrayBuffer();
    closeGoogleDriveModal();
    const result = await loadArchiveFile(arrayBuffer, latestFoundDriveFile.name);
    onArchiveLoaded(result);
  } catch (err) {
    alert("Error fetching note: " + err.message);
  } finally {
    downloadBtn.textContent = "📥 Fetch & Open Notes";
    downloadBtn.disabled = false;
  }
}

function onArchiveLoaded(result) {
  currentLibrary = result.library;
  renderLibraryTree();

  if (currentLibrary.notebooks && currentLibrary.notebooks.length > 0) {
    selectNotebook(currentLibrary.notebooks[0].notebookId);
  }
}

// ----------------------------------------------------
// Drag & Drop Import Handler
// ----------------------------------------------------
const dropTarget = document.getElementById('drop-target');

window.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropTarget.classList.add('dragover');
});

window.addEventListener('dragleave', (e) => {
  if (e.relatedTarget === null) {
    dropTarget.classList.remove('dragover');
  }
});

window.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropTarget.classList.remove('dragover');

  if (e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    try {
      const result = await loadArchiveFile(file, file.name);
      onArchiveLoaded(result);
    } catch (err) {
      alert("Could not load archive. Ensure it is a valid inkflow_vault_backup.zip or .inkflow package.");
    }
  }
});

// ----------------------------------------------------
// UI Event Bindings
// ----------------------------------------------------
document.getElementById('btn-toggle-sidebar').onclick = () => {
  sidebar.classList.toggle('collapsed');
  setTimeout(resizeCanvas, 240);
};

// Continuous vs Pager Mode Switcher
const btnContinuous = document.getElementById('btn-mode-continuous');
const btnPager = document.getElementById('btn-mode-pager');
const dockPagerGroup = document.getElementById('dock-pager-group');

btnContinuous.onclick = () => {
  isContinuousStream = true;
  btnContinuous.classList.add('active');
  btnPager.classList.remove('active');
  dockPagerGroup.style.display = 'none';
  clampPan();
  render();
};

btnPager.onclick = () => {
  isContinuousStream = false;
  btnPager.classList.add('active');
  btnContinuous.classList.remove('active');
  dockPagerGroup.style.display = 'flex';
  clampPan();
  render();
};

// Dock Navigation
document.getElementById('btn-prev-page').onclick = prevPage;
document.getElementById('btn-next-page').onclick = nextPage;
document.getElementById('btn-fit-width').onclick = fitToWidth;
document.getElementById('btn-fit-page').onclick = fitToPage;
document.getElementById('btn-zoom-in').onclick = () => zoomBy(1.25);
document.getElementById('btn-zoom-out').onclick = () => zoomBy(0.80);

// Paper Style Switcher
const styles = ["GRID", "RULED", "DOT", "BLANK"];
document.getElementById('btn-paper-style').onclick = () => {
  const nextIdx = (styles.indexOf(activePaperTemplate) + 1) % styles.length;
  activePaperTemplate = styles[nextIdx];
  document.getElementById('label-paper-style').textContent = activePaperTemplate.charAt(0) + activePaperTemplate.slice(1).toLowerCase();
  render();
};

// Fullscreen Focus
document.getElementById('btn-fullscreen').onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
};

// Printing
document.getElementById('btn-print').onclick = executePrint;

// File Selector & Import
const fileSelector = document.getElementById('file-selector');
document.getElementById('btn-open-import').onclick = () => fileSelector.click();
document.getElementById('btn-splash-open').onclick = () => fileSelector.click();
fileSelector.onchange = async (e) => {
  if (e.target.files.length > 0) {
    try {
      const file = e.target.files[0];
      const result = await loadArchiveFile(file, file.name);
      onArchiveLoaded(result);
    } catch (err) {
      alert("Could not load archive. Ensure it is a valid inkflow_vault_backup.zip or .inkflow package.");
    }
  }
};

// Sample notes
document.getElementById('btn-sample-notes').onclick = loadSampleDsaNote;
document.getElementById('btn-splash-sample').onclick = loadSampleDsaNote;

// Reset Cache
document.getElementById('btn-clear-cache').onclick = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction("vault", "readwrite");
    tx.objectStore("vault").clear();
    location.reload();
  } catch (e) {
    location.reload();
  }
};

// Theme Toggle
const themeBtn = document.getElementById('btn-toggle-theme');
const iconMoon = document.getElementById('icon-theme-moon');
const iconSun = document.getElementById('icon-theme-sun');

function toggleTheme() {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.body.classList.add('dark');
    iconMoon.style.display = 'block';
    iconSun.style.display = 'none';
  } else {
    document.body.classList.remove('dark');
    iconMoon.style.display = 'none';
    iconSun.style.display = 'block';
  }
  localStorage.setItem('inkflow_theme', isDarkMode ? 'dark' : 'light');
  render();
}
themeBtn.onclick = toggleTheme;

// Google Drive Modals
document.getElementById('btn-open-gdrive').onclick = openGoogleDriveModal;
document.getElementById('btn-splash-gdrive').onclick = openGoogleDriveModal;
document.getElementById('btn-sidebar-sync').onclick = openGoogleDriveModal;
document.getElementById('btn-close-gdrive').onclick = closeGoogleDriveModal;
document.getElementById('btn-search-drive').onclick = searchGoogleDriveForNotes;
document.getElementById('btn-download-drive').onclick = fetchNoteFromDrive;

// Shortcuts Modal
const modalShortcuts = document.getElementById('modal-shortcuts');
document.getElementById('btn-shortcuts').onclick = () => modalShortcuts.classList.add('open');
document.getElementById('btn-close-shortcuts').onclick = () => modalShortcuts.classList.remove('open');

// Search Box
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('btn-clear-search');
searchInput.oninput = (e) => {
  const q = e.target.value;
  clearSearchBtn.style.display = q ? 'block' : 'none';
  renderLibraryTree(q);
};
clearSearchBtn.onclick = () => {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  renderLibraryTree('');
};

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === '[' || e.key === ']') {
    sidebar.classList.toggle('collapsed');
    setTimeout(resizeCanvas, 240);
  } else if (e.key === 't' || e.key === 'T') {
    toggleTheme();
  } else if (e.key === 'w' || e.key === 'W') {
    fitToWidth();
  } else if (e.key === '0') {
    fitToPage();
  } else if (e.key === '+' || e.key === '=') {
    zoomBy(1.25);
  } else if (e.key === '-' || e.key === '_') {
    zoomBy(0.80);
  } else if (e.key === 'ArrowLeft') {
    prevPage();
  } else if (e.key === 'ArrowRight') {
    nextPage();
  } else if (e.key === 'i' || e.key === 'I') {
    if (isContinuousStream) btnPager.click(); else btnContinuous.click();
  } else if (e.key === 'f' || e.key === 'F') {
    document.getElementById('btn-fullscreen').click();
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
    e.preventDefault();
    executePrint();
  } else if (e.key === '?') {
    modalShortcuts.classList.toggle('open');
  } else if (e.key === 'Escape') {
    modalGdrive.classList.remove('open');
    modalShortcuts.classList.remove('open');
  }
});

// ----------------------------------------------------
// Initial Boot Sequence (IndexedDB Restoration)
// ----------------------------------------------------
async function boot() {
  const savedTheme = localStorage.getItem('inkflow_theme');
  if (savedTheme === 'light') {
    toggleTheme();
  }

  resizeCanvas();

  try {
    const cachedLib = await loadFromIndexedDB("cached_library");
    const cachedPages = await loadFromIndexedDB("cached_pages");

    if (cachedLib && cachedPages && cachedPages.length > 0 && cachedLib.notebooks && cachedLib.notebooks.length > 0) {
      currentLibrary = cachedLib;
      renderLibraryTree();
      selectNotebook(cachedLib.notebooks[0].notebookId);
      return;
    }
  } catch (err) {
    console.warn("Cached notes restore failed:", err);
  }

  // If no saved notes or empty pages cache, show welcome overlay
  dropzoneOverlay.style.display = 'flex';
}

boot();
