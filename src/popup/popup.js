import { createZip, makeExportName, makeReceiptHtml, toJsonl } from "../core/exporter.js";

const $ = (id) => document.getElementById(id);
const MAX_STEPS = 80;
const MAX_RUNTIME_MS = 5 * 60 * 1000;
const NO_PROGRESS_LIMIT = 4;
const state = { phase: "idle", channel: "WhatsApp Channel", posts: new Map(), observed: 0, media: 0, unavailable: 0, diagnostics: null, tabId: null, startedAt: 0, step: 0, noProgress: 0, boundaryReached: false, reason: "" };
const now = new Date();
$("startDate").value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
$("endDate").value = now.toISOString().slice(0, 10);

function setStatus(title, detail, error = false) { $("statusTitle").textContent = title; $("statusDetail").textContent = detail; $("statusDot").classList.toggle("error", error); }
function setProgress(label, value) { $("progressWrap").classList.remove("hidden"); $("progressLabel").textContent = label; $("progressValue").textContent = `${Math.round(value)}%`; $("progressBar").value = Math.max(0, Math.min(100, value)); }
function range() { const start = $("startDate").value; const end = $("endDate").value; if (!start || !end || start > end) throw new Error("Choose a valid From and Through date range."); return { start, end }; }
async function activeTab() { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); if (!tab?.id || !tab.url?.startsWith("https://web.whatsapp.com/")) throw new Error("Open WhatsApp Web in this tab before scanning."); return tab; }
function send(tabId, message) { return new Promise((resolve, reject) => { chrome.tabs.sendMessage(tabId, message, (result) => { if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message)); else resolve(result); }); }); }
async function collector(tabId, message) {
  try { return await send(tabId, message); }
  catch (error) {
    if (!error.message.includes("Receiving end does not exist")) throw error;
    await chrome.scripting.executeScript({ target: { tabId }, files: ["src/content/whatsapp-content.js"] });
    return send(tabId, message);
  }
}
function identity(post) { return post.id || `${post.channel}|${post.publishedAt}|${post.text}|${(post.media || []).map((m) => m.url).join(",")}`; }
function mergeBatch(batch) { for (const post of batch) { const key = identity(post); const existing = state.posts.get(key); state.posts.set(key, existing ? { ...existing, media: [...new Map([...(existing.media || []), ...(post.media || [])].map((m) => [m.url || m.filename, m])).values()] } : post); } }
function includedPosts() { const { start, end } = range(); return [...state.posts.values()].filter((post) => post.date?.status === "parsed" && post.date.iso >= start && post.date.iso <= end); }
function updateSummary() { const included = includedPosts(); state.observed = state.posts.size; state.media = [...state.posts.values()].reduce((n, post) => n + (post.media?.length || 0), 0); state.unavailable = [...state.posts.values()].filter((p) => /couldn.t load|open on your phone/i.test(p.text || "")).length; $("postCount").textContent = included.length; $("mediaCount").textContent = state.media; $("observedCount").textContent = state.observed; $("failedCount").textContent = state.unavailable; $("summary").classList.remove("hidden"); $("actions").classList.toggle("hidden", !included.length); return included; }
async function persist() { await new Promise((resolve) => chrome.runtime.sendMessage({ type: "SAVE_SCAN_STATE", job: { phase: state.phase, channel: state.channel, observed: state.observed, included: includedPosts().length, step: state.step, boundaryReached: state.boundaryReached, reason: state.reason, updatedAt: new Date().toISOString() } }, resolve)); }
async function runScan() {
  state.phase = "initializing"; state.startedAt = Date.now(); state.step = 0; state.noProgress = 0; state.boundaryReached = false; state.reason = ""; state.posts.clear();
  $("scanButton").disabled = true; $("cancelButton").classList.remove("hidden"); $("actions").classList.add("hidden"); setProgress("Connecting to WhatsApp Web…", 3); setStatus("Initializing scan…", "Confirming the active Channel and preparing the history boundary.");
  try {
    const { start } = range(); const tab = await activeTab(); state.tabId = tab.id; const reset = await collector(tab.id, { type: "SCAN_RESET" }); if (!reset?.ok) throw new Error(reset?.error || "Could not initialize the collector.");
    while (state.phase === "initializing" || state.phase === "loading") {
      if (Date.now() - state.startedAt > MAX_RUNTIME_MS) { state.phase = "partial"; state.reason = "timed_out"; break; }
      if (state.step >= MAX_STEPS) { state.phase = "partial"; state.reason = "max_steps"; break; }
      state.phase = "loading"; state.step += 1; setProgress(`Loading history · step ${state.step}`, Math.min(92, 8 + state.step));
      const result = await collector(tab.id, { type: "SCAN_STEP", startDate: start, stepPx: 650 });
      if (!result?.ok) throw new Error(result?.error || "The Channel collector failed.");
      state.channel = result.channel || state.channel; state.diagnostics = result.diagnostics; mergeBatch(result.posts || []); updateSummary();
      if (result.boundaryReached) { state.boundaryReached = true; state.phase = "complete"; state.reason = "boundary_reached"; break; }
      if (result.noProgress || !result.postsChanged) state.noProgress += 1; else state.noProgress = 0;
      if (result.scroll?.atTop && state.noProgress >= 2) { state.phase = "partial"; state.reason = "top_reached_without_boundary"; break; }
      if (state.noProgress >= NO_PROGRESS_LIMIT) { state.phase = "partial"; state.reason = "no_progress"; break; }
      await persist();
    }
    if (state.phase === "complete") { setProgress("Boundary reached", 100); setStatus("Complete boundary reached", `${state.channel}: ${includedPosts().length} included posts from the requested range.`); }
    else if (state.phase === "partial") { setProgress("Partial archive", 100); setStatus("Partial archive", `${state.channel}: ${includedPosts().length} included of ${state.observed} observed. Reason: ${state.reason}.`, false); }
    else if (state.phase === "canceled") { setStatus("Scan canceled", `${includedPosts().length} posts preserved from the partial scan.`); }
    await persist();
  } catch (error) { state.phase = "failed"; state.reason = error.message; setStatus("Scan failed", error.message, true); }
  finally { $("scanButton").disabled = false; $("cancelButton").classList.add("hidden"); updateSummary(); }
}
async function cancelScan() { if (!state.tabId) return; state.phase = "canceled"; await collector(state.tabId, { type: "SCAN_CANCEL" }).catch(() => {}); setProgress("Canceled", 100); setStatus("Scan canceled", "The records collected so far remain available for export."); }
async function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const jobId = crypto.randomUUID(); try { const result = await new Promise((resolve, reject) => chrome.runtime.sendMessage({ type: "DOWNLOAD_EXPORT", url, filename, jobId }, (response) => { if (chrome.runtime.lastError || !response?.ok) reject(new Error(chrome.runtime.lastError?.message || response?.error || "Could not start download.")); else resolve(response); })); for (let i = 0; i < 60; i += 1) { const status = await new Promise((resolve) => chrome.runtime.sendMessage({ type: "GET_DOWNLOAD_STATUS", jobId }, resolve)); if (status?.state === "complete") return status; if (status?.state === "interrupted") throw new Error(status.error || "Download interrupted."); await new Promise((resolve) => setTimeout(resolve, 500)); } return result; } finally { setTimeout(() => URL.revokeObjectURL(url), 5000); } }
$("scanButton").addEventListener("click", () => runScan()); $("cancelButton").addEventListener("click", () => cancelScan());
$("jsonButton").addEventListener("click", async () => { try { await downloadBlob(new Blob([toJsonl(includedPosts())], { type: "application/x-ndjson" }), makeExportName(state.channel)); setStatus("JSONL download complete", "The bounded archive was saved locally."); } catch (error) { setStatus("Download failed", error.message, true); } });
$("zipButton").addEventListener("click", async () => { $("zipButton").disabled = true; try { const posts = includedPosts(); const blob = await createZip(posts, window.JSZip, { channel: state.channel, start: $("startDate").value, end: $("endDate").value, phase: state.phase, reason: state.reason, boundaryReached: state.boundaryReached, observedPosts: state.observed, includedPosts: posts.length, unavailable: state.unavailable, scanSteps: state.step }, (media) => collector(state.tabId, { type: "FETCH_MEDIA", url: media.url })); await downloadBlob(blob, makeExportName(state.channel, "zip")); setStatus("ZIP download complete", "The bounded archive was saved locally."); } catch (error) { setStatus("Archive failed", error.message, true); } finally { $("zipButton").disabled = false; } });
$("receiptButton").addEventListener("click", async () => { try { const posts = includedPosts(); const receipt = makeReceiptHtml({ channel: state.channel, start: $("startDate").value, end: $("endDate").value, phase: state.phase, reason: state.reason, boundaryReached: state.boundaryReached, observed: state.observed, included: posts.length, media: state.media, unavailable: state.unavailable, steps: state.step }); await downloadBlob(new Blob([receipt], { type: "text/html" }), makeExportName(state.channel, "html")); setStatus("Receipt download complete", "The archive receipt was saved locally."); } catch (error) { setStatus("Receipt failed", error.message, true); } });
$("diagnosticButton").addEventListener("click", async () => { const report = { product: "wa-channel-exporter", version: "1.3.0", generatedAt: new Date().toISOString(), phase: state.phase, reason: state.reason, channel: state.channel, observed: state.observed, included: includedPosts().length, boundaryReached: state.boundaryReached, step: state.step, diagnostics: state.diagnostics }; await navigator.clipboard.writeText(JSON.stringify(report, null, 2)); setStatus("Diagnostic copied", "The report is redacted and contains no post text or media URLs."); });
