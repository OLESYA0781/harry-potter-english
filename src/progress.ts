import { initial, stages } from './data';
import type { LessonState } from './data';
import { agencyKey } from './lessons/homeworkOne/data';
import { readAgency } from './lessons/homeworkOne/model';
import { joinFields, splitField, splitFields } from './progressFields';

export const legacyKey = 'hogwarts-english-v1';
export const journalKey = 'hogwarts-cloud-v1';
export type Field = { value: unknown; revision: number; mutation: string; updated_at?: string };
export type Fields = Record<string, Field>;
export type Change = { value: unknown; base: number; mutation: string; legacyRevision?: number };
export type Journal = {
  version: 1 | 2; owner: string | null; state: LessonState; cloud: Fields;
  pending: Record<string, Change>; migration: { id: string; fields: Record<string, unknown> } | null;
  backup: LessonState | null; migrated: boolean;
  previousOwnerJournal?: Journal;
  legacyPending?: Record<string, Change>;
  superseded?: Record<string, { key: string; change: Change; cloud?: Field }>;
  flight?: { id: string; changes: Record<string, Change>; migration: Journal['migration'] };
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => equal(value, b[index]));
  }
  return isRecord(a) && isRecord(b) &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(([key, value]) => Object.hasOwn(b, key) && equal(value, b[key]));
}

// Merge independent edits using the last shared version. Older queues may
// lack that version, so retain keys from both sides and prefer cloud on overlap.
function merge(local: unknown, cloud: unknown, base: { value: unknown } | undefined): unknown {
  if (equal(local, cloud) || (base && equal(local, base.value))) return cloud;
  if (base && equal(cloud, base.value)) return local;
  if (!isRecord(local) || !isRecord(cloud)) {
    return !base && cloud === undefined ? local : cloud;
  }
  const previous = isRecord(base?.value) ? base.value : {};
  const keys = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  return Object.fromEntries([...keys].flatMap(key => {
    const value = merge(
      Object.hasOwn(local, key) ? local[key] : undefined,
      Object.hasOwn(cloud, key) ? cloud[key] : undefined,
      base && { value: Object.hasOwn(previous, key) ? previous[key] : undefined },
    );
    return value === undefined ? [] : [[key, value]];
  }));
}
export function flattenLegacy(s: LessonState): Record<string, unknown> {
  return Object.fromEntries([
    ['name', s.name], ['step', s.step],
    ...(['answers', 'scores', 'ratings'] as const).flatMap(group =>
      Object.entries(s[group]).map(([key, value]) => [`${group}:${key}`, value])),
  ]);
}
export function flatten(state: LessonState): Record<string, unknown> {
  return splitFields(flattenLegacy(state));
}
export function expand(values: Record<string, unknown>): LessonState {
  return expandLegacy(joinFields(values));
}
export function expandLegacy(values: Record<string, unknown>): LessonState {
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
export function readLegacy(storage: Pick<Storage, 'getItem'>): LessonState | null {
  try {
    const s = JSON.parse(storage.getItem(legacyKey) || 'null');
    if (s && [1, 2, 3].includes(s.version) && Number.isInteger(s.data?.step) &&
        s.data.step >= 0 && s.data.step < (s.version === 1 ? 12 : s.version === 2 ? 13 : stages.length) &&
        typeof s.data.name === 'string' && s.data.answers && s.data.scores && s.data.ratings) {
      return { ...s.data, step: (s.version === 1 && s.data.step === 11) || (s.version === 2 && s.data.step === 12) ? stages.length - 1 : s.data.step };
    }
  } catch { /* Keep working in memory if browser storage is unavailable. */ }
  return null;
}
export function loadLegacy(storage: Pick<Storage, 'getItem'>): LessonState {
  return readLegacy(storage) ?? structuredClone(initial);
}
export function newJournal(state: LessonState): Journal {
  return { version: 2, owner: null, state, cloud: {}, pending: {}, migration: null, backup: null, migrated: false };
}
export function bind(j: Journal, owner: string, actor = owner): Journal {
  if (j.owner === owner) return j;
  if (j.owner && j.owner !== actor) {
    throw new Error('Этот браузер связан с другой ученицей. Локальный прогресс сохранён; войдите в прежнюю учётную запись.');
  }
  if (actor !== owner) {
    // An assigned teacher may have a journal from before the accounts were
    // linked. Preserve it in the export of the newly bound journal.
    return {
      ...newJournal(structuredClone(initial)), owner, migrated: true,
      backup: j.owner ? null : structuredClone(j.state),
      previousOwnerJournal: j.owner ? j : undefined,
    };
  }
  return { ...j, owner, backup: structuredClone(j.state), migration: { id: crypto.randomUUID(), fields: flatten(j.state) } };
}
export function edit(j: Journal, state: LessonState): Journal {
  if (!j.owner) return { ...j, state };
  const before = flatten(j.state), after = flatten(state), pending = { ...j.pending };
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (!equal(before[key], after[key])) {
      pending[key] = {
        value: after[key] ?? null, base: pending[key]?.base ?? j.cloud[key]?.revision ?? 0,
        mutation: crypto.randomUUID(), legacyRevision: pending[key]?.legacyRevision,
      };
    }
  }
  return { ...j, state, pending };
}
export function reconcile(j: Journal, fields: Fields, sent: Record<string, Change>, migrationId?: string): Journal {
  // A different tab can persist a newer server snapshot before this response arrives.
  fields = { ...fields };
  for (const [key, known] of Object.entries(j.cloud)) {
    if (known.revision > (fields[key]?.revision ?? 0)) fields[key] = known;
  }
  const pending = { ...j.pending };
  const superseded = { ...j.superseded };
  for (const [key, change] of Object.entries(pending)) {
    const cloud = fields[key];
    const revision = cloud?.revision ?? 0;
    if (cloud && (cloud.mutation === change.mutation || equal(cloud.value, change.value))) {
      delete pending[key];
    } else if (cloud && (cloud.mutation === sent[key]?.mutation || cloud.mutation === migrationId)) {
      pending[key] = { ...change, base: revision, legacyRevision: undefined };
    } else if (revision !== change.base) {
      // Preserve rejected drafts in the downloadable local backup.
      superseded[`${key}:${change.mutation}`] = { key, change, cloud };
      const previous = j.cloud[key];
      const base = change.base === 0 || previous?.revision === change.base
        ? { value: previous?.revision === change.base ? previous.value : undefined }
        : undefined;
      let value = cloud?.value;
      // These boards have cross-slot uniqueness rules. Merge non-overlapping
      // moves only when the resulting board still satisfies those rules.
      if (key === `answers:${agencyKey}`) {
        const merged = merge(change.value, cloud?.value, base);
        try { readAgency(merged); value = merged; } catch { /* Keep the confirmed board. */ }
      }
      if (key.endsWith('/~sync/answers/mixed-village/v1') && cloud?.value !== null) {
        const merged = merge(change.value, cloud?.value, base);
        if (isRecord(merged) && isRecord(merged.interviewed)) {
          const houses = Object.values(merged.interviewed).flatMap(resident =>
            isRecord(resident) && typeof resident.house === 'number' ? [resident.house] : []);
          if (new Set(houses).size === houses.length) value = merged;
        }
      }
      if (equal(value, cloud?.value)) delete pending[key];
      else pending[key] = { value: value ?? null, base: revision, mutation: crypto.randomUUID() };
    }
  }
  const values = Object.fromEntries(Object.entries(fields).map(([key, f]) => [key, f.value]));
  for (const [key, change] of Object.entries(pending)) values[key] = change.value;
  return {
    ...j, cloud: fields, pending, state: expand(values), migration: null, migrated: j.migrated || !!migrationId,
    superseded: Object.keys(superseded).length ? superseded : undefined,
  };
}
// Upgrade already-consolidated v1 changes and write-ahead records without
// promoting an old edit to a revision the device never saw.
export function upgradeJournal(j: Journal): Journal {
  if (j.version === 2) return j;
  const cloud: Fields = {};
  for (const [key, field] of Object.entries(j.cloud)) {
    for (const [path, value] of Object.entries(splitField(key, field.value))) cloud[path] = { ...field, value };
  }
  const pending: Journal['pending'] = {};
  const legacyPending: Journal['pending'] = {};
  for (const [key, change] of Object.entries(j.pending)) {
    const previous = j.cloud[key];
    const before = splitField(key, previous?.value);
    const after = splitField(key, change.value);
    if (Object.hasOwn(before, key) && Object.hasOwn(after, key)) {
      pending[key] = change;
      continue;
    }
    legacyPending[key] = change;
    for (const path of new Set([...Object.keys(before), ...Object.keys(after)])) {
      if (path === key || equal(before[path], after[path])) continue;
      pending[path] = {
        ...change, value: after[path] ?? null,
        legacyRevision: (previous?.revision ?? 0) === change.base ? change.base : undefined,
        base: (previous?.revision ?? 0) === change.base ? cloud[path]?.revision ?? 0 : -1,
      };
    }
  }
  return {
    ...j, version: 2, cloud, pending,
    legacyPending: Object.keys(legacyPending).length ? legacyPending : undefined,
    migration: j.migration && { ...j.migration, fields: splitFields(j.migration.fields) },
  };
}
