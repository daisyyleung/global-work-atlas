import { labelForStatus, labelForWorkType, STATUS_LABELS } from '../domain/constants.js';
import { el, button } from './dom.js';

function statusPill(status) { return el('span', { class: `pill ${status}`, text: labelForStatus(status) }); }
function taskCard(task, { onOpen, onArchive, onRestore } = {}) {
  const actions = [];
  if (onOpen) actions.push(button('Open', () => onOpen(task), { class: 'button small' }));
  if (task.archived && onRestore) actions.push(button('Restore', () => onRestore(task), { class: 'button small' }));
  if (!task.archived && onArchive) actions.push(button('Archive', () => onArchive(task), { class: 'button small ghost' }));
  return el('article', { class: 'task-card' }, [
    el('div', { class: 'card-header' }, [el('div', {}, [el('h3', { text: task.title }), el('small', { text: `${task.region} · ${task.teamLabel}` })]), statusPill(task.status)]),
    task.summary ? el('p', { text: task.summary }) : null,
    el('div', { class: 'task-meta' }, [el('span', { class: 'pill', text: labelForWorkType(task.workType) }), el('span', { class: 'pill', text: `${task.progress}%` }), el('span', { class: 'pill', text: `Due ${task.dueDate}` })]),
    el('progress', { class: 'progress', max: 100, value: task.progress, attrs: { 'aria-label': `${task.title} progress` } }, `${task.progress}%`),
    task.tags.length ? el('div', { class: 'tag-list' }, task.tags.map((tag) => el('span', { class: 'tag', text: `#${tag}` }))) : null,
    actions.length ? el('div', { class: 'task-actions' }, actions) : null,
  ]);
}

export function renderCards(tasks, handlers) {
  if (!tasks.length) return el('div', { class: 'empty-state', text: 'No tasks match the current filters.' });
  return el('div', { class: 'grid-3' }, tasks.map((task) => taskCard(task, handlers)));
}

export function renderTable(tasks, handlers) {
  if (!tasks.length) return el('div', { class: 'empty-state', text: 'No tasks match the current filters.' });
  const table = el('table', { class: 'task-table' });
  table.append(el('thead', {}, [el('tr', {}, ['Task', 'Region', 'Type', 'Status', 'Progress', 'Due', ''].map((heading) => el('th', { text: heading })))]));
  const body = el('tbody');
  for (const task of tasks) {
    const actions = [button('Open', () => handlers.onOpen?.(task), { class: 'button small' })];
    if (task.archived) actions.push(button('Restore', () => handlers.onRestore?.(task), { class: 'button small' }));
    else actions.push(button('Archive', () => handlers.onArchive?.(task), { class: 'button small ghost' }));
    body.append(el('tr', {}, [el('td', {}, [el('strong', { text: task.title }), el('small', { text: task.teamLabel })]), el('td', { text: task.region }), el('td', { text: labelForWorkType(task.workType) }), el('td', {}, [statusPill(task.status)]), el('td', { text: `${task.progress}%` }), el('td', { text: task.dueDate }), el('td', { class: 'task-actions' }, actions)]));
  }
  table.append(body);
  return el('div', { class: 'table-scroll' }, [table]);
}

export function renderBoard(tasks, handlers) {
  return el('div', { class: 'board' }, Object.entries(STATUS_LABELS).map(([status, label]) => el('section', { class: 'board-column' }, [el('h3', { text: label }), ...tasks.filter((task) => task.status === status).map((task) => taskCard(task, handlers))])));
}

export function renderHierarchy(tasks, handlers) {
  if (!tasks.length) return el('div', { class: 'empty-state', text: 'No tasks match the current filters.' });
  const regions = new Map();
  for (const task of tasks) { if (!regions.has(task.region)) regions.set(task.region, []); regions.get(task.region).push(task); }
  return el('div', { class: 'hierarchy' }, [...regions.entries()].sort().map(([region, regionTasks]) => el('section', { class: 'hierarchy-group' }, [el('h3', { text: region }), ...regionTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((task) => el('div', { class: 'list-row' }, [el('div', {}, [el('strong', { text: task.title }), el('small', { text: `${task.workstream} · ${task.dueDate}` })]), el('div', { class: 'task-meta' }, [statusPill(task.status), button('Open', () => handlers.onOpen?.(task), { class: 'button small' }), task.archived ? button('Restore', () => handlers.onRestore?.(task), { class: 'button small' }) : button('Archive', () => handlers.onArchive?.(task), { class: 'button small ghost' })])]))])));
}
