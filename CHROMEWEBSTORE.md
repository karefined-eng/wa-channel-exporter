# Chrome Web Store Listing — WA Channel Exporter

> Last Updated: 2026-09-17

## Store Listing

**Extension Name** [REQUIRED]
WA Channel Exporter

**Short Description** [REQUIRED]
Export and archive WhatsApp Channel posts and media directly from WhatsApp Web into an organized, offline ZIP archive.

**Detailed Description** [REQUIRED]
The ultimate tool to safely backup and archive the WhatsApp Channels you follow. 

WA Channel Exporter is specifically engineered to scrape and parse the "Updates" feed on WhatsApp Web, allowing you to instantly extract thousands of posts, videos, images, and voice notes into a clean offline archive. 

How to use it:
1. Open web.whatsapp.com and click on a Channel.
2. Open the WA Channel Exporter side panel.
3. Select your date range (e.g., "This Month" or "All Loaded") and click Export.
4. Download your clean .zip archive!

Your archive includes an Offline HTML Viewer with an authentic dark theme, categorized folders for downloaded media, and CSV/Markdown files for quick spreadsheet analysis or importing into Notion.

Privacy First: 
Zero server uploads, zero logins, and zero telemetry. All processing happens 100% locally directly inside your browser session. We never see your channel data.

Support & Feedback:
If you encounter any issues or have feature requests, please reach out via our support email!

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Exports posts and media from WhatsApp Channels into a local ZIP archive.

**Primary Language** [REQUIRED]
English


## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `src/assets/icons/icon128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 4 | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 5 | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Show the extension Side Panel open alongside a WhatsApp Channel on WhatsApp Web, demonstrating the UI.
- **Screenshot 2**: Show the progress bar as the extension scrolls through and extracts channel messages.
- **Screenshot 3**: Show the resulting `.zip` file and the beautiful Offline HTML Viewer in action.


## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| storage | permissions | Required to save the user's export configuration preferences, date range selections, and settings between sessions. |
| downloads | permissions | Required to trigger the download of the final generated .zip archive to the user's local file system. |
| activeTab | permissions | Required to temporarily grant access to the current WhatsApp Web tab only when the user explicitly clicks the extension action icon. |
| scripting | permissions | Required to execute the data extraction scripts that safely read the DOM of the WhatsApp Channel feed. |
| sidePanel | permissions | Required to open and manage the extension's user interface within the browser's side panel for a persistent scraping experience. |
| tabs | permissions | Required to verify that the active tab is actually WhatsApp Web (web.whatsapp.com) before allowing the user to initiate an export. |
| https://web.whatsapp.com/* | host_permissions | Required to read the HTML structure of the WhatsApp Web channel updates feed in order to extract the text and media links for the archive. |


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [RECOMMENDED]
https://wachannelexporter.me/privacy-policy


## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free


## Developer Info

**Publisher Name** [REQUIRED]
[Your Name/Company]

**Contact Email** [REQUIRED]
[Your Email]

**Support URL / Email** [RECOMMENDED]
https://wachannelexporter.me/support
support@wachannelexporter.com

**Homepage URL** [RECOMMENDED]
https://wachannelexporter.me/


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.3.1 | 2026-09-17 | Initial Store Submission | Draft |


## Review Notes

### Known Issues / Limitations
- The extension only works on the "Channels" view, not standard 1-on-1 chats.
- WhatsApp Web only exposes content that has loaded in the current session, so historical completeness is not guaranteed.
- WhatsApp sometimes rate-limits, expires, or unloads old media, which might affect deep historical scans.
- The extension is read-only and does not guarantee immunity from WhatsApp or Meta platform enforcement.
- WA Channel Exporter is an independent project and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.

### Rejection History
None yet.
