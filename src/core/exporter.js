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
export function extensionForMime(mime = "", url = "") { const normalized = text(mime).toLowerCase().split(";")[0]; const map = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "video/3gpp": "3gp", "video/ogg": "ogv", "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/ogg": "ogg", "audio/opus": "opus", "audio/webm": "weba", "audio/wav": "wav", "audio/x-wav": "wav", "audio/aac": "aac", "application/pdf": "pdf", "application/zip": "zip", "text/plain": "txt", "text/csv": "csv" }; if (map[normalized]) return map[normalized]; const match = text(url).split(/[?#]/)[0].match(/\.([a-z0-9]{2,5})$/i); return match ? match[1].toLowerCase() : "bin"; }
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
export function makeExportName(channelName, extension = "jsonl", options = {}) {
  const opts = typeof options === "string" ? { scope: options } : (options || {});
  const safeName = text(channelName || "whatsapp-channel")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "whatsapp-channel";

  const scope = opts.scope || "all";
  const scopeTag = scope === "media" ? "media" : scope === "posts" ? "posts" : "archive";

  let dateTag = "";
  if (opts.start && opts.end) {
    dateTag = opts.start === opts.end ? opts.start : `${opts.start}_to_${opts.end}`;
  } else if (opts.start) {
    dateTag = `from_${opts.start}`;
  } else if (opts.end) {
    dateTag = `through_${opts.end}`;
  } else {
    dateTag = new Date().toISOString().slice(0, 10);
  }

  return `${safeName}_${scopeTag}_${dateTag}.${extension}`;
}

export function makeReceiptHtml(meta) { const esc = (value) => text(value).replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c])); const complete = meta.boundaryReached === true; const status = complete ? "COMPLETE BOUNDARY REACHED" : meta.phase === "canceled" ? "CANCELED — PARTIAL RESULTS" : "PARTIAL ARCHIVE"; return `<!doctype html><html><head><meta charset="utf-8"><title>Archive receipt</title><style>body{font:16px Arial,sans-serif;color:#17202a;max-width:820px;margin:40px auto;line-height:1.45}h1{font-size:28px}h2{font-size:16px;color:#138a5b;border-top:1px solid #dbe7e0;padding-top:18px;margin-top:28px}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #e5e9eb;padding:10px 0}td:first-child{color:#65717d;width:42%}.status{font-weight:800;color:${complete ? "#138a5b" : "#a92d3c"}}.note{background:#f7f8fa;padding:14px}</style></head><body><h1>WhatsApp Channel Archive Receipt</h1><p><strong>${esc(meta.channel)}</strong></p><p class="status">${status}</p><table><tr><td>Requested range</td><td>${esc(meta.start)} through ${esc(meta.end)}</td></tr><tr><td>Boundary reached</td><td>${complete ? "Yes" : "No"}</td></tr><tr><td>Posts observed</td><td>${meta.observed}</td></tr><tr><td>Posts included</td><td>${meta.included}</td></tr><tr><td>Media observed</td><td>${meta.media}</td></tr><tr><td>Unavailable updates</td><td>${meta.unavailable}</td></tr><tr><td>Scan steps</td><td>${meta.steps}</td></tr><tr><td>Completion reason</td><td>${esc(meta.reason || "not reported")}</td></tr><tr><td>Generated</td><td>${new Date().toISOString()}</td></tr></table><h2>Interpretation</h2><div class="note">This receipt describes what WhatsApp Web made available to the authorized browser session. A partial archive does not imply that missing posts or media do not exist; it means they were not verified as captured in this scan.</div><h2>Local-first handling</h2><p>No post content is uploaded by WA Channel Exporter. The receipt and archive files are saved locally by the browser.</p></body></html>`; }

export function toMarkdownWithMedia(posts, meta = {}, mediaPathMap = {}) {
  const normalized = posts.map(normalizePost);
  const channel = text(meta.channel || normalized[0]?.channel?.name || "WhatsApp Channel");
  const heading = `# ${channel} archive\n\n**Range:** ${text(meta.start)} through ${text(meta.end)}  \n**Posts:** ${normalized.length}\n\n`;
  return heading + normalized.map((post, index) => {
    const mediaMd = post.media.length
      ? post.media.map((m) => {
          const p = mediaPathMap[m.mediaId];
          if (!p) return `*(${m.filename} — not saved)*`;
          // Append the saved extension to the alt text if not already present
          const ext = p.match(/\.([a-z0-9]+)$/i)?.[1] || "";
          const altText = ext && !m.filename.toLowerCase().endsWith(`.${ext}`) ? `${m.filename}.${ext}` : m.filename;
          return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(p)
            ? `![${altText}](${p})`
            : `[${altText}](${p})`;
        }).join("\n\n")
      : "";
    return `## ${String(index + 1).padStart(4, "0")} — ${post.publishedAt.raw || post.publishedAt.iso || "Date not available"}\n\n${post.text || "[No text captured]"}\n${mediaMd ? "\n" + mediaMd : ""}\n\n---\n`;
  }).join("\n");
}

export function toIndexHtml(posts, meta = {}, mediaPathMap = {}, channelName = "WhatsApp Channel") {
  const esc = (v) => text(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const normalized = posts.map(normalizePost);
  const byDate = {};
  for (const post of normalized) {
    const dk = post.publishedAt?.iso?.slice(0, 10) || "undated";
    if (!byDate[dk]) byDate[dk] = [];
    byDate[dk].push(post);
  }
  const fmtDate = (k) => {
    if (k === "undated") return "Date Unknown";
    try { return new Date(k + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
    catch { return k; }
  };
  const renderMediaItem = (m) => {
    const p = mediaPathMap[m.mediaId];
    if (!p) return "";
    const isImg = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(p);
    const isVid = /\.(mp4|webm|mov|3gp|ogv)$/i.test(p);
    const isAud = /\.(mp3|m4a|ogg|opus|weba|wav|aac)$/i.test(p);
    if (isImg) return `<img src="${esc(p)}" alt="${esc(m.filename)}" loading="lazy">`;
    if (isVid) return `<video controls preload="none" style="width:100%;border-radius:8px"><source src="${esc(p)}"></video>`;
    if (isAud) return `<audio controls style="width:100%;border-radius:8px"><source src="${esc(p)}"></audio>`;
    return `<a href="${esc(p)}" class="doc-link">&#128206; ${esc(m.filename)}</a>`;
  };
  const postsHtml = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dk, dp]) => {
      const cards = dp.map((post) => {
        const mediaItems = post.media.map(renderMediaItem).filter(Boolean);
        const mediaHtml = mediaItems.length ? `<div class="post-media">${mediaItems.join("")}</div>` : "";
        const textHtml = post.text ? `<div class="post-text">${esc(post.text)}</div>` : "";
        return `<article class="post"><div class="post-meta">${esc(post.publishedAt.raw || post.publishedAt.iso || "")}</div>${textHtml}${mediaHtml}</article>`;
      }).join("");
      return `<div class="date-sep"><span>${fmtDate(dk)}</span></div>${cards}`;
    }).join("");
  const totalSaved = Object.keys(mediaPathMap).length;
  const range = (meta.start && meta.end) ? `${esc(text(meta.start))} \u2013 ${esc(text(meta.end))}` : "All loaded dates";
  const expAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const css = `:root{--bg:#0f1923;--card:#192635;--border:#243444;--text:#dde6ef;--muted:#6b8ea6;--accent:#25d366;--r:12px}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:15px;line-height:1.6}
header{background:#0c1824;border-bottom:1px solid var(--border);padding:16px 20px;position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:14px}
.ch-icon{width:46px;height:46px;background:linear-gradient(135deg,#128c7e 0%,#25d366 100%);border-radius:50%;display:grid;place-items:center;font-size:22px;flex-shrink:0}
header h1{font-size:18px;font-weight:700;letter-spacing:-.2px}
header p{font-size:12px;color:var(--muted);margin-top:3px}
main{max-width:680px;margin:0 auto;padding:20px 14px 80px}
.date-sep{text-align:center;margin:28px 0 12px}
.date-sep span{background:var(--border);color:var(--muted);font-size:11.5px;font-weight:700;padding:4px 15px;border-radius:20px;letter-spacing:.5px;text-transform:uppercase}
.post{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;margin-bottom:8px;transition:border-color .15s}
.post:hover{border-color:#2d4d68}
.post-meta{font-size:11.5px;color:var(--muted);margin-bottom:7px;letter-spacing:.2px}
.post-text{white-space:pre-wrap;word-break:break-word}
.post-media{margin-top:12px;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
.post-media img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;cursor:zoom-in;transition:opacity .15s}
.post-media img:hover{opacity:.85}
.doc-link{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:#1f3145;border-radius:8px;color:var(--accent);text-decoration:none;font-size:13px}
#lb{display:none;position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:999;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(6px)}
#lb.open{display:flex}
#lb img{max-width:90vw;max-height:90vh;border-radius:10px;box-shadow:0 24px 64px #000}
footer{text-align:center;padding:32px;color:var(--muted);font-size:12px;border-top:1px solid var(--border);margin-top:40px}`;
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(channelName)} \u2014 Channel Archive</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n<header>\n<div class="ch-icon">&#128226;</div>\n<div><h1>${esc(channelName)}</h1><p>${range} &nbsp;\u00b7&nbsp; ${normalized.length} posts &nbsp;\u00b7&nbsp; ${totalSaved} media saved &nbsp;\u00b7&nbsp; ${expAt}</p></div>\n</header>\n<div id="lb" role="dialog" aria-modal="true"><img id="lb-img" src="" alt="Expanded image"></div>\n<main>\n${postsHtml}\n</main>\n<footer>Archived with WA Channel Exporter &nbsp;\u00b7&nbsp; Local&#8209;first &nbsp;\u00b7&nbsp; No data uploaded</footer>\n<script>\nconst lb=document.getElementById('lb'),lbImg=document.getElementById('lb-img');\ndocument.querySelectorAll('.post-media img').forEach(i=>i.addEventListener('click',()=>{lbImg.src=i.src;lb.classList.add('open')}));\nlb.addEventListener('click',()=>lb.classList.remove('open'));\ndocument.addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('open')});\n<\/script>\n</body>\n</html>`;
}

export async function createZip(posts, JSZip, manifest = {}, pageMediaFetcher = null, onProgress = null, options = {}) {
  const validation = validateExportSchemas(posts);
  if (!validation.ok) throw new Error(`Export validation failed: ${validation.errors.join("; ")}`);
  const zip = new JSZip();
  const normalized = posts.map(normalizePost);
  const scope = options.scope || manifest.scope || "all";
  const channelName = text(manifest.channel || normalized[0]?.channel?.name || "WhatsApp Channel");

  const includePosts = scope === "all" || scope === "posts";
  const includeMedia = scope === "all" || scope === "media";

  if (includePosts) {
    zip.file("posts.jsonl", toJsonl(posts));
    zip.file("posts.csv", toCsv(posts));
    // posts.md is generated after media downloads so it can include inline media links
    for (const [index, post] of posts.entries()) {
      const stem = postFileStem(post, index);
      zip.file(`posts/${stem}.md`, toMarkdown([post], manifest));
      zip.file(`posts/${stem}.txt`, toPostText(post));
    }
  }

  const mediaReport = {
    channel: channelName,
    exportScope: scope,
    dateRange: { start: text(manifest.start), end: text(manifest.end) },
    exportedAt: new Date().toISOString(),
    observed: validation.mediaCount,
    downloaded: 0,
    unavailable: 0,
    failed: 0,
    items: []
  };

  const mediaPathMap = {}; // mediaId -> relative zip path (populated during download)

  if (!includeMedia) {
    for (const post of normalized) {
      for (const media of post.media) {
        mediaReport.items.push({
          postId: post.postId,
          mediaId: media.mediaId,
          requestedUrlType: "skipped",
          status: "skipped_scope_posts_only",
          bytes: 0,
          error: null
        });
      }
    }
  } else {
    const totalMedia = normalized.reduce((acc, p) => acc + p.media.filter((m) => m.url).length, 0);
    let processedMedia = 0;
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
            const dateFolder = post.publishedAt?.iso?.slice(0, 10) || "undated";
            const zipPath = `media/${dateFolder}/${String(postIndex + 1).padStart(4, "0")}-${String(mediaIndex + 1).padStart(2, "0")}-${filename}`;
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
            mediaPathMap[media.mediaId] = zipPath;
            mediaReport.downloaded += 1;
          } catch (error) {
            itemReport.error = error.message || "Media retrieval failed";
            mediaReport.failed += 1;
          }
          mediaReport.items.push(itemReport);
        } else {
          mediaReport.unavailable += 1;
          mediaReport.items.push({ postId: post.postId, mediaId: media.mediaId, requestedUrlType: "missing", status: "unavailable", bytes: 0, error: "No retrievable media URL was present." });
        }
      }
    }
  }

  // Generate enriched posts.md with inline media links now that paths are known
  if (includePosts) {
    zip.file("posts.md", toMarkdownWithMedia(posts, manifest, mediaPathMap));
  }
  // Generate offline HTML viewer for full archives that include both posts and media
  if (includePosts && includeMedia) {
    zip.file("index.html", toIndexHtml(posts, manifest, mediaPathMap, channelName));
  }

  const scopeDescription = scope === "media" ? "Media Only (Images, Videos, Audio, Documents)" : scope === "posts" ? "Posts Only (Text, CSV, JSONL, Markdown)" : "All (Posts, Text, and Media)";
  const dateRangeStr = (manifest.start && manifest.end) ? `${manifest.start} through ${manifest.end}` : "All loaded dates";
  const readme = [
    "============================================================",
    "WHATSAPP CHANNEL EXPORT ARCHIVE",
    "============================================================",
    `Channel:         ${channelName}`,
    `Export Scope:    ${scopeDescription}`,
    `Date Range:      ${dateRangeStr}`,
    `Exported At:     ${new Date().toISOString()}`,
    `Posts Observed:  ${normalized.length}`,
    `Media Observed:  ${validation.mediaCount}`,
    `Media Saved:     ${mediaReport.downloaded}`,
    `Boundary:        ${manifest.boundaryReached ? "Boundary reached" : "Partial scan"}`,
    "",
    "ARCHIVE CONTENTS:",
    "- manifest.json: Full export metadata, schema verification, and configuration.",
    "- media-report.json: Audit of every media item attempted, downloaded, or skipped.",
    ...(includePosts ? [
      "- posts.jsonl: Line-delimited JSON with schemaVersion 2.",
      "- posts.csv: Spreadsheet-compatible table of posts.",
      "- posts.md: Chronological readable Markdown transcript (with inline media links).",
      "- posts/: Individual post text (.txt) and Markdown (.md) records."
    ] : []),
    ...(includeMedia ? [
      "- media/YYYY-MM-DD/: Media files organized by date of post."
    ] : []),
    ...(includePosts && includeMedia ? [
      "- index.html: Offline viewer — double-click to browse the full archive."
    ] : []),
    "",
    "Local-first export by WA Channel Exporter.",
    "============================================================"
  ].join("\n");
  zip.file("README.txt", readme + "\n");

  if (typeof onProgress === "function") onProgress({ phase: "compressing", percent: 0 });
  zip.file("media-report.json", JSON.stringify(mediaReport, null, 2));
  zip.file("manifest.json", JSON.stringify({ format: "wa-channel-exporter", schemaVersion: 2, exportScope: scope, channel: channelName, exportedAt: new Date().toISOString(), postCount: normalized.length, mediaCount: validation.mediaCount, exportValidation: validation, mediaReport, ...manifest }, null, 2));
  return zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (metadata) => {
      if (typeof onProgress === "function") {
        onProgress({ phase: "compressing", percent: Math.round(metadata.percent) });
      }
    }
  );
}
