import assert from "node:assert/strict";
import fs from "node:fs";
import JSZip from "jszip";
const source = fs.readFileSync(new URL("../src/core/exporter.js", import.meta.url), "utf8");
const core = await import(`data:text/javascript,${encodeURIComponent(source)}`);

const posts = [
  { id: "p-1", channel: "Pilot Channel", publishedAt: "3:00 PM, 8/19/2026", date: { iso: "2026-08-19", status: "parsed" }, text: 'Quote "test", with comma', media: [{ type: "image", url: "https://example.test/image", filename: "image.jpg" }] },
  { id: "p-2", channel: "Pilot Channel", publishedAt: "8/20/2026", date: { iso: "2026-08-20", status: "parsed" }, text: "Second post", media: [] }
];

const jsonl = core.toJsonl(posts).trim().split("\n").map(JSON.parse);
const csv = core.toCsv(posts);
const result = core.validateExportSchemas(posts);
assert.equal(result.ok, true, result.errors.join("; "));
assert.equal(result.postCount, 2);
assert.equal(result.mediaCount, 1);
assert.equal(jsonl.length, 2);
assert.equal(jsonl[0].schemaVersion, 2);
assert.equal(jsonl[0].channel.name, "Pilot Channel");
assert.match(csv, /"post_id","channel"/);
assert.match(csv, /"Quote ""test"", with comma"/);
const normalizedFallback = core.validateExportSchemas([{ id: "bad", channel: "", media: "not-array" }]);
assert.equal(normalizedFallback.ok, true);
assert.equal(normalizedFallback.postCount, 1);
assert.equal(normalizedFallback.mediaCount, 0);
assert.equal(core.extensionForMime("image/jpeg"), "jpg");
assert.equal(core.extensionForMime("image/png"), "png");
assert.equal(core.extensionForMime("image/gif"), "gif");
assert.equal(core.mediaFilename("media-1-1", "image/jpeg"), "media-1-1.jpg");
assert.equal(core.mediaFilename("asset", "", "https://cdn.example/asset.webp?token=1"), "asset.webp");
const zipBlob = await core.createZip(posts, JSZip, { channel: "Pilot Channel", start: "2026-08-19", end: "2026-08-20" }, async () => ({ ok: true, mime: "image/jpeg", buffer: new Uint8Array([255, 216, 255, 217]).buffer }));
const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
const manifest = JSON.parse(await zip.file("manifest.json").async("string"));
const mediaReport = JSON.parse(await zip.file("media-report.json").async("string"));
assert.ok(zip.file("media/2026-08-19/0001-01-image.jpg"), "media file must exist in date folder");
assert.ok(zip.file("posts.csv"));
assert.ok(zip.file("posts.jsonl"));
assert.ok(zip.file("posts.md"), "enriched posts.md must exist");
assert.ok(zip.file("index.html"), "offline viewer index.html must exist in full archive");
assert.ok(zip.file("README.txt"));
assert.equal(manifest.mediaReport.downloaded, 1);
assert.equal(mediaReport.channel, "Pilot Channel");
assert.equal(mediaReport.items[0].status, "downloaded");
assert.equal(mediaReport.items[0].requestedUrlType, "page-context");

// Test makeExportName with scope and date range options
const allName = core.makeExportName("Pilot Channel", "zip", { scope: "all", start: "2026-08-19", end: "2026-08-20" });
assert.equal(allName, "pilot-channel_archive_2026-08-19_to_2026-08-20.zip");

const mediaName = core.makeExportName("VOU Election Command Centre", "zip", { scope: "media", start: "2026-09-01", end: "2026-09-16" });
assert.equal(mediaName, "vou-election-command-centre_media_2026-09-01_to_2026-09-16.zip");

const postsName = core.makeExportName("News Desk", "zip", { scope: "posts", start: "2026-09-01", end: "2026-09-16" });
assert.equal(postsName, "news-desk_posts_2026-09-01_to_2026-09-16.zip");

// Test createZip with scope: "posts" (bypasses media retrieval)
let mediaFetcherCalled = false;
const postsOnlyZipBlob = await core.createZip(
  posts,
  JSZip,
  { channel: "Pilot Channel", start: "2026-08-19", end: "2026-08-20" },
  async () => { mediaFetcherCalled = true; return { ok: true }; },
  null,
  { scope: "posts" }
);
assert.equal(mediaFetcherCalled, false, "Media fetcher should not be called in posts-only scope");
const postsZip = await JSZip.loadAsync(await postsOnlyZipBlob.arrayBuffer());
assert.equal(postsZip.file("media/2026-08-19/0001-01-image.jpg"), null, "Media should not exist in posts-only zip");
assert.ok(postsZip.file("posts.csv"), "posts.csv must exist in posts-only zip");
assert.ok(postsZip.file("posts.jsonl"), "posts.jsonl must exist in posts-only zip");
const postsMediaReport = JSON.parse(await postsZip.file("media-report.json").async("string"));
assert.equal(postsMediaReport.items[0].status, "skipped_scope_posts_only");

// Test createZip with scope: "media" (skips post text/csv/jsonl files)
const mediaOnlyZipBlob = await core.createZip(
  posts,
  JSZip,
  { channel: "Pilot Channel", start: "2026-08-19", end: "2026-08-20" },
  async () => ({ ok: true, mime: "image/jpeg", buffer: new Uint8Array([255, 216, 255, 217]).buffer }),
  null,
  { scope: "media" }
);
const mediaZip = await JSZip.loadAsync(await mediaOnlyZipBlob.arrayBuffer());
assert.ok(mediaZip.file("media/2026-08-19/0001-01-image.jpg"), "Media must exist in date-organised folder in media-only zip");
assert.equal(mediaZip.file("posts.csv"), null, "posts.csv should not exist in media-only zip");
assert.equal(mediaZip.file("posts.jsonl"), null, "posts.jsonl should not exist in media-only zip");
assert.equal(mediaZip.file("index.html"), null, "index.html must NOT be generated in media-only scope");
assert.ok(mediaZip.file("manifest.json"), "manifest.json must exist in media-only zip");
assert.ok(mediaZip.file("media-report.json"), "media-report.json must exist in media-only zip");

console.log(JSON.stringify({
  valid: result,
  normalizedFallback,
  filenameChecks: "PASS",
  namingConventions: { allName, mediaName, postsName },
  zipMediaChecks: "PASS",
  scopeChecks: { postsOnly: "PASS", mediaOnly: "PASS", fullArchive: "PASS" },
  status: "PASS"
}, null, 2));

