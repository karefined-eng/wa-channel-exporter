# Contributing to WA Channel Exporter

Thank you for taking the time to contribute! This project is built by a small team and every contribution — bug fixes, translations, documentation, new features — genuinely matters.

## How to Contribute

### Reporting Bugs
Please open a [Bug Report](https://github.com/karefined-eng/whatsapp-channel-exporter/issues/new?template=bug_report.md) issue and include:
- Which Chrome version and OS you are using.
- The exact WhatsApp Channel you were trying to export (or a description of it).
- What you expected to happen vs what actually happened.
- Any error messages from the browser console (`F12 > Console`).

### Suggesting Features
Open a [Feature Request](https://github.com/karefined-eng/whatsapp-channel-exporter/issues/new?template=feature_request.md) issue. Please explain:
- The use case (who benefits and why).
- Whether you'd be willing to help implement it.

### Submitting Code
1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes and run the test suite: `npm run test` (or `npm run build` to verify compilation).
4. Commit with a conventional commit message: `feat: add X`, `fix: correct Y`, `docs: update Z`.
5. Open a Pull Request with a clear description of what you changed and why.

### Translating the Extension
WhatsApp Channels are huge in India, Brazil, Nigeria, and across Europe. If you can translate the extension UI into Spanish, Portuguese, Hindi, Arabic, or any other language, please open an issue labeled `i18n`.

## Project Structure

```
wa-channel-exporter/
├── src/
│   ├── content/           # Content scripts (runs inside WhatsApp Web)
│   ├── core/              # Core export logic (ZIP, CSV, PDF, Markdown)
│   └── popup/             # Extension side-panel UI
├── website/               # Public-facing landing page (Vite)
├── docs/                  # Project documentation and research
├── scripts/               # Build and test utilities
└── manifest.json          # Chrome Manifest V3 configuration
```

## Code Style
- Plain JavaScript (no framework in the extension core).
- Follow the existing `eslint` config (`.eslintrc.json`).
- Prioritize **local-first processing**. Zero data should leave the user's machine.

## Privacy Principle (Non-Negotiable)
All data processing must happen 100% locally in the user's browser. Any PR that introduces a server-side call, telemetry, or data upload will not be merged.
