# WA Channel Exporter — Feature List

> Authoritative list of what is built, tested, and working as of September 2026.  
> Updated whenever a feature ships. Cross-referenced with `ORIGINS.md` for design context.

---

## Export & Archive

| Feature | Status | Notes |
|---|---|---|
| **Date-bounded scans** | ✅ Shipped | Choose a start and end date to limit what is archived |
| **Date presets** | ✅ Shipped | One-click: `This Month`, `Last 7 Days`, `All Loaded` |
| **ZIP download** | ✅ Shipped | One portable archive with everything inside |
| **Export scope selector** | ✅ Shipped | Three modes: `All`, `Media Only`, `Posts Only` |
| **Archive naming convention** | ✅ Shipped | `{channel}_{scope}_{start}_to_{end}.zip` |
| **Live filename preview** | ✅ Shipped | Shows exact ZIP filename in the UI before you click download |

---

## Archive Contents

| File / Folder | Scope | Description |
|---|---|---|
| `index.html` | All | Offline HTML viewer — double-click to browse the full archive with embedded media |
| `posts.md` | All, Posts Only | Chronological Markdown transcript with inline image embeds (`![photo.jpg](media/...)`) |
| `posts.jsonl` | All, Posts Only | Newline-delimited JSON, one record per post, schema version 2 |
| `posts.csv` | All, Posts Only | Spreadsheet-compatible flat table |
| `posts/NNNN-date.md` | All, Posts Only | Individual Markdown file per post |
| `posts/NNNN-date.txt` | All, Posts Only | Individual plain text file per post |
| `media/YYYY-MM-DD/` | All, Media Only | Media files organized in date subfolders — one folder per day |
| `media-report.json` | All scopes | Per-item audit: downloaded / unavailable / failed / skipped |
| `manifest.json` | All scopes | Full export metadata: channel, range, counts, validation, and scope |
| `README.txt` | All scopes | Human-readable guide to archive contents |

---

## Offline HTML Viewer (`index.html`)

| Feature | Status |
|---|---|
| Sticky channel header with range, post count, and media count | ✅ Shipped |
| Posts grouped by date with date separator bars | ✅ Shipped |
| Post cards with timestamp and text | ✅ Shipped |
| Inline image display (lazy-loaded) | ✅ Shipped |
| Native video player | ✅ Shipped |
| Native audio player (voice notes) | ✅ Shipped |
| Image lightbox (click to expand, Esc or click to close) | ✅ Shipped |
| WhatsApp-style dark theme | ✅ Shipped |
| No internet required — fully self-contained | ✅ Shipped |

---

## Media Support

| Format | Type | Status |
|---|---|---|
| `.jpg` / `.jpeg` / `.png` / `.gif` / `.webp` / `.avif` | Image | ✅ |
| `.mp4` / `.webm` / `.mov` / `.3gp` / `.ogv` | Video | ✅ |
| `.mp3` / `.m4a` / `.ogg` / `.opus` / `.weba` / `.wav` / `.aac` | Audio | ✅ |
| Voice notes (`audio/ogg; codecs=opus`) | Audio | ✅ |
| `.pdf` / `.zip` / `.txt` / `.csv` | Document | Detected, reported in manifest |

**How media retrieval works:**
1. Content script identifies `<img>`, `<video>`, `<audio>`, and `<source>` elements in each post.
2. WhatsApp exposes media as authenticated `blob:` URLs — only fetchable from within the page.
3. Content script fetches the binary in-page and encodes it as **Base64** before passing it across the Chrome extension IPC boundary (raw `ArrayBuffer` would be silently destroyed by JSON serialization).
4. The exporter receives the Base64, pads it, and writes the file to `media/YYYY-MM-DD/` in the ZIP.

---

## Channel Detection

| Feature | Status | Notes |
|---|---|---|
| Auto-detect channel name from open conversation | ✅ Shipped | Reads the `#main` header, not the sidebar list |
| Editable channel name input | ✅ Shipped | Override or correct the detected name before export |
| Re-detect button (`↻`) | ✅ Shipped | Tap to re-read the active conversation header |
| `document.title` fallback | ✅ Shipped | Used if DOM header is inaccessible |
| Auto-detect on window focus | ✅ Shipped | Fires when user navigates back to the extension |

---

## Scan UX

| Feature | Status |
|---|---|
| Live scan progress bar | ✅ Shipped |
| "Retrieving media N/M" counter during media download | ✅ Shipped |
| Auto-scroll to action buttons on scan completion | ✅ Shipped |
| "No posts in date range" guidance message | ✅ Shipped |
| Scan cancellation (partial results remain exportable) | ✅ Shipped |
| Deduplication of repeated DOM observations | ✅ Shipped |

---

## Archive Integrity

| Feature | Status |
|---|---|
| Schema validation on every export (JSONL + CSV) | ✅ Shipped |
| `media-report.json` per-item audit trail | ✅ Shipped |
| Honest completeness reporting (complete / partial / canceled) | ✅ Shipped |
| Missing / unavailable / failed items distinguished | ✅ Shipped |
| `manifest.json` includes export validation results | ✅ Shipped |

---

## Extension Architecture

| Feature | Status | Notes |
|---|---|---|
| Chrome Manifest V3 | ✅ | Service worker, no background page |
| Side panel + popup dual mode | ✅ | Fluid styling for both contexts |
| Local-first — no server, no upload | ✅ | All processing happens in the browser |
| Base64 media transport across IPC | ✅ | Required by Chrome message serialization rules |
| International date format parsing | ✅ | `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD` |

---

## Roadmap (Not Yet Shipped)

| Feature | Priority |
|---|---|
| Resume interrupted scan | High |
| Date-organized posting in `posts/` folder | Medium |
| Thumbnails in HTML viewer for large image grids | Medium |
| Channel subscriber count / metadata capture | Low |
| Scheduled / recurring exports | Out of scope for v1 |
| Cloud sync or shared workspace | Out of scope for v1 |
