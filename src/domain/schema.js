import {
  ACTIVITY_FIELDS, MAX_ACTIVITY, MAX_IMPORT_BYTES, MAX_TASKS, PRIORITY_LIMIT,
  ANALYTICS_PRESETS, SCHEMA_VERSION, SETTINGS_FIELDS, STATUSES, TASK_FIELDS,
  VIEW_IDS, WORKSPACE_FORMAT,
  WORK_TYPES,
} from './constants.js';

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function fail(message) {
  throw new Error(message);
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function exactKeys(value, allowed, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object`);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(`${label} contains unsupported field: ${key}`);
  }
}

function requiredString(value, label, max = 240) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > max) fail(`${label} must be a non-empty string`);
  return value;
}

function optionalString(value, label, max = 240) {
  if (typeof value !== 'string' || value.length > max) fail(`${label} must be text`);
  return value;
}

function validId(value, label) {
  requiredString(value, label, 80);
  if (!ID_RE.test(value)) fail(`${label} has an invalid format`);
  return value;
}

function validTimestamp(value, label) {
  requiredString(value, label, 64);
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) fail(`${label} must be an ISO timestamp`);
  return value;
}

function validDate(value, label) {
  requiredString(value, label, 10);
  if (!DATE_RE.test(value)) fail(`${label} must be YYYY-MM-DD`);
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) fail(`${label} is not a valid date`);
  return value;
}

function cloneSimple(value) {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(cloneSimple);
  if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneSimple(item)]));
  fail('Unsupported nested value');
}

function normalizeTask(input, index) {
  const label = `tasks[${index}]`;
  exactKeys(input, TASK_FIELDS, label);
  const task = {
    id: validId(input.id, `${label}.id`),
    title: requiredString(input.title, `${label}.title`, 160),
    summary: optionalString(input.summary || '', `${label}.summary`, 1200),
    region: requiredString(input.region, `${label}.region`, 100),
    workstream: requiredString(input.workstream, `${label}.workstream`, 120),
    teamLabel: requiredString(input.teamLabel, `${label}.teamLabel`, 120),
    workType: input.workType,
    status: input.status,
    startDate: validDate(input.startDate, `${label}.startDate`),
    dueDate: validDate(input.dueDate, `${label}.dueDate`),
    progress: input.progress,
    tags: input.tags,
    createdAt: validTimestamp(input.createdAt, `${label}.createdAt`),
    updatedAt: validTimestamp(input.updatedAt, `${label}.updatedAt`),
    completedAt: input.completedAt,
    archived: input.archived,
  };
  if (!WORK_TYPES.includes(task.workType)) fail(`${label}.workType is unsupported`);
  if (!STATUSES.includes(task.status)) fail(`${label}.status is unsupported`);
  if (task.startDate > task.dueDate) fail(`${label} startDate must be on or before dueDate`);
  if (typeof task.progress !== 'number' || !Number.isFinite(task.progress) || task.progress < 0 || task.progress > 100) fail(`${label}.progress must be 0-100`);
  if (!Array.isArray(task.tags) || task.tags.length > 30) fail(`${label}.tags must be an array`);
  task.tags = task.tags.map((tag, tagIndex) => requiredString(tag, `${label}.tags[${tagIndex}]`, 60));
  if (typeof task.archived !== 'boolean') fail(`${label}.archived must be boolean`);
  if (task.completedAt !== null) validTimestamp(task.completedAt, `${label}.completedAt`);
  if (task.status === 'complete' && task.completedAt === null) fail(`${label}.completedAt is required for complete tasks`);
  if (task.status !== 'complete' && task.completedAt !== null) fail(`${label}.completedAt only applies to complete tasks`);
  return task;
}

function normalizeActivity(input, index, taskIds) {
  const label = `activity[${index}]`;
  exactKeys(input, ACTIVITY_FIELDS, label);
  const event = {
    id: validId(input.id, `${label}.id`),
    taskId: input.taskId,
    taskTitleSnapshot: requiredString(input.taskTitleSnapshot, `${label}.taskTitleSnapshot`, 160),
    eventType: requiredString(input.eventType, `${label}.eventType`, 80),
    occurredAt: validTimestamp(input.occurredAt, `${label}.occurredAt`),
    changes: input.changes,
  };
  if (event.taskId !== null) {
    validId(event.taskId, `${label}.taskId`);
    if (!taskIds.has(event.taskId)) fail(`${label}.taskId does not reference a task`);
  }
  if (!Array.isArray(event.changes) || event.changes.length > 30) fail(`${label}.changes must be an array`);
  event.changes = event.changes.map((change, changeIndex) => {
    const changeLabel = `${label}.changes[${changeIndex}]`;
    exactKeys(change, ['field', 'before', 'after'], changeLabel);
    requiredString(change.field, `${changeLabel}.field`, 80);
    return { field: change.field, before: cloneSimple(change.before), after: cloneSimple(change.after) };
  });
  return event;
}

export function rebuildWorkspace(input, { maxBytes = MAX_IMPORT_BYTES } = {}) {
  if (!isPlainObject(input)) fail('Workspace must be an object');
  exactKeys(input, ['format', 'schemaVersion', 'revision', 'meta', 'settings', 'tasks', 'priorityOrder', 'activity'], 'workspace');
  if (input.format !== WORKSPACE_FORMAT) fail('Unsupported workspace format');
  if (input.schemaVersion !== SCHEMA_VERSION) fail('Unsupported schema version');
  if (!Number.isInteger(input.revision) || input.revision < 0) fail('revision must be a non-negative integer');
  exactKeys(input.meta, ['sampleData', 'name', 'createdAt'], 'meta');
  if (typeof input.meta.sampleData !== 'boolean') fail('meta.sampleData must be boolean');
  const meta = { sampleData: input.meta.sampleData };
  if (input.meta.name !== undefined) meta.name = optionalString(input.meta.name, 'meta.name', 160);
  if (input.meta.createdAt !== undefined) meta.createdAt = validTimestamp(input.meta.createdAt, 'meta.createdAt');
  exactKeys(input.settings, SETTINGS_FIELDS, 'settings');
  const settings = {};
  if (input.settings.lastView !== undefined) {
    requiredString(input.settings.lastView, 'settings.lastView', 40);
    if (!VIEW_IDS.includes(input.settings.lastView)) fail('settings.lastView is unsupported');
    settings.lastView = input.settings.lastView;
  }
  if (input.settings.analyticsRange !== undefined) {
    exactKeys(input.settings.analyticsRange, ['preset', 'from', 'to'], 'settings.analyticsRange');
    settings.analyticsRange = {
      preset: requiredString(input.settings.analyticsRange.preset, 'settings.analyticsRange.preset', 20),
      from: validDate(input.settings.analyticsRange.from, 'settings.analyticsRange.from'),
      to: validDate(input.settings.analyticsRange.to, 'settings.analyticsRange.to'),
    };
    if (!ANALYTICS_PRESETS.includes(settings.analyticsRange.preset)) fail('settings.analyticsRange.preset is unsupported');
    if (settings.analyticsRange.from > settings.analyticsRange.to) fail('analytics range is inverted');
  }
  if (!Array.isArray(input.tasks) || input.tasks.length > MAX_TASKS) fail(`tasks must contain at most ${MAX_TASKS} items`);
  const tasks = input.tasks.map(normalizeTask);
  const taskIds = new Set();
  for (const task of tasks) {
    if (taskIds.has(task.id)) fail(`Duplicate task id: ${task.id}`);
    taskIds.add(task.id);
  }
  if (!Array.isArray(input.priorityOrder) || input.priorityOrder.length > PRIORITY_LIMIT) fail('priorityOrder exceeds maximum');
  const priorityOrder = [];
  for (const id of input.priorityOrder) {
    validId(id, 'priorityOrder id');
    if (priorityOrder.includes(id)) fail('priorityOrder contains duplicate ids');
    const task = tasks.find((candidate) => candidate.id === id);
    if (!task || task.archived || task.status !== 'active') fail('priorityOrder must contain active, non-archived tasks');
    priorityOrder.push(id);
  }
  if (!Array.isArray(input.activity) || input.activity.length > MAX_ACTIVITY) fail(`activity must contain at most ${MAX_ACTIVITY} items`);
  const activityIds = new Set();
  const activity = input.activity.map((entry, index) => {
    const event = normalizeActivity(entry, index, taskIds);
    if (activityIds.has(event.id)) fail(`Duplicate activity id: ${event.id}`);
    activityIds.add(event.id);
    return event;
  });
  const result = { format: WORKSPACE_FORMAT, schemaVersion: SCHEMA_VERSION, revision: input.revision, meta, settings, tasks, priorityOrder, activity };
  const encoded = JSON.stringify(result);
  if (new TextEncoder().encode(encoded).byteLength > maxBytes) fail('Workspace exceeds the import size limit');
  return result;
}

export function validateWorkspace(input, options) {
  try {
    return { ok: true, value: rebuildWorkspace(input, options), errors: [] };
  } catch (error) {
    return { ok: false, value: null, errors: [error instanceof Error ? error.message : String(error)] };
  }
}

export function parseWorkspaceJson(text, options) {
  if (typeof text !== 'string') fail('JSON input must be text');
  const bytes = new TextEncoder().encode(text).byteLength;
  if (bytes > (options?.maxBytes ?? MAX_IMPORT_BYTES)) fail('JSON import exceeds the size limit');
  let parsed;
  try { parsed = JSON.parse(text); } catch { fail('JSON import is not valid JSON'); }
  return rebuildWorkspace(parsed, options);
}

export function assertWorkspace(input) {
  const result = validateWorkspace(input);
  if (!result.ok) fail(result.errors[0]);
  return result.value;
}
