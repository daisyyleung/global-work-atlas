export const WORKSPACE_FORMAT = 'signal-atlas-workspace';
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'signal-atlas.workspace.v1';
export const STATUSES = ['planned', 'active', 'at-risk', 'waiting', 'complete'];
export const WORK_TYPES = ['program', 'project', 'operations', 'initiative'];
export const PRIORITY_LIMIT = 5;
export const MAX_TASKS = 500;
export const MAX_ACTIVITY = 5000;
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const VIEW_IDS = ['overview', 'analytics', 'work-index', 'priorities', 'activity'];
export const ANALYTICS_PRESETS = ['30d', '90d', 'year', 'all', 'custom'];
export const REGIONS = ['Northstar', 'Tideway', 'Sunfield', 'Cloudbank', 'Lattice'];
export const STATUS_LABELS = {
  planned: 'Planned',
  active: 'Active',
  'at-risk': 'At risk',
  waiting: 'Waiting',
  complete: 'Complete',
};
export const WORK_TYPE_LABELS = {
  program: 'Program',
  project: 'Project',
  operations: 'Operations',
  initiative: 'Initiative',
};

export const TASK_FIELDS = [
  'id', 'title', 'summary', 'region', 'workstream', 'teamLabel', 'workType',
  'status', 'startDate', 'dueDate', 'progress', 'tags', 'createdAt',
  'updatedAt', 'completedAt', 'archived',
];

export const ACTIVITY_FIELDS = [
  'id', 'taskId', 'taskTitleSnapshot', 'eventType', 'occurredAt', 'changes',
];

export const SETTINGS_FIELDS = ['lastView', 'analyticsRange'];

export function labelForStatus(value) {
  return STATUS_LABELS[value] || value;
}

export function labelForWorkType(value) {
  return WORK_TYPE_LABELS[value] || value;
}

export function dateOnly(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || '').slice(0, 10);
}

export function daysFromToday(offset) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  today.setDate(today.getDate() + offset);
  return dateOnly(today);
}

export function timestampFromToday(offset, hour = 9) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}
