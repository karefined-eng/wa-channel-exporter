# Chrome Extension Competitor Audit: Lessons from the Top
> Researched via GitHub CLI - Sept 2026. All stats are live at time of research.

## The League Table (Top 15 by Stars)

| Rank | Repo | Stars | Forks | Open Issues | Language | Niche |
|---|---|---|---|---|---|---|
| 1 | **gorhill/uBlock** | 67,919 | 4,353 | 15 | JavaScript | Ad Blocker |
| 2 | **refined-github/refined-github** | 32,175 | 1,910 | 82 | TypeScript | GitHub UI |
| 3 | **nextai-translator** | 24,986 | 1,850 | 529 | TypeScript | AI Translation |
| 4 | **gildas-lormeau/SingleFile** | 22,412 | 1,410 | 99 | JavaScript | Web Archiving |
| 5 | **darkreader/darkreader** | 22,366 | 2,745 | 1,450 | TypeScript | Dark Mode |
| 6 | **xifangczy/cat-catch** | 21,903 | 1,911 | 566 | JavaScript | Media Sniffer |
| 7 | **AutomaApp/automa** | 21,624 | 2,340 | 377 | Vue | Browser Automation |
| 8 | **Nagi-ovo/voyager** | 20,083 | 664 | 11 | TypeScript | AI Enhancement |
| 9 | **dailydotdev/daily** | 20,069 | 568 | 6 | JavaScript | Dev News Feed |
| 10 | **immersive-translate** | 18,924 | 1,119 | 392 | — | Bilingual Translation |
| 11 | **alyssaxuu/screenity** | 18,702 | 1,521 | 8 | JavaScript | Screen Recorder |
| 12 | **Automattic/harper** | 15,455 | 631 | 911 | Rust | Grammar Checker |
| 13 | **checkly/headless-recorder** | 15,304 | 733 | 1 | JavaScript | Browser Recorder |
| 14 | **ajayyy/SponsorBlock** | 13,795 | 477 | 443 | TypeScript | YouTube |
| 15 | **unbug/codelf** | 14,135 | 958 | 43 | JavaScript | Naming Tool |

---

## Deep Dives

### 🥇 uBlock Origin — The Gold Standard (67.9k ⭐)
**Repo:** https://github.com/gorhill/uBlock
**Homepage:** None (relies entirely on GitHub + store listings)
**License:** GPL-3.0

#### What makes uBlock massive:
- **Zero homepage.** The product sells itself entirely through the Chrome Web Store and GitHub. The README IS the marketing page.
- **Obsessive efficiency branding.** Every word in their README is about performance — "CPU and memory efficiency." They created a category-defining metric.
- **Extremely low open issues (only 15 with 67k stars).** This signals either extreme code quality or aggressive issue triage. They close things FAST. This builds insane trust.
- **Consistent releases.** Latest: v1.75.0. GitHub Release downloads: ~6,901 per release (just from GitHub — store figures are in the tens of millions).
- **Topics on GitHub:** `blocker, browser-extension, chromium, firefox, javascript, ublock, ublock-origin` — clean, precise, searchable.
- **Community:** Has a `CONTRIBUTING.md` but no Code of Conduct. Doesn't need it — the author's reputation IS the community signal.

#### Lesson for WA Channel Exporter:
> Your README is your storefront. uBlock's README has ZERO fluff. It's just: what it is, why it's better (benchmarks!), and how to install. Ours needs to hit that level of precision.

---

### 🗂️ SingleFile — Closest Spiritual Cousin (22.4k ⭐)
**Repo:** https://github.com/gildas-lormeau/SingleFile
**Homepage:** https://getsinglefile.com
**License:** AGPL-3.0
**GitHub Release Downloads (latest):** 43 (most traffic goes through the stores)

#### What makes SingleFile so relevant to us:
- **SingleFile does for generic web pages what WA Channel Exporter does for WhatsApp Channels.** Same concept: capture a web page as a self-contained offline archive.
- **22k stars without being on ANY major social platform.** Pure SEO + word-of-mouth in web developer and OSINT communities.
- **Topics:** `archive, archiver, osint, offline-reading, web-clipper, chrome-extension, firefox` — **OSINT is a key search term we are missing.**
- **Dedicated commercial landing page** (getsinglefile.com) despite being fully open-source. The free product drives trust, the landing page drives conversions.
- **Listed in "OSINT Framework" resources.** This is how they broke 20k stars.

#### Lesson for WA Channel Exporter:
> Add the topic `osint` and `archiver` to our GitHub repo immediately. The OSINT community (researchers, journalists, investigators) is a massive user base that would actively use and share our tool.

---

### 🎬 SponsorBlock — Community-Driven Flywheel (13.8k ⭐)
**Repo:** https://github.com/ajayyy/SponsorBlock
**Homepage:** https://sponsor.ajay.app
**License:** GPL-3.0
**Topics:** `chrome, firefox, hacktoberfest, youtube, sponsored-segments, adblock`

#### What makes SponsorBlock a case study:
- **The product IS the community.** SponsorBlock is a crowdsourced database. Every user that labels a sponsor segment is an active contributor. This creates a viral loop: more users = more data = better product = more users.
- **Hacktoberfest tag.** By adding `hacktoberfest` as a topic during October, they get free PR contributors who submit bug fixes and features.
- **Reddit is their primary distribution channel.** r/datahoarder, r/youtube, r/privacy. Not Product Hunt, not TechCrunch — niche subreddits where the target user already lives.
- **GitHub Sponsors + Open Collective.** Revenue model is fully transparent and community-funded.

#### Lesson for WA Channel Exporter:
> Our distribution should be Reddit-first. Specifically: r/whatsapp, r/DataHoarder, r/PrivacyGuides, r/osint, and r/Africa, r/Brazil, r/India (where WhatsApp Channels are HUGE). One genuine, helpful post there beats 100 tweets.

---

### 🌙 Dark Reader — The Monetization Blueprint (22.3k ⭐)
**Repo:** https://github.com/darkreader/darkreader
**Homepage:** https://darkreader.org/
**License:** MIT
**Community Health Score:** 75% (has Code of Conduct, CONTRIBUTING.md, docs)
**GitHub Release Downloads (latest):** 339

#### What makes Dark Reader the monetization master:
- **Open source + optional "sponsor" tier.** The extension is free. The website has a prominent "Support Us" button. They make significant recurring revenue without gating any features.
- **Their own website is a content hub.** darkreader.org has a blog, FAQs, and installation guides. This is their SEO moat, not GitHub.
- **Topics:** `accessibility, dark-mode, eye-care, night-mode` — they own MULTIPLE adjacent search terms.
- **Community Health: 75%.** They have a Code of Conduct and CONTRIBUTING.md. This is why they attract contributors. Our health score: likely ~30%.
- **1,450 open issues = active community.** Every issue is a feature request, a bug report, or a conversation. It's not a bug, it's social proof that people care.

#### Lesson for WA Channel Exporter:
> We need to immediately add:
> 1. A `CONTRIBUTING.md` file.
> 2. A `CODE_OF_CONDUCT.md` file.
> 3. GitHub issue templates (bug report + feature request).
> This would take our community health score from ~30% to ~90%+ and make us feel like a serious project.

---

## The Shared DNA of Every Top Extension

After auditing 15 top repos and diving deep on 4, here are the universal truths:

### 1. The README is the Product Page
Every single massive extension repo has a long, well-structured README with badges, a clear one-line description, a feature table, and install instructions. The README IS the CWS store listing, IS the press release, IS the first impression.

### 2. GitHub Topics = Discoverability
The top repos use 7-15 precise topics. SingleFile uses `osint`. SponsorBlock uses `hacktoberfest`. These are not vanity tags — they are how developers find these repos organically through GitHub's topic browsing.

### 3. Open Source + Optional Donation = Sustainable
None of the top 15 extensions are paywalled. All of the successful ones (Dark Reader, SponsorBlock) use GitHub Sponsors or Open Collective to monetize optionally. This is the right model.

### 4. Reddit is the Distribution Channel
Not Product Hunt. Not Hacker News. Not TechCrunch. The extensions that went viral did so because someone posted them in a niche subreddit where the exact right user already lived.

### 5. Community Health Files = Trust Signals
`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `ISSUE_TEMPLATE/` are not bureaucracy — they are trust signals that tell a developer "this is a serious, welcoming project I can contribute to."

---

## Action Items for WA Channel Exporter

| Priority | Action | Impact |
|---|---|---|
| 🔴 Immediate | Add GitHub topics: `whatsapp, archiver, osint, data-export, privacy, chrome-extension, offline-archive` | +discovery |
| 🔴 Immediate | Submit to Chrome Web Store | Millions of potential users |
| 🟡 This week | Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, Issue templates | Community health 30% → 90% |
| 🟡 This week | Post to r/whatsapp, r/DataHoarder, r/osint, r/privacy | Organic viral distribution |
| 🟢 This month | Add `hacktoberfest` topic in October | Free open-source contributors |
| 🟢 This month | Add GitHub Sponsors page | Sustainable revenue |
| 🟢 Future | i18n: Spanish, Portuguese, Hindi translations | 3x addressable market |
