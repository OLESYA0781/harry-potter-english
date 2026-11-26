import { describe, expect, it } from 'vitest';
import { initial } from './data';
import { agencyKey } from './lessons/homeworkOne/data';
import { bind, edit, expand, flatten, loadLegacy, newJournal, reconcile } from './progress';
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
  it('automatically accepts the cloud value for concurrent edits to the same answer', () => {
    let j = reconcile(start(), { name: field('Original', 1) }, {});
    j = edit(j, { ...j.state, name: 'Local' });
    j = JSON.parse(JSON.stringify(j));
    j = reconcile(j, { name: field('Cloud', 9) }, j.pending);
    expect(j.pending).toEqual({});
    expect(j.state.name).toBe('Cloud');
  });
  it('acknowledges reordered JSON and merges edits to different answers in a lesson', () => {
    const lesson = 'answers:lesson';
    const same = 'answers:job-agency';
    const original = { version: 1, data: { removed: true, common: 'original' } };
    let j = reconcile(start(), { [lesson]: field(original, 1) }, {});
    j = edit(j, { ...j.state, answers: {
      lesson: { version: 1, data: { common: 'local', local: true } },
      'job-agency': { version: 1, placements: {} },
    } });
    j = reconcile(j, {
      [lesson]: field({ data: { removed: true, common: 'cloud', cloud: true }, version: 1 }, 2),
      [same]: field({ placements: {}, version: 1 }, 3),
    }, j.pending);
    expect(j.pending[same]).toBeUndefined();
    expect(j.pending[lesson].base).toBe(2);
    expect(j.state.answers.lesson).toEqual({ version: 1, data: { common: 'cloud', local: true, cloud: true } });
    j = reconcile(j, { ...j.cloud, [lesson]: field(j.pending[lesson].value, 3, j.pending[lesson].mutation) }, j.pending);
    expect(j.pending).toEqual({});
  });
  it('resolves old blocked queues without discarding answers unique to either device', () => {
    const key = 'answers:lesson';
    const cloud = { data: { step: 8, answers: { cloud: true } } };
    let j = reconcile(start(), { [key]: field(cloud, 3) }, {});
    j = edit(j, { ...j.state, answers: { lesson: { data: { step: 2, answers: { local: true } } } } });
    j.pending[key].base = 1;
    j = reconcile(JSON.parse(JSON.stringify(j)), j.cloud, j.pending);
    expect(j.pending[key].base).toBe(3);
    expect(j.state.answers.lesson).toEqual({ data: { step: 8, answers: { local: true, cloud: true } } });
  });
  it('keeps a valid job board when two devices place the same card in different slots', () => {
    const key = `answers:${agencyKey}`;
    const cloud = { version: 1, placements: { houses: 'pilot' } };
    let j = reconcile(start(), { [key]: field({ version: 1, placements: {} }, 1) }, {});
    j = edit(j, { ...j.state, answers: { [agencyKey]: { version: 1, placements: { paint: 'pilot' } } } });
    j = reconcile(j, { [key]: field(cloud, 2) }, j.pending);
    expect(j.state.answers[agencyKey]).toEqual(cloud);
    expect(j.pending).toEqual({});
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
