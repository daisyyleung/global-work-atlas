import { createSampleState } from '../data/sample-state.js';
import { MAX_ACTIVITY, STORAGE_KEY } from '../domain/constants.js';
import { assertWorkspace, parseWorkspaceJson } from '../domain/schema.js';
import { reduceWorkspace } from '../domain/reducer.js';
import { browserStorage, loadStoredWorkspace, saveWorkspace } from './storage.js';

export function createStore({ storage = browserStorage(), initialState = createSampleState(), eventTarget = typeof window === 'undefined' ? null : window } = {}) {
  const loaded = loadStoredWorkspace(storage);
  let state = loaded.state || assertWorkspace(initialState);
  let storageError = loaded.error;
  const listeners = new Set();
  function notify() { for (const listener of listeners) listener(state, { storageError }); }
  function readStorageState() {
    if (!storage) return { kind: 'unavailable' };
    let text;
    try { text = storage.getItem(STORAGE_KEY); } catch (error) { return { kind: 'error', error: error.message || String(error) }; }
    if (text === null) return { kind: 'empty' };
    try { return { kind: 'valid', state: parseWorkspaceJson(text) }; }
    catch (error) { return { kind: 'invalid', error: error.message || String(error) }; }
  }
  function storageMatchesExpectedRevision(expectedRevision, { allowInvalid = false } = {}) {
    const current = readStorageState();
    if (current.kind === 'unavailable' || current.kind === 'empty') return true;
    if (current.kind !== 'valid') {
      if (allowInvalid) return true;
      storageError = `Saved workspace changed but is invalid; local mutation was not written (${current.error}).`;
      return false;
    }
    if (current.state.revision !== expectedRevision) {
      storageError = `A newer workspace revision exists in another tab; local mutation was not written (expected ${expectedRevision}, found ${current.state.revision}).`;
      return false;
    }
    return true;
  }
  function handleStorageEvent(event) {
    if (!event || event.key !== STORAGE_KEY) return;
    if (event.storageArea && storage && event.storageArea !== storage) return;
    if (event.newValue === null) {
      storageError = 'The workspace was cleared in another tab; this tab kept its state and is now session-only.';
      notify();
      return;
    }
    let incoming;
    try { incoming = parseWorkspaceJson(event.newValue); }
    catch (error) {
      storageError = `A workspace update from another tab was rejected: ${error.message || error}`;
      notify();
      return;
    }
    if (incoming.revision <= state.revision) return;
    state = incoming;
    storageError = null;
    notify();
  }
  eventTarget?.addEventListener?.('storage', handleStorageEvent);
  return {
    getState() { return state; },
    getStorageError() { return storageError; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    dispatch(action) {
      const next = reduceWorkspace(state, action);
      if (next === state || next.revision === state.revision) return state;
      if (!storageMatchesExpectedRevision(state.revision)) { notify(); return state; }
      state = next;
      const result = saveWorkspace(state, storage);
      storageError = result.error;
      notify();
      return state;
    },
    replace(workspace, eventType = null) {
      const next = assertWorkspace(workspace);
      if (!storageMatchesExpectedRevision(state.revision, { allowInvalid: Boolean(eventType) })) { notify(); return state; }
      let replacement = next;
      if (eventType) {
        const ids = new Set(next.activity.map((entry) => entry.id));
        let id;
        do id = `event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; while (ids.has(id));
        const event = { id, taskId: null, taskTitleSnapshot: 'Workspace', eventType, occurredAt: new Date().toISOString(), changes: [{ field: 'taskCount', before: null, after: next.tasks.length }] };
        replacement = assertWorkspace({ ...next, revision: next.revision + 1, activity: [event, ...next.activity].slice(0, MAX_ACTIVITY) });
      }
      state = replacement;
      const result = saveWorkspace(state, storage);
      storageError = result.error;
      notify();
      return state;
    },
    reset(workspace) {
      return this.replace(workspace, 'workspace-reset');
    },
    clearStorage() {
      try { storage?.removeItem?.(STORAGE_KEY); } catch { /* best effort */ }
    },
    destroy() {
      eventTarget?.removeEventListener?.('storage', handleStorageEvent);
      listeners.clear();
    },
  };
}
