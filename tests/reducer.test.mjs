import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleState } from '../src/data/sample-state.js';
import { createBlankState, reduceWorkspace } from '../src/domain/reducer.js';

test('task update creates a local activity event and increments revision', () => {
  const state = createSampleState();
  const next = reduceWorkspace(state, { type: 'UPDATE_TASK', id: 'sample-orbit-map', patch: { progress: 70 }, now: '2026-08-15T10:00:00.000Z' });
  assert.equal(next.revision, state.revision + 1);
  assert.equal(next.tasks.find((task) => task.id === 'sample-orbit-map').progress, 70);
  assert.equal(next.activity[0].eventType, 'updated');
});

test('archive removes priority and restore makes task eligible', () => {
  const state = createSampleState();
  const archived = reduceWorkspace(state, { type: 'ARCHIVE_TASK', id: 'sample-orbit-map', now: '2026-08-15T10:00:00.000Z' });
  assert.equal(archived.priorityOrder.includes('sample-orbit-map'), false);
  const restored = reduceWorkspace(archived, { type: 'RESTORE_TASK', id: 'sample-orbit-map', now: '2026-08-15T10:01:00.000Z' });
  assert.equal(restored.tasks.find((task) => task.id === 'sample-orbit-map').archived, false);
});

test('priority change emits exactly one event and clear activity works', () => {
  const state = createBlankState();
  const withTask = reduceWorkspace(state, { type: 'ADD_TASK', task: { id: 'task-one', title: 'One', summary: '', region: 'Northstar', workstream: 'Work', teamLabel: 'Team', workType: 'project', status: 'active', startDate: '2026-08-15', dueDate: '2026-08-20', progress: 0, tags: [] }, now: '2026-08-15T10:00:00.000Z' });
  const prioritized = reduceWorkspace(withTask, { type: 'SET_PRIORITIES', order: ['task-one'], now: '2026-08-15T10:01:00.000Z' });
  assert.equal(prioritized.activity.filter((event) => event.eventType === 'priorities-changed').length, 1);
  const cleared = reduceWorkspace(prioritized, { type: 'CLEAR_ACTIVITY' });
  assert.equal(cleared.activity.length, 0);
});
