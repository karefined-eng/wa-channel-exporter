# Chrome Web Store Final Packaging and Submission Checklist

> **Project:** WA Channel Exporter  
> **Target release:** `1.3.1` unless the version is intentionally incremented before submission  
> **Primary purpose:** Export authorized WhatsApp Channel posts and media from WhatsApp Web into local archive files  
> **Status:** Complete every required gate before selecting **Submit for review** in the Chrome Web Store Developer Dashboard.

## 1. Release decision and source control

- [ ] Confirm the release version in `manifest.json` matches the version intended for the Chrome Web Store.
- [ ] Confirm the release is based on the intended `main` branch commit.
- [ ] Review `git status` and confirm there are no unintended changes, generated secrets, credentials, or personal files.
- [ ] Review the final diff for the manifest, popup, content script, background service worker, exporter, website, and store documentation.
- [ ] Confirm the release author and maintainer contact details are correct.
- [ ] Record the release commit SHA in the release notes or internal submission record.
- [ ] Do not submit a build that has only passed synthetic tests if live WhatsApp Web verification is still pending.

## 2. Manifest and permission review

- [ ] Confirm the extension is Manifest V3.
- [ ] Confirm the `name`, `version`, `description`, icons, action, side panel, service worker, content script, and web-accessible resources point to files that exist in the final package.
- [ ] Verify every referenced path with case-sensitive checks. This is especially important for icon files, popup files, vendor files, and content scripts.
- [ ] Review every permission in `manifest.json` and confirm it is necessary for the single purpose:
  - [ ] `storage` — local preferences and scan state.
  - [ ] `downloads` — saving user-requested archives.
  - [ ] `activeTab` — user-invoked active-tab access.
  - [ ] `scripting` — running the extraction workflow in the active WhatsApp Web tab.
  - [ ] `sidePanel` — displaying the extension interface.
  - [ ] `tabs` — identifying and validating the active WhatsApp Web tab.
  - [ ] `https://web.whatsapp.com/*` — reading the open Channel view used by the export workflow.
- [ ] Confirm the permissions shown in the Developer Dashboard match the permissions in the submitted package.
- [ ] Confirm the privacy policy explains every permission in plain language.
- [ ] Avoid adding a permission, host permission, remote script, analytics SDK, or external service without updating the privacy review and store disclosures.

## 3. Privacy, disclosure, and Limited Use gates

- [ ] Confirm the public privacy policy is live over HTTPS at:
  `https://wachannelexporter.me/privacy-policy`
- [ ] Confirm the policy is accessible without login, geoblocking, or a broken redirect.
- [ ] Confirm the policy states what the extension reads from the open WhatsApp Web Channel view: post text, timestamps, channel name, and available media.
- [ ] Confirm the policy explains that the content is used only to create the local archive requested by the user.
- [ ] Confirm the policy explains local preference storage and downloaded archive files.
- [ ] Confirm the policy states that WA Channel Exporter does not upload Channel content, credentials, phone numbers, or archives to a server operated by the project.
- [ ] Confirm the policy discloses third-party handling when a user voluntarily contacts support through email or GitHub.
- [ ] Confirm the policy contains retention and deletion guidance.
- [ ] Confirm the policy contains the Chrome Web Store Limited Use compliance statement.
- [ ] Confirm the policy states that data is not sold or used for advertising, unrelated profiling, creditworthiness, lending, or data brokerage.
- [ ] Confirm the extension UI shows a prominent disclosure before scanning.
- [ ] Confirm the scan button remains disabled until the user affirmatively checks the disclosure acknowledgment.
- [ ] Confirm the disclosure says the extension reads the open Channel view to create a local archive and that the user must be authorized to view and save the content.
- [ ] Confirm the in-product disclosure links to the HTTPS privacy policy.
- [ ] Confirm the store listing, privacy policy, support page, and extension UI use consistent language about local processing, read-only behavior, limitations, and account risk.
- [ ] Confirm the listing and website state that the project is independent and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.
- [ ] Do not use official WhatsApp or Meta branding in a way that implies affiliation or endorsement.

## 4. Functional validation on a clean Chrome profile

Use a clean Chrome profile or a separate test profile immediately before submission.

- [ ] Install the packaged extension in the clean profile.
- [ ] Open `https://web.whatsapp.com/` and authenticate using a test account or an authorized account.
- [ ] Open a WhatsApp Channel rather than a one-to-one chat or group.
- [ ] Confirm the extension detects the Channel name.
- [ ] Confirm the user can manually correct the Channel name.
- [ ] Confirm the privacy disclosure is visible before scanning.
- [ ] Confirm scanning cannot begin until the disclosure checkbox is selected.
- [ ] Confirm the user can select a custom date range.
- [ ] Confirm the `This Month`, `Last 7 Days`, and `All Loaded` presets behave correctly.
- [ ] Confirm each export scope works: `All`, `Media`, `Posts`, and `PDF`.
- [ ] Confirm scan progress updates while history loads.
- [ ] Confirm the scan can be canceled and partial results remain exportable where supported.
- [ ] Confirm the extension reports a partial archive when WhatsApp Web does not expose the requested boundary.
- [ ] Confirm the extension reports an empty date range clearly instead of creating a misleading archive.
- [ ] Confirm images, videos, and audio that are available to WhatsApp Web are handled correctly.
- [ ] Confirm unavailable or failed media is reported rather than silently presented as complete.
- [ ] Confirm the ZIP archive downloads successfully.
- [ ] Confirm the PDF export downloads successfully.
- [ ] Confirm JSONL and receipt-only downloads work.
- [ ] Open the archive’s `index.html` offline.
- [ ] Verify `manifest.json`, `media-report.json`, `posts.md`, `posts.jsonl`, `posts.csv`, `README.txt`, and media folders are present when applicable.
- [ ] Confirm the archive does not contain unexpected credentials, session tokens, or unrelated browser data.
- [ ] Reload WhatsApp Web and repeat a small export to verify the extension can recover from a normal page reload.
- [ ] Record the Chrome version, operating system, WhatsApp Web behavior, test Channel, date range, result status, and any known limitation.

## 5. Automated validation and package inspection

Run from the repository root:

```bash
npm ci
npm run build
npm run build:store
node scripts/test-exports.mjs
node scripts/test-mv3.js
```

Then complete the following checks:

- [ ] `npm run build` completes successfully.
- [ ] Build the submission package with `npm run build:store`; verify the packaged `manifest.json` omits the development-only `key` field before upload.
- [ ] `node scripts/test-exports.mjs` reports `status: PASS`.
- [ ] `node scripts/test-mv3.js` reports Manifest V3 and package checks as `PASS`.
- [ ] Confirm the generated ZIP exists and is non-empty:

```bash
test -s wa-channel-exporter.zip
```

- [ ] Inspect the ZIP file list:

```bash
unzip -l wa-channel-exporter.zip
```

- [ ] Confirm the ZIP contains `manifest.json`.
- [ ] Confirm all files referenced by `manifest.json` are present in the ZIP.
- [ ] Confirm the ZIP does not contain `.git`, `node_modules`, source-control credentials, local environment files, or unrelated test data.
- [ ] Confirm no remote code is required for the core extension workflow.
- [ ] Run `git diff --check`.
- [ ] Confirm the generated package was created from the final reviewed source rather than an earlier build.
- [ ] Preserve a checksum for the exact submitted package:

```bash
sha256sum wa-channel-exporter.zip
```

## 6. Store listing fields

Use the final reviewed copy from `CHROMEWEBSTORE.md` and verify every field in the Developer Dashboard.

### Identity and positioning

- [ ] **Name:** `WA Channel Exporter`
- [ ] **Category:** `Productivity`
- [ ] **Primary language:** `English`
- [ ] **Single purpose:** Export authorized WhatsApp Channel posts and media into a local archive.
- [ ] **Short description:** Accurately describes exporting WhatsApp Channel messages and media locally without implying official affiliation.
- [ ] **Detailed description:** Explains the problem, workflow, outputs, local-first handling, read-only behavior, and limitations.
- [ ] The first paragraph uses natural search terms without keyword stuffing.
- [ ] The description does not promise complete historical recovery, guaranteed account safety, or immunity from enforcement.
- [ ] The description states that results depend on what WhatsApp Web makes available during the scan.
- [ ] The description includes the independent-project disclaimer.

### Privacy tab and permissions justification

- [ ] Select only the data categories actually handled by the extension.
- [ ] Mark data as not sold.
- [ ] Mark data as not used for purposes unrelated to the extension’s single purpose.
- [ ] Use permission justifications that match `manifest.json` and the privacy policy.
- [ ] Add the privacy policy URL:
  `https://wachannelexporter.me/privacy-policy`
- [ ] Add the support URL:
  `https://wachannelexporter.me/support`
- [ ] Add the support email:
  `support@wachannelexporter.com`
- [ ] Confirm the homepage URL is current:
  `https://wachannelexporter.me/`

## 7. Graphics and promotional assets

- [ ] Upload the final 128×128 extension icon.
- [ ] Confirm the icon is original project branding and does not imitate official WhatsApp or Meta branding.
- [ ] Upload the required first screenshot showing the extension working beside a WhatsApp Channel in WhatsApp Web.
- [ ] Upload additional screenshots showing:
  - [ ] Date range and export controls.
  - [ ] Scan progress and completeness status.
  - [ ] ZIP archive contents or offline HTML viewer.
  - [ ] PDF or structured export output.
- [ ] Use consistent dimensions and readable annotations.
- [ ] Ensure screenshots do not expose phone numbers, private Channel content, account identifiers, or unrelated browser tabs.
- [ ] Confirm screenshots show the actual current UI, including the privacy disclosure where appropriate.
- [ ] Upload the promotional tile only if it accurately represents the submitted version.
- [ ] Verify every uploaded asset is the final asset and not a development mockup.

## 8. Review notes for the Chrome Web Store reviewer

Provide concise, reproducible instructions that explain how to verify the single purpose:

1. Install the extension.
2. Open `https://web.whatsapp.com/` and open an authorized WhatsApp Channel.
3. Open the WA Channel Exporter side panel.
4. Review the local-processing disclosure and select the acknowledgment checkbox.
5. Choose a short date range or `All Loaded` and select an export scope.
6. Start the scan and wait for the completion or partial-archive status.
7. Download and open the resulting ZIP or PDF.

Also include these review notes:

- [ ] The extension is read-only and does not send messages or modify the WhatsApp account.
- [ ] The extension requires an open WhatsApp Web Channel because it reads content made available in that view.
- [ ] The extension does not require a project account or cloud upload.
- [ ] The privacy policy and support pages are publicly accessible over HTTPS.
- [ ] The extension reports partial or unavailable content rather than claiming guaranteed historical completeness.
- [ ] The project is independent and not affiliated with WhatsApp or Meta.
- [ ] If the reviewer uses a test account without WhatsApp Channel content, explain that an authorized Channel must be opened for the scan workflow.

## 9. Final submission gate

Do not select **Submit for review** until all of the following are true:

- [ ] The final package is built from the reviewed commit.
- [ ] The version number is correct and has not already been submitted as an identical package.
- [ ] The clean-profile workflow has been tested successfully.
- [ ] The privacy policy is live and matches the package.
- [ ] The in-product disclosure and consent gate work.
- [ ] The store description, privacy fields, permission justifications, and screenshots match actual behavior.
- [ ] No unexplained permissions or remote services remain.
- [ ] The support URL and contact email are working.
- [ ] The independent-project disclaimer appears where needed.
- [ ] The ZIP checksum and submission timestamp are recorded.
- [ ] The exact package uploaded to the dashboard has been archived locally.

## 10. After submission

- [ ] Record the submission date, version, package checksum, and dashboard status.
- [ ] Monitor the Developer Dashboard for review messages or policy requests.
- [ ] Respond to reviewer questions with exact reproduction steps and links to the privacy and support pages.
- [ ] Do not change the submitted package while a review is pending unless a new version is intentionally prepared.
- [ ] If the submission is rejected, record the exact policy reason before changing code or listing copy.
- [ ] After publication, verify the public listing, install flow, privacy link, support link, screenshots, and version number.
- [ ] Ask satisfied users for honest reviews only after a successful export. Never offer incentives for reviews.
- [ ] Monitor GitHub issues and WhatsApp Web compatibility reports.
- [ ] Prepare a maintenance release path for confirmed DOM or media breakage.
- [ ] Publish a changelog entry for the submitted and published version.

## References

[1]: https://developer.chrome.com/docs/webstore/program-policies/privacy "Chrome Web Store Privacy Policies"
[2]: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq "Chrome Web Store User Data FAQ"
[3]: https://developer.chrome.com/docs/webstore/program-policies/limited-use "Chrome Web Store Limited Use Policy"
[4]: https://developer.chrome.com/docs/webstore/program-policies/disclosure-requirements "Chrome Web Store Disclosure Requirements"

> **Important:** This checklist is an operational release aid, not legal advice or a guarantee of Chrome Web Store approval. Google may request additional information during review, and platform behavior can change.
