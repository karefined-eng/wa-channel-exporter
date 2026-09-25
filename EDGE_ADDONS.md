# Superseded draft

Use [`docs/STORE-LISTING-COPY.md`](docs/STORE-LISTING-COPY.md) as the canonical Microsoft Edge Add-ons copy for version `1.3.1`. This document is retained as historical submission planning material and may contain stale asset or package references.

# Microsoft Edge Add-ons Store Listing — WA Channel Exporter

> Last Updated: 2026-09-24

## Store Listing Details

**Extension Name** [REQUIRED]
WA Channel Exporter

**Short Description** [REQUIRED] (Max 132 chars)
Export WhatsApp Channel posts and media directly from WhatsApp Web into an organized, offline ZIP archive or formatted PDF.

**Detailed Description** [REQUIRED] (Max 10,000 chars)
The ultimate tool to safely backup and archive the WhatsApp Channels you follow. 

WA Channel Exporter is specifically engineered to read and export the "Updates" feed on WhatsApp Web, allowing you to save posts, videos, images, and voice notes into a clean offline archive or a professional PDF document.

How to use it:
1. Open web.whatsapp.com and click on a Channel.
2. Open the WA Channel Exporter side panel.
3. Select your date range (e.g., "This Month" or "All Loaded") and click Export.
4. Download your clean .zip archive or PDF!

Your ZIP archive includes an Offline HTML Viewer with an authentic dark theme, categorized folders for downloaded media, and CSV/Markdown files for quick spreadsheet analysis or importing into Notion.

Privacy First: 
Zero server uploads, zero logins, and zero telemetry. All processing happens 100% locally directly inside your browser session. We never see your channel data.

Support & Feedback:
If you encounter any issues or have feature requests, please reach out via our support email!

**Search Terms** [RECOMMENDED] (Max 7)
whatsapp, export, archive, channel, pdf, downloader, offline

**Category** [REQUIRED]
Productivity

**Language** [REQUIRED]
English (US)

## Graphics & Assets

| Asset | Dimensions | Status |
|-------|-----------|--------|
| Store Icon | 300x300 PNG | ✅ Prepared (`store-assets/edge-icon-300.png`) |
| Promotional Tile | 440x280 PNG | ✅ Prepared (`store-assets/promo-tile-440x280.png`) |
| Screenshots | 1280x800 or 1920x1080 | ✅ Prepared (`store-assets/screenshot-1-1280x800.png`, `store-assets/screenshot-2-1280x800.png`) |
| Marquee Tile | 1400x560 PNG | ✅ Prepared (`store-assets/marquee-tile-1400x560.png`) |

*Note: Edge requires slightly different asset sizes than Chrome for the main icon, but accepts the same screenshot resolutions. Regenerate the complete set with `npm run prepare:store-assets`.*

## Privacy & Compliance

**Privacy Policy URL**
https://wachannelexporter.me/privacy-policy

**Website URL**
https://wachannelexporter.me/

**Does your product require personal information?**
No.

## Submission Checklist

1. Register as a Microsoft Edge Extension Developer (Requires Microsoft Account).
2. Pay the one-time registration fee (if applicable, though often free for individuals).
3. Upload `wa-channel-exporter.zip` (Edge supports the exact same Manifest V3 `.zip` as Chrome).
4. Fill in the store listing using the text above.
5. Upload the required graphical assets.
6. Submit for review!
