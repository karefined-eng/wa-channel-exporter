const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture Promo Tile (440x280)
  await page.setViewport({ width: 440, height: 280, deviceScaleFactor: 2 });
  await page.goto(`file:///${path.resolve(__dirname, 'promo-tile.html').replace(/\\/g, '/')}`);
  await page.waitForTimeout(500); // wait for fonts
  await page.screenshot({ path: path.join(__dirname, 'store-promo-tile.png') });
  console.log('Saved store-promo-tile.png (440x280)');

  // Capture Marquee Tile (1400x560)
  await page.setViewport({ width: 1400, height: 560, deviceScaleFactor: 2 });
  await page.goto(`file:///${path.resolve(__dirname, 'marquee-tile.html').replace(/\\/g, '/')}`);
  await page.waitForTimeout(500); // wait for fonts
  await page.screenshot({ path: path.join(__dirname, 'store-marquee-tile.png') });
  console.log('Saved store-marquee-tile.png (1400x560)');

  await browser.close();
})();
