const fs = require("node:fs");
const path = require("node:path");
const puppeteer = require("puppeteer");

const root = path.resolve(__dirname, "..");
const fixture = process.env.WA_DOM_FIXTURE || "/home/ubuntu/upload/web.whatsapp.com__1787683949156.html";
const collectorSource = fs.readFileSync(path.join(root, "src/content/whatsapp-content.js"), "utf8");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

(async () => {
  if (!fs.existsSync(fixture)) throw new Error(`Fixture not found: ${fixture}`);
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`file://${fixture}`, { waitUntil: "domcontentloaded" });
  await page.evaluateOnNewDocument(() => { globalThis.chrome = { runtime: { onMessage: { addListener() {} } } }; });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.addScriptTag({ content: collectorSource });

  const result = await page.evaluate(() => ({
    data: collectPosts(),
    originalHeader: document.querySelectorAll('[data-testid="conversation-header"]').length,
    originalMessages: document.querySelectorAll('[data-pre-plain-text], [data-testid="msg-container"], [data-testid^="conv-msg-"]').length,
    fallbackText: document.querySelectorAll('span[dir="ltr"]').length,
    fallbackMedia: document.querySelectorAll('img[src], video[src], audio[src], a[href]').length,
    channelCandidates: [...document.querySelectorAll('div[role="button"] span[dir="auto"][title], div[role="button"] span[dir="auto"]')].map((node) => node.getAttribute("title") || node.textContent.trim()).filter(Boolean)
  }));
  await browser.close();

  check(result.originalHeader === 0, `expected original conversation header selector to be absent in fixture, got ${result.originalHeader}`);
  check(result.originalMessages === 0, `expected original message selectors to be absent in fixture, got ${result.originalMessages}`);
  check(result.fallbackText > 0, "fallback text selector returned no nodes");
  check(result.fallbackMedia > 0, "fallback media selector returned no nodes");
  check(result.data.diagnostics.fallbackMessageRoots > 0, "collector fallback produced no message roots");
  check(result.data.posts.length > 0, "collector returned no posts");
  check(/ABEDNEGO/i.test(result.data.channel), `collector channel identity was not Abednego: ${result.data.channel}`);
  check(result.data.posts.every((post) => post.media.every((media) => !media.url.startsWith("data:image/gif"))), "collector retained a 1x1 data GIF");
  check(result.data.diagnostics.acceptedMediaNodes === 0, `fixture UI/avatar media should be rejected, accepted ${result.data.diagnostics.acceptedMediaNodes}`);

  console.log(JSON.stringify({
    fixture,
    originalHeader: result.originalHeader,
    originalMessages: result.originalMessages,
    fallbackText: result.fallbackText,
    fallbackMedia: result.fallbackMedia,
    channel: result.data.channel,
    postCount: result.data.posts.length,
    mediaCount: result.data.posts.reduce((total, post) => total + post.media.length, 0),
    diagnostics: result.data.diagnostics,
    failures
  }, null, 2));
  if (failures.length) process.exit(1);
  console.log("browser fixture extraction: PASS");
})().catch((error) => { console.error(error.stack || error.message); process.exit(1); });
