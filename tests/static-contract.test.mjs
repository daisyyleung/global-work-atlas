import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';

test('static shell contains local-first CSP, module entry, and MIT notice', async () => {
  const html = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /type="module"/);
  assert.doesNotMatch(html, /https?:\/\//);
  const shell = await fs.readFile(new URL('../src/ui/app-shell.js', import.meta.url), 'utf8');
  assert.match(shell, /Copyright © 2026 DaisYY Leung/);
  assert.match(shell, /Licensed under the MIT License/);
  const license = await fs.readFile(new URL('../LICENSE', import.meta.url), 'utf8');
  assert.match(license, /^MIT License$/m);
  assert.match(license, /Copyright \(c\) 2026 DaisYY Leung/);
});

test('runtime UI source contains no inline style writes', async () => {
  const files = ['../src/ui/views/overview.js', '../src/ui/views/analytics.js', '../src/ui/task-views.js', '../src/ui/views/priorities.js'];
  for (const file of files) {
    const text = await fs.readFile(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(text, /\bstyle\s*:/);
    assert.doesNotMatch(text, /\.style\b/);
    assert.doesNotMatch(text, /setAttribute\(['"]style/);
  }
});
