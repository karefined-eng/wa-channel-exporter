# Store packaging

Chrome Web Store and Microsoft Edge Add-ons use the same extension code, but this repository produces separate submission archives because the stores have different manifest-description constraints.

## Build both packages

From the repository root:

```sh
npm ci
npm run build:stores
```

This creates two local, ignored archives:

| Store | Archive | Manifest description |
|---|---|---|
| Chrome Web Store | `wa-channel-exporter-chrome.zip` | Short Chrome-compatible description |
| Microsoft Edge Add-ons | `wa-channel-exporter-edge.zip` | Expanded Edge-compatible description |

Both packages use Manifest V3, remove the development-only `key` field, contain the same extension code and permissions, and are built from the same source commit. Only the store-specific manifest description and archive filename differ.

The build also removes legacy dynamic-code fallbacks from the bundled JSZip and PDFMake files. The extension does not need string callbacks or remote code; the packaged bundles are checked for `eval` and `new Function` patterns by `node scripts/test-mv3.js`.

To build one package independently:

```sh
npm run build:chrome
npm run build:edge
```

The ZIP files are generated locally and are intentionally excluded from Git. Record the checksum of the exact archive uploaded to each store:

```sh
sha256sum wa-channel-exporter-chrome.zip wa-channel-exporter-edge.zip
```

Upload the corresponding listing artwork and complete the store-specific privacy, permission, support, and description fields in each dashboard.
