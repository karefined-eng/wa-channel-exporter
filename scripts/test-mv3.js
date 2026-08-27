const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(manifest.manifest_version === 3, "manifest_version must be 3");
check(manifest.permissions.includes("activeTab"), "activeTab permission missing");
check(manifest.permissions.includes("scripting"), "scripting permission missing");
check(manifest.permissions.includes("downloads"), "downloads permission missing");
check(manifest.background?.service_worker === "src/background/service-worker.js", "service worker path mismatch");
check(manifest.content_scripts?.some((item) => item.matches?.includes("https://web.whatsapp.com/*")), "WhatsApp host match missing");

for (const file of ["src/background/service-worker.js", "src/popup/popup.js", "src/content/whatsapp-content.js"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const temp = path.join(root, `.syntax-${path.basename(file, ".js")}.mjs`);
  fs.writeFileSync(temp, source);
  const result = spawnSync(process.execPath, ["--check", temp], { cwd: root, encoding: "utf8" });
  fs.rmSync(temp, { force: true });
  check(result.status === 0, `${file} syntax check failed: ${result.stderr}`);
}

const fixture = "/home/ubuntu/upload/web.whatsapp.com__1787681903222.html";
if (fs.existsSync(fixture)) {
  const html = fs.readFileSync(fixture, "utf8");
  check(html.includes('data-testid="conversation-header"'), "fixture lacks conversation header");
  check(html.includes("data-pre-plain-text"), "fixture lacks timestamp attributes");
  check(html.includes('data-testid="selectable-text"'), "fixture lacks selectable text nodes");
  check(html.includes("<img"), "fixture lacks image media nodes");
  console.log("live HTML fixture checks: PASS");
} else {
  console.log("live HTML fixture checks: SKIP (fixture unavailable)");
}

check(fs.existsSync(path.join(root, "dist", "manifest.json")), "dist manifest missing; run npm run build");
check(fs.existsSync(path.join(root, "dist", "src", "vendor", "jszip.min.js")), "vendored JSZip missing from dist");
check(fs.existsSync(path.join(root, "wa-channel-exporter.zip")), "distribution ZIP missing; run npm run build");

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Manifest V3 and package checks: PASS");
