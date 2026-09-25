# SEO/GEO Remediation Handoff

**Repository:** `karefined-eng/whatsapp-channel-exporter`  
**Candidate branch:** `fix/seo-geo-remediation`  
**Baseline:** `9080cd4 Fix homepage JSON-LD graph`  
**Status:** Candidate repaired; not committed, pushed, deployed, or published.

## What the supplied audits established

The 25 September 2026 reports describe a site with a strong basic technical foundation but weaker content citability, E-E-A-T, schema consistency, and external brand authority. Several findings are stale relative to the current repository: all eight HTML pages already contain a viewport meta tag; the nested website Vercel configuration already contains HSTS with `includeSubDomains; preload`; Google Fonts URLs already use `display=swap`; and a support/contact page, author byline, comparison table, `llms.txt`, `robots.txt`, Organization schema, and BreadcrumbList schema exist in the current source.

## Implemented in this candidate

| Audit area | Change | Evidence / limitation |
|---|---|---|
| Homepage metadata | Shortened the homepage, Open Graph, and Twitter descriptions to reduce SERP truncation risk. | Source-level; live SERP rendering still needs recheck. |
| E-E-A-T | Added `meta[name=author]` for the maintainer across HTML pages and repaired the malformed maintainer link on `/about`. | Source-level; this is an organization/maintainer signal, not a fabricated personal credential. |
| Schema | Added a valid homepage `BreadcrumbList`; validated every JSON-LD block; removed an unverified generic Reddit subreddit from `Organization.sameAs`. | JSON parsing passes. Only verified GitHub/Twitter identities remain. |
| Comparison citability | Added a table caption and `scope="col"` to the homepage feature comparison table. | Improves accessibility and machine-readable comparison extraction; no unsupported comparison claims were added. |
| Heading hierarchy | Converted footer navigation headings from `h4` to `h3` on `/about`, `/privacy-policy`, and `/terms-of-service`; extended existing footer CSS to style both heading levels. | Removes the two skipped-heading findings identified by the GEO audit without changing visible intent. |
| Security headers | Added the missing global HSTS rule to the root `vercel.json`, aligned with `website/vercel.json`: `max-age=63072000; includeSubDomains; preload`. | JSON structure and global placement validated. Deployment still needs a live header check. |
| AI discoverability | Added an explicit `robots.txt` comment pointing to `/llms.txt`. | `llms.txt` already exists and validates; this improves human/operator discoverability but is not a guaranteed crawler directive. |
| Accessibility | Added a reusable visually-hidden `.sr-only` class for the comparison caption. | No visible layout change intended. |

## Validation completed

- `git diff --check` — passed.
- Both Vercel configuration files parse as JSON — passed.
- All JSON-LD blocks in all eight HTML pages parse as JSON — passed.
- Website production build (`npm ci && npm run build`) — passed.
- Vite output generated eight pages and cleaned an eight-URL sitemap — passed.
- Extension regression suite (`npm test`) — passed.
- Extension lint (`npm run lint`) — passed.
- Live HTML fixture checks — skipped by the repository test because the fixture is unavailable.
- Vite emitted existing warnings that external Vercel telemetry scripts without `type="module"` cannot be bundled; the build still completed successfully.

## Findings not honestly solvable by code alone

1. **YouTube, Reddit, LinkedIn, Wikidata/Wikipedia, and other external authority presence.** These require real profiles, helpful public contributions, and/or an eligible entity. No accounts or public claims were fabricated.
2. **Original research, benchmarks, and citations.** These require actual measurements and sources. The site should not publish invented export-speed, volume, or comparative statistics.
3. **Verified ratings/reviews.** `aggregateRating` must not be added without real review data.
4. **Live response time, compression, HTTP/2/3, and Core Web Vitals.** These require a deployed-domain measurement through PageSpeed Insights, CrUX, or equivalent. The static build cannot prove them.
5. **Privacy-policy date finding.** The supplied report calls 24 September 2026 future-dated, but the audit itself is dated 25 September 2026 and the current policy date is therefore not future relative to this task. No unsupported date rewrite was made.

## Recommended next verification steps

1. Review the candidate diff and run a live crawl against `https://wachannelexporter.me/` after deployment.
2. Check response headers on the canonical domain, especially HSTS, `Content-Encoding`, and cache behavior.
3. Run PageSpeed Insights or CrUX for mobile and desktop field/lab data.
4. Validate homepage and secondary-page JSON-LD in Google Rich Results Test and Schema Markup Validator.
5. Create a real, helpful external publishing plan only where the maintainer controls the account and can provide non-promotional value.

**No deployment, release, public post, external profile creation, or repository commit occurred.**

## Changed files

- `vercel.json`
- `website/about.html`
- `website/documentation.html`
- `website/download-media.html`
- `website/export-to-pdf.html`
- `website/index.html`
- `website/privacy-policy.html`
- `website/public/robots.txt`
- `website/style.css`
- `website/support.html`
- `website/terms-of-service.html`
- `docs/SEO-GEO-REMEDIATION-REPORT.md`

> Note: `website/vercel.json` already contained the desired HSTS policy and was not changed.
