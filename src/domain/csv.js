function protectFormula(value) {
  const text = String(value ?? '');
  return /^[\s\p{Cc}]*[=+\-@]/u.test(text) ? `'${text}` : text;
}

export function escapeCsvCell(value) {
  const text = protectFormula(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows) {
  if (!Array.isArray(rows) || !rows.length) return '\uFEFF';
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const row of rows) lines.push(headers.map((header) => escapeCsvCell(row[header])).join(','));
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

export function tasksToCsv(tasks) {
  return toCsv(tasks.map((task) => ({ id: task.id, title: task.title, region: task.region, workstream: task.workstream, team: task.teamLabel, type: task.workType, status: task.status, startDate: task.startDate, dueDate: task.dueDate, progress: task.progress, tags: task.tags.join('; '), createdAt: task.createdAt, updatedAt: task.updatedAt, completedAt: task.completedAt || '' })));
}

export function analyticsToCsv(analytics) {
  return toCsv(analytics.days.map((day) => ({ granularity: analytics.granularity, date: day.date, from: day.from, to: day.to, created: day.created, completed: day.completed, actions: day.actions })));
}
