import assert from "node:assert/strict";
import fs from "node:fs";
import JSZip from "jszip";

// Load exporter module dynamically
const source = fs.readFileSync(new URL("../src/core/exporter.js", import.meta.url), "utf8");
const exporter = await import(`data:text/javascript,${encodeURIComponent(source)}`);

// 1. Mock posts containing images, videos, failed media, and unavailable media
const posts = [
  {
    id: "post-img-1",
    channel: "Tech Channel",
    publishedAt: "10:00 AM, 9/15/2026",
    date: { iso: "2026-09-15", status: "parsed" },
    text: "Here is the photo of the new event setup",
    media: [
      {
        mediaId: "m-img-1",
        type: "img",
        url: "blob:https://web.whatsapp.com/sample-photo-blob-id",
        filename: "photo-1",
        width: 1200,
        height: 800,
        status: "observed"
      }
    ]
  },
  {
    id: "post-vid-2",
    channel: "Tech Channel",
    publishedAt: "11:00 AM, 9/15/2026",
    date: { iso: "2026-09-15", status: "parsed" },
    text: "Here is the video recording",
    media: [
      {
        mediaId: "m-vid-2",
        type: "video",
        url: "https://mmg.whatsapp.net/v/t24/sample-video.mp4",
        filename: "recording-2",
        status: "observed"
      }
    ]
  },
  {
    id: "post-fail-3",
    channel: "Tech Channel",
    publishedAt: "12:00 PM, 9/15/2026",
    date: { iso: "2026-09-15", status: "parsed" },
    text: "Media that timed out or expired",
    media: [
      {
        mediaId: "m-fail-3",
        type: "img",
        url: "https://mmg.whatsapp.net/expired-key.jpg",
        filename: "broken-3",
        status: "observed"
      }
    ]
  },
  {
    id: "post-unavail-4",
    channel: "Tech Channel",
    publishedAt: "1:00 PM, 9/15/2026",
    date: { iso: "2026-09-15", status: "parsed" },
    text: "This update couldn't load. Open on your phone.",
    media: [
      {
        mediaId: "m-unavail-4",
        type: "unknown",
        url: "",
        filename: "unavail-4",
        status: "unavailable"
      }
    ]
  }
];

// 2. Mock what the content script does when receiving FETCH_MEDIA
const mockPageMediaFetcher = async (media) => {
  // Test photo: simulates successful blob / in-page image fetch
  if (media.url.includes("sample-photo-blob-id")) {
    const fakeJpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    return { ok: true, mime: "image/jpeg", buffer: fakeJpegBytes.buffer };
  }
  // Test video: simulates successful mp4 stream fetch
  if (media.url.includes("sample-video.mp4")) {
    const fakeMp4Bytes = new TextEncoder().encode("fake-mp4-video-stream-data");
    return { ok: true, mime: "video/mp4", buffer: fakeMp4Bytes.buffer };
  }
  // Test failed network request
  if (media.url.includes("expired-key.jpg")) {
    return { ok: false, error: "Media request failed with HTTP 410 Gone." };
  }
  return { ok: false, error: "Not found" };
};

// 3. Run createZip
const zipBlob = await exporter.createZip(
  posts,
  JSZip,
  { channel: "Tech Channel", start: "2026-09-15", end: "2026-09-15" },
  mockPageMediaFetcher
);

// 4. Inspect the generated ZIP in memory
const zipBuffer = await zipBlob.arrayBuffer();
const zip = await JSZip.loadAsync(zipBuffer);

const mediaReport = JSON.parse(await zip.file("media-report.json").async("string"));
const manifest = JSON.parse(await zip.file("manifest.json").async("string"));

console.log("\n=== VERIFYING MEDIA ARCHIVE STRUCTURE ===");
console.log("Media Report Summary:", {
  observed: mediaReport.observed,
  downloaded: mediaReport.downloaded,
  unavailable: mediaReport.unavailable,
  failed: mediaReport.failed
});

// Assertions
assert.equal(mediaReport.observed, 4, "Total media observed should be 4");
assert.equal(mediaReport.downloaded, 2, "2 media files should have downloaded");
assert.equal(mediaReport.failed, 1, "1 media file should fail");
assert.equal(mediaReport.unavailable, 1, "1 media file should be unavailable");

// Verify the actual image and video files are inside media/
const photoFile = zip.file("media/0001-1-photo-1.jpg");
const videoFile = zip.file("media/0002-1-recording-2.mp4");

assert.ok(photoFile, "media/0001-1-photo-1.jpg must exist in the ZIP");
assert.ok(videoFile, "media/0002-1-recording-2.mp4 must exist in the ZIP");

console.log("\nFound image in ZIP:", photoFile.name);
console.log("Found video in ZIP:", videoFile.name);

// Verify media-report items
console.log("\nDetailed Media Items in media-report.json:");
console.table(mediaReport.items);

console.log("\n✅ ALL VERIFICATIONS PASSED: Photos and videos are successfully captured, fetched in-page, typed, and saved into the ZIP archive with full auditing.");
