<div align="center">

# WA Channel Exporter

### Export WhatsApp Channel posts from WhatsApp Web into a trustworthy local archive.

[![Status: pilot](https://img.shields.io/badge/status-pilot-0f766e?style=flat-square)](https://github.com/karefined-eng/wa-channel-exporter)
[![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![Privacy](https://img.shields.io/badge/data%20handling-local--first-16a34a?style=flat-square)](#privacy-and-rights)
[![License: MIT](https://img.shields.io/badge/license-MIT-111827?style=flat-square)](LICENSE)

**Preserve the updates your authorized WhatsApp Web session can actually make available.**

</div>

> **WA Channel Exporter is an independent Chrome extension for date-bounded WhatsApp Channel archiving.** It scans the Channel you open in WhatsApp Web, saves posts and retrievable media into a portable ZIP archive, and reports what was observed, included, unavailable, or failed.

## Why this exists

Important Channel updates disappear into a fast-moving feed. Faith and ministry teams, community organizers, researchers, media volunteers, and independent publishers often need a dated record for an event, campaign, monthly archive, or content-reuse workflow.

WA Channel Exporter is intentionally **not** a generic bulk scraper. It is a user-invoked, local-first archive assistant built around a more honest promise:

> **Archive the WhatsApp Channel content your authorized browser session can load—and make the gaps visible.**

## What you get

| Capability | What it means |
|---|---|
| **Offline HTML viewer (`index.html`)** | Double-click to browse the entire channel offline with an authentic WhatsApp dark theme, inline image/video/audio players, and image lightbox. |
| **Date-organized media (`media/YYYY-MM-DD/`)** | Photos, videos, and voice notes saved into date-stamped subfolders for intuitive, calendar-like browsing. |
| **Export scope selector** | Choose between **All** (full archive), **Media Only** (photos/videos/audio), or **Posts Only** (lightweight text export). |
| **Enriched Markdown** | `posts.md` contains chronological posts with relative inline image embeds (`![photo.jpg](media/...)`), ready for Obsidian or Notion. |
| **Channel auto-detection** | Automatically reads the active Channel name from the conversation header, complete with a live filename preview (`{channel}_{scope}_{start}_to_{end}.zip`). |
| **Date-bounded scans & presets** | Pick custom start/end dates or use one-click presets (**This Month**, **Last 7 Days**, **All Loaded**). |
| **Honest missing-item audit** | `manifest.json` and `media-report.json` document downloaded, unavailable, failed, and skipped items instead of silently pretending the archive is complete. |
| **Machine-readable records** | Keep `posts.jsonl` (schema v2) and `posts.csv` alongside individual per-post text/Markdown files for AI, data analysis, and spreadsheets. |
| **100% Local-first handling** | Zero server uploads, zero logins, zero telemetry. All processing and authenticated blob retrieval happens directly inside your browser session. |

## Quick Start: How to Install in 30 Seconds

1. Download **`wa-channel-exporter.zip`** from the latest release and unzip it to a folder on your computer.
2. In Google Chrome, go to `chrome://extensions` and turn on **Developer mode** (top right switch).
3. Click **Load unpacked** (top left) and choose the unzipped folder (or the `dist` directory if building from source).
4. Pin **WA Channel Exporter** to your Chrome toolbar, open [WhatsApp Web](https://web.whatsapp.com/), and click the icon to open the Side Panel!

## The workflow

1. Build the extension (`npm run build`) and load `dist/` as an unpacked extension at `chrome://extensions`.
2. Open [WhatsApp Web](https://web.whatsapp.com/) and open the Channel you are authorized to view.
3. Open **WA Channel Exporter** in Chrome's side panel. The channel name auto-detects from the open conversation header.
4. Select your export scope (**All**, **Media Only**, or **Posts Only**) and choose your date boundary or preset.
5. Watch the live filename preview update dynamically, then click **Scan history**.
6. Let the extension load older posts incrementally. It deduplicates repeated DOM observations and stops at the requested boundary—or reports why the boundary was not verified.
7. Review the live counters, then choose **Download ZIP archive**. Double-click `index.html` inside the ZIP to view your offline archive immediately.

## Archive layout

A successful ZIP archive contains a clean, human- and machine-friendly structure:

```text
{channel}_{scope}_{start}_to_{end}.zip
├── index.html             # offline browser viewer with embedded media & lightbox (scope: All)
├── manifest.json          # counts, date range, status, completion reason, and scope
├── media-report.json      # downloaded, unavailable, failed, and skipped media audit
├── posts.jsonl            # newline-delimited JSON (schema v2) for developers & AI
├── posts.csv              # spreadsheet-compatible tabular export
├── posts.md               # readable Markdown archive with inline media embeds
├── README.txt             # archive interpretation and field guide
├── posts/                 # individual text (.txt) and Markdown (.md) post files
└── media/                 # retrieved media organized by publication date
    ├── 2026-09-01/
    │   ├── 0001-01-photo.jpg
    │   └── 0002-01-briefing.mp4
    └── 2026-09-15/
        └── 0003-01-announcement.jpg
```

The ZIP is designed to be the useful hand-off artifact. You should not need to separately download a JSONL file or an HTML receipt just to understand the archive. `manifest.json`, `media-report.json`, and the readable post files travel with the ZIP.

## Honest completeness

A successful button click is not treated as proof of a complete history. The archive reports whether the requested date boundary was reached.

The result can be:

- **Complete boundary reached:** the scan crossed the requested start date.
- **Partial archive:** the browser reached the top, stopped making progress, timed out, or encountered unavailable updates before the boundary was verified.
- **Canceled:** the user stopped the scan; records collected so far remain exportable.

A partial archive does not mean that missing content never existed. It means WhatsApp Web did not make that content available to this scan in a way the extension could verify.

## Privacy and rights

WA Channel Exporter is designed for content that you are authorized to view and save. Exporting content does not grant republication rights. You are responsible for respecting the rights of Channel owners, contributors, and people shown in media.

The extension is independent and is **not affiliated with or endorsed by WhatsApp or Meta**. It does not bypass login, recover deleted posts, access private material without authorization, or promise every historical post or media file.

Before public distribution, the project must publish a complete privacy policy and matching Chrome Web Store data-use disclosure. The extension reads content from the active WhatsApp Web page, so local-only processing still needs to be described accurately.

## Current status

This repository is in a **pilot and hardening phase**. The core workflow, Manifest V3 packaging, date-bounded scan loop, archive generation, and browser-fixture checks are present. Production readiness still depends on live WhatsApp Web validation across multiple Channel layouts and media states.

Known release gates include:

- validating original-media retrieval instead of relying on temporary browser previews;
- handling unavailable, expired, or credential-bound media without silent loss;
- making interrupted exports resumable;
- testing extension reloads, tab refreshes, and service-worker restarts;
- publishing the privacy policy and store disclosure;
- validating the archive manifest and download completion across supported Chrome versions.

## Local development

```bash
npm install
npm run build
node scripts/test-exports.mjs
node scripts/test-mv3.js
node scripts/test-browser-fixture.js
```

The build creates `wa-channel-exporter.zip` and a loadable `dist/` directory. In Chrome, choose **Load unpacked** and select `dist/`.

## Repository map

```text
src/content/whatsapp-content.js   DOM collection and page-context media retrieval
src/core/exporter.js              ZIP, JSONL, CSV, manifest, and readable archive files
src/popup/popup.js                 scan controls, progress, and ZIP-first downloads
src/background/service-worker.js  local download brokering and status tracking
scripts/                          build and browser/export regression checks
```

## Roadmap

The next product milestones are reliable original-media retrieval, resume-after-interruption, richer date parsing, a polished archive summary, and feedback from at least five faith or community Channel operators. Cloud sync, shared workspaces, enterprise compliance, scheduled capture, and generic all-WhatsApp export remain intentionally out of scope until the local archive workflow is reliable.

## License

MIT

<div align="center">

**A local archive should be portable, inspectable, and honest about its gaps.**

</div>
