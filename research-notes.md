# Research notes

## Chrome primary-source observations

As of 2026-08-25, Chrome’s official Content Scripts documentation states that content scripts run in the context of web pages, can read the page DOM, and communicate with the parent extension. It also distinguishes the isolated content-script world from the page’s own JavaScript context.

Chrome’s official `chrome.scripting` reference states that programmatic injection requires the `scripting` permission plus either matching `host_permissions` or `activeTab`. Runtime functions can be passed to `executeScript`, and returned values are delivered per frame. This supports a fallback collector when a registered content script is absent, provided the user invokes the extension on the active WhatsApp Web tab.

Sources:
- https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- https://developer.chrome.com/docs/extensions/reference/api/scripting

## Chrome service-worker observations

Chrome’s official lifecycle documentation states that extension service workers are normally terminated after 30 seconds of inactivity, a single request longer than five minutes, or a fetch response taking longer than 30 seconds. Global variables are lost when the worker shuts down, so persistent state belongs in extension storage or IndexedDB. This means large media exports should not depend on one background-worker lifetime or global in-memory job state.

Source:
- https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle

## Rights and publication observations

WhatsApp’s official Terms of Service page is marked effective January 4, 2021. It states that users are responsible for their actions, information, and content; it also discusses third-party intellectual-property infringement and possible account action. This is not a legal determination that an exporter is permitted or prohibited, but it makes terms review and user-facing responsibility disclosures release-blocking.

Chrome Web Store’s official user-data FAQ states that extensions must disclose how they handle user data even when data is processed or stored only locally. It says a privacy policy must describe how the product collects, uses, and shares user data. A Chrome Web Store listing therefore requires a hosted, accurate privacy policy for this exporter, despite local-first processing.

Sources:
- https://www.whatsapp.com/legal/terms-of-service
- https://developer.chrome.com/docs/webstore/program-policies/user-data-faq

## Chrome downloads and messaging observations

Chrome’s official downloads API reference states that the `downloads` permission is required to use `chrome.downloads`, and the API can initiate downloads with filename and `saveAs` options. Export code should handle download errors and not assume a successful callback means the file is fully written.

Chrome’s official message-passing documentation states that asynchronous `sendResponse` requires returning the literal `true` from the listener; it also documents promise responses in newer Chrome versions while recommending compatibility with the literal-true pattern. The current code uses callback messaging, but its failure path and sender-side cleanup need explicit tests.

Sources:
- https://developer.chrome.com/docs/extensions/reference/api/downloads
- https://developer.chrome.com/docs/extensions/develop/concepts/messaging

## Alternatives and buyer-demand observations

WhatsApp’s Help Center has an official “How to export your chat history” article, but the browser extraction returned no detailed body text, so the specific native workflow should be verified manually before relying on it. The existence of a native chat export is a known alternative; the proposed product must differentiate on Channel-specific capture, date-range control, portable media bundles, and transparent completeness reporting rather than generic chat export.

A representative Chrome Web Store competitor, WA Media Downloader Pro, advertises 10,000 users, media and document downloads, ZIP output, deep scan, date filters in PRO, a free file cap, local processing, and minimal permissions. This establishes buyer expectations around date filters, cancellation, smart filenames, deep history, and privacy messaging. It also indicates a crowded generic-media-downloader category; a Channel-specific archive with reliable completeness and audit metadata is a stronger differentiation path.

Sources:
- https://faq.whatsapp.com/1180414079177245
- https://chromewebstore.google.com/detail/wa-media-downloader-pro/ifbnofcpgmmnbollmkjpckdpjcadfnie
