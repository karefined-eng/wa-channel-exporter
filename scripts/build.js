const fs = require("node:fs");
const path = require("node:path");
const JSZip = require("jszip");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const vendor = path.join(root, "src", "vendor");
const storeBuild = process.env.STORE_BUILD === "true";
const storeTarget = process.env.STORE_TARGET || "chrome";
const archiveName = process.env.ARCHIVE_NAME || "wa-channel-exporter.zip";
const archive = path.join(root, path.basename(archiveName));

const storeDescriptions = {
  chrome: "Export WhatsApp Channel posts from WhatsApp Web into a local ZIP archive with date ranges and missing-item reports.",
  edge: "WA Channel Exporter is a local-first, read-only browser extension for exporting authorized WhatsApp Channel posts and available media from WhatsApp Web. Choose a date range and export posts, media, or both into a portable ZIP archive with an offline viewer, structured JSONL and CSV records, PDF output, and clear reports for unavailable or partial content. No channel content is uploaded to a server, and the extension does not send messages or modify your WhatsApp account.",
};

function copyTree(source, target) {
  fs.cpSync(source, target, { recursive: true });
}

function sanitizeJsZipBundle(file) {
  const source = fs.readFileSync(file, "utf8");
  const fallback = 'e=new Function(""+e)';
  if (!source.includes(fallback)) {
    throw new Error(`Expected JSZip setImmediate fallback not found in ${file}`);
  }
  const sanitized = source.replaceAll(fallback, 'e=function(){throw new TypeError("Callback must be a function")}');
  fs.writeFileSync(file, sanitized);
}

function addDirectoryToZip(zip, directory, prefix = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) addDirectoryToZip(zip, absolute, relative);
    else if (entry.isFile()) zip.file(relative.replaceAll(path.sep, "/"), fs.readFileSync(absolute));
  }
}

async function build() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
  fs.mkdirSync(vendor, { recursive: true });

  const manifestPath = path.join(root, "manifest.json");
  const builtManifestPath = path.join(dist, "manifest.json");
  copyTree(manifestPath, builtManifestPath);
  if (storeBuild) {
    const manifest = JSON.parse(fs.readFileSync(builtManifestPath, "utf8"));
    if (!storeDescriptions[storeTarget]) {
      throw new Error(`Unsupported STORE_TARGET: ${storeTarget}. Use chrome or edge.`);
    }
    delete manifest.key;
    manifest.description = storeDescriptions[storeTarget];
    fs.writeFileSync(builtManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  copyTree(path.join(root, "src"), path.join(dist, "src"));

  const jszip = require.resolve("jszip/dist/jszip.min.js");
  const jszipOutput = path.join(dist, "src", "vendor", "jszip.min.js");
  fs.copyFileSync(jszip, jszipOutput);
  sanitizeJsZipBundle(jszipOutput);

  const popup = path.join(dist, "src", "popup", "popup.html");
  let html = fs.readFileSync(popup, "utf8");
  html = html.replace('<script type="module" src="popup.js"></script>', '<script src="../vendor/jszip.min.js"></script><script type="module" src="popup.js"></script>');
  fs.writeFileSync(popup, html);

  fs.rmSync(archive, { force: true });
  const zip = new JSZip();
  addDirectoryToZip(zip, dist);
  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
  fs.writeFileSync(archive, buffer);
  console.log(`Built ${archive} (${storeBuild ? storeTarget : "development"} package)`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
