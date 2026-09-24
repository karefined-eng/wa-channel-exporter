# Store assets

This directory contains the generated graphics prepared for the Chrome Web Store and Microsoft Edge Add-ons listings. The files are derived from the tracked product artwork and tile layouts in this repository; no private WhatsApp data is included.

| File | Dimensions | Purpose |
|---|---:|---|
| `edge-icon-300.png` | 300×300 | Microsoft Edge Add-ons listing icon |
| `promo-tile-440x280.png` | 440×280 | Chrome/Edge promotional tile |
| `marquee-tile-1400x560.png` | 1400×560 | Chrome/Edge marquee tile |
| `screenshot-1-1280x800.png` | 1280×800 | Store screenshot: channel/date/export controls |
| `screenshot-2-1280x800.png` | 1280×800 | Store screenshot: export progress and reporting |

Regenerate every file from the repository root with:

```sh
npm ci
npm run prepare:store-assets
```

The screenshot artwork is promotional repository artwork rather than a fresh authenticated WhatsApp Web capture. Review it for authenticity and privacy before submitting a store listing.
