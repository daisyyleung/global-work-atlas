import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleState } from '../src/data/sample-state.js';
import { reduceWorkspace } from '../src/domain/reducer.js';
import { createStore } from '../src/state/store.js';

function memoryStorage(seed = null, fail = false) {
  const map = new Map(seed ? [['signal-atlas.workspace.v1', JSON.stringify(seed)]] : []);
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { if (fail) throw new Error('quota'); map.set(key, value); }, removeItem: (key) => map.delete(key) };
}

function storageEvents() {
  const listeners = new Set();
  return { addEventListener: (type, listener) => { if (type === 'storage') listeners.add(listener); }, removeEventListener: (type, listener) => { if (type === 'storage') listeners.delete(listener); }, emit: (event) => listeners.forEach((listener) => listener(event)) };
}

test('store reloads valid state and recovers from invalid saved JSON', () => {
  const storage = memoryStorage(createSampleState());
  const store = createStore({ storage, initialState: { ...createSampleState(), tasks: [] } });
  assert.equal(store.getState().tasks.length, 8);
  const invalidStorage = memoryStorage(); invalidStorage.setItem('signal-atlas.workspace.v1', '{bad');
  const fallback = createStore({ storage: invalidStorage, initialState: createSampleState() });
  assert.equal(fallback.getState().meta.sampleData, true);
  assert.match(fallback.getStorageError(), /could not be loaded/);
});

test('store exposes save failure without losing in-memory state', () => {
  const store = createStore({ storage: memoryStorage(null, true), initialState: createSampleState() });
  const before = store.getState();
  store.dispatch({ type: 'UPDATE_TASK', id: 'sample-orbit-map', patch: { progress: 65 }, now: '2026-08-15T10:00:00.000Z' });
  assert.notEqual(store.getState(), before);
  assert.match(store.getStorageError(), /could not be saved/);
});

test('replacement flows append one bounded local event', () => {
  const storage = memoryStorage();
  const store = createStore({ storage, initialState: createSampleState() });
  const imported = store.replace(createSampleState(), 'workspace-imported');
  assert.equal(imported.activity[0].eventType, 'workspace-imported');
  const reset = store.reset({ ...createSampleState(), activity: [] });
  assert.equal(reset.activity[0].eventType, 'workspace-reset');
  assert.ok(reset.activity.length <= 5000);
});

test('store accepts newer storage events and rejects stale local writes', () => {
  const initial = createSampleState();
  const storage = memoryStorage(initial);
  const events = storageEvents();
  const store = createStore({ storage, eventTarget: events, initialState: initial });
  const newer = reduceWorkspace(initial, { type: 'UPDATE_TASK', id: 'sample-orbit-map', patch: { progress: 88 }, now: '2026-08-15T10:00:00.000Z' });
  storage.setItem('signal-atlas.workspace.v1', JSON.stringify(newer));
  events.emit({ key: 'signal-atlas.workspace.v1', storageArea: storage, newValue: JSON.stringify(newer) });
  assert.equal(store.getState().tasks.find((task) => task.id === 'sample-orbit-map').progress, 88);
  const stale = store.getState();
  const evenNewer = reduceWorkspace(newer, { type: 'UPDATE_TASK', id: 'sample-orbit-map', patch: { progress: 89 }, now: '2026-08-15T10:01:00.000Z' });
  storage.setItem('signal-atlas.workspace.v1', JSON.stringify(evenNewer));
  store.dispatch({ type: 'UPDATE_TASK', id: 'sample-orbit-map', patch: { progress: 90 }, now: '2026-08-15T10:02:00.000Z' });
  assert.equal(store.getState(), stale);
  assert.match(store.getStorageError(), /newer workspace revision/);
  events.emit({ key: 'signal-atlas.workspace.v1', storageArea: storage, newValue: '{invalid' });
  assert.equal(store.getState(), stale);
  assert.match(store.getStorageError(), /rejected/);
  store.destroy();
});
