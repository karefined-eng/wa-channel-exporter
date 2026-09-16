import { createZip, makeExportName, makeReceiptHtml, toJsonl } from "../core/exporter.js";

const $ = (id) => document.getElementById(id);
const MAX_STEPS = 80;
const MAX_RUNTIME_MS = 5 * 60 * 1000;
const NO_PROGRESS_LIMIT = 4;
const state = {
  phase: "idle",
  channel: "WhatsApp Channel",
  channelManual: false,
  scope: "all",
  posts: new Map(),
  observed: 0,
  media: 0,
  unavailable: 0,
  diagnostics: null,
  tabId: null,
  startedAt: 0,
  step: 0,
  noProgress: 0,
  boundaryReached: false,
  reason: ""
};
const now = new Date();

function updateFilenamePreview() {
  const start = $("startDate")?.value || "";
  const end = $("endDate")?.value || "";
  const filename = makeExportName(state.channel, "zip", { scope: state.scope, start, end });
  const preview = $("previewText");
  if (preview) preview.textContent = filename;
}

function updateScopeUI() {
  const scopeBtns = document.querySelectorAll(".segmented-control .segment");
  scopeBtns.forEach((btn) => {
    const active = btn.dataset.scope === state.scope;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-checked", active ? "true" : "false");
  });

  const zipBtn = $("zipButton");
  if (zipBtn) {
    if (state.scope === "media") zipBtn.textContent = "Download Media Only (ZIP)";
    else if (state.scope === "posts") zipBtn.textContent = "Download Posts Only (ZIP)";
    else zipBtn.textContent = "Download Complete Archive (ZIP)";
  }
  updateFilenamePreview();
}

function setDates(startIso, endIso) {
  $("startDate").value = startIso;
  $("endDate").value = endIso;
  updateFilenamePreview();
  if (state.posts.size > 0) updateSummary();
}

function setThisMonth() {
  const s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const e = now.toISOString().slice(0, 10);
  setDates(s, e);
}

function setLast7Days() {
  const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  setDates(past.toISOString().slice(0, 10), now.toISOString().slice(0, 10));
}

function setAllLoaded() {
  const dates = [...state.posts.values()].map((p) => p.date?.iso).filter(Boolean).sort();
  if (dates.length) setDates(dates[0], dates[dates.length - 1]);
  else setDates("2020-01-01", now.toISOString().slice(0, 10));
}

setThisMonth();
$("presetThisMonth")?.addEventListener("click", setThisMonth);
$("presetLast7Days")?.addEventListener("click", setLast7Days);
$("presetAllLoaded")?.addEventListener("click", setAllLoaded);

// Channel name handling
function setChannel(name, manual = false) {
  state.channel = name || "WhatsApp Channel";
  state.channelManual = manual;
  const input = $("channelInput");
  if (input && input.value !== state.channel) input.value = state.channel;
  const badge = $("channelStatusBadge");
  if (badge) {
    badge.textContent = manual ? "Custom" : "Detected";
    badge.classList.toggle("manual", manual);
  }
  updateFilenamePreview();
}

$("channelInput")?.addEventListener("input", (e) => {
  const val = e.target.value.trim();
  setChannel(val || "WhatsApp Channel", true);
});

$("refreshChannelBtn")?.addEventListener("click", async () => {
  try {
    const tab = await activeTab();
    state.tabId = tab.id;
    const initial = await collector(tab.id, { type: "COLLECT_POSTS" }).catch(() => null);
    if (initial?.channel && initial.channel !== "WhatsApp Channel") {
      setChannel(initial.channel, false);
      setStatus(`Detected: ${initial.channel}`, "Channel confirmed from WhatsApp Web.");
    } else {
      setStatus("Channel not detected", "Make sure a WhatsApp Channel conversation is open in WhatsApp Web.", true);
    }
  } catch (err) {
    setStatus("Detection failed", err.message, true);
  }
});

// Scope buttons
document.querySelectorAll(".segmented-control .segment").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.scope = btn.dataset.scope || "all";
    updateScopeUI();
  });
});

function setStatus(title, detail, error = false) {
  $("statusTitle").textContent = title;
  $("statusDetail").textContent = detail;
  $("statusDot").classList.toggle("error", error);
}

function setProgress(label, value) {
  $("progressWrap").classList.remove("hidden");
  $("progressLabel").textContent = label;
  $("progressValue").textContent = `${Math.round(value)}%`;
  $("progressBar").value = Math.max(0, Math.min(100, value));
}

function range() {
  const start = $("startDate").value;
  const end = $("endDate").value;
  if (!start || !end || start > end) throw new Error("Choose a valid From and Through date range.");
  return { start, end };
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://web.whatsapp.com/")) throw new Error("Open WhatsApp Web in this tab before scanning.");
  return tab;
}

function send(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (result) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(result);
    });
  });
}

async function collector(tabId, message) {
  try {
    return await send(tabId, message);
  } catch (error) {
    if (!error.message.includes("Receiving end does not exist")) throw error;
    await chrome.scripting.executeScript({ target: { tabId }, files: ["src/content/whatsapp-content.js"] });
    return send(tabId, message);
  }
}

function identity(post) {
  return post.id || `${post.channel}|${post.publishedAt}|${post.text}|${(post.media || []).map((m) => m.url).join(",")}`;
}

function mergeBatch(batch) {
  for (const post of batch) {
    const key = identity(post);
    const existing = state.posts.get(key);
    state.posts.set(key, existing ? { ...existing, media: [...new Map([...(existing.media || []), ...(post.media || [])].map((m) => [m.url || m.filename, m])).values()] } : post);
  }
}

function includedPosts() {
  const { start, end } = range();
  return [...state.posts.values()].filter((post) => post.date?.status === "parsed" && post.date.iso >= start && post.date.iso <= end);
}

function updateSummary() {
  const included = includedPosts();
  state.observed = state.posts.size;
  state.media = [...state.posts.values()].reduce((n, post) => n + (post.media?.length || 0), 0);
  state.unavailable = [...state.posts.values()].filter((p) => /couldn.t load|open on your phone/i.test(p.text || "")).length;
  $("postCount").textContent = included.length;
  $("mediaCount").textContent = state.media;
  $("observedCount").textContent = state.observed;
  $("failedCount").textContent = state.unavailable;
  $("summary").classList.remove("hidden");
  $("actions").classList.toggle("hidden", !included.length);
  updateFilenamePreview();
  return included;
}

async function persist() {
  await new Promise((resolve) => chrome.runtime.sendMessage({
    type: "SAVE_SCAN_STATE",
    job: {
      phase: state.phase,
      channel: state.channel,
      observed: state.observed,
      included: includedPosts().length,
      step: state.step,
      boundaryReached: state.boundaryReached,
      reason: state.reason,
      updatedAt: new Date().toISOString()
    }
  }, resolve));
}

async function runScan() {
  state.phase = "initializing";
  state.startedAt = Date.now();
  state.step = 0;
  state.noProgress = 0;
  state.boundaryReached = false;
  state.reason = "";
  state.posts.clear();
  $("scanButton").disabled = true;
  $("cancelButton").classList.remove("hidden");
  $("actions").classList.add("hidden");
  setProgress("Connecting to WhatsApp Web…", 3);
  setStatus("Initializing scan…", "Confirming the active Channel and preparing the history boundary.");
  try {
    const { start } = range();
    const tab = await activeTab();
    state.tabId = tab.id;
    const reset = await collector(tab.id, { type: "SCAN_RESET" });
    if (!reset?.ok) throw new Error(reset?.error || "Could not initialize the collector.");
    while (state.phase === "initializing" || state.phase === "loading") {
      if (Date.now() - state.startedAt > MAX_RUNTIME_MS) { state.phase = "partial"; state.reason = "timed_out"; break; }
      if (state.step >= MAX_STEPS) { state.phase = "partial"; state.reason = "max_steps"; break; }
      state.phase = "loading";
      state.step += 1;
      setProgress(`Loading history · step ${state.step}`, Math.min(92, 8 + state.step));
      const result = await collector(tab.id, { type: "SCAN_STEP", startDate: start, stepPx: 650 });
      if (!result?.ok) throw new Error(result?.error || "The Channel collector failed.");
      if (result.channel && !state.channelManual) {
        setChannel(result.channel, false);
      }
      state.diagnostics = result.diagnostics;
      mergeBatch(result.posts || []);
      updateSummary();
      if (result.boundaryReached) { state.boundaryReached = true; state.phase = "complete"; state.reason = "boundary_reached"; break; }
      if (result.noProgress || !result.postsChanged) state.noProgress += 1; else state.noProgress = 0;
      if (result.scroll?.atTop && state.noProgress >= 2) { state.phase = "partial"; state.reason = "top_reached_without_boundary"; break; }
      if (state.noProgress >= NO_PROGRESS_LIMIT) { state.phase = "partial"; state.reason = "no_progress"; break; }
      await persist();
    }
    if (state.phase === "complete") {
      setProgress("Boundary reached", 100);
      setStatus("Complete boundary reached", `${state.channel}: ${includedPosts().length} included posts from the requested range.`);
    } else if (state.phase === "partial") {
      setProgress("Partial archive", 100);
      setStatus("Partial archive", `${state.channel}: ${includedPosts().length} included of ${state.observed} observed. Reason: ${state.reason}.`, false);
    } else if (state.phase === "canceled") {
      setStatus("Scan canceled", `${includedPosts().length} posts preserved from the partial scan.`);
    }
    await persist();
  } catch (error) {
    state.phase = "failed";
    state.reason = error.message;
    setStatus("Scan failed", error.message, true);
  } finally {
    $("scanButton").disabled = false;
    $("cancelButton").classList.add("hidden");
    updateSummary();
  }
}

async function cancelScan() {
  if (!state.tabId) return;
  state.phase = "canceled";
  await collector(state.tabId, { type: "SCAN_CANCEL" }).catch(() => {});
  setProgress("Canceled", 100);
  setStatus("Scan canceled", "The records collected so far remain available for export.");
}

async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const jobId = crypto.randomUUID();
  try {
    const result = await new Promise((resolve, reject) => chrome.runtime.sendMessage({ type: "DOWNLOAD_EXPORT", url, filename, jobId }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) reject(new Error(chrome.runtime.lastError?.message || response?.error || "Could not start download."));
      else resolve(response);
    }));
    for (let i = 0; i < 60; i += 1) {
      const status = await new Promise((resolve) => chrome.runtime.sendMessage({ type: "GET_DOWNLOAD_STATUS", jobId }, resolve));
      if (status?.state === "complete") return status;
      if (status?.state === "interrupted") throw new Error(status.error || "Download interrupted.");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return result;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

$("scanButton").addEventListener("click", () => runScan());
$("cancelButton").addEventListener("click", () => cancelScan());
$("startDate").addEventListener("change", () => { updateFilenamePreview(); updateSummary(); });
$("endDate").addEventListener("change", () => { updateFilenamePreview(); updateSummary(); });

$("jsonButton").addEventListener("click", async () => {
  try {
    const filename = makeExportName(state.channel, "jsonl", { scope: "posts", start: $("startDate").value, end: $("endDate").value });
    await downloadBlob(new Blob([toJsonl(includedPosts())], { type: "application/x-ndjson" }), filename);
    setStatus("JSONL download complete", "The bounded archive was saved locally.");
  } catch (error) {
    setStatus("Download failed", error.message, true);
  }
});

$("zipButton").addEventListener("click", async () => {
  $("zipButton").disabled = true;
  try {
    const posts = includedPosts();
    const start = $("startDate").value;
    const end = $("endDate").value;
    setProgress("Preparing archive…", 5);

    if (state.scope === "posts") {
      setStatus("Creating Posts archive…", `Packaging ${posts.length} text posts (skipping media).`);
    } else if (state.scope === "media") {
      setStatus("Creating Media archive…", `Retrieving media files for ${posts.length} posts.`);
    } else {
      setStatus("Creating ZIP archive…", `Retrieving media and bundling ${posts.length} posts.`);
    }

    const blob = await createZip(
      posts,
      window.JSZip,
      {
        channel: state.channel,
        scope: state.scope,
        start,
        end,
        phase: state.phase,
        reason: state.reason,
        boundaryReached: state.boundaryReached,
        observedPosts: state.observed,
        includedPosts: posts.length,
        unavailable: state.unavailable,
        scanSteps: state.step
      },
      async (media) => {
        const primary = await collector(state.tabId, { type: "FETCH_MEDIA", url: media.url }).catch(() => null);
        if (primary?.ok) return primary;
        if (media.fallbackUrl) {
          const fallback = await collector(state.tabId, { type: "FETCH_MEDIA", url: media.fallbackUrl }).catch(() => null);
          if (fallback?.ok) return fallback;
        }
        return primary || { ok: false, error: "Media retrieval failed." };
      },
      (progress) => {
        if (progress.phase === "media") {
          const pct = Math.min(90, Math.round((progress.current / Math.max(1, progress.total)) * 85) + 5);
          setProgress(`Retrieving media (${progress.current}/${progress.total})`, pct);
          setStatus("Downloading media…", `${progress.current} of ${progress.total} items retrieved.`);
        } else if (progress.phase === "compressing") {
          setProgress(`Compressing ZIP · ${progress.percent}%`, Math.min(99, 90 + Math.round(progress.percent * 0.09)));
          setStatus("Compressing archive…", "Bundling files into ZIP.");
        }
      },
      { scope: state.scope }
    );

    setProgress("Saving archive…", 100);
    const exportFilename = makeExportName(state.channel, "zip", { scope: state.scope, start, end });
    await downloadBlob(blob, exportFilename);
    setStatus("ZIP download complete", `Saved as ${exportFilename}`);
  } catch (error) {
    setStatus("Archive failed", error.message, true);
  } finally {
    $("zipButton").disabled = false;
  }
});

$("receiptButton").addEventListener("click", async () => {
  try {
    const posts = includedPosts();
    const start = $("startDate").value;
    const end = $("endDate").value;
    const receipt = makeReceiptHtml({
      channel: state.channel,
      start,
      end,
      phase: state.phase,
      reason: state.reason,
      boundaryReached: state.boundaryReached,
      observed: state.observed,
      included: posts.length,
      media: state.media,
      unavailable: state.unavailable,
      steps: state.step
    });
    const filename = makeExportName(state.channel, "html", { scope: "receipt", start, end });
    await downloadBlob(new Blob([receipt], { type: "text/html" }), filename);
    setStatus("Receipt download complete", "The archive receipt was saved locally.");
  } catch (error) {
    setStatus("Receipt failed", error.message, true);
  }
});

$("diagnosticButton").addEventListener("click", async () => {
  const report = {
    product: "wa-channel-exporter",
    version: "1.3.1",
    generatedAt: new Date().toISOString(),
    phase: state.phase,
    reason: state.reason,
    channel: state.channel,
    scope: state.scope,
    observed: state.observed,
    included: includedPosts().length,
    boundaryReached: state.boundaryReached,
    step: state.step,
    diagnostics: state.diagnostics
  };
  await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
  setStatus("Diagnostic copied", "The report is redacted and contains no post text or media URLs.");
});

// Initial setup
updateScopeUI();

(async () => {
  try {
    const tab = await activeTab();
    state.tabId = tab.id;
    const initial = await collector(tab.id, { type: "COLLECT_POSTS" }).catch(() => null);
    if (initial?.channel && initial.channel !== "WhatsApp Channel" && !state.channelManual) {
      setChannel(initial.channel, false);
      setStatus(`Ready: ${initial.channel}`, "Set your date range or choose a preset, then scan history.");
    }
  } catch {}
})();
