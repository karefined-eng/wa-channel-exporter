const fs = require("node:fs");
const path = require("node:path");
const puppeteer = require("puppeteer");
const { createPng } = require("./generate-icons");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "store-assets");
const publicDir = path.join(root, "website", "public");

function fileUrl(file) {
  return `file://${file.replace(/\\/g, "/")}`;
}

async function captureFile(page, source, output, width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(fileUrl(source), { waitUntil: "networkidle0" });
  await page.screenshot({ path: output, type: "png" });
}

async function captureScreenshot(page, source, output, title, subtitle) {
  const image = fs.readFileSync(source).toString("base64");
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1280px; height: 800px; overflow: hidden; background: #070b0d; color: #f5f7f8; font-family: Arial, sans-serif; }
  body { padding: 32px 40px 40px; }
  header { height: 68px; display: flex; align-items: center; justify-content: space-between; }
  .title { font-size: 24px; font-weight: 700; letter-spacing: -.02em; }
  .subtitle { margin-top: 5px; color: #8da19b; font-size: 13px; }
  .badge { border: 1px solid rgba(37,211,102,.5); color: #8af0b0; border-radius: 999px; padding: 9px 14px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  figure { margin: 0; width: 1200px; height: 660px; border-radius: 18px; overflow: hidden; border: 1px solid rgba(134, 255, 193, .24); box-shadow: 0 20px 60px rgba(0,0,0,.42); background: #111; }
  img { display: block; width: 1200px; height: 660px; object-fit: cover; object-position: center; }
  footer { height: 40px; padding-top: 14px; color: #72827d; font-size: 12px; }
</style></head><body>
<header><div><div class="title">${title}</div><div class="subtitle">${subtitle}</div></div><div class="badge">Local-first · read-only</div></header>
<figure><img src="data:image/jpeg;base64,${image}" alt="WA Channel Exporter product view"></figure>
<footer>WA Channel Exporter · Offline archive workflow</footer>
</body></html>`;
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: output, type: "png" });
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const edgeIcon = path.join(outputDir, "edge-icon-300.png");
  fs.writeFileSync(edgeIcon, createPng(300, 300, 15, 140, 91));
  console.log(`Generated ${path.relative(root, edgeIcon)} (300x300)`);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.CHROME_BIN || "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await captureFile(page, path.join(root, "promo-tile.html"), path.join(outputDir, "promo-tile-440x280.png"), 440, 280);
    console.log("Generated store-assets/promo-tile-440x280.png (440x280)");
    await captureFile(page, path.join(root, "marquee-tile.html"), path.join(outputDir, "marquee-tile-1400x560.png"), 1400, 560);
    console.log("Generated store-assets/marquee-tile-1400x560.png (1400x560)");
    await captureScreenshot(page, path.join(publicDir, "promo-screenshot-1.jpg"), path.join(outputDir, "screenshot-1-1280x800.png"), "Archive the channel you can see", "Choose a date range and export posts or media into a portable archive.");
    console.log("Generated store-assets/screenshot-1-1280x800.png (1280x800)");
    await captureScreenshot(page, path.join(publicDir, "promo-screenshot-2.jpg"), path.join(outputDir, "screenshot-2-1280x800.png"), "Review the export before download", "A local, read-only workflow with clear progress and partial-content reporting.");
    console.log("Generated store-assets/screenshot-2-1280x800.png (1280x800)");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
