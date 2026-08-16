import { activityEntries, allEventTypes } from '../../domain/selectors.js';
import { el, field, selectControl, button } from '../dom.js';

export function renderActivity(state, { filters, onFilters, onClear }) {
  const current = filters || {};
  const search = el('input', { type: 'search', value: current.search || '', placeholder: 'Search local changes…' });
  const eventType = selectControl([{ value: 'all', label: 'All event types' }, ...allEventTypes(state).map((value) => ({ value, label: value }))], current.eventType || 'all');
  const apply = () => onFilters({ search: search.value, eventType: eventType.value });
  search.addEventListener('input', apply); eventType.addEventListener('change', apply);
  const entries = activityEntries(state, current);
  const items = entries.length ? el('div', { class: 'activity-list' }, entries.map((entry) => el('article', { class: 'activity-item' }, [el('h3', { text: `${entry.eventType} · ${entry.taskTitleSnapshot}` }), el('time', { text: new Date(entry.occurredAt).toLocaleString() }), entry.changes.length ? el('p', { text: entry.changes.map((change) => `${change.field}: ${String(change.before)} → ${String(change.after)}`).join(' · ') }) : el('p', { text: 'No field details recorded.' })]))) : el('div', { class: 'empty-state', text: 'No local activity matches this filter.' });
  return el('div', { class: 'content-stack' }, [el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Local history' }), el('h2', { text: 'Activity' })]), button('Clear history', onClear, { class: 'button danger small' })]), el('div', { class: 'toolbar' }, [field('Search', search), field('Event', eventType)])]), el('section', { class: 'card' }, [el('p', { class: 'privacy-copy', text: 'This is editable local workspace history, not tamper-evident audit evidence.' }), items])]);
}
