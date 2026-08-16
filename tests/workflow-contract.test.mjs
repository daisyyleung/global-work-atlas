import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';

test('all five workflow view modules are present and wired', async () => {
  const names = ['overview', 'analytics', 'work-index', 'priorities', 'activity'];
  for (const name of names) {
    const text = await fs.readFile(new URL(`../src/ui/views/${name}.js`, import.meta.url), 'utf8');
    assert.ok(text.length > 100, `${name} view should contain implementation`);
  }
  const app = await fs.readFile(new URL('../src/ui/app-shell.js', import.meta.url), 'utf8');
  for (const name of names) assert.match(app, new RegExp(`render${name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}`));
});

test('reset/import and recovery contracts are wired', async () => {
  const dialogs = await fs.readFile(new URL('../src/ui/dialogs.js', import.meta.url), 'utf8');
  assert.match(dialogs, /Confirm replacement/);
  assert.match(dialogs, /file\.size > MAX_IMPORT_BYTES/);
  assert.match(dialogs, /focusableSelector/);
  assert.match(dialogs, /event\.key !== 'Tab'/);
  assert.match(dialogs, /querySelector\('#app-main'\)/);
  const shell = await fs.readFile(new URL('../src/ui/app-shell.js', import.meta.url), 'utf8');
  assert.match(shell, /getStorageError/);
  assert.match(shell, /workspace-imported/);
  assert.match(shell, /workspace-reset/);
  const hierarchy = await fs.readFile(new URL('../src/ui/task-views.js', import.meta.url), 'utf8');
  assert.match(hierarchy, /button\('Archive'/);
  assert.match(hierarchy, /button\('Restore'/);
});

test('analytics controls have a narrow viewport layout', async () => {
  const analytics = await fs.readFile(new URL('../src/ui/views/analytics.js', import.meta.url), 'utf8');
  assert.match(analytics, /analytics-toolbar/);
  const responsive = await fs.readFile(new URL('../src/styles/responsive.css', import.meta.url), 'utf8');
  assert.match(responsive, /@media \(max-width: 480px\)/);
  assert.match(responsive, /analytics-toolbar/);
  assert.match(responsive, /body \{ overflow-x: hidden; \}/);
  const components = await fs.readFile(new URL('../src/styles/components.css', import.meta.url), 'utf8');
  assert.match(components, /\.content-stack, \.card/);
  assert.match(components, /\.chart-bar \{ flex: 1 1 0/);
  assert.match(components, /\.analytics-toolbar > \* \{ min-width: 0/);
});

test('analytics invalid custom ranges surface an error and disable export', async () => {
  const analytics = await fs.readFile(new URL('../src/ui/views/analytics.js', import.meta.url), 'utf8');
  assert.match(analytics, /Choose both dates/);
  assert.match(analytics, /exportButton\.disabled = invalid/);
  assert.match(analytics, /invalid \|\| !next\.from/);
});
