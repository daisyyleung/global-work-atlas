import { APP_NAME, VIEWS } from '../config.js';
import { el, button, clear, announce } from './dom.js';
import { openTaskDialog, showConfirm, showImportDialog, showResetDialog } from './dialogs.js';
import { renderOverview } from './views/overview.js';
import { renderAnalytics } from './views/analytics.js';
import { renderWorkIndex } from './views/work-index.js';
import { renderPriorities } from './views/priorities.js';
import { renderActivity } from './views/activity.js';

const viewState = { filters: {}, workView: 'cards', activityFilters: {} };
const COPYRIGHT_NOTICE = 'Copyright © 2026 DaisYY Leung. Licensed under the MIT License.';

export function mountApp(root, store) {
  const shell = el('div', { class: 'app-shell' });
  root.append(shell);
  const live = el('div', { class: 'sr-only', attrs: { 'data-live-region': '', 'aria-live': 'polite' } });
  root.append(live);

  function render(state = store.getState()) {
    const currentView = state.settings.lastView || 'overview';
    const storageError = store.getStorageError();
    clear(shell);
    shell.append(renderSidebar(currentView, storageError), renderMain(currentView, state, storageError));
    if (state.meta.sampleData) announce('Fictional sample data is loaded.');
  }

  function renderSidebar(currentView, storageError) {
    const nav = el('nav', { class: 'nav', attrs: { 'aria-label': 'Main navigation' } });
    for (const view of VIEWS) nav.append(el('button', { class: 'nav-button', attrs: { type: 'button', 'aria-current': currentView === view.id ? 'page' : 'false' }, on: { click: () => { store.dispatch({ type: 'SET_SETTINGS', patch: { lastView: view.id } }); } } }, [el('span', { class: 'nav-icon', text: view.icon }), el('span', { text: view.label })]));
    return el('aside', { class: 'sidebar' }, [el('div', { class: 'brand' }, [el('span', { class: 'brand-mark', text: 'SA' }), el('div', {}, [el('strong', { text: APP_NAME }), el('small', { text: 'local workspace' })])]), nav, el('div', { class: 'sidebar-footer' }, [el('p', { text: storageError ? 'Session only · persistence unavailable' : 'No account · saved locally' }), el('p', { text: COPYRIGHT_NOTICE })])]);
  }

  function renderMain(currentView, state, storageError) {
    const title = VIEWS.find((view) => view.id === currentView)?.label || 'Overview';
    const content = currentView === 'analytics' ? renderAnalytics(state, { onExport: handleAnalytics }) : currentView === 'work-index' ? renderWorkIndex(state, { filters: viewState.filters, view: viewState.workView, onFilters: (filters) => { viewState.filters = filters; render(); }, onView: (view) => { viewState.workView = view; render(); }, onOpenTask: openTask, onAddTask: addTask, onArchive: archiveTask, onRestore: restoreTask }) : currentView === 'priorities' ? renderPriorities(state, { onChange: changePriorities, onOpenTask: openTask }) : currentView === 'activity' ? renderActivity(state, { filters: viewState.activityFilters, onFilters: (filters) => { viewState.activityFilters = filters; render(); }, onClear: clearActivity }) : renderOverview(state, { onOpenTask: openTask, onAddTask: addTask });
    const sampleNote = state.meta.sampleData ? el('div', { class: 'alert info', text: 'Fictional sample data is loaded. Replace it with your own non-confidential workspace when ready.' }) : null;
    const storageNote = storageError ? el('div', { class: 'alert error', text: `${storageError} Changes are currently session-only; export a JSON backup before continuing.` }) : null;
    return el('main', { id: 'app-main', class: 'main-area', attrs: { tabindex: '-1' } }, [el('header', { class: 'main-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Signal Atlas' }), el('h1', { text: title }), el('p', { text: subtitle(currentView) })]), el('div', { class: 'header-actions' }, [button('Export JSON', exportJson, { class: 'button' }), button('Import JSON', importJson, { class: 'button' }), button('Reset', resetWorkspace, { class: 'button danger' })])]), el('div', { class: 'content-stack' }, [el('div', { class: 'privacy-banner' }, [el('p', { text: 'Privacy first: data stays in this browser profile. Local storage is unencrypted; do not enter confidential information.' })]), storageNote, sampleNote, content])]);
  }

  function openTask(task) {
    openTaskDialog({ task, onSubmit: (patch) => { store.dispatch({ type: 'UPDATE_TASK', id: task.id, patch }); announce('Task updated.'); } });
  }
  function addTask() {
    openTaskDialog({ onSubmit: (task) => { store.dispatch({ type: 'ADD_TASK', task }); announce('Task added.'); } });
  }
  function archiveTask(task) { showConfirm({ title: 'Archive task?', message: `Archive “${task.title}”? It will leave active views but can be restored.`, confirmLabel: 'Archive', danger: true, onConfirm: () => { store.dispatch({ type: 'ARCHIVE_TASK', id: task.id }); announce('Task archived.'); } }); }
  function restoreTask(task) { store.dispatch({ type: 'RESTORE_TASK', id: task.id }); announce('Task restored.'); }
  function changePriorities(order) {
    if (order.length > 5) return;
    showConfirm({ title: 'Save priority order?', message: 'This writes the exact visible order to local storage and records one local activity event.', confirmLabel: 'Save order', onConfirm: () => { store.dispatch({ type: 'SET_PRIORITIES', order }); announce('Priorities saved.'); } });
  }
  function clearActivity() { showConfirm({ title: 'Clear local activity?', message: 'This removes the local history entries from this workspace. It is not an audit log.', confirmLabel: 'Clear history', danger: true, onConfirm: () => { store.dispatch({ type: 'CLEAR_ACTIVITY' }); announce('Activity cleared.'); } }); }
  function handleAnalytics(action) { if (action.type === 'range') store.dispatch({ type: 'SET_SETTINGS', patch: { analyticsRange: action.value } }); else if (action.type === 'csv') download('signal-atlas-analytics.csv', action.value, 'text/csv;charset=utf-8'); }
  function exportJson() { download('signal-atlas-workspace.json', JSON.stringify(store.getState(), null, 2), 'application/json;charset=utf-8'); announce('JSON backup downloaded.'); }
  function importJson() { showImportDialog({ onImport: (workspace) => { store.replace(workspace, 'workspace-imported'); announce('Workspace replaced from JSON backup.'); } }); }
  function resetWorkspace() { showResetDialog({ onReset: (workspace) => { store.replace(workspace, 'workspace-reset'); announce('Workspace reset.'); } }); }

  render();
  return { render };
}

function subtitle(view) {
  return ({ overview: 'A calm view of what is moving, waiting, and due next.', analytics: 'Time-boxed signals derived from your local workspace.', 'work-index': 'Find, shape, and archive the work behind the signals.', priorities: 'Keep the five most important active tasks in view.', activity: 'A readable history of local changes, for context—not compliance.' })[view];
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: filename, text: `Download ${filename}` });
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
}
