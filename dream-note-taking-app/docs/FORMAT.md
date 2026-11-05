# InkFlow File & Backup Specification (`FORMAT.md`)

> **Specification Version:** `3.0`  
> **Container Extension:** `.inkflow` / `.inkpage`  
> **Magic Header:** `0x494E4B31` (`INK1` in ASCII)  
> **Status:** Authoritative & Lossless

---

## 1. Overview & Architecture

InkFlow stores note pages as compact, append-friendly binary containers. The format is designed for:
1. **Near-Zero Latency Serialization:** Direct binary mapping with zero reflection or JSON overhead on the render thread.
2. **Git Delta Friendliness:** Deterministic field ordering and compact structures enable Git to compress commit deltas efficiently.
3. **Hardware Acceleration:** Native stroke coordinates and pressure parameters match Android's `androidx.ink` and HTML5 Canvas 2D without coordinate degradation.
4. **Resilient Integrity:** Every file terminates with an 8-byte CRC32 checksum, validated before memory allocation or canvas dispatch.
5. **Forward/Backward Compatibility:** Versioned header (`FORMAT_VERSION = 3`). Unknown fields in future versions are safely skipped by readers using payload length prefixes.

---

## 2. Binary Layout (`.inkflow`)

Every `.inkflow` page file is structured into four sequential sections:

```
+-------------------------------------------------------------------+
| 1. Header (8 bytes): MAGIC_HEADER (4B) + FORMAT_VERSION (4B)       |
+-------------------------------------------------------------------+
| 2. Page Metadata (Variable length, UTF-8 + Big-Endian Primitives) |
+-------------------------------------------------------------------+
| 3. Strokes Array (4B Count + Variable Stroke Blocks)              |
+-------------------------------------------------------------------+
| 4. Integrity Checksum (8 bytes): CRC32 (Long)                     |
+-------------------------------------------------------------------+
```

### 2.1 Section 1: Header
| Offset | Type | Field | Description |
|---|---|---|---|
| `0x00` | `UInt32` | `magic` | Fixed magic `0x494E4B31` (`INK1` in ASCII) |
| `0x04` | `Int32` | `version` | Format version integer: `3` (current), `2`, or `1` (legacy) |

### 2.2 Section 2: Page Metadata
All string fields use Java/Modified UTF-8 format: a 2-byte unsigned big-endian length prefix followed by UTF-8 bytes.
| Field | Type | Description |
|---|---|---|
| `pageId` | `String` (UTF) | Unique UUID string (e.g., `59096166-884f-409e-b462-af4b2c86dc77`) |
| `notebookId` | `String` (UTF) | Parent notebook UUID string |
| `pageIndex` | `Int32` | 0-based page sequence index within the notebook |
| `title` | `String` (UTF) | Page title (e.g., `"Climbing Stairs"`) |
| `templateOrdinal` | `Int32` | Background template type (see §4) |
| `createdAt` | `Int64` | Creation epoch timestamp in milliseconds |
| `modifiedAt` | `Int64` | Last modification epoch timestamp in milliseconds |

### 2.3 Section 3: Strokes Array
| Field | Type | Description |
|---|---|---|
| `strokeCount` | `Int32` | Total number of strokes $N$ contained on this page |

Followed by $N$ consecutive stroke definitions. Each stroke block is encoded as:
| Field | Type | Description |
|---|---|---|
| `strokeId` | `String` (UTF) | Persistent stroke UUID (used for de-duplication and undo/redo matching) |
| `familyId` | `Byte` | Brush family identifier: `0` = Pressure Pen, `1` = Highlighter, `2` = Marker |
| `colorIntArgb` | `Int32` | 32-bit ARGB color value (e.g. `0xFF111318` for ink black, `0x66FFEB3B` for highlighter) |
| `size` | `Float32` | Base stroke width / brush diameter in world coordinate points |
| `epsilon` | `Float32` | Geometric curve smoothing tolerance |
| `encodingType` | `Byte` | `0` = Native Ink Proto, `1` = Portable Raw Input Stream (see §3) |
| `payloadLength`| `Int32` | Byte length $L$ of the encoded stroke inputs payload |
| `payloadBytes` | `Byte[L]` | The stroke inputs byte payload |

### 2.4 Section 4: Integrity Checksum
| Offset | Type | Field | Description |
|---|---|---|---|
| `EOF - 8` | `Int64` | `crc32` | CRC-32 checksum computed across all bytes from `0x00` through `EOF - 8`. |

---

## 3. Stroke Input Encoding (Portable Raw Stream: `encodingType = 1`)

When `encodingType == 1`, `payloadBytes` is structured as a sequence of high-precision stylus/touch input points:

| Offset | Type | Field | Description |
|---|---|---|---|
| `0x00` | `Int32` | `inputCount` | Number of recorded points $M$ in this stroke |

Followed by $M$ point records, each exactly 36 bytes:
| Field | Type | Size | Description |
|---|---|---|---|
| `x` | `Float32` | 4B | World X coordinate in canvas units |
| `y` | `Float32` | 4B | World Y coordinate in canvas units |
| `elapsedTime` | `Int64` | 8B | Milliseconds elapsed since stroke initiation |
| `toolType` | `Int32` | 4B | `1` = Unknown, `2` = Finger/Touch, `3` = Stylus, `4` = Mouse |
| `unitLengthCm` | `Float32` | 4B | Physical digitizer stroke unit length (cm) |
| `pressure` | `Float32` | 4B | Normalized stylus pressure ($0.0 \dots 1.0$) |
| `tiltRadians` | `Float32` | 4B | Stylus tilt angle from vertical in radians ($0 \dots \pi/2$) |
| `orientation` | `Float32` | 4B | Stylus azimuth orientation angle in radians ($-\pi \dots \pi$) |

Total point size: $4 + 4 + 8 + 4 + 4 + 4 + 4 + 4 = 36\text{ bytes per point}$.

---

## 4. Background Paper Templates

The `templateOrdinal` maps to:
* `0`: **BLANK** — Clean canvas without guide lines.
* `1`: **RULED** — Ruled notebook lines (horizontal spacing 56 pt, subtle margin rule at $x = 120\text{ pt}$).
* `2`: **GRID** — Math grid / graph paper (grid cell size 48 pt).
* `3`: **CORNELL** — Cornell student notes layout (summary section at bottom, cue column at left $w = 220\text{ pt}$).
* `4`: **DOT_GRID** — Minimalist dot matrix (spacing 40 pt).
* `5`: **INFINITE** — Dynamic unbounded canvas with continuous subtle background grid.

---

## 5. Repository Layout (GitHub Backup)

The GitHub backup repository follows this strict structure:

```
<backup-repo>/
  README.md                 # Interactive Table of Contents & note index with direct page links
  FORMAT.md                 # This authoritative specification document
  backup-meta.json          # Repository metadata (schema version, app version, last backup timestamp)
  library.json              # Full hierarchical tree: subjects, topics, notebooks, pages, bounds, sha256
  search-index.json         # Lightweight search index: page ID -> title, typed text, tags, problem description
  notebooks/
    <notebook-id>/
      pages/
        <page-id>.inkflow   # Lossless binary vector note file
      assets/
        <sha256>.<ext>      # Embedded images / attachments
  _trash/                   # 30-day deleted notebook archives
  viewer/                   # Standalone Web Reader source (untouched by Android app)
```

### 5.1 `backup-meta.json` Schema
```json
{
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "deviceId": "moto_pad_70_pro",
  "deviceModel": "Motorola Moto Pad 70 Pro",
  "lastBackupTimestamp": 1730834000000,
  "format": "inkflow-v3",
  "encryption": {
    "enabled": false,
    "algorithm": "AES-256-GCM"
  }
}
```

### 5.2 `library.json` Schema
```json
{
  "version": 1,
  "exportedAt": 1730834000000,
  "appVersion": "1.0.0",
  "folders": [
    {
      "folderId": "f_dsa",
      "parentFolderId": null,
      "name": "DSA",
      "iconKey": "code_terminal",
      "order": 0
    }
  ],
  "notebooks": [
    {
      "notebookId": "nb_dp",
      "folderId": "f_dsa",
      "title": "Dynamic Programming",
      "pageCount": 1,
      "isStarred": false,
      "iconKey": "git_branch",
      "pages": [
        {
          "pageId": "p_climbing_stairs",
          "title": "Climbing Stairs",
          "pageIndex": 0,
          "filePath": "notebooks/nb_dp/pages/p_climbing_stairs.inkflow",
          "strokeCount": 42,
          "contentBounds": { "xMin": 100.0, "yMin": 150.0, "xMax": 850.0, "yMax": 1100.0 },
          "sizeBytes": 3482,
          "sha256": "4a5b6c...",
          "updatedAt": 1730834000000,
          "template": "RULED",
          "difficulty": "Easy",
          "status": "Solved",
          "tags": ["DP", "Recursion"],
          "sourceLink": "https://leetcode.com/problems/climbing-stairs/"
        }
      ]
    }
  ]
}
```

---

## 6. Golden Test Vector Specification

A minimal, valid `.inkflow` v3 page file with 0 strokes (blank page):
* **Page ID:** `test_page_empty`
* **Notebook ID:** `test_nb`
* **Title:** `Empty Note`
* **Template:** `RULED` (ordinal `1`)
* **Created / Modified:** `1730800000000L` (`0x00000192F3E76000`)
* **Strokes Count:** `0`
* **Byte Size:** `117 bytes`
* **Hex Representation:**
```
494e4b31 00000003 000f7465 73745f70 6167655f 656d7074 79000774 6573745f
6e620000 0000000a 456d7074 79204e6f 74650000 00010000 0192f3e7 60000000
0192f3e7 60000000 0000<8-byte CRC32>
```

Any file containing strokes will have `size > 125` bytes. Backups verify that non-empty pages have `size > 125` and `decoded.strokeCount == expected.strokeCount`.
