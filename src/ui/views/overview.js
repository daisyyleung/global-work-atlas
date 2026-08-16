import { overviewBreakdowns, overviewMetrics } from '../../domain/selectors.js';
import { el, button } from '../dom.js';
import { labelForStatus, labelForWorkType } from '../../domain/constants.js';

function bars(title, items) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Snapshot' }), el('h2', { text: title })])]), items.length ? el('div', { class: 'bar-list' }, items.map((item) => el('div', { class: 'bar-row' }, [el('span', { text: item.label }), el('progress', { class: 'bar-track', max, value: item.count, attrs: { 'aria-label': `${item.label}: ${item.count}` } }, item.count), el('strong', { text: item.count })]))) : el('div', { class: 'empty-state', text: 'No data yet.' })]);
}

export function renderOverview(state, { onOpenTask, onAddTask }) {
  const metrics = overviewMetrics(state);
  const breakdowns = overviewBreakdowns(state);
  return el('div', { class: 'content-stack' }, [
    el('section', { class: 'metric-grid' }, [
      metric('Visible work', metrics.total), metric('Active', metrics.active, 'success'), metric('Complete', metrics.complete), metric('At risk', metrics.atRisk, 'alert'), metric('Waiting', metrics.waiting),
    ]),
    el('div', { class: 'grid-2' }, [
      el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Focus' }), el('h2', { text: 'Priority queue' })]), button('Add task', onAddTask, { class: 'button primary small' })]), metrics.priority.length ? el('div', { class: 'activity-list' }, metrics.priority.map((task, index) => el('div', { class: 'list-row' }, [el('div', {}, [el('strong', { text: `${index + 1}. ${task.title}` }), el('small', { text: `${task.region} · due ${task.dueDate}` })]), el('div', { class: 'task-meta' }, [statusPill(task.status), button('Open', () => onOpenTask(task), { class: 'button small' })])]))) : el('div', { class: 'empty-state', text: 'No priorities set. Add active work from the Priorities view.' })]),
      el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Attention' }), el('h2', { text: 'Due in the next 7 days' })])]), metrics.dueSoon.length ? el('div', { class: 'activity-list' }, metrics.dueSoon.slice(0, 6).map((task) => el('div', { class: 'list-row' }, [el('div', {}, [el('strong', { text: task.title }), el('small', { text: `${task.region} · ${task.dueDate}` })]), button('Open', () => onOpenTask(task), { class: 'button small' })]))) : el('div', { class: 'empty-state', text: 'Nothing due soon.' })]),
    ]),
    el('div', { class: 'grid-3' }, [bars('By region', breakdowns.regions), bars('By status', breakdowns.statuses), bars('By work type', breakdowns.workTypes)]),
  ]);
}

function metric(label, value, tone = '') { return el('div', { class: `metric ${tone}` }, [el('span', { class: 'metric-label', text: label }), el('strong', { class: 'metric-value', text: value })]); }
function statusPill(status) { return el('span', { class: `pill ${status}`, text: labelForStatus(status) }); }
