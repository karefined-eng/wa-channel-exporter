const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture Branded OG Main (1200x630)
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto(`file:///${path.resolve(__dirname, '../og-branded-main.html').replace(/\\/g, '/')}`);
  await page.waitForTimeout(500); // wait for fonts and background to load
  await page.screenshot({ path: path.join(__dirname, '../website/og-main.jpg'), type: 'jpeg', quality: 90 });
  console.log('Saved website/og-main.jpg (1200x630)');

  // Capture Branded OG PDF (1200x630)
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto(`file:///${path.resolve(__dirname, '../og-branded-pdf.html').replace(/\\/g, '/')}`);
  await page.waitForTimeout(500); // wait for fonts and background to load
  await page.screenshot({ path: path.join(__dirname, '../website/og-pdf.jpg'), type: 'jpeg', quality: 90 });
  console.log('Saved website/og-pdf.jpg (1200x630)');

  await browser.close();
})();
