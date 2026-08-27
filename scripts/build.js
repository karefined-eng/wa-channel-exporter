const fs = require("node:fs");
const path = require("node:path");
const JSZip = require("jszip");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const vendor = path.join(root, "src", "vendor");
const archive = path.join(root, "wa-channel-exporter.zip");

function copyTree(source, target) {
  fs.cpSync(source, target, { recursive: true });
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

  copyTree(path.join(root, "manifest.json"), path.join(dist, "manifest.json"));
  copyTree(path.join(root, "src"), path.join(dist, "src"));

  const jszip = require.resolve("jszip/dist/jszip.min.js");
  fs.copyFileSync(jszip, path.join(dist, "src", "vendor", "jszip.min.js"));

  const popup = path.join(dist, "src", "popup", "popup.html");
  let html = fs.readFileSync(popup, "utf8");
  html = html.replace('<script type="module" src="popup.js"></script>', '<script src="../vendor/jszip.min.js"></script><script type="module" src="popup.js"></script>');
  fs.writeFileSync(popup, html);

  fs.rmSync(archive, { force: true });
  const zip = new JSZip();
  addDirectoryToZip(zip, dist);
  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
  fs.writeFileSync(archive, buffer);
  console.log(`Built ${archive}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
