# WA Channel Exporter — Research-Only Implementation Brief

**Author:** Manus AI  
**Research date:** 25 August 2026  
**Repository:** `karefined-eng/wa-channel-exporter`  
**Status:** Research gate; implementation changes are intentionally paused.

## Executive decision

The current repository is **not ready to promise “download all assets from 1 August until now.”** It is a prototype with a narrow DOM snapshot collector, a popup-to-content-script connection fallback, JSONL generation, and a best-effort ZIP routine. It does not yet prove historical completeness, date-range correctness, media fidelity, resumability, duplicate prevention, or reliable handling of unavailable WhatsApp updates.

The recommended product is a **user-invoked, local-first Channel archive assistant**. Its core promise should be: “Export the Channel posts and media that WhatsApp Web has made available to your browser, with an explicit completeness report.” It should not promise server-side recovery, all historical content, or media that WhatsApp Web has not loaded or that is no longer retrievable.

Chrome’s platform supports the proposed architecture: content scripts can read the page DOM and communicate with the extension; `chrome.scripting.executeScript()` can inject a runtime collector when the user invokes the extension, provided the extension declares `scripting` plus `activeTab` or suitable host permissions [1] [2]. However, Manifest V3 service workers are ephemeral, so a large export cannot depend on one long-running worker or global in-memory state [3].

The first release gate is therefore **not feature count**. It is trustworthy completeness: the user must know the date window requested, how many posts were observed, how many were excluded, which media succeeded, which failed, why they failed, and where all local files were written.

## Scope and assumptions

The intended user is an individual or small team who is already authorized to view a WhatsApp Channel in WhatsApp Web and wants a portable local archive for personal reference, research, communications history, or internal records. The product is not intended to bypass login, recover deleted content, access private material without authorization, automate posting, or operate as a background scraper.

The supported environment for the MVP is Google Chrome with Manifest V3 and `https://web.whatsapp.com/`. The user explicitly invokes the extension while the target Channel is open. The product may inspect only content rendered or made available to that authorized browser session. The requested August-to-present use case is treated as a date-bounded export requirement, not as evidence that WhatsApp Web exposes a complete historical API.

The research brief assumes that content may contain personal information, campaign material, photographs, video, documents, and copyrighted works. Technical feasibility does not establish a right to copy, retain, redistribute, or republish that content. WhatsApp’s Terms of Service place responsibility on users for their actions, information, and content and discuss third-party intellectual-property infringement [4]. Chrome’s user-data policy requires disclosure of handling even when data is processed or stored locally [5].

## Evidence table

| ID | Classification | Evidence | Decision supported |
|---|---|---|---|
| E1 | Verified fact | Chrome states that content scripts run in web-page context, can read the DOM, and communicate with the parent extension [1]. | DOM capture is technically viable, but depends on page structure and lifecycle. |
| E2 | Verified fact | Chrome states that `chrome.scripting` requires the `scripting` permission plus host permissions or `activeTab`; runtime functions can be passed to `executeScript()` [2]. | A user-invoked fallback collector is compatible with MV3. |
| E3 | Verified fact | Chrome service workers may terminate after inactivity, a long request, or a slow fetch; global variables are lost and state should be persisted [3]. | Large exports require resumable state and must not rely on one worker lifetime. |
| E4 | Verified fact | Chrome requires the `downloads` permission for the downloads API [6]. | Download initiation must be declared and tested separately from archive creation. |
| E5 | Verified fact | Chrome documents asynchronous messaging with literal `return true` for `sendResponse` compatibility [7]. | Every request-response path needs timeout and disconnected-receiver handling. |
| E6 | Verified fact | Chrome recommends least privilege and explains that permissions and host patterns can trigger warnings; optional permissions should be considered [8]. | Keep the permission set narrow and explain it in onboarding and store metadata. |
| E7 | Verified fact | Chrome Web Store policy requires disclosure of user-data handling and a privacy policy even for local-only processing [5]. | A public privacy policy is a publication blocker, not a later enhancement. |
| E8 | Verified fact | WhatsApp’s official Terms page identifies responsibility for user content and discusses third-party intellectual-property infringement [4]. | Add rights-responsibility language and legal review before public distribution. |
| E9 | Observed behavior | In the user-authorized My Browser session on 25 August 2026, WhatsApp Web loaded the Channel “ABEDNEGO LOMAZAH, EVERLASTING...” with 8.5K followers and rendered posts including 18 August 2026 through 25 August 2026. | The current UI can expose Channel posts, but this observation is not proof of full history. |
| E10 | Observed behavior | The same session showed updates that “couldn’t load” and required opening the message on the phone; some posts showed media durations and reaction counts, while not every update was available. | The exporter must report unavailable content and cannot claim media completeness. |
| E11 | Observed behavior | The first prototype test produced “Could not establish connection. Receiving end does not exist.” because the popup could not reach a registered content script in the already-open tab. | Receiver absence must be a normal recoverable state with injection fallback and diagnostic messaging. |
| E12 | Market observation | A representative Chrome Web Store competitor advertises 10,000 users, media/document types, ZIP, deep scan, date filtering in PRO, cancellation, smart filenames, local processing, and minimal permissions [9]. | Buyers expect date filters, cancellation, deep history, filenames, ZIP, and clear privacy claims. |
| E13 | Open question | WhatsApp’s Help Center export article was reachable but returned no detailed body text in the research browser extraction [10]. | Native export capabilities and Channel-specific differences require manual verification before relying on them. |

## Findings by research stream

### WhatsApp Web and Channel behavior

The live observation confirms that a Channel can be opened in WhatsApp Web and that visible posts can contain text, timestamps, reactions, links, media indicators, and unavailable-update messages. The current prototype’s use of selectors such as `[data-testid="msg-container"]` is fragile. WhatsApp can change test IDs, class names, nesting, virtualization, and the representation of media without notice. A production collector needs selector telemetry, a DOM diagnostics mode, and a fixture suite captured from multiple Channel states.

The current “scan” is a snapshot. It does not scroll, paginate, wait for older messages, detect whether the top of the requested date range has been reached, or establish that all posts in a date interval were loaded. For an August-to-present export, the product must run a controlled load loop, record the earliest and latest observed post dates, deduplicate posts across viewport changes, and stop only when a boundary condition is satisfied or the user explicitly stops.

A date boundary cannot be inferred safely from a human-readable string alone. The collector should normalize dates into a machine-readable representation where WhatsApp exposes one, retain the raw displayed label, and mark ambiguous dates as unresolved. It should use the user’s locale and timezone explicitly. If a post has no parseable date, it remains in the archive with `dateStatus: "unknown"` and is excluded from a date-filtered export unless the user chooses an explicit inclusion policy.

### Chrome Manifest V3 architecture

The current manifest is directionally appropriate but not yet publication-ready. It declares a static content script for WhatsApp Web, `activeTab`, `scripting`, `downloads`, and `storage`. The fallback injection is consistent with Chrome’s documented `executeScript()` model [2]. The extension should still handle the state where the static content script is not present, the tab has been refreshed, the extension was reloaded, the page is not WhatsApp Web, the active tab changed, or the user invokes the popup while WhatsApp is still loading.

The service worker only brokers downloads. That is a reasonable small role, but the current implementation treats archive generation as a popup responsibility and passes a blob URL to the service worker. This needs explicit compatibility testing. It also assumes that a single download callback is enough to declare success. The final product should monitor `chrome.downloads` state or provide a verifiable archive receipt and should never revoke an object URL before Chrome has safely consumed it without testing that behavior across supported Chrome versions.

The service worker must remain event-driven and stateless between events. If resumable jobs are introduced, persist job metadata in `chrome.storage.local` or IndexedDB and keep the content capture session in the page or an extension UI that remains active. Do not use global worker variables as the source of truth [3].

### Export and media-retrieval architecture

The current JSONL schema is not sufficient for an auditable archive. It does not distinguish observed, selected, skipped, unavailable, and failed media. It stores raw date labels but no normalized date or timezone. It uses fallback positional IDs that can change across scans. It does not include a deterministic content hash, archive job ID, capture sequence, retrieval status, MIME type, byte count, or error code.

The recommended schema is versioned and explicit:

```json
{
  "schemaVersion": 2,
  "postId": "stable-or-derived-id",
  "channel": { "name": "...", "identifier": "..." },
  "publishedAt": { "raw": "...", "iso": "...", "timezone": "...", "status": "parsed|unknown" },
  "text": "...",
  "edited": false,
  "forwarded": false,
  "media": [{
    "mediaId": "...",
    "type": "image|video|audio|document|unknown",
    "sourceUrlPresent": true,
    "filename": "...",
    "mime": "...",
    "bytes": 0,
    "sha256": "...",
    "status": "downloaded|unavailable|failed|skipped",
    "errorCode": null
  }],
  "capture": { "observedAt": "...", "source": "WhatsApp Web", "sequence": 1 }
}
```

Media URLs may be blob URLs, credential-bound URLs, expired URLs, or references that only work in the page context. The exporter must test media retrieval in the context where the URL is valid, preserve the original reference only when it is safe and useful, and report partial results. ZIP creation must not silently discard failed media. A `manifest.json` should state counts for posts observed, posts included, posts excluded, media observed, media downloaded, media unavailable, and media failed.

The current ZIP routine has a critical architectural risk: it performs sequential network fetches inside the popup, has no progress reporting, catches all media errors without recording them, and may exceed UI or fetch time constraints for large archives. A production design should stream or chunk work, cap concurrency, persist progress, support cancellation, and generate a partial-but-auditable archive when needed.

### Privacy, rights, and compliance

The extension’s intended local-first behavior reduces transmission risk but does not eliminate data handling obligations. The Chrome Web Store policy explicitly requires disclosure for local processing [5]. Before publication, provide a privacy policy that names the data categories read from WhatsApp Web, states that processing and output are local by default, explains whether telemetry exists, describes temporary memory and local file retention, and provides a deletion/support contact.

Do not collect analytics containing post text, media, phone numbers, channel identifiers, or raw DOM unless the user explicitly opts into a narrowly defined diagnostic flow. If diagnostics are exported, redact content by default. The permission explanation should say that access is limited to WhatsApp Web because the extension needs to read the currently open Channel and create a local archive.

The UI should state that users are responsible for having authority to save and use content, and that exporting content does not grant republication rights. This is product risk language, not jurisdiction-specific legal advice. A qualified reviewer should assess applicable law, copyright, privacy, employment, election, and records-retention requirements for the intended market.

### Competitors and demand

Generic WhatsApp downloaders already advertise the features users will compare against: date ranges, deep scans, media/document coverage, ZIP output, cancellation, filename controls, local processing, and a free-versus-paid boundary [9]. Competing on “download media” alone is unlikely to create a durable position. The differentiator should be a **Channel archive with evidence of completeness**: date-window control, post/media status, deterministic manifests, deduplication, resumability, and clear privacy.

The initial buyer-facing message should avoid unsupported “all history” language. A stronger claim is: “Create an auditable local archive of the Channel posts WhatsApp Web makes available, with clear missing-item reporting.” Before pricing, interview or observe at least five users across researchers, student organizations, publishers, campaign/communications teams, and personal archivists. Measure time-to-first-success, acceptable missing-item rate, willingness to pay for date filters and resumability, and whether JSONL is understandable to the target user.

## Current-state reproduction

The repository began as a four-file skeleton containing a minimal README, manifest, package metadata, and lockfile. The implementation added afterward contains popup UI, a content collector, a background download broker, an exporter module, and a build script. The package builds and the manifest parses, but these are static checks rather than proof of live correctness.

The live user test on 25 August 2026 established the following: the user’s authenticated WhatsApp Web session could open Channels; searching for “Abednego Lomazah” found “ABEDNEGO LOMAZAH, EVERLASTING...” with 8.5K followers; the open Channel displayed posts from at least 18 August 2026 through the current date; some updates were unavailable in WhatsApp Web; and the initial extension run failed because the popup could not reach a content-script receiver. A fallback injection was then added, but it has not yet been validated in the user’s reloaded extension.

## Data-flow and threat model

| Component | Data handled | Primary risk | Required control |
|---|---|---|---|
| WhatsApp Web page | Rendered post text, dates, media references, channel identity | Over-collection; DOM changes; user-visible content exposure | User invocation, narrow host match, diagnostics, no hidden background capture |
| Content script or injected function | DOM snapshot and normalized records | Capture of unrelated page content; unstable selectors | Verify active Channel identity; bounded selectors; schema validation |
| Popup | Scan state, records, archive progress | UI close or memory pressure; incomplete job | Progress, cancel, persisted job metadata, explicit incomplete state |
| Service worker | Download requests and status | Worker termination; object URL timing | Event-driven handlers, no global state, download status checks |
| Local archive | Post text, media, manifest | Unauthorized access or sharing | Clear file naming, user-controlled save dialog, privacy notice |
| Optional diagnostics | DOM structure and errors | Sensitive content leakage | Redaction, opt-in, local-only export by default |
| Remote services | None in MVP | Accidental transmission | No analytics or upload endpoints; network audit in release testing |

Threats to address include a malicious page attempting to message the extension, a compromised dependency, a user accidentally scanning the wrong tab, content from a different chat being captured, a ZIP containing misleading filenames, stale media URLs, sensitive archive leakage, and a future “cloud sync” feature expanding the data boundary without a policy update.

## Detailed technical requirements matrix

Priority meanings: **P0** blocks a trustworthy MVP; **P1** is required for a strong public release; **P2** is a deliberate follow-on.

| ID | Priority | Requirement | Evidence or rationale | Acceptance criteria | MV3 impact |
|---|---:|---|---|---|---|
| R-001 | P0 | Restrict execution and capture to `https://web.whatsapp.com/*` and the user-invoked active tab. | Current manifest and Chrome permission guidance [2] [8]. | Unsupported URLs produce a clear message; no DOM is read; active-tab invocation works after reload. | `content_scripts.matches`, `host_permissions`, `activeTab`, `scripting`. |
| R-002 | P0 | Detect the current Channel identity before capture. | Prevents exporting the wrong chat or a stale tab. | Export is blocked unless the page presents a Channel-like identity and the displayed name is stored in the manifest. | Content script and injected function only. |
| R-003 | P0 | Make missing receivers recoverable. | Live failure E11. | On “Receiving end does not exist,” inject a self-contained collector, retry once, and show actionable failure if injection is denied. | `scripting`, `activeTab`, messaging. |
| R-004 | P0 | Define a versioned post/media schema. | Current schema lacks status and normalized date fields. | Every record validates against schema v2; invalid records are rejected with diagnostics, not silently emitted. | No extra permission. |
| R-005 | P0 | Capture only posts currently loaded or explicitly loaded by the controlled scan. | WhatsApp Web behavior E9/E10; no API completeness proof. | UI states “loaded/observed,” never “all,” unless a completeness condition is met. | Content script, popup state. |
| R-006 | P0 | Implement upward history loading with a stop condition. | August-to-present request requires date-bound traversal. | Given a fixture or live test with older posts, scan stops at the requested start boundary or reports boundary not reached. | DOM interaction; no new permission. |
| R-007 | P0 | Normalize dates with timezone and raw-label preservation. | Human labels are ambiguous. | Date-filter inclusion is deterministic; ambiguous dates are visibly marked and handled by documented policy. | No extra permission. |
| R-008 | P0 | Deduplicate posts across repeated DOM observations. | Virtualized/scrolling UIs can expose the same post repeatedly. | Repeated scans produce one record per stable post; fallback IDs are marked derived and not treated as globally stable. | Storage recommended for resumable state. |
| R-009 | P0 | Record post and media retrieval status. | Current ZIP silently discards failed media. | Manifest counts downloaded, unavailable, failed, skipped, and observed items; each failure has a code. | No extra permission. |
| R-010 | P0 | Make partial exports auditable. | Some WhatsApp updates were unavailable in live test. | ZIP remains readable when media fails and includes a report listing failures and reasons. | `downloads` only for final file. |
| R-011 | P0 | Handle extension reload, tab refresh, and service-worker restart. | MV3 lifecycle [3]. | No stale global state; in-progress or interrupted jobs recover or clearly reset. | `storage` or IndexedDB. |
| R-012 | P0 | Make messaging asynchronous and timeout-safe. | Chrome messaging rules [7]. | Every request resolves, rejects, or times out; literal `return true` is used where callback response is asynchronous. | Runtime messaging. |
| R-013 | P0 | Test archive download completion, not only initiation. | Downloads API [6]. | UI distinguishes queued, complete, interrupted, and failed states. | `downloads`; optional `downloads.onChanged`. |
| R-014 | P0 | Ensure no remote transmission in MVP. | Local-first product and privacy policy requirements [5]. | Network audit finds no product endpoint or analytics call; media retrieval is limited to required WhatsApp resources. | Host/network review. |
| R-015 | P1 | Add scan progress and cancellation. | Competitor expectation [9] and large-export risk. | User sees posts scanned, media processed, failures, and a working cancel action. | Popup or extension page; persisted state. |
| R-016 | P1 | Add date-range filters in UI. | Competitor expectation [9] and user request. | Start/end dates are required for bounded exports; summary shows observed versus included counts. | No new permission. |
| R-017 | P1 | Add media-type filters and filename/MIME preservation. | Market benchmark [9]; current filename logic is weak. | User can select images/video/audio/documents; names use safe deterministic paths and retain MIME evidence. | No new permission. |
| R-018 | P1 | Support resumable and incremental exports. | MV3 worker lifecycle [3] and large archives. | Interrupted jobs resume without duplicate files; prior archive or local index can be selected. | `storage`/IndexedDB. |
| R-019 | P1 | Publish a privacy policy and data-use disclosure. | Chrome policy [5]. | Store listing and onboarding link to an accurate, reachable policy. | No API impact. |
| R-020 | P1 | Add a diagnostic report without content by default. | Selector volatility and live connection failure. | Report version, URL class, selector counts, permissions, and errors while redacting post text/media. | No new permission. |
| R-021 | P1 | Add automated unit tests for normalization and archive manifest. | Current package has no test script. | CI validates schema, dates, deduplication, safe filenames, partial media statuses, and ZIP contents. | No MV3 permission. |
| R-022 | P1 | Add live fixture tests for multiple WhatsApp Channel DOM states. | DOM is implementation-dependent and volatile. | Fixtures cover text, media, forwarded, edited, reaction-only, unavailable, and virtualized states. | No permission. |
| R-023 | P1 | Add dependency and supply-chain review. | ZIP library and packaged source are release inputs. | Lockfile is audited; only required production files enter ZIP; no unused remote code. | CSP/build review. |
| R-024 | P2 | Offer CSV/HTML adapters for non-technical users. | JSONL is excellent for data but not universal. | Export is derived from schema v2 and preserves status fields. | No new permission. |
| R-025 | P2 | Offer optional scheduled exports only after local reliability is proven. | Background automation increases terms, privacy, lifecycle, and support risk. | Requires explicit user consent, persisted state, visible schedule, and policy review. | `alarms` and stronger lifecycle testing. |

## Manifest V3 compliance checklist

| Area | Current assessment | Required action before release |
|---|---|---|
| `manifest_version` | Correctly set to 3. | Keep at 3 and pin the supported minimum Chrome version if version-dependent behavior is used. |
| Service worker | Present and event-driven in the current prototype. | Remove any future global job state; test termination and restart. |
| Content scripts | Static WhatsApp Web content script plus injected fallback. | Keep fallback self-contained; add diagnostics for registration and injection state. |
| `activeTab` | Declared. | Verify the user gesture is the extension action/popup invocation and that access is not assumed after the gesture expires. |
| `scripting` | Declared and used for fallback injection. | Test main-frame injection, refreshed tabs, and denied/unsupported pages. |
| `host_permissions` | Scoped to WhatsApp Web. | Keep narrow; re-evaluate whether static host permission can be removed in favor of user-invoked activeTab injection. |
| `downloads` | Declared. | Add completion monitoring and interrupted-download UI. |
| `storage` | Declared but currently underused. | Use for job metadata only; do not store raw post content unless explicitly required and disclosed. |
| Messaging | Popup, content script, and worker use one-time messages. | Use literal `return true` for async callbacks, sender timeout, receiver validation, and duplicate-response guards [7]. |
| CSP and remote code | Current package uses local JS and a vendored ZIP library. | Ensure no remote script loading, `eval`, or dynamically fetched executable code. |
| Web-accessible resources | Declared for broad source paths. | Reduce or remove unnecessary web-accessible resources; content scripts do not need all source modules exposed to page origins. |
| Permissions UX | Narrow but not yet explained in product language. | Explain each permission and link privacy policy in onboarding/store listing. |
| Store data policy | Not yet supplied. | Complete data-use disclosure and publish hosted privacy policy [5]. |

## Risk register

| Risk | Likelihood | Impact | Mitigation | Release status |
|---|---:|---:|---|---|
| WhatsApp changes DOM selectors or message structure | High | High | Semantic selectors, fixtures, diagnostics, versioned adapters, smoke tests | Open; P0 |
| Historical posts are not loaded or cannot be paginated reliably | High | High | Controlled load loop, explicit boundary state, observed/included counts, no “all history” claim | Open; P0 |
| Media URLs are blob, credential-bound, expired, or unavailable | High | High | Retrieve in valid context, classify failures, partial manifest, retry policy | Open; P0 |
| Duplicate records across virtualization/scrolling | High | Medium | Stable IDs where available, normalized fingerprints, deterministic deduplication | Open; P0 |
| User scans wrong tab or wrong chat | Medium | High | Identity confirmation, preview, explicit channel name, block unsupported state | Open; P0 |
| MV3 worker terminates during large export | High | High | Keep capture/UI active, persist progress, chunk work, resumability | Open; P0 |
| Download initiation is mistaken for completed archive | Medium | Medium | Monitor download state and show final status | Open; P0 |
| Local archive contains sensitive or copyrighted content | High | High | Disclosure, user responsibility language, local-only default, no cloud upload, legal review | Open; P0/P1 |
| Chrome Web Store rejects missing privacy disclosure | High | High | Hosted privacy policy and accurate data-use form | Open; P1 |
| Dependency or build accidentally includes remote code | Low/Medium | High | Lockfile audit, packaged-file inspection, CSP review | Open; P1 |
| Competitors out-position generic download features | High | Medium | Differentiate on Channel scope, auditability, completeness, and reliability | Open; P1 |
| Product overclaims “all assets” or “all history” | Medium | High | Claim language tied to measured acceptance criteria | Open; P0 |

## Manifest V3 test plan

Run the following matrix against a clean Chrome profile, a normal authenticated profile, and the user’s connected WhatsApp Web session. Record Chrome version, extension version, WhatsApp Web build if available, test date, channel name, requested date range, and loaded-state details for every live test.

| Test ID | Scenario | Setup | Action | Expected result | Evidence |
|---|---|---|---|---|---|
| MV3-01 | Fresh install | Clean profile; unpacked extension | Load `dist/` from `chrome://extensions` | Extension installs without manifest errors; service worker registers | Extension errors page; version |
| MV3-02 | Static manifest validation | `manifest.json` and packaged ZIP | Parse JSON and inspect files | MV3, paths, permissions, and referenced files are valid | CI output |
| MV3-03 | Unsupported URL | Open `chrome://extensions` or a non-WhatsApp page | Open popup and scan | No injection attempt; actionable unsupported-URL message | Popup screenshot/log |
| MV3-04 | Authenticated WhatsApp tab | Open WhatsApp Web, Channel visible | Open popup and scan | Collector runs in main frame and returns channel identity | Scan report |
| MV3-05 | Already-open tab after extension reload | Open Channel first; reload extension | Open popup and scan | No “Receiving end” fatal error; fallback injection or clean reattach works | Popup status; console |
| MV3-06 | Page refresh | Open Channel; refresh WhatsApp Web | Wait for UI readiness; scan | Content script attaches or fallback injects; no stale state | Timestamped log |
| MV3-07 | WhatsApp still loading | Reload and invoke before chats finish loading | Scan | User sees loading state and retry guidance; no false empty export | Screenshot |
| MV3-08 | Wrong active tab | Open WhatsApp in one tab and another tab active | Open popup and scan | Product targets only the active tab and explains mismatch | Popup screenshot |
| MV3-09 | Channel identity mismatch | Open a normal chat/group | Scan | Export is blocked or clearly labeled as unsupported; no silent chat export | Report |
| MV3-10 | Content-script receiver absent | Disable/reload extension with Channel open | Scan | `executeScript()` fallback returns a result or actionable injection error | Service-worker log |
| MV3-11 | Messaging timeout | Simulate delayed or nonresponsive collector fixture | Scan | Popup times out, re-enables controls, and does not hang | Automated test |
| MV3-12 | Duplicate message listeners | Reload extension repeatedly | Scan once | Exactly one response; no duplicate scans/downloads | Console/log |
| MV3-13 | Service-worker restart | Trigger worker stop/restart through extension management | Start or resume export | State is restored from storage or user receives explicit recoverable state | Storage snapshot |
| MV3-14 | Long export | Fixture with thousands of records and media | Start ZIP export | No worker-lifetime dependency; progress remains visible; partial state is safe | Performance log |
| MV3-15 | Slow media | Mock delayed media responses | Export ZIP | Per-item timeout/classification; archive remains auditable | Manifest and report |
| MV3-16 | Failed media | Mock 404, 403, expired blob, invalid MIME | Export ZIP | Failures appear in manifest; no silent loss | ZIP contents |
| MV3-17 | Download initiation | Valid small JSONL and ZIP | Download with Save As | Chrome download dialog opens with safe filename | Download item |
| MV3-18 | Download completion | Interrupt or cancel browser download | Export | UI distinguishes complete from interrupted/canceled | `downloads` state |
| MV3-19 | Object URL lifecycle | Download generated Blob | Start download and observe revocation | File is complete and readable after URL cleanup | Hash/size comparison |
| MV3-20 | Permissions review | Inspect extension details and install UI | Install/reload | Only justified permissions are requested and explained | Screenshot |
| MV3-21 | Network audit | DevTools network panel; export content | Scan and download | No extension-owned upload or analytics request; only required page/media traffic | HAR summary |
| MV3-22 | CSP audit | Inspect packaged scripts | Load extension | No remote code, `eval`, or inline prohibited code path | Static grep/build log |
| MV3-23 | Web-accessible resources | Open WhatsApp page and inspect resource access | Attempt direct access to extension resources | Only intentionally exposed resources are available | Browser test |
| MV3-24 | Uninstall/reinstall | Export then uninstall/reinstall | Reopen extension | No unexpected remote state; disclosed local state behavior is honored | Storage/file inspection |
| MV3-25 | Chrome version matrix | Supported minimum, current stable, current beta | Run smoke suite | APIs and messaging behavior match support policy | Matrix report |

## Functional exporter test plan

| Test ID | Scenario | Expected result |
|---|---|---|
| EXP-01 | Plain text post | Text preserved exactly after normalization rules; raw and normalized fields are distinct where needed. |
| EXP-02 | Multiline post | Newlines and paragraphs are preserved in schema or intentionally normalized with documented behavior. |
| EXP-03 | Edited post | Edited state is captured if observable; no claim is made if the UI does not expose revision history. |
| EXP-04 | Forwarded post | Forwarded marker and source label are preserved where visible. |
| EXP-05 | Image/video/audio/document | Media type, source presence, filename, MIME, status, and byte count are recorded. |
| EXP-06 | Reaction-only or media-only post | Post is retained even when text is empty. |
| EXP-07 | Unavailable update | Post/update placeholder is recorded as unavailable or excluded with a reason, never treated as successful media. |
| EXP-08 | Date start boundary | Post before start date is excluded and counted; boundary-day timezone behavior is deterministic. |
| EXP-09 | Date end boundary | Post after end date is excluded and counted; UI shows the applied timezone. |
| EXP-10 | Unknown date | Record is retained in an observation report but excluded from filtered archive unless user chooses inclusion. |
| EXP-11 | Repeated scan | No duplicate records or duplicate media files. |
| EXP-12 | Partial ZIP | Archive opens; manifest and failure report reconcile with actual files. |
| EXP-13 | Safe filenames | Channel and media names cannot escape archive directories or create ambiguous paths. |
| EXP-14 | Empty result | User receives a clear explanation that no qualifying loaded posts were found, not a misleading successful archive. |
| EXP-15 | Large result | Memory, time, and cancellation behavior remain within defined limits. |

## MVP and deferred roadmap

### Research-approved MVP

The MVP should include user-invoked Channel identity verification; a controlled scan of loaded and newly loaded posts; explicit start/end date inputs; deduplication; a versioned JSONL schema; ZIP output with a manifest and failure report; media status classification; cancellation; scan/export progress; robust fallback injection; download completion status; diagnostics that redact content; and a privacy policy with no remote upload.

The MVP should explicitly state that it exports content made available to the current WhatsApp Web session and may be incomplete when WhatsApp does not load a post or media item. It should not include scheduled background scraping, cloud sync, automatic posting, account management, or promises of deleted-content recovery.

### Deferred until evidence exists

Defer scheduled exports, shared team workspaces, cloud destinations, automatic OCR/transcription, cross-account synchronization, and paid “unlimited history” claims. These features materially expand lifecycle, privacy, terms, support, and compliance risk. First measure capture completeness, failure rates, job duration, and user willingness to pay for reliable bounded exports.

## Open questions

1. Does the current WhatsApp Web build expose a stable machine-readable timestamp or only localized display labels for Channel posts?
2. Can the Channel view reliably load older posts through upward scrolling, and what is the observable stop condition at the beginning of the requested date range?
3. Which media URLs are retrievable from the page context versus the extension context, and how long do they remain valid?
4. Does Chrome reliably accept object URLs generated in the popup when the download is initiated by the service worker after the popup begins closing?
5. What is the supported Chrome version range, and are promise-based messaging responses available across that range? The literal-true callback pattern should remain the compatibility baseline [7].
6. Is the static host permission necessary, or can the final product use only user-invoked `activeTab` plus `scripting` for a smaller warning surface?
7. What legal and policy review is required for the target market and intended users of political, student, or campaign-related Channel archives?
8. Which user segment values an auditable Channel archive enough to pay, and which output format makes the first successful job fastest?

## Implementation gate

Do not resume implementation until the following are answered by live tests or authoritative evidence: historical traversal behavior; deterministic date filtering; deduplication identity; media retrieval context and failure modes; resumability strategy; download completion semantics; minimum permissions; privacy-policy text; and the exact claims allowed in onboarding, README, and Chrome Web Store metadata.

## References

[1]: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts "Chrome for Developers — Content scripts"

[2]: https://developer.chrome.com/docs/extensions/reference/api/scripting "Chrome for Developers — chrome.scripting API"

[3]: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle "Chrome for Developers — The extension service worker lifecycle"

[4]: https://www.whatsapp.com/legal/terms-of-service "WhatsApp — Terms of Service"

[5]: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq "Chrome Web Store — Updated Privacy Policy & Secure Handling Requirements"

[6]: https://developer.chrome.com/docs/extensions/reference/api/downloads "Chrome for Developers — chrome.downloads API"

[7]: https://developer.chrome.com/docs/extensions/develop/concepts/messaging "Chrome for Developers — Message passing"

[8]: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions "Chrome for Developers — Declare permissions"

[9]: https://chromewebstore.google.com/detail/wa-media-downloader-pro/ifbnofcpgmmnbollmkjpckdpjcadfnie "Chrome Web Store — WA Media Downloader Pro"

[10]: https://faq.whatsapp.com/1180414079177245 "WhatsApp Help Center — How to export your chat history"
