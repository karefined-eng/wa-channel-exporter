import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(websiteRoot, '..');
const archive = resolve(repositoryRoot, 'wa-channel-exporter.zip');
const publicArchive = resolve(websiteRoot, 'public', 'wa-channel-exporter.zip');

// The website is deployed independently from the extension. Build the archive
// from the same checkout so the download cannot drift from the published code.
if (!existsSync(resolve(repositoryRoot, 'node_modules', 'jszip'))) {
  execFileSync('npm', ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], {
    cwd: repositoryRoot,
    stdio: 'inherit'
  });
}

execFileSync('npm', ['run', 'build'], {
  cwd: repositoryRoot,
  stdio: 'inherit'
});

mkdirSync(dirname(publicArchive), { recursive: true });
copyFileSync(archive, publicArchive);
console.log(`Published ${publicArchive}`);
