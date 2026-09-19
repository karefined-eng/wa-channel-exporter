# Project Guidelines & Agent Instructions (`AGENTS.md`)

## 1. Release Readiness & Quality Guardrails
- **Never push to release solely based on synthetic/unit tests when live integration is pending.**
  - When the user asks to "ship today" or publish a release, differentiate between *syntactic readiness* (builds compile, tests pass, linter is clean) and *functional completeness* (live browser verification on realistic workloads).
  - Explicitly ask or verify if live data extraction and real user smoke tests have succeeded on actual, authentic targets before drafting release tags or publication steps.

## 2. Chrome Extension Architecture & IPC Invariants
- **Message Boundary Serialization:**
  - `chrome.runtime.sendMessage` and `chrome.tabs.sendMessage` serialize payloads using JSON. `ArrayBuffer` and `Blob` instances lose their data and degrade to empty objects (`{}`) across this boundary.
  - Always transfer binary assets as Base64 strings (or chunked Base64) with explicit MIME metadata across extension messaging boundaries, then rehydrate them at the destination.
- **Media Link Classification:**
  - When scanning web messaging pages (e.g., WhatsApp Web), strictly distinguish between actual attachment media (`<img>`, `<video>`, direct media URLs) and external article links (`<a href="https://...">`) to prevent cross-origin fetch failures and Content Security Policy (CSP) violations.
- **Side Panel Responsiveness:**
  - The side panel container width is user-resizable. Extension pages configured for both popup and side panel must use fluid styling (`min-width: 320px`, `max-width: 100%`) rather than fixed viewport dimensions.

## 3. Universal Visual Design (Eleviewer Aesthetic)
- **Iconography:** Use custom inline SVG logos with a rounded dark container (`#1c1c1c` with a subtle border) and animated `plus-lighter` sweep/glow gradients for a dynamic, premium feel. Avoid standard text-in-circle avatars.
- **Navbar & Components:** Minimal clutter. Navigation links should be clean and muted, transitioning to primary text on hover. Include a primary solid CTA button with hover effects and explicit external icons for links like GitHub. Do not use decorative "online" tags.
- **Typography & Layout:** Headings should use `font-semibold` and `tracking-tight` (`-0.02em`). Body text is `text-pretty` and muted. For tags and small labels, use `font-mono text-xs uppercase tracking-widest`.
- **Glassmorphism:** Use deep dark backgrounds with subtle borders and `backdrop-filter: blur(16px)` instead of heavy box-shadows. Use radial-gradient hover spotlights for interactive card grids.

## 4. Environment Traps
- **Vercel Build Environment & Node 18:**
  - Vercel deployments often default to Node 18 environments. `import.meta.dirname` was introduced in Node.js v20.11.0.
  - **Trap:** Using `import.meta.dirname` in configuration files (like `vite.config.js`) will cause Vercel builds to fail silently or with `TypeError [ERR_INVALID_ARG_TYPE]` since it resolves to `undefined`.
  - **Workaround:** Always use `const __dirname = dirname(fileURLToPath(import.meta.url));` with `import { fileURLToPath } from 'url'; import { dirname } from 'path';` for ES modules instead.
- **Windows PowerShell Command Chaining:**
  - **Trap:** Using `&&` in Windows PowerShell (5.1) results in `The token '&&' is not a valid statement separator`.
  - **Workaround:** Use `;` to sequence commands in PowerShell.
- **Dual Lockfile Dependabot Synchronization:**
  - When both `package-lock.json` and `pnpm-lock.yaml` are present in the repository, Dependabot inspects both.
  - Running `npm audit fix --package-lock-only` avoids Puppeteer postinstall download errors and file-lock EPERM issues while safely patching `package-lock.json`.
  - If Dependabot continues to flag high-severity vulnerabilities, run `pnpm up <vulnerable-package> -r` to sync the pnpm lockfile as well.

