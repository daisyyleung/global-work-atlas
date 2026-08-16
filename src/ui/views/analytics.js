import { analyticsForRange } from '../../domain/selectors.js';
import { analyticsToCsv } from '../../domain/csv.js';
import { el, field, button, selectControl } from '../dom.js';

function dateString(date) { return date.toISOString().slice(0, 10); }
function rangeForPreset(preset, state) {
  const end = new Date(); end.setHours(12, 0, 0, 0);
  const start = new Date(end);
  if (preset === '90d') start.setDate(start.getDate() - 89);
  else if (preset === 'year') { start.setMonth(0, 1); }
  else if (preset === 'all') {
    const evidence = state.tasks.flatMap((task) => [task.startDate, task.dueDate, task.createdAt, task.updatedAt, task.completedAt]).concat(state.activity.map((entry) => entry.occurredAt)).filter(Boolean).map((value) => String(value).slice(0, 10)).sort();
    if (evidence.length) start.setTime(new Date(`${evidence[0]}T12:00:00`).getTime());
  }
  else start.setDate(start.getDate() - 29);
  return { from: dateString(start), to: dateString(end) };
}

export function renderAnalytics(state, { onExport }) {
  const savedRange = state.settings.analyticsRange;
  const range = savedRange?.preset === 'all' ? { preset: 'all', ...rangeForPreset('all', state) } : (savedRange || { preset: '30d', ...rangeForPreset('30d', state) });
  const preset = selectControl([{ value: '30d', label: 'Last 30 days' }, { value: '90d', label: 'Last 90 days' }, { value: 'year', label: 'This year' }, { value: 'all', label: 'All time' }, { value: 'custom', label: 'Custom range' }], range.preset);
  const from = el('input', { type: 'date', value: range.from });
  const to = el('input', { type: 'date', value: range.to });
  const invalidRange = () => preset.value === 'custom' && (!from.value || !to.value || from.value > to.value);
  const rangeError = el('div', { class: 'alert error', text: 'Choose both dates; the start date must be on or before the end date.', attrs: { role: 'alert', hidden: true } });
  const exportButton = button('Export CSV', () => onExport({ type: 'csv', value: analyticsToCsv(analytics) }), { class: 'button primary', attrs: { disabled: invalidRange() } });
  const update = () => {
    const next = preset.value === 'custom' ? { preset: 'custom', from: from.value, to: to.value } : { preset: preset.value, ...rangeForPreset(preset.value, state) };
    const invalid = invalidRange();
    rangeError.hidden = !invalid;
    exportButton.disabled = invalid;
    if (invalid || !next.from || !next.to || next.from > next.to) return;
    onExport({ type: 'range', value: next });
  };
  preset.addEventListener('change', () => { if (preset.value !== 'custom') { const next = rangeForPreset(preset.value, state); from.value = next.from; to.value = next.to; } update(); });
  from.addEventListener('input', update); from.addEventListener('change', update); to.addEventListener('input', update); to.addEventListener('change', update);
  const analytics = analyticsForRange(state, range.from, range.to);
  const max = Math.max(1, ...analytics.days.map((day) => day.created + day.completed + day.actions));
  return el('div', { class: 'content-stack' }, [
    el('section', { class: 'card analytics-controls' }, [el('div', { class: 'toolbar analytics-toolbar' }, [field('Range', preset), field('From', from), field('To', to), exportButton]), rangeError]),
    el('section', { class: 'metric-grid' }, [metric('Created', analytics.counts.created), metric('Completed', analytics.counts.completed, 'success'), metric('Touched', analytics.counts.touched), metric('Activity actions', analytics.counts.actions)]),
    el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Accessible chart' }), el('h2', { text: 'Activity by range' }), el('p', { class: 'privacy-copy', text: `${analytics.granularity === 'day' ? 'Daily' : analytics.granularity === 'month' ? 'Monthly' : analytics.granularity === 'year' ? 'Yearly' : `Multi-year (${analytics.periodYears}-year)`} buckets cover ${analytics.from} through ${analytics.to}.` })])]), analytics.days.length ? el('div', { class: 'chart' }, analytics.days.map((day) => el('div', { class: 'chart-row' }, [el('time', { text: day.date }), el('div', { class: 'chart-bars' }, [bar(day.created, max, 'Created'), bar(day.completed, max, 'Completed'), bar(day.actions, max, 'Actions')]), el('span', { text: `${day.created}/${day.completed}/${day.actions}` })]))) : el('div', { class: 'empty-state', text: 'No activity in this range.' })]),
    el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('h2', { text: 'Range totals' })]), el('div', { class: 'table-scroll' }, [el('table', { class: 'task-table' }, [el('thead', {}, [el('tr', {}, ['Measure', 'Count', 'What it means'].map((heading) => el('th', { text: heading })))]), el('tbody', {}, [['Created', analytics.counts.created, 'Tasks first added in range'], ['Completed', analytics.counts.completed, 'Tasks marked complete in range'], ['Touched', analytics.counts.touched, 'Tasks with a saved update in range'], ['Actions', analytics.counts.actions, 'Local activity events in range']].map(([name, count, detail]) => el('tr', {}, [el('td', { text: name }), el('td', { text: count }), el('td', { text: detail })])))])])]),
  ]);
}

function metric(label, value, tone = '') { return el('div', { class: `metric ${tone}` }, [el('span', { class: 'metric-label', text: label }), el('strong', { class: 'metric-value', text: value })]); }
function bar(value, max, label) { return el('progress', { class: 'chart-bar', max, value, attrs: { 'aria-label': `${label}: ${value}` } }, value); }
