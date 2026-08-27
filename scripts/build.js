const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const vendor = path.join(root, "src", "vendor");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(vendor, { recursive: true });

function copyTree(source, target) {
  fs.cpSync(source, target, { recursive: true });
}

copyTree(path.join(root, "manifest.json"), path.join(dist, "manifest.json"));
copyTree(path.join(root, "src"), path.join(dist, "src"));
const jszip = require.resolve("jszip/dist/jszip.min.js");
fs.copyFileSync(jszip, path.join(dist, "src", "vendor", "jszip.min.js"));

const popup = path.join(dist, "src", "popup", "popup.html");
let html = fs.readFileSync(popup, "utf8");
html = html.replace('<script type="module" src="popup.js"></script>', '<script src="../vendor/jszip.min.js"></script><script type="module" src="popup.js"></script>');
fs.writeFileSync(popup, html);

const archive = path.join(root, "wa-channel-exporter.zip");
fs.rmSync(archive, { force: true });
execFileSync("zip", ["-qr", archive, "."], { cwd: dist });
console.log(`Built ${archive}`);
