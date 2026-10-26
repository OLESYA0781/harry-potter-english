import { initial, stages } from './data';
import type { LessonState } from './data';

export const legacyKey = 'hogwarts-english-v1';
export const journalKey = 'hogwarts-cloud-v1';
export type Field = { value: unknown; revision: number; mutation: string };
export type Fields = Record<string, Field>;
export type Change = { value: unknown; base: number; mutation: string };
export type Journal = {
  version: 1; owner: string | null; state: LessonState; cloud: Fields;
  pending: Record<string, Change>; migration: { id: string; fields: Record<string, unknown> } | null;
  backup: LessonState | null; migrated: boolean;
};
export const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export function flatten(s: LessonState): Record<string, unknown> {
  return Object.fromEntries([
    ['name', s.name], ['step', s.step],
    ...(['answers', 'scores', 'ratings'] as const).flatMap(group =>
      Object.entries(s[group]).map(([key, value]) => [`${group}:${key}`, value])),
  ]);
}
export function expand(values: Record<string, unknown>): LessonState {
  const state = structuredClone(initial);
  for (const [key, value] of Object.entries(values)) {
    if (value === null) continue; // Tombstones keep the revision after restart.
    if (key === 'name' && typeof value === 'string') state.name = value;
    else if (key === 'step' && Number.isInteger(value) && Number(value) >= 0 && Number(value) < stages.length) state.step = Number(value);
    else {
      const split = key.indexOf(':');
      const group = key.slice(0, split);
      if (['answers', 'scores', 'ratings'].includes(group) && split > 0) {
        Object.defineProperty(state[group as 'answers'], key.slice(split + 1), { value, enumerable: true, configurable: true, writable: true });
      }
    }
  }
  return state;
}
export function loadLegacy(storage: Pick<Storage, 'getItem'>): LessonState {
  try {
    const s = JSON.parse(storage.getItem(legacyKey) || 'null');
    if (s && [1, 2, 3].includes(s.version) && Number.isInteger(s.data?.step) &&
        s.data.step >= 0 && s.data.step < (s.version === 1 ? 12 : s.version === 2 ? 13 : stages.length) &&
        typeof s.data.name === 'string' && s.data.answers && s.data.scores && s.data.ratings) {
      return { ...s.data, step: (s.version === 1 && s.data.step === 11) || (s.version === 2 && s.data.step === 12) ? stages.length - 1 : s.data.step };
    }
  } catch { /* Keep working in memory if browser storage is unavailable. */ }
  return structuredClone(initial);
}
export function newJournal(state: LessonState): Journal {
  return { version: 1, owner: null, state, cloud: {}, pending: {}, migration: null, backup: null, migrated: false };
}
export function bind(j: Journal, owner: string): Journal {
  if (j.owner && j.owner !== owner) throw new Error('Этот браузер связан с другой ученицей. Локальный прогресс сохранён; войдите в прежнюю учётную запись.');
  if (j.owner) return j;
  return { ...j, owner, backup: structuredClone(j.state), migration: { id: crypto.randomUUID(), fields: flatten(j.state) } };
}
export function edit(j: Journal, state: LessonState): Journal {
  if (!j.owner) return { ...j, state };
  const before = flatten(j.state), after = flatten(state), pending = { ...j.pending };
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (!equal(before[key], after[key])) {
      pending[key] = { value: after[key] ?? null, base: pending[key]?.base ?? j.cloud[key]?.revision ?? 0, mutation: crypto.randomUUID() };
    }
  }
  return { ...j, state, pending };
}
export function reconcile(j: Journal, fields: Fields, sent: Record<string, Change>, migrationId?: string): Journal {
  const pending = { ...j.pending };
  for (const [key, change] of Object.entries(pending)) {
    const cloud = fields[key];
    if (cloud?.mutation === change.mutation) delete pending[key];
    // A newer edit made during the request must inherit the acknowledged revision.
    else if (cloud && (cloud.mutation === sent[key]?.mutation || cloud.mutation === migrationId)) {
      pending[key] = { ...change, base: cloud.revision };
    }
  }
  const values = Object.fromEntries(Object.entries(fields).map(([key, f]) => [key, f.value]));
  for (const [key, change] of Object.entries(pending)) values[key] = change.value;
  return { ...j, cloud: fields, pending, state: expand(values), migration: null, migrated: j.migrated || !!migrationId };
}
export function conflicts(j: Journal) {
  return Object.keys(j.pending).filter(key => (j.cloud[key]?.revision ?? 0) !== j.pending[key].base);
}
export function resolve(j: Journal, key: string, choice: 'cloud' | 'local'): Journal {
  const pending = { ...j.pending };
  if (choice === 'local') pending[key] = { ...pending[key], base: j.cloud[key]?.revision ?? 0, mutation: crypto.randomUUID() };
  else delete pending[key];
  return reconcile({ ...j, pending }, j.cloud, {});
}
