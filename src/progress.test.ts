import { describe, expect, it } from 'vitest';
import { initial } from './data';
import { bind, conflicts, edit, expand, flatten, loadLegacy, newJournal, reconcile, resolve } from './progress';
import type { Fields } from './progress';
const start = () => bind(newJournal(structuredClone(initial)), 'learner');
const field = (value: unknown, revision: number, mutation = 'remote') => ({ value, revision, mutation });
it('round trips every lesson field including nested challenge histories', () => {
  const state = { ...structuredClone(initial), name: 'Alice', step: 13, answers: { grammarB1: { attempts: [{ answer: 'had gone', correct: false }], index: 2 }, 'key:with.dots': ['x'] }, ratings: { story: 2 }, scores: { a: { correct: true, first: false, latest: true, skill: 'Grammar' as const } } };
  expect(expand(flatten(state))).toEqual(state);
});
it('retains v1/v2 migration mapping and accepts v3', () => {
  for (const [version, step] of [[1, 11], [2, 12], [3, 14]]) {
    expect(loadLegacy({ getItem: () => JSON.stringify({ version, data: { ...initial, step, name: 'Old' } }) }).step).toBe(14);
  }
});
it('backs up legacy progress once and refuses rebinding to another user', () => {
  const j = start();
  expect(bind(j, 'learner')).toBe(j);
  expect(j.backup).toEqual(initial);
  expect(() => bind(j, 'other')).toThrow(/другой/);
});
it('queues answers and checks together without dropping consecutive edits', () => {
  let j = start();
  j = edit(j, { ...j.state, answers: { a: 2 } });
  j = edit(j, { ...j.state, ratings: { speech: 1 } });
  expect(Object.keys(j.pending)).toEqual(['answers:a', 'ratings:speech']);
  expect(j.pending['answers:a'].base).toBe(0);
});
it('acknowledges a retried mutation and preserves newer edits made in flight', () => {
  let j = start();
  j = edit(j, { ...j.state, name: 'A' });
  const sent = j.pending;
  j = edit(j, { ...j.state, name: 'Alice' });
  j = reconcile(j, { name: field('A', 1, sent.name.mutation) }, sent);
  expect(j.state.name).toBe('Alice');
  expect(j.pending.name.base).toBe(1);
  j = reconcile(j, { name: field('Alice', 2, j.pending.name.mutation) }, j.pending);
  expect(j.pending).toEqual({});
});
it('cloud wins legacy import while edits during import are rebased only on imported fields', () => {
  let j = start(); const migration = j.migration!;
  j = edit(j, { ...j.state, name: 'After login' });
  const fields: Fields = { name: field('', 1, migration.id), step: field(6, 7) };
  j = reconcile(j, fields, {}, migration.id);
  expect(j.pending.name.base).toBe(1);
  expect(j.state.name).toBe('After login');
  expect(j.state.step).toBe(6);
  expect(j.migration).toBeNull();
  expect(j.backup).toEqual(initial);
});
describe('conflicts and reset tombstones', () => {
  it('preserves unsynced changes across reload and allows explicit conflict resolution', () => {
    let j = start();
    j = edit(j, { ...j.state, name: 'Local' });
    j = JSON.parse(JSON.stringify(j));
    j = reconcile(j, { name: field('Cloud', 9) }, j.pending);
    expect(conflicts(j)).toEqual(['name']);
    expect(j.state.name).toBe('Local');
    expect(resolve(j, 'name', 'cloud').state.name).toBe('Cloud');
    expect(resolve(j, 'name', 'local').pending.name.base).toBe(9);
  });
  it('retains remote changes on unrelated fields', () => {
    let j = start(); j = edit(j, { ...j.state, name: 'Local' });
    j = reconcile(j, { 'ratings:speech': field(2, 4) }, {});
    expect(j.state.ratings.speech).toBe(2);
    expect(j.state.name).toBe('Local');
  });
  it('reset removes prior answers without losing their version or resurrecting stale values', () => {
    let j = reconcile(start(), { 'answers:a': field(1, 3) }, {});
    j = edit(j, structuredClone(initial));
    expect(j.pending['answers:a'].value).toBeNull();
    expect(j.pending['answers:a'].base).toBe(3);
    const sent = j.pending;
    j = reconcile(j, { 'answers:a': field(null, 4, sent['answers:a'].mutation) }, sent);
    expect(j.state.answers).toEqual({});
    expect(j.cloud['answers:a'].revision).toBe(4);
  });
});
