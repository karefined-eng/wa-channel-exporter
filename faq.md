# FAQ: Frequently Asked Questions

## What does WA Channel Exporter do?
WA Channel Exporter is a Chrome extension that saves the content of WhatsApp Channels you follow. It captures text updates, images, videos, and voice notes visible in the WhatsApp Web "Updates" feed and packages them into a portable ZIP archive, an offline HTML viewer, a CSV spreadsheet, or a formatted PDF document.

## Does WA Channel Exporter upload any data to external servers?
No. All processing happens 100% locally inside your browser session. Your WhatsApp content, phone number, and account information are never transmitted to any server. You can verify this by inspecting the source code in this repository.

## Why can't I use the standard "Export Chat" feature on a WhatsApp Channel?
WhatsApp's built-in "Export Chat" button only works for individual chats and standard group conversations. It is not available for WhatsApp Channels (the broadcast "Updates" feed). WA Channel Exporter was built specifically to solve this problem.

## Does this work on all WhatsApp Channels?
It works on any Channel visible in the "Updates" tab of WhatsApp Web. The extension scrapes what WhatsApp Web has loaded into your browser. WhatsApp may not load older posts automatically — in that case, scroll up to load more content before starting the export. Posts not loaded by WhatsApp Web cannot be captured.

## Why are some images or videos missing from my export?
WhatsApp's media links expire after a short time. If you initiate an export after the media link has expired, the binary content will no longer be downloadable. Additionally, WhatsApp Web may not have loaded all media into the DOM yet — scrolling the channel fully before exporting improves completeness. The `manifest.json` in your archive reports exactly which items failed.

## Can it export channels I don't follow?
No. You must follow the channel and have it open in WhatsApp Web for the extension to read it. WA Channel Exporter cannot access content you are not authorized to view.

## What format does the export come in?
By default, your export is a `.zip` file containing:
- `index.html` — an offline viewer with a WhatsApp-style dark theme.
- `posts.csv` — for spreadsheet analysis in Excel/Sheets.
- `posts.md` — a Markdown archive with inline image embeds.
- `posts.jsonl` — structured JSON for developers and AI pipelines.
- `media/` — retrieved photos, videos, and audio organized by date.
- `manifest.json` — an audit file reporting completeness and any gaps.

You can also choose the **PDF** export mode to generate a standalone formatted document.

## Can I use this for legal, compliance, or journalistic purposes?
WA Channel Exporter is designed to create honest, timestamped archives of publicly broadcast channel content. The `manifest.json` clearly reports what was captured and what was missed. For formal legal proceedings, consult your legal team regarding chain-of-custody requirements.

## Is this against WhatsApp's Terms of Service?
Consult WhatsApp's current Terms of Service. WA Channel Exporter does not modify WhatsApp's systems, bypass authentication, or access content you are not authorized to view. It acts as a local browser automation tool that reads the page you are already viewing.

## Does it work on Firefox, Edge, or other browsers?
Currently, the extension is packaged for Chromium-based browsers (Google Chrome, Microsoft Edge, Brave, Opera). Firefox support is on the roadmap.

## How do I report a bug or request a feature?
Please open an issue on GitHub using the provided templates:
- [Report a bug](https://github.com/karefined-eng/whatsapp-channel-exporter/issues/new?template=bug_report.md)
- [Request a feature](https://github.com/karefined-eng/whatsapp-channel-exporter/issues/new?template=feature_request.md)
