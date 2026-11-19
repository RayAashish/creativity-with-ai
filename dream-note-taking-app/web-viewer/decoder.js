/**
 * InkFlow Web — Lossless Vector Decoder & IndexedDB Storage
 * Binary .inkpage unpacker, protobuf decompressor, and archive loader.
 */

// ----------------------------------------------------
// Native IndexedDB Cache Engine
// ----------------------------------------------------
const DB_NAME = "InkFlowVaultDB";
const DB_VERSION = 1;
const STORE_NAME = "vault";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIndexedDB(key, data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB save error:", err);
  }
}

async function loadFromIndexedDB(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB load error:", err);
    return null;
  }
}

// ----------------------------------------------------
// Protobuf & Vector Stroke Decoder
// ----------------------------------------------------
async function decompressGzip(bytes) {
  if (typeof DecompressionStream !== "undefined") {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const response = await new Response(stream);
    return new Uint8Array(await response.arrayBuffer());
  }
  throw new Error("DecompressionStream unsupported in this environment");
}

function parseAxis(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let i = 0, raw = null, scale = 1.0, start = 0.0;
  while (i < bytes.length) {
    let key = 0, shift = 0;
    while (i < bytes.length) {
      const b = bytes[i++];
      key |= (b & 0x7F) << shift;
      if (!(b & 0x80)) break;
      shift += 7;
    }
    const fn = key >> 3, wt = key & 7;
    if (wt === 2) {
      let len = 0, s = 0;
      while (i < bytes.length) {
        const b = bytes[i++];
        len |= (b & 0x7F) << s;
        if (!(b & 0x80)) break;
        s += 7;
      }
      const sub = bytes.subarray(i, i + len); i += len;
      if (fn === 1) raw = sub;
    } else if (wt === 5) {
      const f = view.getFloat32(i, true); i += 4;
      if (fn === 2) scale = f;
      else if (fn === 3) start = f;
    } else if (wt === 0) {
      while (i < bytes.length && (bytes[i++] & 0x80)) {}
    } else if (wt === 1) {
      i += 8;
    } else {
      break; // Safe exit on unknown wire type to prevent hang
    }
  }
  return { start, scale, raw };
}

function decodeZigZag(bytes) {
  if (!bytes) return [];
  const deltas = [];
  let i = 0;
  while (i < bytes.length) {
    let val = 0, shift = 0;
    while (i < bytes.length) {
      const b = bytes[i++];
      val |= (b & 0x7F) << shift;
      if (!(b & 0x80)) break;
      shift += 7;
    }
    deltas.push((val >>> 1) ^ (-(val & 1)));
  }
  return deltas;
}

function decodeProtoStrokes(buf) {
  let i = 0, xInfo = null, yInfo = null;
  while (i < buf.length) {
    let key = 0, shift = 0;
    while (i < buf.length) {
      const b = buf[i++];
      key |= (b & 0x7F) << shift;
      if (!(b & 0x80)) break;
      shift += 7;
    }
    const fn = key >> 3, wt = key & 7;
    if (wt === 2) {
      let len = 0, s = 0;
      while (i < buf.length) {
        const b = buf[i++];
        len |= (b & 0x7F) << s;
        if (!(b & 0x80)) break;
        s += 7;
      }
      const sub = buf.subarray(i, i + len); i += len;
      if (fn === 1) xInfo = parseAxis(sub);
      else if (fn === 2) yInfo = parseAxis(sub);
    } else if (wt === 0) {
      while (i < buf.length && (buf[i++] & 0x80)) {}
    } else if (wt === 5) {
      i += 4;
    } else if (wt === 1) {
      i += 8;
    } else {
      break;
    }
  }

  if (!xInfo || !yInfo) return [];
  const xDeltas = decodeZigZag(xInfo.raw);
  const yDeltas = decodeZigZag(yInfo.raw);

  // CRITICAL FIX FOR STRAY "\" ARTIFACT:
  // In AndroidX Ink wire format, xInfo.start and yInfo.start are baseline coordinates (origin).
  // xDeltas[0] and yDeltas[0] contain the initial point offset from this origin.
  // We do NOT add a fake point at (xInfo.start, yInfo.start); the stroke begins at
  // (xInfo.start + xDeltas[0] * scale). Adding a point at (start) created a stray diagonal slash
  // to the first point across 10% of strokes.
  let curX = xInfo.start;
  let curY = yInfo.start;
  const pts = [];
  const count = Math.min(xDeltas.length, yDeltas.length);
  for (let p = 0; p < count; p++) {
    curX += xDeltas[p] * xInfo.scale;
    curY += yDeltas[p] * yInfo.scale;
    pts.push([curX, curY, 0.8]);
  }
  return pts;
}

// ----------------------------------------------------
// Binary .inkpage Parser
// ----------------------------------------------------
async function parseInkPage(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  let offset = 0;

  const magic = view.getUint32(offset, false); offset += 4;
  const version = view.getUint32(offset, false); offset += 4;

  if (magic !== 0x494E4B31) {
    throw new Error("Invalid .inkpage magic header (expected INK1)");
  }

  function readUTF() {
    const len = view.getUint16(offset, false); offset += 2;
    const bytes = new Uint8Array(arrayBuffer, offset, len);
    offset += len;
    return new TextDecoder('utf-8').decode(bytes);
  }

  const pageId = readUTF();
  const notebookId = readUTF();
  const pageIndex = view.getInt32(offset, false); offset += 4;
  const title = readUTF();
  const templateOrdinal = view.getInt32(offset, false); offset += 4;
  offset += 16; // skip createdAt and modifiedAt

  const strokeCount = view.getInt32(offset, false); offset += 4;
  const strokes = [];

  for (let s = 0; s < strokeCount; s++) {
    let familyId = 0;
    let colorArgb = 0;
    let size = 3.0;

    if (version >= 3) {
      readUTF(); // strokeId
      familyId = view.getUint8(offset); offset += 1;
      colorArgb = view.getInt32(offset, false); offset += 4;
      size = view.getFloat32(offset, false); offset += 4;
      offset += 4; // skip eps
    } else if (version === 2) {
      familyId = view.getUint8(offset); offset += 1;
      colorArgb = view.getInt32(offset, false); offset += 4;
      size = view.getFloat32(offset, false); offset += 4;
      offset += 4;
    } else {
      colorArgb = view.getInt32(offset, false); offset += 4;
      size = view.getFloat32(offset, false); offset += 4;
      offset += 4;
    }

    const encodingType = view.getUint8(offset); offset += 1;
    const payloadLength = view.getInt32(offset, false); offset += 4;
    const payloadBytes = new Uint8Array(arrayBuffer, offset, payloadLength); offset += payloadLength;

    let pts = [];
    if (encodingType === 1) { // Raw input stream
      const pView = new DataView(payloadBytes.buffer, payloadBytes.byteOffset, payloadBytes.byteLength);
      let pOff = 0;
      const count = pView.getInt32(pOff, false); pOff += 4;
      for (let p = 0; p < count; p++) {
        const x = pView.getFloat32(pOff, false); pOff += 4;
        const y = pView.getFloat32(pOff, false); pOff += 4;
        pOff += 16; // skip elapsed, tool, unit
        const pressure = pView.getFloat32(pOff, false); pOff += 4;
        pOff += 8; // skip tilt
        pts.push([x, y, pressure]);
      }
    } else if (encodingType === 0) { // AndroidX Ink Proto gzip
      try {
        const decompressed = await decompressGzip(payloadBytes);
        pts = decodeProtoStrokes(decompressed);
      } catch (err) {
        console.warn("Gzip proto decompress error", err);
      }
    }

    const hexColor = '#' + (colorArgb >>> 0).toString(16).padStart(8, '0');
    const isHighlighter = (familyId === 1) || (((colorArgb >>> 24) & 0xff) <= 0x80);

    strokes.push({
      c: hexColor,
      w: size,
      h: isHighlighter,
      pts: pts
    });
  }

  const templateMap = ["BLANK", "RULED", "GRID", "DOT", "CORNELL"];
  return {
    id: pageId,
    notebookId: notebookId,
    index: pageIndex,
    title: title || `Page ${pageIndex + 1}`,
    template: templateMap[templateOrdinal] || "GRID",
    strokes: strokes
  };
}

// ----------------------------------------------------
// Full Archive Extraction (.zip & .inkflow)
// ----------------------------------------------------
async function loadArchiveFile(fileOrBuffer, filename = "inkflow_vault_backup.zip") {
  if (typeof JSZip === "undefined") {
    throw new Error("JSZip library not available");
  }

  const zip = new JSZip();

  try {
    const loadedZip = await zip.loadAsync(fileOrBuffer);

    function findZipFile(candidates) {
      for (const cand of candidates) {
        const entry = loadedZip.file(cand);
        if (entry && !entry.dir) return entry;
      }
      for (const cand of candidates) {
        const stripped = cand.replace(/^\/+/, '');
        const entry = loadedZip.file(stripped);
        if (entry && !entry.dir) return entry;
      }
      for (const cand of candidates) {
        const base = cand.split('/').pop();
        for (const [filePath, fileObj] of Object.entries(loadedZip.files)) {
          if (fileObj.dir) continue;
          if (filePath.endsWith('/' + base) || filePath === base) {
            return fileObj;
          }
        }
      }
      return null;
    }

    // Check for library.json or manifest.json
    let libFile = findZipFile(["library.json", "/library.json", "manifest.json"]);
    let libraryData = null;

    if (libFile) {
      const text = await libFile.async("text");
      libraryData = JSON.parse(text);
    } else {
      // Auto-synthesize library from .inkpage files
      const inkEntries = Object.keys(loadedZip.files).filter(k => k.endsWith(".inkpage") || k.endsWith(".snapshot"));
      if (inkEntries.length > 0) {
        libraryData = {
          folders: [{ folderId: "f_root", name: "Imported Notes" }],
          notebooks: [{
            notebookId: "nb_imported",
            folderId: "f_root",
            title: filename.replace(/\.(zip|inkflow)$/i, ''),
            pages: inkEntries.map(f => f.split('/').pop().replace(/\.(inkpage|snapshot)$/, ''))
          }]
        };
      } else {
        throw new Error("Could not find library.json, manifest.json, or .inkpage files in archive");
      }
    }

    const loadedPages = [];
    let totalStrokesLoaded = 0;

    for (const nb of libraryData.notebooks || []) {
      const pageIds = nb.pages || [];
      for (let pIdx = 0; pIdx < pageIds.length; pIdx++) {
        const pid = pageIds[pIdx];
        const candidates = [
          `notebooks/${nb.notebookId}/pages/${pid}.inkpage`,
          `notebooks/${nb.notebookId}/pages/${pid}.snapshot`,
          `pages/${pid}.inkpage`,
          `pages/${pid}.snapshot`,
          `${pid}.inkpage`,
          `${pid}.snapshot`
        ];

        let pEntry = findZipFile(candidates);
        if (pEntry) {
          try {
            const buf = await pEntry.async("arraybuffer");
            const parsed = await parseInkPage(buf);
            parsed.notebookId = nb.notebookId;
            parsed.index = pIdx;
            totalStrokesLoaded += (parsed.strokes ? parsed.strokes.length : 0);
            loadedPages.push(parsed);
          } catch (pErr) {
            console.warn(`Failed to parse page ${pid}:`, pErr);
          }
        }
      }
    }

    // Persist full vault to native IndexedDB
    await saveToIndexedDB("cached_library", libraryData);
    await saveToIndexedDB("cached_pages", loadedPages);

    return {
      library: libraryData,
      pages: loadedPages,
      totalStrokes: totalStrokesLoaded
    };

  } catch (err) {
    console.error("Archive extraction failed:", err);
    throw err;
  }
}
