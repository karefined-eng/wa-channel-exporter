# ORIGINS.md — The Idea Ledger

> *"I'd like to call it an origins file or an idea ledger. That's my way of documenting the build process — vibe-coder to agent, or vibe-coder with my voice preserved — and the exact words I used, grammar-corrected though, in there. I think the other thing is AI and agent handoff. I guess I don't know, but I've done something like that with my other projects."*
> — Builder, September 16, 2026

---

## What This Document Is

This is not a changelog, not a technical spec, and not a README. It is an **idea ledger** — a living record of how this product came to be, told from the perspective of the person who built it using their voice and an AI coding agent.

It preserves three things:
1. **The original words of the builder** (transcribed from voice, grammar-corrected but with the spirit intact).
2. **The design decisions and the reasoning behind them** at each stage.
3. **The agent handoff context** — what the AI agent was told, what it understood, what it built, and what the builder reacted to.

---

## The Builder

**Handle:** Karefined Engineering
**Context:** Non-technical founder, community manager, and advocate — who builds with voice and instinct, not syntax and semicolons.
**Method:** Vibe-coding with AI agents. Ideas spoken out loud, iterated live, shipped the same session.
**Other Projects:** Has done agent-handoff documentation on other builds. This is the same practice applied here.

---

## Chapter 1 — The Problem Is Obvious (If You Have Ever Needed It)

**Date:** September 2026
**The moment:** A WhatsApp Channel is running. It has months of announcements, photos, voice updates, community news. Important information. Then someone asks: *"Can we save this? Can we archive it?"*

The answer from WhatsApp is: **No.**

Not "not yet." Not "it's limited." Just: **No.** There is no Export button. There is no backup. There is no bulk media download. There is no way to get 6 months of a channel's content out of WhatsApp Web without sitting there and saving each image, one by one, by hand.

The builder's words:
> *"We have hit a goldmine. People can finally use and benefit in large numbers from something we have built."*

That was the moment the scope became clear. This wasn't a niche utility — this was **the only tool in existence** that solves this problem for WhatsApp Channel administrators and followers.

---

## Chapter 2 — The First Working Version

**Key milestone:** The extension worked. A real WhatsApp Channel — *VOU Election Command Centre* — was scanned, and the archive `vou-election-com-cent-2026-09-16.zip` was downloaded with:
- 111 of 112 media items successfully retrieved.
- Posts archived as `posts.jsonl`, `posts.csv`, `posts.md`.
- `media-report.json` showing every download attempted, its result, and its file size.

**The builder's reaction:**
> *"PERFECT!! IT WORKS."*

**The agent's role at this stage:** The agent had initially been pushing toward publishing a release before live verification. The builder caught this and corrected it. That correction became a permanent rule in `AGENTS.md`:

> *"Never push to release solely based on synthetic/unit tests when live integration is pending."*

---

## Chapter 3 — "Wait, But Is There Anything We Could Do That Would Make This Subtly Better?"

This is the question that unlocked the second phase of the build.

The builder's words:
> *"Wait, wait. But is there anything we could do that would make this subtly better?"*

What shipped:

### Auto-Detection of Channel Name
The extension now reads the active conversation header on WhatsApp Web to identify which channel you are archiving before you even press Scan.

### Date Presets
Instead of typing dates manually, three one-click presets appear:
- `[ This Month ]`
- `[ Last 7 Days ]`
- `[ All Loaded ]`

### Live Progress During Media Download
The progress bar now shows: *"Retrieving media 14/48"* in real time so you know the export is working, not frozen.

### International Date Parsing
The content script handles WhatsApp's date display in `DD/MM/YYYY`, `MM/DD/YYYY`, and `YYYY-MM-DD` formats — because WhatsApp Web displays dates differently depending on the user's phone locale.

---

## Chapter 4 — The Export Scope Toggle

**Builder's words:**
> *"I also believe an optional toggle for either images alone or images and posts, or posts alone should also be available."*

Three export modes were added:

| Scope | What It Does |
|---|---|
| **All (Posts + Media)** | Full archive — text, CSV, JSONL, Markdown, and all downloaded media. |
| **Media Only** | Downloads all photos, videos, and audio into `media/` with a report. No text files. |
| **Posts Only** | Packages text and structured data only. Zero media network requests. Instant download. |

**Design decision:** The "Posts Only" mode is completely bandwidth-free. The media fetcher loop is bypassed entirely, and all media items are marked `status: "skipped_scope_posts_only"` in `media-report.json`. This makes it useful for researchers and archivists who only need the text corpus.

---

## Chapter 5 — The Naming Problem

**Builder's words:**
> *"Another thing I realised is the naming convention the ZIP folder uses and how the current channel being exported is identified."*

**Before:**
```
vou-election-com-cent-2026-09-16.zip
```

**After:**
```
vou-election-command-centre_archive_2026-09-01_to_2026-09-16.zip
vou-election-command-centre_media_2026-09-01_to_2026-09-16.zip
vou-election-command-centre_posts_2026-09-01_to_2026-09-16.zip
```

**What else changed:**
- A live **filename preview chip** appears in the UI above the download button, showing you the exact filename *before* you click.
- The channel name is now editable in a dedicated **Target Channel** input field with a re-detect button.
- A critical bug was fixed: the channel name was being read from the sidebar list (the first channel in the chat list) instead of the *active open conversation*. Fixed by targeting `#main` in the DOM.

---

## Chapter 6 — Video and Audio

**Builder's question:**
> *"Do we support video? And audio?"*

**What the pipeline does:**
1. The content script scans `<video>`, `<audio>`, and `<source>` elements inside each post.
2. WhatsApp loads media as authenticated `blob:` URLs — these can only be fetched from within the page context.
3. The content script fetches the binary in-page, encodes it as Base64, and sends it across the Chrome extension IPC boundary safely.
4. The exporter receives the Base64 and writes the file to `media/` with the correct extension.

**MIME type coverage:**
- **Images:** `.jpg`, `.png`, `.gif`, `.webp`, `.avif`
- **Video:** `.mp4`, `.webm`, `.mov`, `.3gp`, `.ogv`
- **Audio:** `.mp3`, `.m4a`, `.ogg`, `.opus`, `.weba`, `.wav`, `.aac`

Voice notes in WhatsApp Channels are typically `audio/ogg; codecs=opus`. These are now properly detected, fetched, and saved as `.ogg` files.

---

## Chapter 7 — The Practicality Discussion

**Builder's words:**
> *"Let's talk about how practical our current export nature is."*

**The gap identified:** There is no "human viewer." Opening the ZIP and seeing `posts.jsonl`, `posts.csv`, and a `media/` folder with 100 sequentially-numbered files is a developer experience — not a user experience.

**The two solutions:**
1. **Date-organized `media/` subfolders** (`media/YYYY-MM-DD/`) — browsing in File Explorer feels like flipping through a calendar.
2. **An offline `index.html` viewer** — double-click it and see the entire channel history in a beautiful feed with photos, videos, and audio embedded inline.

**Why this matters:**
- Telegram's gold-standard desktop export generates an `index.html` viewer. That is what users compare against.
- Every WhatsApp Channel export competitor either (a) doesn't work for Channels at all, (b) crashes on media, or (c) uploads data to external servers.
- This would make WA Channel Exporter definitively the best tool in existence for preserving broadcast community archives.

---

## Shipped — Chapter 8: The HTML Viewer and Date-Organized Media

> *"Yess I guess! Anything to be great and strong."*

**What was shipped:**
1. **Offline HTML Viewer (`index.html`):**
   - Self-contained, single-file viewer generated directly inside the ZIP when exporting with `scope: "all"`.
   - Styled with an authentic WhatsApp-style dark theme (`#0f1923` background, `#111b21` cards, `#25d366` emerald accents, `#00a884` details).
   - Sticky channel header displaying the channel name, date range, post count, and media tally.
   - Posts grouped by date with sticky date divider pills (`September 15, 2026`).
   - Native inline responsive embeds for images, video player (`<video controls>`), and audio player (`<audio controls>`).
   - Full-screen image lightbox: click any photo to expand into an overlay; dismiss by clicking anywhere or pressing the `Esc` key.
   - Zero internet or external CDN dependencies. Fully functional offline.

2. **Date-Organized `media/` Subfolders:**
   - Media files are systematically filed into `media/YYYY-MM-DD/` directories (e.g. `media/2026-09-15/0001-01-photo.jpg`).
   - Undated posts fall back cleanly to `media/undated/`.
   - Browsing in macOS Finder or Windows File Explorer feels like flipping through a calendar.

3. **Enriched Markdown (`posts.md`):**
   - Transformed from a plain text list into a media-rich document with relative inline image links (`![photo.jpg](media/2026-09-15/0001-01-photo.jpg)`).
   - Ready for drop-in use in Obsidian, Notion, Logseq, or GitHub previews.

**Resulting ZIP output structure:**
```
📁 vou-election-command-centre_archive_2026-09-01_to_2026-09-16.zip
├── 🌐 index.html                 ← Double-click to view full archive offline
├── 📄 posts.md                   ← Inline image links for Obsidian / Notion
├── 📊 posts.csv                  ← Excel / Sheets compatible
├── 📦 posts.jsonl                ← Structured data for developers / AI (schema v2)
├── 📋 manifest.json              ← Export metadata and audit
├── 📋 media-report.json          ← Per-item download audit (downloaded/unavailable/failed)
├── 📄 README.txt                 ← Human-readable guide
├── 📁 posts/                     ← Individual post text & markdown files
└── 📁 media/
      ├── 📁 2026-09-01/
      │     ├── 0001-01-photo.jpg
      │     └── 0002-01-video.mp4
      └── 📁 2026-09-15/
            ├── 0003-01-press-conference.jpg
            ├── 0004-01-speech-recording.ogg
            └── 0005-01-results-chart.png
```

---

## Phase 3: The PDF Pivot & Generative Engine Optimization (Sept 2026)

### The "WhatsApp to PDF" Market Reality
The product team realized a massive uncrowded wedge market: existing third-party WhatsApp PDF exporters all fail on WhatsApp Channels because the native `.txt` export button does not exist. Users were trapped.

**What was built:**
- Integrated `pdfmake` entirely locally.
- Added a dedicated "PDF Document" export mode that renders the channel feed into a clean, paginated, and timestamped PDF (complete with embedded base64 images).
- Perfected the offline zero-server requirement.

### Generative Engine Optimization (GEO)
To capture the AI search market (ChatGPT Search, Perplexity, Google AI Overviews) that currently tells users exporting is "impossible," we built an advanced GEO strategy on the main website:
- Designed a semantic `documentation.html` page using 150-word answer passages optimized for AI crawler extraction.
- Injected `HowTo`, `SoftwareApplication`, and `Article` Schema.org JSON-LD structured data.
- Configured a dedicated `robots.txt` whitelisting `OAI-SearchBot` and `Claude-SearchBot`.
- Created an `llms.txt` file specifically instructing AI models about our tool's capabilities.
- Automated `sitemap.xml` generation and integrated Vercel Analytics.

---

## Build Methodology Notes

### How This Was Built

This is a vibe-coder-to-agent project. The process:

1. **Builder speaks.** Ideas come out raw, fast, often mid-sentence and typo-filled.
2. **Agent listens.** The AI coding agent interprets intent, resolves ambiguity, and implements.
3. **Builder reacts.** "This works." / "Wait, this is wrong." / "Can we also add...?"
4. **Agent adapts.** Code is updated live in the same session.
5. **Both verify.** Tests run, build passes, extension reloaded in Chrome and tested on a real WhatsApp Channel.

### What Makes This Different from Standard Vibe-Coding

- **Real data testing.** Every major feature was verified on an actual WhatsApp Channel (VOU Election Command Centre), not just synthetic mocks.
- **Guardrails.** `AGENTS.md` exists precisely because the agent tried to rush a release before live verification. The builder caught it. The lesson became a permanent rule.
- **The builder owns the product instinct.** The agent owns the implementation. The builder decides what "practical" means for real users. The agent figures out how to build it.

---

## Key Files

| File | Purpose |
|---|---|
| `src/content/whatsapp-content.js` | Content script. Runs inside WhatsApp Web. Detects posts, media, channel name. Fetches media binary in page context. |
| `src/core/exporter.js` | Core logic. Schema validation, CSV/JSONL/Markdown generation, ZIP creation, naming convention. |
| `src/popup/popup.js` | UI controller. Manages scan state, export scope, channel detection, progress, and download. |
| `src/popup/popup.html` | Side panel layout. Channel card, date filters, scope selector, filename preview, action buttons. |
| `AGENTS.md` | Agent rules. Hard constraints written by the builder after catching an agent mistake. Non-negotiable. |
| `docs/research/market-demand-and-research.md` | Market evidence. Citations from Reddit, GitHub, Quora, and product forums showing real unmet demand. |

---

*This document is updated as the build continues. It is the source of truth for why decisions were made, not just what was built.*
