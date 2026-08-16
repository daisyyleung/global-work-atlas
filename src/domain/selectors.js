import { STATUSES, labelForStatus, labelForWorkType } from './constants.js';

/** Maximum number of analytics aggregation buckets rendered or exported. */
export const MAX_ANALYTICS_BUCKETS = 366;

function dateValue(value) {
  return value ? new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`).getTime() : NaN;
}

export function activeTasks(state) { return state.tasks.filter((task) => !task.archived && task.status === 'active'); }
export function visibleTasks(state) { return state.tasks.filter((task) => !task.archived); }

export function overviewMetrics(state, today = new Date()) {
  const tasks = visibleTasks(state);
  const active = tasks.filter((task) => task.status === 'active').length;
  const complete = tasks.filter((task) => task.status === 'complete').length;
  const atRisk = tasks.filter((task) => task.status === 'at-risk').length;
  const waiting = tasks.filter((task) => task.status === 'waiting').length;
  const dueCutoff = new Date(today);
  dueCutoff.setDate(dueCutoff.getDate() + 7);
  const todayValue = new Date(today).setHours(0, 0, 0, 0);
  const dueSoon = tasks.filter((task) => {
    const due = dateValue(task.dueDate);
    return task.status !== 'complete' && Number.isFinite(due) && due >= todayValue && due <= dueCutoff.getTime();
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return { total: tasks.length, active, complete, atRisk, waiting, dueSoon, priority: state.priorityOrder.map((id) => state.tasks.find((task) => task.id === id)).filter(Boolean) };
}

function countBy(tasks, key, label = (value) => value) {
  const map = new Map();
  tasks.forEach((task) => map.set(task[key], (map.get(task[key]) || 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).map(([value, count]) => ({ value, label: label(value), count }));
}

export function overviewBreakdowns(state) {
  const tasks = visibleTasks(state);
  return { regions: countBy(tasks, 'region'), statuses: countBy(tasks, 'status', labelForStatus), workTypes: countBy(tasks, 'workType', labelForWorkType) };
}

export function filterTasks(state, filters = {}) {
  const query = String(filters.search || '').trim().toLowerCase();
  const matches = (task) => {
    if (!filters.includeArchived && task.archived) return false;
    if (query && ![task.title, task.summary, task.region, task.workstream, task.teamLabel, ...task.tags].join(' ').toLowerCase().includes(query)) return false;
    for (const field of ['region', 'status', 'workType', 'teamLabel']) {
      if (filters[field] && filters[field] !== 'all' && task[field] !== filters[field]) return false;
    }
    if (filters.tag && filters.tag !== 'all' && !task.tags.includes(filters.tag)) return false;
    if (filters.priority && filters.priority !== 'all') {
      const isPriority = state.priorityOrder.includes(task.id);
      if ((filters.priority === 'priority') !== isPriority) return false;
    }
    return true;
  };
  return state.tasks.filter(matches);
}

export function filterOptions(state) {
  const tasks = state.tasks;
  return {
    regions: [...new Set(tasks.map((task) => task.region))].sort(),
    statuses: STATUSES,
    workTypes: [...new Set(tasks.map((task) => task.workType))].sort(),
    teams: [...new Set(tasks.map((task) => task.teamLabel))].sort(),
    tags: [...new Set(tasks.flatMap((task) => task.tags))].sort(),
  };
}

function inRange(value, from, to) {
  const date = dateValue(value);
  return Number.isFinite(date) && date >= dateValue(from) && date <= dateValue(to) + 86399999;
}

export function analyticsForRange(state, from, to) {
  const tasks = state.tasks;
  const created = tasks.filter((task) => inRange(task.createdAt, from, to));
  const completed = tasks.filter((task) => task.completedAt && inRange(task.completedAt, from, to));
  const touched = tasks.filter((task) => inRange(task.updatedAt, from, to));
  const actions = state.activity.filter((event) => inRange(event.occurredAt, from, to));
  const spanDays = Math.floor((dateValue(to) - dateValue(from)) / 86400000) + 1;
  const fromParts = dateParts(from);
  const toParts = dateParts(to);
  const monthCount = (toParts.year - fromParts.year) * 12 + toParts.month - fromParts.month + 1;
  const yearSpan = toParts.year - fromParts.year + 1;
  const periodYears = monthCount > 366 ? Math.max(1, Math.ceil(yearSpan / MAX_ANALYTICS_BUCKETS)) : 0;
  const granularity = spanDays <= 366 ? 'day' : monthCount <= MAX_ANALYTICS_BUCKETS ? 'month' : periodYears === 1 ? 'year' : 'multi-year';
  const buckets = [];
  const cursor = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const addBucket = (date, bucketFrom, bucketTo) => {
    const includes = (value) => inRange(value, bucketFrom, bucketTo);
    buckets.push({ date, from: bucketFrom, to: bucketTo, created: created.filter((task) => includes(task.createdAt)).length, completed: completed.filter((task) => includes(task.completedAt)).length, actions: actions.filter((event) => includes(event.occurredAt)).length });
  };
  if (granularity === 'day') {
    while (cursor <= end) {
      const bucketDate = cursor.toISOString().slice(0, 10);
      addBucket(bucketDate, bucketDate, bucketDate);
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (granularity === 'month') {
    cursor.setDate(1);
    while (cursor <= end) {
      const bucketStart = new Date(cursor);
      const bucketEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 12);
      const bucketFrom = bucketStart < new Date(`${from}T12:00:00`) ? from : bucketStart.toISOString().slice(0, 10);
      const bucketTo = bucketEnd > end ? to : bucketEnd.toISOString().slice(0, 10);
      addBucket(bucketStart.toISOString().slice(0, 7), bucketFrom, bucketTo);
      cursor.setMonth(cursor.getMonth() + 1, 1);
    }
  } else {
    let bucketYear = fromParts.year;
    while (bucketYear <= toParts.year) {
      const bucketEndYear = Math.min(toParts.year, bucketYear + periodYears - 1);
      const bucketFrom = bucketYear === fromParts.year ? from : `${yearText(bucketYear)}-01-01`;
      const bucketTo = bucketEndYear === toParts.year ? to : `${yearText(bucketEndYear)}-12-31`;
      const date = granularity === 'year' ? yearText(bucketYear) : `${yearText(bucketYear)}–${yearText(bucketEndYear)}`;
      addBucket(date, bucketFrom, bucketTo);
      bucketYear = bucketEndYear + 1;
    }
  }
  return { from, to, granularity, periodYears, created, completed, touched, actions, counts: { created: created.length, completed: completed.length, touched: touched.length, actions: actions.length }, days: buckets };
}

function dateParts(value) {
  const [year, month] = String(value).slice(0, 10).split('-').map(Number);
  return { year, month };
}

function yearText(year) { return String(year).padStart(4, '0'); }

export function activityEntries(state, { search = '', eventType = 'all' } = {}) {
  const query = search.trim().toLowerCase();
  return state.activity.filter((entry) => {
    if (eventType !== 'all' && entry.eventType !== eventType) return false;
    if (!query) return true;
    return `${entry.taskTitleSnapshot} ${entry.eventType} ${entry.taskId || ''} ${entry.changes.map((change) => `${change.field} ${change.after}`).join(' ')}`.toLowerCase().includes(query);
  }).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function allEventTypes(state) { return [...new Set(state.activity.map((entry) => entry.eventType))].sort(); }
