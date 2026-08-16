import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['src', 'scripts', 'tests'];
const forbidden = [/innerHTML\s*=/, /insertAdjacentHTML/, /eval\s*\(/, /new\s+Function\s*\(/];
const files = [];
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(?:js|mjs|css|html)$/.test(entry.name)) files.push(full);
  }
}
for (const dir of sourceRoots) await walk(path.join(root, dir));
files.push(path.join(root, 'index.html'));
const unique = [...new Set(files)].filter((file) => !file.includes(`${path.sep}node_modules${path.sep}`));
const errors = [];
for (const file of unique) {
  const text = await fs.readFile(file, 'utf8');
  const lines = text.split('\n').length;
  if (lines > 500 && !file.includes(`${path.sep}tests${path.sep}`)) errors.push(`${path.relative(root, file)} exceeds 500 lines (${lines})`);
  if (!file.endsWith(path.join('scripts', 'check-source.mjs'))) for (const pattern of forbidden) if (pattern.test(text)) errors.push(`${path.relative(root, file)} contains forbidden pattern ${pattern}`);
  for (const match of text.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]\s*\)?/g)) {
    const target = path.resolve(path.dirname(file), match[1]);
    const candidates = [target, `${target}.js`, `${target}.mjs`, path.join(target, 'index.js')];
    if (!candidates.some((candidate) => files.includes(candidate) || candidate === path.join(root, 'index.html'))) errors.push(`${path.relative(root, file)} imports missing module ${match[1]}`);
  }
  if (path.basename(file) === 'index.html' && !text.includes("connect-src 'none'")) errors.push('index.html is missing connect-src \'none\'');
}
const packageText = await fs.readFile(path.join(root, 'package.json'), 'utf8');
const pkg = JSON.parse(packageText);
if (!pkg.private) errors.push('package must be private');
if (pkg.dependencies || pkg.devDependencies) errors.push('package must not declare dependencies');
if (!errors.length) { console.log(`source contract passed (${unique.length} files)`); process.exit(0); }
console.error(errors.join('\n')); process.exit(1);
