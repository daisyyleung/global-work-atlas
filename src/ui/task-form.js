import { WORK_TYPES, STATUSES, labelForStatus, labelForWorkType } from '../domain/constants.js';
import { el, field, selectControl, button } from './dom.js';

function input(type, value = '') { return el('input', { type, value }); }

export function taskForm({ task = null, onSubmit, onCancel }) {
  const form = el('form', { class: 'form-grid' });
  const values = task || { title: '', summary: '', region: '', workstream: '', teamLabel: '', workType: 'project', status: 'planned', startDate: '', dueDate: '', progress: 0, tags: [] };
  const title = input('text', values.title); title.required = true; title.maxLength = 160;
  const summary = el('textarea', { text: values.summary }); summary.maxLength = 1200;
  const region = input('text', values.region); region.required = true; region.maxLength = 100;
  const workstream = input('text', values.workstream); workstream.required = true; workstream.maxLength = 120;
  const teamLabel = input('text', values.teamLabel); teamLabel.required = true; teamLabel.maxLength = 120;
  const workType = selectControl(WORK_TYPES.map((value) => ({ value, label: labelForWorkType(value) })), values.workType);
  const status = selectControl(STATUSES.map((value) => ({ value, label: labelForStatus(value) })), values.status);
  const startDate = input('date', values.startDate); startDate.required = true;
  const dueDate = input('date', values.dueDate); dueDate.required = true;
  const progress = input('number', values.progress); progress.min = 0; progress.max = 100; progress.step = 1;
  const tags = input('text', values.tags.join(', ')); tags.placeholder = 'comma-separated labels';
  form.append(
    field('Title', title, 'Use a clear, fictional or non-confidential label.'),
    field('Summary', summary),
    field('Region', region), field('Workstream', workstream), field('Team label', teamLabel),
    field('Work type', workType), field('Status', status), field('Start date', startDate), field('Due date', dueDate), field('Progress (%)', progress),
    field('Tags', tags),
  );
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (startDate.value > dueDate.value) { dueDate.setCustomValidity('Due date must be on or after start date.'); form.reportValidity(); dueDate.setCustomValidity(''); return; }
    onSubmit({ title: title.value.trim(), summary: summary.value.trim(), region: region.value.trim(), workstream: workstream.value.trim(), teamLabel: teamLabel.value.trim(), workType: workType.value, status: status.value, startDate: startDate.value, dueDate: dueDate.value, progress: Number(progress.value), tags: tags.value.split(',').map((tag) => tag.trim()).filter(Boolean) });
  });
  form.append(el('div', { class: 'dialog-footer full' }, [button('Cancel', onCancel, { class: 'button ghost' }), button(task ? 'Save changes' : 'Add task', () => form.requestSubmit(), { class: 'button primary' })]));
  return form;
}
