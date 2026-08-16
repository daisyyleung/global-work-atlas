import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleState } from '../src/data/sample-state.js';
import { parseWorkspaceJson, validateWorkspace } from '../src/domain/schema.js';

test('sample workspace is valid, fictional, and round trips', () => {
  const sample = createSampleState();
  assert.equal(sample.meta.sampleData, true);
  const rebuilt = parseWorkspaceJson(JSON.stringify(sample));
  assert.deepEqual(rebuilt.tasks.map((task) => task.id), sample.tasks.map((task) => task.id));
});

test('schema rejects unknown fields, duplicate ids, and invalid priorities', () => {
  const sample = createSampleState();
  const unknown = structuredClone(sample); unknown.tasks[0].unexpected = true;
  assert.equal(validateWorkspace(unknown).ok, false);
  const duplicate = structuredClone(sample); duplicate.tasks[1].id = duplicate.tasks[0].id;
  assert.equal(validateWorkspace(duplicate).ok, false);
  const priority = structuredClone(sample); priority.priorityOrder = ['sample-lattice-story'];
  assert.equal(validateWorkspace(priority).ok, false);
});

test('schema rejects oversized JSON before replacement', () => {
  const sample = createSampleState();
  assert.throws(() => parseWorkspaceJson(JSON.stringify(sample), { maxBytes: 20 }));
});

test('schema allowlists view and analytics settings', () => {
  const sample = createSampleState();
  const invalidView = structuredClone(sample); invalidView.settings.lastView = 'private-view';
  assert.equal(validateWorkspace(invalidView).ok, false);
  const invalidPreset = structuredClone(sample); invalidPreset.settings.analyticsRange.preset = 'forever';
  assert.equal(validateWorkspace(invalidPreset).ok, false);
  const valid = structuredClone(sample); valid.settings.lastView = 'activity'; valid.settings.analyticsRange.preset = 'custom';
  assert.equal(validateWorkspace(valid).ok, true);
});
