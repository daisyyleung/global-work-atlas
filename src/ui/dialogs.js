import { createSampleState } from '../data/sample-state.js';
import { MAX_IMPORT_BYTES } from '../domain/constants.js';
import { createBlankState } from '../domain/reducer.js';
import { parseWorkspaceJson } from '../domain/schema.js';
import { el, button, clear } from './dom.js';

export function openDialog({ title, description = '', body, onClose }) {
  const invokingElement = document.activeElement && typeof document.activeElement.focus === 'function' ? document.activeElement : null;
  const backdrop = el('div', { class: 'dialog-backdrop', attrs: { role: 'presentation' } });
  const dialog = el('section', { class: 'dialog', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dialog-title', tabindex: '-1' } });
  let closed = false;
  const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const close = () => {
    if (closed) return;
    closed = true;
    backdrop.remove();
    onClose?.();
    const focusTarget = invokingElement?.isConnected ? invokingElement : document.querySelector('#app-main');
    if (focusTarget?.isConnected && typeof focusTarget.focus === 'function') focusTarget.focus();
  };
  dialog.append(el('div', { class: 'dialog-header' }, [el('div', {}, [el('h2', { attrs: { id: 'dialog-title' }, text: title }), description ? el('p', { class: 'privacy-copy', text: description }) : null]), button('Close', close, { class: 'button icon', attrs: { 'aria-label': 'Close dialog' } })]), body);
  backdrop.append(dialog); document.body.append(backdrop); dialog.focus();
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll(focusableSelector)];
    if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  return { close, dialog };
}

export function openTaskDialog({ task, onSubmit }) {
  let dialog;
  return import('./task-form.js').then(({ taskForm }) => {
    dialog = openDialog({ title: task ? 'Edit task' : 'Add task', description: 'Saved only in this browser profile.', body: taskForm({ task, onSubmit: (value) => { onSubmit(value); dialog.close(); }, onCancel: () => dialog.close() }) });
    return dialog;
  });
}

export function showConfirm({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm }) {
  let dialog;
  const body = el('div', {}, [el('p', { text: message }), el('div', { class: 'dialog-footer' }, [button('Cancel', () => dialog.close(), { class: 'button ghost' }), button(confirmLabel, () => { onConfirm(); dialog.close(); }, { class: `button ${danger ? 'danger' : 'primary'}` })])]);
  dialog = openDialog({ title, body });
  return dialog;
}

export function showImportDialog({ onImport }) {
  let dialog;
  const textArea = el('textarea', { class: 'input', attrs: { rows: 10, placeholder: '{ "format": "signal-atlas-workspace", ... }' } });
  const fileInput = el('input', { type: 'file', attrs: { accept: 'application/json,.json' } });
  const status = el('div');
  const preview = el('div', { class: 'card', attrs: { hidden: true } });
  const confirmImport = button('Replace workspace', () => { try { onImport(parseWorkspaceJson(textArea.value)); dialog.close(); } catch (error) { clear(status).append(el('div', { class: 'alert error', text: error.message || String(error) })); } }, { class: 'button primary', attrs: { disabled: true } });
  textArea.addEventListener('input', () => {
    try { const value = parseWorkspaceJson(textArea.value); preview.hidden = false; clear(preview).append(el('strong', { text: 'Preview ready' }), el('p', { text: `${value.tasks.length} tasks and ${value.activity.length} activity entries will replace this workspace.` })); confirmImport.disabled = false; clear(status); }
    catch (error) { preview.hidden = true; confirmImport.disabled = true; clear(status).append(el('div', { class: 'alert info', text: error.message || String(error) })); }
  });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      clear(status).append(el('div', { class: 'alert error', text: 'This file exceeds the 2 MiB import limit.' }));
      fileInput.value = '';
      return;
    }
    try { textArea.value = await file.text(); textArea.dispatchEvent(new Event('input')); }
    catch (error) { clear(status).append(el('div', { class: 'alert error', text: error.message || String(error) })); }
  });
  const body = el('div', {}, [el('p', { class: 'privacy-copy', text: 'Paste a JSON backup or choose a local file. Nothing changes until you confirm replacement.' }), fieldLabel('Choose JSON file', fileInput), fieldLabel('JSON backup', textArea), status, preview, el('div', { class: 'dialog-footer' }, [button('Cancel', () => dialog.close(), { class: 'button ghost' }), confirmImport])]);
  dialog = openDialog({ title: 'Import JSON backup', body });
  return dialog;
}

function fieldLabel(label, control) { return el('label', { class: 'field' }, [el('span', { class: 'field-label', text: label }), control]); }

export function showResetDialog({ onReset }) {
  let dialog;
  const choice = el('select', { attrs: { 'aria-label': 'Reset replacement choice' } }, [el('option', { value: '', text: 'Choose a replacement…' }), el('option', { value: 'blank', text: 'Blank workspace' }), el('option', { value: 'sample', text: 'Fictional sample workspace' })]);
  const preview = el('div', { class: 'card', attrs: { hidden: true } });
  const confirm = button('Confirm replacement', () => { if (!choice.value) return; onReset(choice.value === 'sample' ? createSampleState() : createBlankState()); dialog.close(); }, { class: 'button primary', attrs: { disabled: true } });
  choice.addEventListener('change', () => {
    if (choice.value === 'blank') {
      clear(preview).append(el('strong', { text: 'Blank workspace preview' }), el('p', { text: '0 tasks · 0 activity entries · fictional marker: no' }));
      preview.hidden = false; confirm.disabled = false;
    } else if (choice.value === 'sample') {
      const sample = createSampleState();
      clear(preview).append(el('strong', { text: 'Fictional sample preview' }), el('p', { text: `${sample.tasks.length} tasks · ${sample.activity.length} activity entries · fictional marker: yes` }));
      preview.hidden = false; confirm.disabled = false;
    } else { preview.hidden = true; confirm.disabled = true; }
  });
  const body = el('div', {}, [el('p', { text: 'Choose a replacement to preview it. Back up the current workspace before replacing it; nothing changes until the separate confirmation action.' }), el('label', { class: 'field' }, [el('span', { class: 'field-label', text: 'Replacement' }), choice]), preview, el('div', { class: 'dialog-footer' }, [button('Cancel', () => dialog.close(), { class: 'button ghost' }), confirm])]);
  dialog = openDialog({ title: 'Reset workspace', description: 'This replaces the current in-browser workspace.', body });
  return dialog;
}
