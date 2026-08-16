import { STORAGE_KEY } from '../domain/constants.js';
import { parseWorkspaceJson } from '../domain/schema.js';

export function browserStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const probe = '__signal_atlas_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadStoredWorkspace(storage = browserStorage()) {
  if (!storage) return { state: null, error: 'Local storage is unavailable; using this session only.' };
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (!text) return { state: null, error: null };
    return { state: parseWorkspaceJson(text), error: null };
  } catch (error) {
    return { state: null, error: `Saved workspace could not be loaded: ${error.message || error}` };
  }
}

export function saveWorkspace(state, storage = browserStorage()) {
  if (!storage) return { ok: false, error: 'Local storage is unavailable; changes remain in this session only.' };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: `Workspace could not be saved: ${error.message || error}` };
  }
}

export function clearStoredWorkspace(storage = browserStorage()) {
  if (!storage) return { ok: false, error: 'Local storage is unavailable.' };
  try { storage.removeItem(STORAGE_KEY); return { ok: true, error: null }; } catch (error) { return { ok: false, error: error.message || String(error) }; }
}
