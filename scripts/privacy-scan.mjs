import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanDirs = ['src', 'public'];
const disallowed = [/\.env(?:\.|$)/i, /api[_-]?key/i, /secret/i, /password/i, /credential/i, /@gmail\./i, /@outlook\./i, /@yahoo\./i, /wrangler/i, /cloudflare/i, /private path/i];
const external = /(?:https?:\/\/|wss?:\/\/|fonts\.googleapis|cdn\.)/i;
const files = [];
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(?:js|mjs|css|html|svg)$/.test(entry.name)) files.push(full);
  }
}
for (const dir of scanDirs) await walk(path.join(root, dir));
const findings = [];
for (const file of files) {
  const text = await fs.readFile(file, 'utf8');
  const relative = path.relative(root, file);
  const withoutSvgNamespace = text.replace(/xmlns="https?:\/\/[^\"]+"/gi, '');
  if (external.test(withoutSvgNamespace)) findings.push(`${relative}: external URL or network asset`);
  for (const pattern of disallowed) if (pattern.test(text) && !['PRIVACY.md', 'SECURITY.md'].includes(path.basename(file))) findings.push(`${relative}: disallowed privacy marker ${pattern}`);
}
const sample = await fs.readFile(path.join(root, 'src/data/sample-state.js'), 'utf8');
if (!sample.includes('sampleData: true')) findings.push('sample-state.js: fictional marker missing');
if (findings.length) { console.error(findings.join('\n')); process.exit(1); }
console.log(`privacy scan passed (${files.length} files)`);
