import { WORKSPACE_FORMAT, SCHEMA_VERSION, daysFromToday, timestampFromToday } from '../domain/constants.js';

const sampleTasks = [
  {
    id: 'sample-orbit-map', title: 'Orbit map refresh', summary: 'Align a fictional regional map with the next planning cycle.', region: 'Northstar', workstream: 'Signal design', teamLabel: 'Mapmakers', workType: 'project', status: 'active', startDate: daysFromToday(-12), dueDate: daysFromToday(6), progress: 64, tags: ['mapping', 'planning'], createdAt: timestampFromToday(-24), updatedAt: timestampFromToday(-1), completedAt: null, archived: false,
  },
  {
    id: 'sample-tide-guide', title: 'Tideway launch guide', summary: 'Write a reusable guide for a fictional launch team.', region: 'Tideway', workstream: 'Enablement', teamLabel: 'Field notes', workType: 'initiative', status: 'planned', startDate: daysFromToday(4), dueDate: daysFromToday(18), progress: 12, tags: ['guide', 'launch'], createdAt: timestampFromToday(-8), updatedAt: timestampFromToday(-2), completedAt: null, archived: false,
  },
  {
    id: 'sample-sunfield-check', title: 'Sunfield quality check', summary: 'Review sample signals and record clear handoff notes.', region: 'Sunfield', workstream: 'Quality', teamLabel: 'Bright crew', workType: 'operations', status: 'at-risk', startDate: daysFromToday(-17), dueDate: daysFromToday(2), progress: 42, tags: ['review', 'handoff'], createdAt: timestampFromToday(-30), updatedAt: timestampFromToday(-3), completedAt: null, archived: false,
  },
  {
    id: 'sample-cloud-cycle', title: 'Cloudbank cycle close', summary: 'Close an example monthly cycle and capture learnings.', region: 'Cloudbank', workstream: 'Operations', teamLabel: 'Cycle desk', workType: 'operations', status: 'waiting', startDate: daysFromToday(-20), dueDate: daysFromToday(11), progress: 55, tags: ['cycle'], createdAt: timestampFromToday(-35), updatedAt: timestampFromToday(-5), completedAt: null, archived: false,
  },
  {
    id: 'sample-lattice-story', title: 'Lattice story kit', summary: 'Assemble fictional stories into a compact presentation kit.', region: 'Lattice', workstream: 'Storytelling', teamLabel: 'Story lab', workType: 'program', status: 'complete', startDate: daysFromToday(-46), dueDate: daysFromToday(-9), progress: 100, tags: ['stories', 'kit'], createdAt: timestampFromToday(-58), updatedAt: timestampFromToday(-8), completedAt: timestampFromToday(-8, 16), archived: false,
  },
  {
    id: 'sample-northstar-retro', title: 'Northstar learning retro', summary: 'Capture a fictional retrospective for the next work cycle.', region: 'Northstar', workstream: 'Learning', teamLabel: 'Mapmakers', workType: 'initiative', status: 'active', startDate: daysFromToday(-4), dueDate: daysFromToday(24), progress: 28, tags: ['retro', 'learning'], createdAt: timestampFromToday(-9), updatedAt: timestampFromToday(-1), completedAt: null, archived: false,
  },
  {
    id: 'sample-tide-ops', title: 'Tideway rhythm check', summary: 'Check a made-up operating rhythm before the next review.', region: 'Tideway', workstream: 'Quality', teamLabel: 'Bright crew', workType: 'project', status: 'planned', startDate: daysFromToday(9), dueDate: daysFromToday(31), progress: 0, tags: ['rhythm'], createdAt: timestampFromToday(-3), updatedAt: timestampFromToday(-3), completedAt: null, archived: false,
  },
  {
    id: 'sample-cloud-archive', title: 'Cloudbank archive sample', summary: 'An archived fictional task used to demonstrate restore.', region: 'Cloudbank', workstream: 'Operations', teamLabel: 'Cycle desk', workType: 'operations', status: 'complete', startDate: daysFromToday(-70), dueDate: daysFromToday(-44), progress: 100, tags: ['archive'], createdAt: timestampFromToday(-76), updatedAt: timestampFromToday(-42), completedAt: timestampFromToday(-42, 14), archived: true,
  },
];

export const sampleState = {
  format: WORKSPACE_FORMAT,
  schemaVersion: SCHEMA_VERSION,
  revision: 1,
  meta: { sampleData: true, name: 'Fictional Signal Atlas workspace', createdAt: timestampFromToday(0, 8) },
  settings: { lastView: 'overview', analyticsRange: { preset: '30d', from: daysFromToday(-29), to: daysFromToday(0) } },
  tasks: sampleTasks,
  priorityOrder: ['sample-orbit-map', 'sample-northstar-retro'],
  activity: [
    { id: 'sample-event-3', taskId: 'sample-orbit-map', taskTitleSnapshot: 'Orbit map refresh', eventType: 'updated', occurredAt: timestampFromToday(-1, 10), changes: [{ field: 'progress', before: 58, after: 64 }] },
    { id: 'sample-event-2', taskId: 'sample-sunfield-check', taskTitleSnapshot: 'Sunfield quality check', eventType: 'created', occurredAt: timestampFromToday(-30, 11), changes: [] },
    { id: 'sample-event-1', taskId: 'sample-lattice-story', taskTitleSnapshot: 'Lattice story kit', eventType: 'completed', occurredAt: timestampFromToday(-8, 16), changes: [{ field: 'status', before: 'active', after: 'complete' }] },
  ],
};

export function createSampleState() {
  return typeof structuredClone === 'function' ? structuredClone(sampleState) : JSON.parse(JSON.stringify(sampleState));
}
