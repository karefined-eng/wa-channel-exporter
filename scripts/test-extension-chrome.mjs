import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';

const extensionPath = path.resolve(process.argv[2] ?? 'dist');
const manifest = JSON.parse(await fs.readFile(path.join(extensionPath, 'manifest.json'), 'utf8'));
const browserCandidates = [
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  await puppeteer.executablePath(),
].filter(Boolean);
let executablePath;
for (const candidate of browserCandidates) {
  try {
    await fs.access(candidate);
    executablePath = candidate;
    break;
  } catch {
    // Try the next browser location.
  }
}
if (!executablePath) throw new Error('No Chrome/Chromium executable was found');
const browser = await puppeteer.launch({
  headless: process.env.CI ? false : true,
  executablePath,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ],
});

const errors = [];
const messages = [];
for (const page of await browser.pages()) {
  page.on('console', message => messages.push(`${message.type()}: ${message.text()}`));
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
}

const popupPath = manifest.side_panel?.default_path || manifest.action?.default_popup;
if (!popupPath) {
  await browser.close();
  throw new Error('Manifest does not expose a popup or side-panel page');
}
const extensionsPage = await browser.newPage();
await extensionsPage.goto('chrome://extensions/', { waitUntil: 'domcontentloaded' });
let extensionId;
for (let attempt = 0; attempt < 20; attempt += 1) {
  extensionId = await extensionsPage.evaluate(() => {
  const findItem = root => {
    for (const element of root.querySelectorAll('*')) {
      if (element.tagName === 'EXTENSIONS-ITEM' && element.shadowRoot?.textContent.includes('WA Channel Exporter')) {
        return element.id;
      }
      if (element.shadowRoot) {
        const nestedId = findItem(element.shadowRoot);
        if (nestedId) return nestedId;
      }
    }
    return null;
  };
  return findItem(document);
  });
  if (extensionId) break;
  await new Promise(resolve => setTimeout(resolve, 500));
}
await extensionsPage.close();
if (!extensionId) {
  await browser.close();
  throw new Error('Loaded WA Channel Exporter was not listed on chrome://extensions');
}
const page = await browser.newPage();
page.on('console', message => messages.push(`${message.type()}: ${message.text()}`));
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
await page.goto(`chrome-extension://${extensionId}/${popupPath}`, { waitUntil: 'networkidle0' });

let serviceWorkerTarget;
for (let attempt = 0; attempt < 40; attempt += 1) {
  serviceWorkerTarget = browser.targets().find(target => target.type() === 'service_worker' && target.url().startsWith(`chrome-extension://${extensionId}/`));
  if (serviceWorkerTarget) break;
  await new Promise(resolve => setTimeout(resolve, 250));
}

const result = await page.evaluate(() => ({
  title: document.title,
  bodyText: document.body.innerText,
  buttons: [...document.querySelectorAll('button')].map(button => button.textContent.trim()).filter(Boolean),
  links: [...document.querySelectorAll('a')].map(link => link.href),
}));
const bodyTextLower = result.bodyText.toLowerCase();
const checks = {
  serviceWorkerStarted: Boolean(serviceWorkerTarget),
  popupLoaded: result.title.length > 0 && bodyTextLower.includes('wa channel exporter'),
  popupHasControls: result.buttons.length > 0,
  popupHasSupportLink: result.links.some(link => link.includes('support.html')),
  noRuntimeErrors: errors.length === 0,
};

console.log(JSON.stringify({
  extensionId,
  manifestVersion: manifest.manifest_version,
  result,
  checks,
  errors,
  messages,
}, null, 2));
await browser.close();
if (Object.values(checks).some(value => !value)) process.exitCode = 1;
