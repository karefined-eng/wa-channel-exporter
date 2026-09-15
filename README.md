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
| **Date-bounded scans** | Choose the current month or a custom range for an event or campaign. |
| **ZIP-first export** | Download one portable archive containing structured records, readable post files, a manifest, and successfully retrieved media. |
| **Archive manifest** | Review the Channel, date range, post counts, media counts, scan steps, and completion reason. |
| **Missing-item reporting** | Distinguish downloaded, unavailable, failed, skipped, observed, and included items instead of silently pretending the archive is complete. |
| **Machine-readable records** | Keep `posts.jsonl` and `posts.csv` inside the ZIP for analysis or later conversion. |
| **Local-first handling** | The extension does not ask for a WhatsApp password or upload post content to a product server. |

## The workflow

1. Build the extension and load `dist/` as an unpacked extension at `chrome://extensions`.
2. Open [WhatsApp Web](https://web.whatsapp.com/) and open the Channel you are authorized to view.
3. Open **WA Channel Exporter**, choose a start and end date, and select **Scan history**.
4. Let the extension load older posts incrementally. It deduplicates repeated DOM observations and stops at the requested boundary—or reports why the boundary was not verified.
5. Review the counts, then choose **Download ZIP archive**. The ZIP is the primary deliverable; JSONL, CSV, and the receipt remain available inside it for inspection and downstream workflows.

## Archive layout

A successful ZIP archive contains a structure like this:

```text
channel-name-2026-09-15.zip
├── manifest.json          # counts, range, status, and completion reason
├── media-report.json      # downloaded, unavailable, and failed media
├── posts.jsonl            # one normalized record per included post
├── posts.csv              # compact tabular companion
├── posts.md               # readable combined archive
├── README.txt             # archive interpretation and limitations
├── posts/                 # one readable text/Markdown file per post
└── media/                 # successfully retrieved original media files
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
