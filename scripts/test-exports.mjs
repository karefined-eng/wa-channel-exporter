import assert from "node:assert/strict";
import fs from "node:fs";
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
console.log(JSON.stringify({ valid: result, normalizedFallback, filenameChecks: "PASS", status: "PASS" }, null, 2));
