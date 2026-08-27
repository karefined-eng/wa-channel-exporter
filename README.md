# WA Channel Exporter

**A local-first archive for faith, ministry, and community WhatsApp Channels.**

WA Channel Exporter helps media volunteers, pastors, community organizers, and independent publishers preserve a dated record of the Channel updates they are authorized to view in WhatsApp Web. It is designed for monthly archives, event campaigns, and content-reuse workflows—not generic bulk scraping.

> **Never lose your Channel updates. Archive the posts WhatsApp Web makes available, with dates, media, and a clear report of anything the browser could not load.**

## The pilot workflow

1. Install the unpacked extension in Chrome from `chrome://extensions` with Developer mode enabled.
2. Open [WhatsApp Web](https://web.whatsapp.com/) and open the Channel you want to preserve.
3. Open WA Channel Exporter. The default date range is the current calendar month; adjust it for an event or campaign.
4. Choose **Scan history**. The extension loads older posts incrementally, deduplicates virtualized content, and stops at the requested start boundary or reports a partial result.
5. Download JSONL, a CSV companion, a ZIP archive, or the human-readable archive receipt.

The first validation case is the **Abednego Lomazah** Channel, using an August-to-present date-bounded archive. The extension reads only the WhatsApp Web page that the user explicitly scans. It does not request a WhatsApp password, upload post content, or recover posts that WhatsApp Web has not made available.

## What the archive contains

The ZIP includes `posts.jsonl`, `posts.csv`, `manifest.json`, `README.txt`, and successfully retrieved media. The receipt records the Channel, requested range, observed and included post counts, media counts, scan steps, completion reason, and whether the historical boundary was reached.

A complete boundary is never inferred from a successful button click. If the browser reaches the top before crossing the date boundary, if the scan times out, if the user cancels, or if updates remain unavailable, the archive is labeled partial.

## Local development

```bash
npm install
npm run build
node scripts/test-mv3.js
node scripts/test-browser-fixture.js
```

The build creates `wa-channel-exporter.zip` and a loadable `dist/` directory. In Chrome, select **Load unpacked** and choose `dist/`.

## Product principles

The extension is user-invoked, local-first, transparent about completeness, and conservative with permissions. Users are responsible for having authority to save and reuse the Channel content. Exporting content does not grant republication rights.

## Roadmap

The next pilot milestones are live August-to-present validation, resume-after-interruption, richer date parsing, a printable receipt, and feedback from at least five faith or community Channel operators. Cloud sync, shared workspaces, enterprise compliance, and generic all-WhatsApp export are intentionally deferred until the local archive workflow is reliable.

## License

MIT
