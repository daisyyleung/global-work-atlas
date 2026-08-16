import { assertWorkspace } from './schema.js';
import { PRIORITY_LIMIT, STATUSES } from './constants.js';

function now() { return new Date().toISOString(); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function nextId(prefix, existing) {
  let id;
  do id = `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; while (existing.has(id));
  return id;
}

function eventFor(task, eventType, changes, ids, occurredAt = now()) {
  return {
    id: nextId('event', ids),
    taskId: task?.id ?? null,
    taskTitleSnapshot: task?.title ?? 'Workspace',
    eventType,
    occurredAt,
    changes: changes.map(({ field, before, after }) => ({ field, before: clone(before), after: clone(after) })),
  };
}

function withRevision(state, patch, event) {
  const activity = event ? [event, ...state.activity].slice(0, 5000) : (patch.activity ?? state.activity);
  return assertWorkspace({ ...state, ...patch, revision: state.revision + 1, activity });
}

function changedFields(before, after) {
  const changes = [];
  for (const field of ['title', 'summary', 'region', 'workstream', 'teamLabel', 'workType', 'status', 'startDate', 'dueDate', 'progress', 'tags', 'archived']) {
    if (JSON.stringify(before[field]) !== JSON.stringify(after[field])) changes.push({ field, before: before[field], after: after[field] });
  }
  return changes;
}

export function reduceWorkspace(state, action) {
  const current = assertWorkspace(state);
  if (!action || typeof action.type !== 'string') return current;
  const ids = new Set(current.activity.map((item) => item.id));
  const tasks = current.tasks.map((task) => ({ ...task, tags: [...task.tags] }));
  let target;
  let next;
  let event;
  switch (action.type) {
    case 'ADD_TASK': {
      target = { ...action.task };
      if (!target.id) target.id = nextId('task', new Set(tasks.map((task) => task.id)));
      const stamp = action.now || now();
      target.createdAt ||= stamp;
      target.updatedAt ||= stamp;
      target.completedAt ??= target.status === 'complete' ? stamp : null;
      target.archived ??= false;
      target.tags ||= [];
      tasks.push(target);
      event = eventFor(target, 'created', [], ids, stamp);
      return withRevision(current, { tasks }, event);
    }
    case 'UPDATE_TASK': {
      const index = tasks.findIndex((task) => task.id === action.id);
      if (index < 0) return current;
      const before = tasks[index];
      target = { ...before, ...action.patch, id: before.id, updatedAt: action.now || now() };
      if (target.status === 'complete' && !target.completedAt) target.completedAt = action.now || now();
      if (target.status !== 'complete') target.completedAt = null;
      tasks[index] = target;
      const changes = changedFields(before, target);
      if (!changes.length) return current;
      event = eventFor(target, target.status === 'complete' && before.status !== 'complete' ? 'completed' : 'updated', changes, ids, target.updatedAt);
      return withRevision(current, { tasks }, event);
    }
    case 'ARCHIVE_TASK':
    case 'RESTORE_TASK': {
      const index = tasks.findIndex((task) => task.id === action.id);
      if (index < 0) return current;
      const before = tasks[index];
      const archived = action.type === 'ARCHIVE_TASK';
      target = { ...before, archived, updatedAt: action.now || now() };
      tasks[index] = target;
      next = current.priorityOrder.filter((id) => id !== target.id);
      event = eventFor(target, archived ? 'archived' : 'restored', [{ field: 'archived', before: before.archived, after: archived }], ids, target.updatedAt);
      return withRevision(current, { tasks, priorityOrder: next }, event);
    }
    case 'SET_PRIORITIES': {
      const requested = Array.isArray(action.order) ? action.order : [];
      if (requested.length > PRIORITY_LIMIT) return current;
      const eligible = new Set(tasks.filter((task) => !task.archived && task.status === 'active').map((task) => task.id));
      if (requested.some((id, index) => !eligible.has(id) || requested.indexOf(id) !== index)) return current;
      if (JSON.stringify(requested) === JSON.stringify(current.priorityOrder)) return current;
      const changes = [{ field: 'priorityOrder', before: current.priorityOrder, after: requested }];
      event = eventFor(null, 'priorities-changed', changes, ids, action.now || now());
      return withRevision(current, { priorityOrder: requested }, event);
    }
    case 'CLEAR_ACTIVITY':
      if (!current.activity.length) return current;
      return withRevision(current, { activity: [] }, null);
    case 'SET_SETTINGS': {
      const settings = { ...current.settings, ...action.patch };
      return withRevision(current, { settings }, null);
    }
    case 'REPLACE_WORKSPACE':
      return assertWorkspace(action.workspace);
    default:
      return current;
  }
}

export function createBlankState() {
  const stamp = now();
  return assertWorkspace({ format: 'signal-atlas-workspace', schemaVersion: 1, revision: 0, meta: { sampleData: false, name: 'Local workspace', createdAt: stamp }, settings: { lastView: 'overview', analyticsRange: { preset: '30d', from: stamp.slice(0, 10), to: stamp.slice(0, 10) } }, tasks: [], priorityOrder: [], activity: [] });
}

export function statusIsControlled(status) { return STATUSES.includes(status); }
