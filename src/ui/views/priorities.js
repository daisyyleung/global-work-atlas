import { activeTasks } from '../../domain/selectors.js';
import { PRIORITY_LIMIT, labelForStatus } from '../../domain/constants.js';
import { el, button } from '../dom.js';

export function renderPriorities(state, { onChange, onOpenTask }) {
  const selected = state.priorityOrder.slice();
  const candidates = activeTasks(state).filter((task) => !selected.includes(task.id));
  const list = el('ol', { class: 'priority-list', attrs: { 'aria-label': 'Priority order' } });
  selected.forEach((id, index) => {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    list.append(el('li', { class: 'priority-item', attrs: { draggable: 'false' } }, [el('span', { class: 'priority-number', text: `${index + 1}` }), el('div', {}, [el('h3', { text: task.title }), el('small', { text: `${task.region} · ${labelForStatus(task.status)}` })]), el('div', { class: 'priority-actions' }, [button('Open', () => onOpenTask(task), { class: 'button small' }), button('↑', () => { if (index) { const next = selected.slice(); [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); } }, { class: 'button icon small', attrs: { 'aria-label': `Move ${task.title} up`, disabled: index === 0 } }), button('↓', () => { if (index < selected.length - 1) { const next = selected.slice(); [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); } }, { class: 'button icon small', attrs: { 'aria-label': `Move ${task.title} down`, disabled: index === selected.length - 1 } }), button('Remove', () => onChange(selected.filter((item) => item !== id)), { class: 'button small ghost' })])]));
  });
  const picker = el('select', { attrs: { 'aria-label': 'Add active task to priorities' } }); picker.append(el('option', { value: '', text: 'Add an active task…' })); candidates.forEach((task) => picker.append(el('option', { value: task.id, text: task.title }))); picker.addEventListener('change', () => { if (picker.value && selected.length < PRIORITY_LIMIT) onChange([...selected, picker.value]); });
  const remaining = PRIORITY_LIMIT - selected.length;
  return el('div', { class: 'content-stack' }, [el('section', { class: 'card' }, [el('div', { class: 'card-header' }, [el('div', {}, [el('span', { class: 'eyebrow', text: 'Focus queue' }), el('h2', { text: 'Priorities' }), el('p', { class: 'privacy-copy', text: `Up to ${PRIORITY_LIMIT} active, non-archived tasks. Changes are confirmed before saving.` })]), el('span', { class: 'pill active', text: `${selected.length}/${PRIORITY_LIMIT}` })]), selected.length ? list : el('div', { class: 'empty-state', text: 'No priorities yet. Choose an active task below.' }), el('div', { class: 'toolbar priority-picker' }, [picker, el('span', { class: 'field-hint', text: `${remaining} slot${remaining === 1 ? '' : 's'} remaining` })])])]);
}
