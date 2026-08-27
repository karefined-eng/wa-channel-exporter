const STATUS_PREFIX = "downloadStatus:";
const SCAN_KEY = "activeScanJob";

async function readStatus(jobId) {
  const key = `${STATUS_PREFIX}${jobId}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}
async function writeStatus(jobId, status) { await chrome.storage.local.set({ [`${STATUS_PREFIX}${jobId}`]: status }); }
async function sendDownload(message, sendResponse) {
  const { url, filename, jobId } = message;
  if (!url || !filename || !jobId) throw new Error("A download URL, filename, and job ID are required.");
  const downloadId = await chrome.downloads.download({ url, filename, saveAs: true });
  await writeStatus(jobId, { downloadId, state: "in_progress", filename, startedAt: new Date().toISOString() });
  sendResponse({ ok: true, jobId, downloadId, state: "in_progress" });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "DOWNLOAD_EXPORT") { sendDownload(message, sendResponse).catch((error) => sendResponse({ ok: false, error: error.message || "Could not start download." })); return true; }
  if (message?.type === "GET_DOWNLOAD_STATUS") { readStatus(message.jobId).then((status) => sendResponse(status ? { ok: true, ...status } : { ok: false, error: "Download job not found." })).catch((error) => sendResponse({ ok: false, error: error.message })); return true; }
  if (message?.type === "CLEAR_DOWNLOAD_STATUS") { chrome.storage.local.remove(`${STATUS_PREFIX}${message.jobId}`).then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message })); return true; }
  if (message?.type === "SAVE_SCAN_STATE") { chrome.storage.local.set({ [SCAN_KEY]: message.job || null }).then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message })); return true; }
  if (message?.type === "GET_SCAN_STATE") { chrome.storage.local.get(SCAN_KEY).then((result) => sendResponse({ ok: true, job: result[SCAN_KEY] || null })).catch((error) => sendResponse({ ok: false, error: error.message })); return true; }
  if (message?.type === "CLEAR_SCAN_STATE") { chrome.storage.local.remove(SCAN_KEY).then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message })); return true; }
  return false;
});

chrome.downloads.onChanged.addListener((delta) => {
  (async () => {
    if (!delta.id) return;
    const all = await chrome.storage.local.get(null);
    const entry = Object.entries(all).find(([key, value]) => key.startsWith(STATUS_PREFIX) && value?.downloadId === delta.id);
    if (!entry) return;
    const [key, status] = entry;
    if (delta.state?.current) status.state = delta.state.current;
    if (delta.error?.current) status.error = delta.error.current;
    if (status.state === "complete" || status.state === "interrupted") status.finishedAt = new Date().toISOString();
    await chrome.storage.local.set({ [key]: status });
  })().catch(() => {});
});
