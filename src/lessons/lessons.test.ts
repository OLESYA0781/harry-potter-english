import { expect, it } from 'vitest';
import { initial } from '../data';
import { bind, edit, flatten, newJournal, reconcile } from '../progress';
import { trialLesson, sortLessons } from './registry';
import { lessonKey, readLesson, updateLesson } from './progress';
import type { LessonDefinition } from './types';
const next: LessonDefinition = { ...trialLesson, id: 'next-lesson', title: 'Next', addedAt: '2026-11-01', summarize: s => ({ status: s.step ? 'in-progress' : 'not-started', percent: 0, detail: '' }) };
const other: LessonDefinition = { ...next, id: 'other-lesson', addedAt: '2026-11-02' };
const original = { ...structuredClone(initial), step: 13, name: 'Вика', answers: { grammarA2: { entries: [{ attempts: [{ answer: 'visited', correct: false, hintUsed: true }] }] }, mood: 'happy' }, ratings: { reading: 2 }, scores: { a: { correct: true, first: false, latest: true, skill: 'Grammar' as const } } };
it('leaves every old field on its existing key and exposes it as the trial lesson', () => {
  expect(readLesson(original, trialLesson)).toEqual(original);
  const updated = updateLesson(original, next, s => ({ ...s, answers: { draft: 'new answer' }, step: 27 }));
  expect(readLesson(updated, trialLesson)).toEqual(original);
  expect(readLesson(updated, next).step).toBe(27);
  for (const [key, value] of Object.entries(flatten(original))) expect(flatten(updated)[key]).toEqual(value);
});
it('isolates reset of trial and new lessons including unknown future records', () => {
  const withNew = updateLesson(original, next, { ...initial, answers: { draft: 'Keep me' } });
  const withBoth = updateLesson(withNew, other, { ...initial, answers: { draft: 'Also keep me' } });
  const resetTrial = updateLesson(withBoth, trialLesson, structuredClone(initial));
  expect(readLesson(resetTrial, trialLesson)).toEqual(initial);
  expect(readLesson(resetTrial, next).answers.draft).toBe('Keep me');
  expect(readLesson(resetTrial, other).answers.draft).toBe('Also keep me');
  const resetNew = updateLesson(withBoth, next, structuredClone(initial));
  expect(readLesson(resetNew, trialLesson)).toEqual(original);
  expect(readLesson(resetNew, next)).toEqual(initial);
  expect(readLesson(resetNew, other).answers.draft).toBe('Also keep me');
});
it('uses independent RPC fields and preserves all lessons through existing reconciliation', () => {
  const base = bind(newJournal(original), 'learner');
  let state = updateLesson(original, next, { ...initial, answers: { draft: 'One' } });
  state = updateLesson(state, other, { ...initial, answers: { draft: 'Two' } });
  const j = edit(base, state);
  expect(Object.keys(j.pending)).toEqual([`answers:${lessonKey(next.id)}`, `answers:${lessonKey(other.id)}`]);
  const fields = Object.fromEntries(Object.entries(flatten(state)).map(([key, value]) => [key, { value, revision: 1, mutation: j.pending[key]?.mutation || 'old-cloud' }]));
  const recovered = reconcile(j, fields, j.pending);
  expect(recovered.pending).toEqual({});
  expect(readLesson(recovered.state, next).answers.draft).toBe('One');
  expect(readLesson(recovered.state, other).answers.draft).toBe('Two');
  expect(readLesson(recovered.state, trialLesson)).toEqual(original);
});
it('sorts new modules first without mutating the registry and rejects duplicate IDs', () => {
  const registry = [next, trialLesson, other];
  expect(sortLessons(registry).map(x => x.id)).toEqual(['other-lesson', 'next-lesson', 'trial']);
  expect(registry.map(x => x.id)).toEqual(['next-lesson', 'trial', 'other-lesson']);
  expect(() => sortLessons([trialLesson, trialLesson])).toThrow();
});
it('never silently overwrites an unrecognized saved format', () => {
  const state = { ...initial, answers: { [lessonKey(next.id)]: { version: 99, data: { valuable: true } } } };
  expect(() => readLesson(state, next)).toThrow(/данные сохранены/);
  expect(() => updateLesson(state, next, structuredClone(initial))).toThrow();
});
it('visiting the final chapter alone does not mean completing the trial lesson', () => {
  expect(trialLesson.summarize({ ...initial, step: 14 })).toMatchObject({ status: 'in-progress', percent: 0 });
  expect(trialLesson.summarize(initial).status).toBe('not-started');
});
