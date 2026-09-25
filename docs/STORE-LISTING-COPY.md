# Store Listing Copy and Release Notes

**Product:** WA Channel Exporter  
**Version:** 1.3.1  
**Platforms:** Chrome Web Store and Microsoft Edge Add-ons  
**Language:** English (US)  
**Category:** Productivity  
**Prepared:** 2026-09-25

This document is the canonical copy source for the `1.3.1` store submissions. The Chrome and Edge packages contain the same extension behavior. Their manifest descriptions differ only because the stores apply different description constraints.

## Chrome Web Store

### Short description

> Export WhatsApp Channel posts and available media from WhatsApp Web into a local, organized ZIP archive.

This summary is **104 characters**, within Chrome's 132-character summary limit.

### Detailed description

> WA Channel Exporter is a local-first browser extension for saving authorized WhatsApp Channel content from WhatsApp Web into a portable archive.
>
> Select a date range, scan the currently loaded Channel feed, and export posts, available media, or both. The extension runs in your browser session and does not upload Channel content to a server.
>
> **Included in each archive**
>
> - An offline HTML viewer with a WhatsApp-style dark theme.
> - Images, videos, audio, and voice notes organized in date-based folders when they are available to WhatsApp Web.
> - Markdown, CSV, and JSONL records for reading, searching, analysis, or import into other tools.
> - A PDF export for a readable document version of the selected posts.
> - A media report that distinguishes downloaded, unavailable, failed, and skipped items.
> - Export metadata and validation results so you can understand the archive's scope and completeness.
>
> **Privacy by design**
>
> Processing happens locally in the browser. The extension does not require a separate login, send messages, modify your WhatsApp account, or upload Channel content to its own server. It requests access only to WhatsApp Web so it can read the Channel feed you choose to export.
>
> **Important limitation**
>
> WhatsApp Web exposes the content loaded in the current session. An export may therefore be partial if older posts or media are not loaded, have expired, or are no longer retrievable. The archive reports these conditions instead of presenting an incomplete export as complete.
>
> WA Channel Exporter is an independent project and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.

### Search terms

`whatsapp`, `export`, `archive`, `channel`, `offline`, `media`, `pdf`

### Release notes — version 1.3.1

> Initial public store release.
>
> - Export posts from WhatsApp Channels by date range or from the currently loaded feed.
> - Save available images, videos, audio, and voice notes into organized ZIP archives.
> - Browse exports in a self-contained offline HTML viewer.
> - Generate Markdown, CSV, JSONL, and PDF representations of exported posts.
> - Report unavailable, failed, skipped, canceled, and partial items clearly in the archive metadata.
> - Process Channel data locally in the browser without an application server or telemetry service.

### Single-purpose statement

> Exports posts and available media from a WhatsApp Channel opened in WhatsApp Web into a local archive selected by the user.

### Privacy disclosure

> The extension reads Channel posts and media exposed by the user's active WhatsApp Web session solely to create the export requested by the user. Exported content is processed locally and written to files selected through the browser download flow. The extension does not sell, advertise against, or transmit Channel content to a third-party server. Settings such as export preferences may be stored locally in the browser.

### Permission justifications

| Permission | Justification |
|---|---|
| `storage` | Stores export preferences and user settings locally so they persist between sessions. |
| `downloads` | Saves the ZIP or PDF export to the user's local file system after the user starts an export. |
| `activeTab` | Allows the extension to interact with the tab the user has explicitly selected for an export action. |
| `scripting` | Starts the user-requested scan and reads the WhatsApp Channel feed in the active WhatsApp Web tab. |
| `sidePanel` | Provides the persistent export interface beside WhatsApp Web. |
| `tabs` | Checks that the selected tab is WhatsApp Web before allowing a scan to start. |
| `https://web.whatsapp.com/*` | Limits content access to WhatsApp Web, where the user selects the Channel to export. |

### Reviewer notes

> To test the extension, open `https://web.whatsapp.com/`, sign in with a test account, open a Channel, and open the WA Channel Exporter side panel. Choose a date range and start a scan. The extension reads only the selected Channel feed and creates a local export. No external account or test credential is required beyond the reviewer's own WhatsApp Web session.
>
> The extension is read-only. It does not send messages, alter Channel content, change account settings, or communicate with an application server. Media that WhatsApp Web no longer exposes is reported as unavailable or failed in the archive rather than silently omitted.

## Microsoft Edge Add-ons

### Short description

> Export WhatsApp Channel posts and available media from WhatsApp Web into a local, organized ZIP archive.

### Detailed description

> WA Channel Exporter is a local-first, read-only extension for exporting authorized WhatsApp Channel posts and available media from WhatsApp Web.
>
> Open a Channel, choose a date range, and use the side panel to scan the content currently available in your WhatsApp Web session. Export posts, media, or both into a portable ZIP archive. The extension also creates a PDF document when a formatted document export is useful.
>
> **Archive contents**
>
> - A self-contained offline HTML viewer with a WhatsApp-style dark theme.
> - Date-organized folders for downloaded images, videos, audio, and voice notes.
> - Markdown, CSV, and JSONL records for reading, searching, analysis, or import into other tools.
> - A PDF representation of the selected posts.
> - `media-report.json` with per-item downloaded, unavailable, failed, or skipped statuses.
> - Export metadata and validation results describing the selected Channel, date range, counts, and completeness.
>
> **Local processing and privacy**
>
> The extension processes the export in the browser. It does not require a separate login, send messages, modify the user's WhatsApp account, or upload Channel content to an application server. Access is limited to WhatsApp Web so the extension can read the Channel feed selected by the user.
>
> **Availability limitation**
>
> WhatsApp Web only exposes content loaded in the current session. Older posts or media may be unavailable, expired, or affected by platform behavior. WA Channel Exporter records these conditions in the archive and does not claim that an export is complete when the source content was not available.
>
> WA Channel Exporter is an independent project and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.

### Search terms

`whatsapp`, `export`, `archive`, `channel`, `offline`, `media`, `pdf`

### Release notes — version 1.3.1

> Initial public store release.
>
> - Export WhatsApp Channel posts from the loaded feed with a selected date range.
> - Download available image, video, audio, and voice-note media into date-organized folders.
> - Open archives in a self-contained offline viewer.
> - Produce Markdown, CSV, JSONL, and PDF output.
> - Include explicit completeness and media-status reports for unavailable or failed items.
> - Keep export processing local to the browser without an application server or telemetry service.

### Single-purpose description

> Exports posts and available media from a WhatsApp Channel opened in WhatsApp Web into a local archive selected by the user.

### Permission and privacy text

Use the same permission justifications and privacy disclosure provided in the Chrome section. In Partner Center, select **No** for remote code: all extension logic is packaged locally, and no remotely hosted JavaScript is loaded or executed.

### Reviewer notes

> To test the extension, open `https://web.whatsapp.com/`, sign in with a test account, open a Channel, and open the WA Channel Exporter side panel. Choose a date range and start a scan. The extension reads only the selected Channel feed and creates a local export. No external account or test credential is required beyond the reviewer's own WhatsApp Web session.
>
> The extension is read-only. It does not send messages, alter Channel content, change account settings, or communicate with an application server. Media that WhatsApp Web no longer exposes is reported as unavailable or failed in the archive rather than silently omitted.

## Shared listing fields

| Field | Value |
|---|---|
| Extension name | WA Channel Exporter |
| Version | 1.3.1 |
| Category | Productivity |
| Primary language | English (US) |
| Website | https://wachannelexporter.me/ |
| Privacy policy | https://wachannelexporter.me/privacy-policy |
| Support page | https://wachannelexporter.me/support |
| Support email | support@wachannelexporter.com |
| Package for Chrome | `wa-channel-exporter-chrome.zip` |
| Package for Edge | `wa-channel-exporter-edge.zip` |

## Accuracy notes for submission

The copy intentionally says **available media** and **currently loaded feed**. These qualifiers are important because WhatsApp Web can omit older posts or expire media. Do not replace them with claims of guaranteed complete historical backup.

The copy also describes the extension as **independent** and does not use WhatsApp or Meta branding to imply endorsement. Keep the privacy-policy URL, permission justifications, and dashboard data-use declarations synchronized with this document before submission.

## References

[1]: https://developer.chrome.com/docs/webstore/best-listing "Chrome Web Store listing guidance"

[2]: https://developer.chrome.com/docs/webstore/program-policies/policies "Chrome Web Store Developer Program Policies"

[3]: https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension "Publish an extension to Microsoft Edge Add-ons"

[4]: https://wachannelexporter.me/privacy-policy "WA Channel Exporter Privacy Policy"
