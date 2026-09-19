<div align="center">

# WA Channel Exporter
### The Ultimate Chrome Extension to Export WhatsApp Channel Messages & Media

[![Status: pilot](https://img.shields.io/badge/status-pilot-0f766e?style=flat-square)](https://github.com/karefined-eng/whatsapp-channel-exporter)
[![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![Privacy](https://img.shields.io/badge/data%20handling-local--first-16a34a?style=flat-square)](#privacy-and-rights)
[![License: MIT](https://img.shields.io/badge/license-MIT-111827?style=flat-square)](LICENSE)

**Securely download WhatsApp Channel history directly to your computer. 100% local, zero data collection.**

</div>

> **WA Channel Exporter** is an independent Chrome extension built specifically to **download WhatsApp Channel messages, videos, and photos** into a portable ZIP archive or a formatted PDF document. It runs entirely in your browser, guaranteeing your data stays on your machine.

🌐 **[Visit the official website for Documentation and Downloads](https://whatsapp-channel-exporter.vercel.app/)**

---

## The Problem: Can you export a WhatsApp Channel?

If you've searched for *"how to export a whatsapp channel"*, you probably noticed that popular tools like *WAnalysis* or *WAExport* only work for 1-on-1 chats and standard groups. They fail completely when trying to read the WhatsApp Channels "Updates" feed.

**WA Channel Exporter is the solution.** It is specifically engineered to act as a **WhatsApp Channel scraper and archiver**, giving you a clean, timestamped export of the channels you follow.

## Who is this for?
Faith and ministry teams, community organizers, researchers, media volunteers, and independent publishers who desperately need a dated record of an event, campaign, or monthly archive for content-reuse workflows.

---

## What You Get

| Capability | What it means |
|---|---|
| **Export to PDF Document** | Generate a professional, paginated PDF document with embedded images and exact timestamps, perfect for compliance, legal, and reporting. |
| **Offline HTML viewer (`index.html`)** | Double-click to browse the entire channel offline with an authentic WhatsApp dark theme, inline image/video/audio players, and image lightbox. |
| **Download WhatsApp Channel Media** | Photos, videos, and voice notes are automatically saved into date-stamped subfolders (`media/YYYY-MM-DD/`) for calendar-like browsing. |
| **Export Scope Selector** | Choose between **All** (full archive), **PDF Document**, **Media Only** (photos/videos/audio), or **Posts Only** (lightweight text export). |
| **Enriched Markdown & CSV** | `posts.md` contains chronological posts with inline image embeds, ready for Obsidian or Notion. `posts.csv` is ready for Excel. |
| **Channel Auto-Detection** | Automatically reads the active Channel name from the conversation header. |
| **Date-Bounded Scans** | Pick custom start/end dates or use one-click presets (**This Month**, **Last 7 Days**, **All Loaded**). |
| **100% Local-first Privacy** | Zero server uploads, zero logins, zero telemetry. All processing happens directly inside your browser session. |

---

## FAQ: Frequently Asked Questions

**Q: Does this Chrome extension download WhatsApp Channel media (photos and videos)?**
Yes! The extension automatically fetches the images, videos, and voice notes visible in the channel and organizes them chronologically in a local `media/` folder.

**Q: Why should I use this instead of standard WhatsApp backup tools?**
Standard backup tools and popular Chrome extensions are designed for the "Chats" tab. They cannot read the "Updates" broadcast feed. This extension was built from the ground up exclusively for WhatsApp Channels.

**Q: Is it safe? Does it steal my data?**
Absolutely safe. WA Channel Exporter processes everything **locally** in your browser. It does not send your channel data, messages, or phone number to any external server. You can inspect the source code in this repository to verify.

**Q: What format does the WhatsApp Channel export into?**
Your export comes neatly packaged in a `.zip` file containing:
- A beautiful `index.html` file to view the channel offline.
- A `posts.csv` file for spreadsheet analysis.
- A `posts.md` file for note-taking apps.
- A `media/` folder with all images and videos.

Alternatively, you can select the **"PDF"** option to generate a standalone formatted PDF document!

---

## Quick Start: How to Install in 30 Seconds

1. Download **`wa-channel-exporter.zip`** from the latest release and unzip it to a folder on your computer.
2. In Google Chrome, go to `chrome://extensions` and turn on **Developer mode** (top right switch).
3. Click **Load unpacked** (top left) and choose the unzipped folder (or the `dist` directory if building from source).
4. Pin **WA Channel Exporter** to your Chrome toolbar, open [WhatsApp Web](https://web.whatsapp.com/), and click the icon to open the Side Panel!

---

## Archive Layout

A successful ZIP archive contains a clean, human- and machine-friendly structure:

```text
{channel}_{scope}_{start}_to_{end}.zip
├── index.html             # offline browser viewer with embedded media & lightbox
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

---

## Honest Completeness & Audit

A successful button click is not treated as proof of a complete history. The archive reports exactly what it found and what it missed in the `manifest.json` and `media-report.json` files. 

If you cancel the scan early, or if WhatsApp Web fails to load older posts, the tool honestly reports a **Partial archive**. A partial archive does not mean that missing content never existed, but simply that WhatsApp Web did not make it available to the scraper at that moment.

## Privacy and Rights

WA Channel Exporter is designed for content that you are authorized to view and save. Exporting content does not grant republication rights. You are responsible for respecting the rights of Channel owners, contributors, and people shown in media.

The extension is independent and is **not affiliated with or endorsed by WhatsApp or Meta**. It does not bypass login, recover deleted posts, access private material without authorization, or promise every historical post or media file.

## Local Development

```bash
npm install
npm run build
node scripts/test-exports.mjs
node scripts/test-mv3.js
node scripts/test-browser-fixture.js
```

The build creates `wa-channel-exporter.zip` and a loadable `dist/` directory.

## License
MIT - **A local archive should be portable, inspectable, and honest about its gaps.**
