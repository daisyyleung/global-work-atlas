import { filterOptions, filterTasks } from '../../domain/selectors.js';
import { labelForStatus, labelForWorkType } from '../../domain/constants.js';
import { el, field, button, selectControl } from '../dom.js';
import { renderBoard, renderCards, renderHierarchy, renderTable } from '../task-views.js';

export function renderWorkIndex(state, { filters, view = 'cards', onFilters, onView, onOpenTask, onAddTask, onArchive, onRestore }) {
  const options = filterOptions(state);
  const current = { includeArchived: false, ...filters };
  const query = el('input', { type: 'search', value: current.search || '', placeholder: 'Search title, team, tags…', attrs: { 'aria-label': 'Search tasks' } });
  const region = selectControl([{ value: 'all', label: 'All regions' }, ...options.regions.map((value) => ({ value, label: value }))], current.region || 'all');
  const status = selectControl([{ value: 'all', label: 'All statuses' }, ...options.statuses.map((value) => ({ value, label: labelForStatus(value) }))], current.status || 'all');
  const workType = selectControl([{ value: 'all', label: 'All types' }, ...options.workTypes.map((value) => ({ value, label: labelForWorkType(value) }))], current.workType || 'all');
  const team = selectControl([{ value: 'all', label: 'All teams' }, ...options.teams.map((value) => ({ value, label: value }))], current.teamLabel || 'all');
  const tag = selectControl([{ value: 'all', label: 'All tags' }, ...options.tags.map((value) => ({ value, label: `#${value}` }))], current.tag || 'all');
  const priority = selectControl([{ value: 'all', label: 'All work' }, { value: 'priority', label: 'Priorities only' }, { value: 'non-priority', label: 'Not priorities' }], current.priority || 'all');
  const archived = selectControl([{ value: 'active', label: 'Hide archived' }, { value: 'all', label: 'Include archived' }], current.includeArchived ? 'all' : 'active');
  const apply = () => onFilters({ search: query.value, region: region.value, status: status.value, workType: workType.value, teamLabel: team.value, tag: tag.value, priority: priority.value, includeArchived: archived.value === 'all' });
  [query, region, status, workType, team, tag, priority, archived].forEach((control) => control.addEventListener(control === query ? 'input' : 'change', apply));
  const filtered = filterTasks(state, current);
  const viewToggle = el('div', { class: 'view-toggle', attrs: { 'aria-label': 'Work Index view' } }, ['cards', 'table', 'board', 'hierarchy'].map((value) => { const control = button(value[0].toUpperCase() + value.slice(1), () => onView(value), { class: 'button', attrs: { 'aria-pressed': view === value } }); return control; }));
  const content = view === 'table' ? renderTable(filtered, { onOpen: onOpenTask, onArchive, onRestore }) : view === 'board' ? renderBoard(filtered, { onOpen: onOpenTask, onArchive, onRestore }) : view === 'hierarchy' ? renderHierarchy(filtered, { onOpen: onOpenTask, onArchive, onRestore }) : renderCards(filtered, { onOpen: onOpenTask, onArchive, onRestore });
  return el('div', { class: 'content-stack' }, [el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Work Index' }), el('h2', { text: `${filtered.length} matching tasks` })]), el('div', { class: 'header-actions' }, [viewToggle, button('Add task', onAddTask, { class: 'button primary' })])]), el('div', { class: 'toolbar' }, [field('Search', query), field('Region', region), field('Status', status), field('Type', workType), field('Team', team), field('Tag', tag), field('Priority', priority), field('Archive', archived), button('Clear filters', () => onFilters({}), { class: 'button ghost' })])]), content]);
}
