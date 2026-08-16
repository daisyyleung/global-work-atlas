import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleState } from '../src/data/sample-state.js';
import { analyticsForRange, filterTasks, overviewMetrics } from '../src/domain/selectors.js';

test('overview metrics and filters derive from one task source', () => {
  const state = createSampleState();
  const metrics = overviewMetrics(state, new Date(`${state.tasks[0].startDate}T12:00:00`));
  assert.equal(metrics.total, state.tasks.filter((task) => !task.archived).length);
  assert.ok(filterTasks(state, { status: 'active' }).every((task) => task.status === 'active'));
  assert.ok(filterTasks(state, { search: 'orbit' }).some((task) => task.id === 'sample-orbit-map'));
});

test('analytics range is inclusive and counts created/completed/touched/actions', () => {
  const state = createSampleState();
  const result = analyticsForRange(state, '2026-01-01', '2026-12-31');
  assert.equal(result.counts.created, state.tasks.length);
  assert.equal(result.counts.completed, state.tasks.filter((task) => task.completedAt).length);
  assert.equal(result.counts.actions, state.activity.length);
  assert.ok(result.days.length >= 300);
});

test('long analytics ranges use complete monthly buckets and preserve totals', () => {
  const state = createSampleState();
  const result = analyticsForRange(state, '2010-03-15', '2026-08-20');
  assert.equal(result.granularity, 'month');
  assert.equal(result.days[0].from, '2010-03-15');
  assert.equal(result.days.at(-1).to, '2026-08-20');
  assert.equal(result.days.reduce((sum, day) => sum + day.created, 0), result.counts.created);
  assert.equal(result.days.reduce((sum, day) => sum + day.completed, 0), result.counts.completed);
  assert.equal(result.days.reduce((sum, day) => sum + day.actions, 0), result.counts.actions);
});

test('extreme accepted date ranges stay bounded without truncating coverage or totals', () => {
  const state = createSampleState();
  const started = performance.now();
  const result = analyticsForRange(state, '0001-01-01', '9999-12-31');
  const elapsed = performance.now() - started;
  assert.ok(result.days.length <= 366);
  assert.equal(result.days[0].from, '0001-01-01');
  assert.equal(result.days.at(-1).to, '9999-12-31');
  assert.equal(result.days.reduce((sum, bucket) => sum + bucket.created, 0), result.counts.created);
  assert.equal(result.days.reduce((sum, bucket) => sum + bucket.completed, 0), result.counts.completed);
  assert.equal(result.days.reduce((sum, bucket) => sum + bucket.actions, 0), result.counts.actions);
  assert.ok(elapsed < 1000, `extreme analytics took ${elapsed}ms`);
});
