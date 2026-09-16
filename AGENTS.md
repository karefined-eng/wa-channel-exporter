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
