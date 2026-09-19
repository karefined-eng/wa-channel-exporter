import fs from 'node:fs/promises';
import path from 'node:path';

const [source, destination] = process.argv.slice(2);
if (!source || !destination) throw new Error('Usage: node scripts/prepare-extension-smoke.mjs <source> <destination>');

await fs.rm(destination, { recursive: true, force: true });
await fs.cp(source, destination, { recursive: true });
const manifestPath = path.join(destination, 'manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
if (!manifest.side_panel?.default_path) throw new Error('Expected a side-panel page in the built manifest');
manifest.action = { ...manifest.action, default_popup: manifest.side_panel.default_path };
delete manifest.side_panel;
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
