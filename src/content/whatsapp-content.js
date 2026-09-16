const SELECTORS = {
  header: '[data-testid="conversation-header"], header, [role="banner"]',
  title: '[data-testid="conversation-header"] span[dir="auto"], header span[dir="auto"], span[dir="auto"][title]',
  messageRoots: '[data-pre-plain-text], [data-testid="msg-container"], [data-testid^="conv-msg-"]',
  text: '[data-testid="selectable-text"], [data-testid="last-msg-status"], span[dir="ltr"], span[dir="auto"]',
  media: 'img[src], video, video[src], audio, audio[src], source[src], a[href]'
};
const session = { root: null, canceled: false, lastSignature: "", steps: 0 };
const clean = (value) => (value || "").replace(/\s+/g, " ").trim();

function channelName() {
  const header = document.querySelector('header, [data-testid="conversation-header"], [role="banner"]');
  if (header) {
    const titled = header.querySelector('[data-testid="conversation-info-header-chat-title"][title], span[dir="auto"][title], div[role="button"] [title], [title]');
    const titledText = clean(titled?.getAttribute("title"));
    if (titledText && !/followers?|verified/i.test(titledText)) return titledText;

    const chatTitle = header.querySelector('[data-testid="conversation-info-header-chat-title"], [data-testid="chat-title"]');
    if (chatTitle) {
      const text = clean(chatTitle.getAttribute("title") || chatTitle.textContent);
      if (text) return text.replace(/…|\.{3}$/, "");
    }

    const headerBtn = header.querySelector('div[role="button"], [role="heading"]');
    if (headerBtn) {
      const span = headerBtn.querySelector('span[dir="auto"]');
      const text = clean(span?.getAttribute("title") || span?.textContent);
      if (text) return text.replace(/…|\.{3}$/, "");
    }
  }

  const activeCellCandidate = document.querySelector('[data-testid="cell-frame-title"] span[dir="auto"][title], [data-testid="cell-frame-title"] span[dir="auto"]');
  if (activeCellCandidate) {
    const text = clean(activeCellCandidate.getAttribute("title") || activeCellCandidate.textContent);
    if (text) return text.replace(/…|\.{3}$/, "");
  }

  const followerContainer = [...document.querySelectorAll('div[role="button"], header, [data-testid="conversation-header"]')].find((node) => /followers?/i.test(node.textContent || ""));
  const candidate = followerContainer?.querySelector('span[dir="auto"][title], span[dir="auto"]') || document.querySelector(SELECTORS.title);
  const result = clean(candidate?.getAttribute("title") || candidate?.textContent) || "WhatsApp Channel";
  return result.replace(/…|\.{3}$/, "");
}

function findScrollRoot() {
  if (session.root?.isConnected) return session.root;
  const preferred = [...document.querySelectorAll('[data-testid="conversation-panel-messages"], [role="main"], [tabindex="-1"]')]
    .filter((node) => node.scrollHeight - node.clientHeight > 40 && node.clientHeight > 120)
    .sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
  if (preferred) return (session.root = preferred);
  const candidates = [...document.querySelectorAll('div')].filter((node) => {
    const style = getComputedStyle(node);
    return node.clientHeight > 120 && node.scrollHeight - node.clientHeight > 80 && /(auto|scroll)/.test(style.overflowY);
  }).sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight));
  return (session.root = candidates[0] || document.scrollingElement);
}

function messageRoots() {
  const direct = [...document.querySelectorAll(SELECTORS.messageRoots)];
  if (direct.length) return [...new Set(direct)];
  const textNodes = [...document.querySelectorAll('span[dir="ltr"][title], span[dir="ltr"]')]
    .filter((node) => clean(node.textContent).length > 0)
    .filter((node) => !node.closest('[role="navigation"], [role="listitem"]'));
  return [...new Set(textNodes.map((node) => node.closest('[data-testid="cell-frame-secondary"], [tabindex="-1"], div') || node))];
}

function parseDisplayedTime(root) {
  const raw = root.getAttribute("data-pre-plain-text") || root.querySelector("[data-pre-plain-text]")?.getAttribute("data-pre-plain-text") || root.getAttribute("title") || "";
  return clean(raw);
}

function parseDate(raw) {
  const str = String(raw || "");
  const isoMatch = str.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (date.getFullYear() === Number(y) && date.getMonth() === Number(m) - 1 && date.getDate() === Number(d)) {
      return { iso: date.toISOString().slice(0, 10), status: "parsed" };
    }
  }

  const match = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (!match) return { iso: "", status: "unknown" };

  const num1 = Number(match[1]);
  const num2 = Number(match[2]);
  const year = Number(match[3]);

  let month;
  let day;
  if (num1 > 12) {
    day = num1;
    month = num2;
  } else if (num2 > 12) {
    month = num1;
    day = num2;
  } else {
    month = num1;
    day = num2;
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { iso: "", status: "unknown" };
  }
  return { iso: date.toISOString().slice(0, 10), status: "parsed" };
}

function mediaCandidates(root) {
  const seen = new Set();
  return [...root.querySelectorAll(SELECTORS.media)].map((item) => {
    const tag = item.tagName.toLowerCase();
    let type = tag;
    if (tag === "source") {
      type = item.parentElement?.tagName.toLowerCase() || "media";
    }
    const explicitUrl = ["data-original", "data-media-url", "data-download-url", "data-src", "data-url"]
      .map((name) => item.getAttribute(name) || "")
      .find(Boolean) || "";
    const linkedUrl = item.closest("a[href]")?.getAttribute("href") || "";
    const renderedUrl = item.currentSrc || item.src || item.getAttribute("src") || item.getAttribute("href") || item.getAttribute("poster") || "";
    const linkedMedia = /\.(?:jpe?g|png|gif|webp|avif|mp4|webm|mov|3gp|mp3|m4a|ogg|opus|wav|aac|pdf|docx?|xlsx?|pptx?|zip)(?:[?#]|$)/i.test(linkedUrl) || /\/media(?:\/|[?#])/i.test(linkedUrl);
    const url = explicitUrl || (linkedMedia ? linkedUrl : renderedUrl);
    const width = Number(item.naturalWidth || item.videoWidth || item.getAttribute("width") || item.style.width?.replace("px", "") || 0);
    const height = Number(item.naturalHeight || item.videoHeight || item.getAttribute("height") || item.style.height?.replace("px", "") || 0);
    const isPixelGif = /^data:image\/gif;base64,R0lGODlhAQABA/.test(url);
    const isDocumentLink = tag === "a" && linkedMedia;
    const isVisibleMedia = tag !== "img" || width >= 80 || height >= 80 || item.getAttribute("data-media-type") || item.closest("[data-testid*='media'], [data-testid*='image'], [data-testid*='video'], [data-testid*='audio']");
    if (!url || seen.has(url) || isPixelGif || (!isDocumentLink && tag === "a") || (tag !== "a" && !isVisibleMedia)) return null;
    seen.add(url);
    return { type, url, filename: `media-${seen.size}`, width, height, source: url.startsWith("blob:") ? "rendered-preview" : url.startsWith("data:") ? "data-url" : explicitUrl ? "page-media-attribute" : linkedMedia ? "linked-media" : "page-url", previewUrl: renderedUrl.startsWith("blob:") && renderedUrl !== url ? renderedUrl : "" };
  }).filter(Boolean);
}

function parsePost(root, index) {
  const media = mediaCandidates(root).map((item, mediaIndex) => ({ ...item, filename: `media-${index + 1}-${mediaIndex + 1}` }));
  const textNode = root.querySelector(SELECTORS.text);
  const publishedAt = parseDisplayedTime(root);
  return { id: root.getAttribute("data-id") || root.id || `derived-${index + 1}`, channel: channelName(), publishedAt, date: parseDate(publishedAt), text: clean(textNode?.getAttribute("title") || textNode?.textContent || root.textContent), media };
}

function collectPosts() {
  const roots = messageRoots();
  const posts = roots.map(parsePost).filter((post) => post.text || post.media.length);
  return { channel: channelName(), posts, diagnostics: { selectors: SELECTORS, directMessageRoots: document.querySelectorAll(SELECTORS.messageRoots).length, fallbackMessageRoots: roots.length, timestampNodes: document.querySelectorAll("[data-pre-plain-text]").length, mediaNodes: document.querySelectorAll(SELECTORS.media).length, acceptedMediaNodes: roots.reduce((count, root) => count + mediaCandidates(root).length, 0), ignoredMediaNodes: Math.max(0, document.querySelectorAll(SELECTORS.media).length - roots.reduce((count, root) => count + mediaCandidates(root).length, 0)), url: location.href.split("?")[0] } };
}

const signature = (posts) => posts.map((post) => `${post.id}|${post.publishedAt}|${post.text.slice(0, 80)}|${post.media.length}`).join("\n");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function stabilize(root, timeoutMs = 2500) {
  const started = Date.now(); let previous = `${root.scrollHeight}:${root.scrollTop}:${messageRoots().length}`; let stable = 0;
  while (Date.now() - started < timeoutMs) {
    await wait(350);
    const current = `${root.scrollHeight}:${root.scrollTop}:${messageRoots().length}`;
    if (current === previous) { stable += 1; if (stable >= 2) return true; } else { stable = 0; previous = current; }
  }
  return false;
}
async function scanStep({ startDate = "", stepPx = 650 } = {}) {
  const root = findScrollRoot();
  if (!root) throw new Error("Could not locate the WhatsApp Web message scroll container.");
  const before = collectPosts();
  const beforeTop = root.scrollTop;
  const beforeHeight = root.scrollHeight;
  root.scrollTop = Math.max(0, beforeTop - stepPx);
  const stable = await stabilize(root);
  const after = collectPosts();
  const earliest = after.posts.map((post) => post.date.iso).filter(Boolean).sort()[0] || "";
  const sig = signature(after.posts);
  const noProgress = root.scrollTop === beforeTop && root.scrollHeight === beforeHeight && sig === session.lastSignature;
  session.lastSignature = sig; session.steps += 1;
  return { ...after, step: session.steps, stable, scroll: { top: root.scrollTop, height: root.scrollHeight, viewport: root.clientHeight, atTop: root.scrollTop <= 4 }, earliestDate: earliest, boundaryReached: Boolean(startDate && earliest && earliest < startDate), noProgress, postsChanged: sig !== signature(before.posts) };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message?.type === "COLLECT_POSTS") sendResponse({ ok: true, ...collectPosts() });
    else if (message?.type === "SCAN_RESET") { session.root = null; session.canceled = false; session.lastSignature = ""; session.steps = 0; sendResponse({ ok: true }); }
    else if (message?.type === "SCAN_CANCEL") { session.canceled = true; sendResponse({ ok: true }); }
    else if (message?.type === "FETCH_MEDIA") {
      const url = String(message.url || "");
      if (url.startsWith("data:")) {
        const match = url.match(/^data:([^;,]+)(?:;charset=[^;,]+)?(?:;(base64))?,(.*)$/i);
        if (!match) throw new Error("Malformed data URL.");
        const mime = match[1] || "image/jpeg";
        const isBase64 = Boolean(match[2]);
        const dataStr = match[3];
        let base64 = "";
        let byteLength = 0;
        if (isBase64) {
          base64 = dataStr;
          byteLength = Math.floor((dataStr.length * 3) / 4);
        } else {
          const raw = decodeURIComponent(dataStr);
          base64 = btoa(raw);
          byteLength = raw.length;
        }
        sendResponse({ ok: true, mime, bytes: byteLength, base64 });
        return;
      }
      if (!/^(blob:|https?:\/\/)/.test(url)) throw new Error("Unsupported media URL.");
      const response = await fetch(url, { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error(`Media request failed with HTTP ${response.status}.`);
      const mime = response.headers.get("content-type") || "application/octet-stream";
      const blob = await response.blob();
      if (!blob.size) throw new Error("Media response was empty.");
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const res = String(reader.result || "");
          const comma = res.indexOf(",");
          resolve(comma >= 0 ? res.slice(comma + 1) : res);
        };
        reader.onerror = () => reject(new Error("Failed to read media buffer."));
        reader.readAsDataURL(blob);
      });
      sendResponse({ ok: true, mime, bytes: blob.size, base64 });
    }
    else if (message?.type === "SCAN_STEP") { if (session.canceled) return sendResponse({ ok: false, state: "canceled" }); sendResponse({ ok: true, ...(await scanStep(message)) }); }
  })().catch((error) => sendResponse({ ok: false, error: error.message || "Collector failed." }));
  return true;
});
