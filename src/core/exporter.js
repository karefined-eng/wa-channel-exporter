const text = (value) => (value == null ? "" : String(value)).trim();

export function normalizePost(raw, index = 0) {
  return {
    schemaVersion: 2,
    postId: text(raw.id || raw.postId) || `post-${index + 1}`,
    channel: { name: text(raw.channel?.name || raw.channel) || "WhatsApp Channel" },
    publishedAt: {
      raw: text(raw.publishedAt?.raw || raw.publishedAt),
      iso: text(raw.publishedAt?.iso || raw.date?.iso),
      timezone: text(raw.publishedAt?.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: raw.publishedAt?.status || raw.date?.status || "unknown"
    },
    text: text(raw.text),
    media: Array.isArray(raw.media)
      ? raw.media.map((item, mediaIndex) => ({
          mediaId: text(item.mediaId) || `media-${index + 1}-${mediaIndex + 1}`,
          type: text(item.type) || "unknown",
          url: text(item.url),
          fallbackUrl: text(item.previewUrl || item.fallbackUrl),
          sourceUrlPresent: Boolean(item.url),
          filename: text(item.filename) || `media-${index + 1}-${mediaIndex + 1}`,
          status: item.status || "observed",
          errorCode: item.errorCode || null
        }))
      : [],
    capture: { source: "WhatsApp Web", observedAt: new Date().toISOString(), sequence: index + 1 }
  };
}
export function toJsonl(posts) { return posts.map(normalizePost).map((post) => JSON.stringify(post)).join("\n") + (posts.length ? "\n" : ""); }
export function toCsv(posts) { const rows = [["post_id", "channel", "published_at", "date_iso", "text", "media_count"]]; for (const post of posts.map(normalizePost)) rows.push([post.postId, post.channel.name, post.publishedAt.raw, post.publishedAt.iso, post.text, post.media.length]); return rows.map((row) => row.map((value) => `"${text(value).replace(/"/g, '""')}"`).join(",")).join("\n") + "\n"; }
export function toMarkdown(posts, meta = {}) { const normalized = posts.map(normalizePost); const heading = `# ${text(meta.channel || normalized[0]?.channel?.name || "WhatsApp Channel")} archive\n\n**Range:** ${text(meta.start)} through ${text(meta.end)}  \n**Posts:** ${normalized.length}\n\n`; return heading + normalized.map((post, index) => `## ${String(index + 1).padStart(4, "0")} — ${post.publishedAt.raw || post.publishedAt.iso || "Date not available"}\n\n${post.text || "[No text captured]"}\n\n${post.media.length ? `**Media:** ${post.media.map((media) => media.filename).join(", ")}` : "**Media:** None"}\n\n---\n`).join("\n"); }
export function postFileStem(post, index = 0) { const date = text(post.publishedAt?.iso || post.date?.iso || post.publishedAt?.raw).replace(/[^0-9-]+/g, "-").replace(/^-|-$/g, "") || "undated"; return `${String(index + 1).padStart(4, "0")}-${date}`; }
export function extensionForMime(mime = "", url = "") { const normalized = text(mime).toLowerCase().split(";")[0]; const map = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4", "video/webm": "webm", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/ogg": "ogg", "application/pdf": "pdf", "application/zip": "zip", "text/plain": "txt", "text/csv": "csv" }; if (map[normalized]) return map[normalized]; const match = text(url).split(/[?#]/)[0].match(/\.([a-z0-9]{2,5})$/i); return match ? match[1].toLowerCase() : "bin"; }
export function mediaFilename(filename, mime = "", url = "") { const base = text(filename || "media").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[^a-z0-9._-]+/gi, "-") || "media"; return `${base}.${extensionForMime(mime, url)}`; }
export function toPostText(post) { const normalized = normalizePost(post); return `${normalized.channel.name}\n${normalized.publishedAt.raw || normalized.publishedAt.iso || "Date not available"}\n\n${normalized.text || "[No text captured]"}\n\nMedia: ${normalized.media.length ? normalized.media.map((media) => media.filename).join(", ") : "None"}\n`; }
function parseCsv(csv) { return csv.trimEnd().split("\n").map((line) => { const cells = []; let cell = ""; let quoted = false; for (let i = 0; i < line.length; i += 1) { const char = line[i]; if (char === '"' && line[i + 1] === '"') { cell += '"'; i += 1; } else if (char === '"') quoted = !quoted; else if (char === "," && !quoted) { cells.push(cell); cell = ""; } else cell += char; } cells.push(cell); return cells; }); }
export function validateExportSchemas(posts) {
  const normalized = posts.map(normalizePost);
  const errors = [];
  const jsonlRows = toJsonl(posts).trim().split("\n").filter(Boolean);
  if (jsonlRows.length !== normalized.length) errors.push(`JSONL row count ${jsonlRows.length} does not equal post count ${normalized.length}`);
  jsonlRows.forEach((line, index) => { try { const row = JSON.parse(line); if (row.schemaVersion !== 2) errors.push(`JSONL row ${index + 1}: schemaVersion must be 2`); if (!row.postId || typeof row.postId !== "string") errors.push(`JSONL row ${index + 1}: postId is required`); if (!row.channel?.name) errors.push(`JSONL row ${index + 1}: channel.name is required`); if (!row.publishedAt || typeof row.publishedAt.raw !== "string" || !row.publishedAt.status) errors.push(`JSONL row ${index + 1}: publishedAt is incomplete`); if (!Array.isArray(row.media)) errors.push(`JSONL row ${index + 1}: media must be an array`); } catch { errors.push(`JSONL row ${index + 1}: invalid JSON`); } });
  const csvRows = parseCsv(toCsv(posts)); const expectedHeader = ["post_id", "channel", "published_at", "date_iso", "text", "media_count"];
  if (JSON.stringify(csvRows[0]) !== JSON.stringify(expectedHeader)) errors.push("CSV header does not match the required schema");
  if (csvRows.length - 1 !== normalized.length) errors.push(`CSV data row count ${csvRows.length - 1} does not equal post count ${normalized.length}`);
  csvRows.slice(1).forEach((row, index) => { if (row.length !== expectedHeader.length) errors.push(`CSV row ${index + 1}: expected ${expectedHeader.length} columns, got ${row.length}`); if (!row[0]) errors.push(`CSV row ${index + 1}: post_id is required`); if (!/^\d+$/.test(row[5] || "")) errors.push(`CSV row ${index + 1}: media_count must be an integer`); });
  return { ok: errors.length === 0, errors, postCount: normalized.length, mediaCount: normalized.reduce((total, post) => total + post.media.length, 0), jsonlRows: jsonlRows.length, csvRows: Math.max(0, csvRows.length - 1) };
}
export function makeExportName(channelName, extension = "jsonl") { const safeName = text(channelName || "whatsapp-channel").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "whatsapp-channel"; return `${safeName}-${new Date().toISOString().slice(0, 10)}.${extension}`; }
export function makeReceiptHtml(meta) { const esc = (value) => text(value).replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c])); const complete = meta.boundaryReached === true; const status = complete ? "COMPLETE BOUNDARY REACHED" : meta.phase === "canceled" ? "CANCELED — PARTIAL RESULTS" : "PARTIAL ARCHIVE"; return `<!doctype html><html><head><meta charset="utf-8"><title>Archive receipt</title><style>body{font:16px Arial,sans-serif;color:#17202a;max-width:820px;margin:40px auto;line-height:1.45}h1{font-size:28px}h2{font-size:16px;color:#138a5b;border-top:1px solid #dbe7e0;padding-top:18px;margin-top:28px}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #e5e9eb;padding:10px 0}td:first-child{color:#65717d;width:42%}.status{font-weight:800;color:${complete ? "#138a5b" : "#a92d3c"}}.note{background:#f7f8fa;padding:14px}</style></head><body><h1>WhatsApp Channel Archive Receipt</h1><p><strong>${esc(meta.channel)}</strong></p><p class="status">${status}</p><table><tr><td>Requested range</td><td>${esc(meta.start)} through ${esc(meta.end)}</td></tr><tr><td>Boundary reached</td><td>${complete ? "Yes" : "No"}</td></tr><tr><td>Posts observed</td><td>${meta.observed}</td></tr><tr><td>Posts included</td><td>${meta.included}</td></tr><tr><td>Media observed</td><td>${meta.media}</td></tr><tr><td>Unavailable updates</td><td>${meta.unavailable}</td></tr><tr><td>Scan steps</td><td>${meta.steps}</td></tr><tr><td>Completion reason</td><td>${esc(meta.reason || "not reported")}</td></tr><tr><td>Generated</td><td>${new Date().toISOString()}</td></tr></table><h2>Interpretation</h2><div class="note">This receipt describes what WhatsApp Web made available to the authorized browser session. A partial archive does not imply that missing posts or media do not exist; it means they were not verified as captured in this scan.</div><h2>Local-first handling</h2><p>No post content is uploaded by WA Channel Exporter. The receipt and archive files are saved locally by the browser.</p></body></html>`; }
export async function createZip(posts, JSZip, manifest = {}, pageMediaFetcher = null, onProgress = null) {
  const validation = validateExportSchemas(posts);
  if (!validation.ok) throw new Error(`Export validation failed: ${validation.errors.join("; ")}`);
  const zip = new JSZip();
  const normalized = posts.map(normalizePost);
  const totalMedia = normalized.reduce((acc, p) => acc + p.media.filter((m) => m.url).length, 0);
  let processedMedia = 0;
  const mediaReport = { observed: validation.mediaCount, downloaded: 0, unavailable: 0, failed: 0, items: [] };
  zip.file("posts.jsonl", toJsonl(posts));
  zip.file("posts.csv", toCsv(posts));
  zip.file("posts.md", toMarkdown(posts, manifest));
  for (const [index, post] of posts.entries()) {
    const stem = postFileStem(post, index);
    zip.file(`posts/${stem}.md`, toMarkdown([post], manifest));
    zip.file(`posts/${stem}.txt`, toPostText(post));
  }
  zip.file("README.txt", "This ZIP is the primary WA Channel Exporter deliverable. Review manifest.json and media-report.json before relying on completeness.\n");
  for (const [postIndex, post] of normalized.entries()) {
    for (const [mediaIndex, media] of post.media.entries()) {
      if (media.url) {
        processedMedia += 1;
        if (typeof onProgress === "function") {
          onProgress({ phase: "media", current: processedMedia, total: totalMedia, filename: media.filename });
        }
        const itemReport = { postId: post.postId, mediaId: media.mediaId, requestedUrlType: media.sourceUrlPresent ? "page-context" : "missing", status: "failed", bytes: 0, error: null };
        try {
          if (!pageMediaFetcher) throw new Error("A page-context media fetcher is required.");
          const fetched = await pageMediaFetcher(media);
          if (!fetched?.ok) throw new Error(fetched?.error || "Media was not returned by WhatsApp Web.");
          const filename = mediaFilename(media.filename, fetched.mime || "application/octet-stream", media.url);
          const zipPath = `media/${String(postIndex + 1).padStart(4, "0")}-${mediaIndex + 1}-${filename}`;
          if (fetched.base64) {
            let b64 = String(fetched.base64).trim();
            const remainder = b64.length % 4;
            if (remainder > 0) b64 = b64.padEnd(b64.length + (4 - remainder), "=");
            zip.file(zipPath, b64, { base64: true });
            itemReport.bytes = fetched.bytes || Math.floor((b64.length * 3) / 4);
          } else if (fetched.buffer) {
            const bytes = fetched.buffer.byteLength ?? fetched.buffer.length ?? 0;
            if (!bytes) throw new Error("Media response was empty.");
            zip.file(zipPath, fetched.buffer);
            itemReport.bytes = bytes;
          } else {
            throw new Error("Media response was empty.");
          }
          itemReport.status = "downloaded";
          mediaReport.downloaded += 1;
        } catch (error) {
          itemReport.error = error.message || "Media retrieval failed";
          mediaReport.failed += 1;
        }
        mediaReport.items.push(itemReport);
      } else {
        mediaReport.unavailable += 1;
        mediaReport.items.push({ postId: post.postId, mediaId: media.mediaId, status: "unavailable", bytes: 0, error: "No retrievable media URL was present." });
      }
    }
  }
  if (typeof onProgress === "function") onProgress({ phase: "compressing", percent: 0 });
  zip.file("media-report.json", JSON.stringify(mediaReport, null, 2));
  zip.file("manifest.json", JSON.stringify({ format: "wa-channel-exporter", schemaVersion: 2, exportedAt: new Date().toISOString(), postCount: normalized.length, mediaCount: normalized.reduce((total, post) => total + post.media.length, 0), exportValidation: validation, mediaReport, ...manifest }, null, 2));
  return zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (metadata) => {
      if (typeof onProgress === "function") {
        onProgress({ phase: "compressing", percent: Math.round(metadata.percent) });
      }
    }
  );
}
