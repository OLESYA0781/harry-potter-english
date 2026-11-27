import { initial, stages } from './data';
import type { LessonState } from './data';
import { agencyKey } from './lessons/homeworkOne/data';
import { readAgency } from './lessons/homeworkOne/model';
import { restoreFields, splitField } from './answerFields';

export const legacyKey = 'hogwarts-english-v1';
export const journalKey = 'hogwarts-cloud-v1';
export type Field = { value: unknown; revision: number; mutation: string; updated_at?: string };
export type Fields = Record<string, Field>;
export type Change = { value: unknown; base: number; mutation: string; attempts?: string[] };
export type Journal = {
  version: 1; owner: string | null; state: LessonState; cloud: Fields;
  pending: Record<string, Change>; migration: { id: string; fields: Record<string, unknown> } | null;
  backup: LessonState | null; migrated: boolean;
  learner?: string;
  superseded?: Record<string, { key: string; local: Change; cloud: Field }>;
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

// Merge independent edits only when their shared base is available.
function merge(local: unknown, cloud: unknown, base: unknown): unknown {
  if (equal(local, cloud) || equal(local, base)) return cloud;
  if (equal(cloud, base)) return local;
  if (!isRecord(local) || !isRecord(cloud)) return cloud;
  const previous = isRecord(base) ? base : {};
  const keys = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  return Object.fromEntries([...keys].flatMap(key => {
    const value = merge(
      Object.hasOwn(local, key) ? local[key] : undefined,
      Object.hasOwn(cloud, key) ? cloud[key] : undefined,
      Object.hasOwn(previous, key) ? previous[key] : undefined,
    );
    return value === undefined ? [] : [[key, value]];
  }));
}
export function flatten(s: LessonState): Record<string, unknown> {
  const fields: [string, unknown][] = [
    ['name', s.name], ['step', s.step],
    ...(['answers', 'scores', 'ratings'] as const).flatMap(group =>
      Object.entries(s[group]).map(([key, value]): [string, unknown] => [`${group}:${key}`, value])),
  ];
  return Object.fromEntries(fields.flatMap(([key, value]) => splitField(key, value)));
}
export function expand(values: Record<string, unknown>): LessonState {
  const state = structuredClone(initial);
  for (const [key, value] of Object.entries(values)) {
    if (value === null || key.startsWith('answers:@sync/')) continue; // Tombstones keep the revision after restart.
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
  restoreFields(state, values);
  return state;
}
export function loadLegacy(storage: Pick<Storage, 'getItem'>, preserveUnknown = false): LessonState {
  try {
    const raw = storage.getItem(legacyKey);
    if (raw === null) return structuredClone(initial);
    const s = JSON.parse(raw);
    if (s && [1, 2, 3].includes(s.version) && Number.isInteger(s.data?.step) &&
        s.data.step >= 0 && s.data.step < (s.version === 1 ? 12 : s.version === 2 ? 13 : stages.length) &&
        typeof s.data.name === 'string' && s.data.answers && s.data.scores && s.data.ratings) {
      return { ...s.data, step: (s.version === 1 && s.data.step === 11) || (s.version === 2 && s.data.step === 12) ? stages.length - 1 : s.data.step };
    }
  } catch { /* The caller can keep working with the in-memory fallback. */ }
  if (preserveUnknown) throw new Error('Не удалось прочитать прежний прогресс. Данные сохранены в браузере.');
  return structuredClone(initial);
}
export function newJournal(state: LessonState): Journal {
  return { version: 1, owner: null, state, cloud: {}, pending: {}, migration: null, backup: null, migrated: false };
}
export function bind(j: Journal, owner: string, learner = owner): Journal {
  if (j.owner && j.owner !== owner) throw new Error('Этот браузер связан с другой учётной записью. Локальный прогресс сохранён; войдите в прежнюю учётную запись.');
  if (j.owner) {
    if ((j.learner ?? j.owner) !== learner) throw new Error('Облачная запись ученицы изменилась. Локальный прогресс сохранён.');
    return j;
  }
  return { ...j, owner, learner, backup: structuredClone(j.state), migration: { id: crypto.randomUUID(), fields: flatten(j.state) } };
}
export function edit(j: Journal, state: LessonState): Journal {
  if (!j.owner) return { ...j, state };
  const before = flatten(j.state), after = flatten(state), pending = { ...j.pending };
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (!equal(before[key], after[key])) {
      pending[key] = {
        value: after[key] ?? null,
        base: pending[key]?.base ?? j.cloud[key]?.revision ?? 0,
        mutation: crypto.randomUUID(),
        attempts: pending[key]?.attempts,
      };
    }
  }
  return { ...j, state, pending };
}
// Keep IDs sent from this browser when a reply is lost and the user continues typing.
export function recordAttempts(journal: Journal): Journal {
  if (!Object.keys(journal.pending).length) return journal;
  return {
    ...journal,
    pending: Object.fromEntries(Object.entries(journal.pending).map(([key, change]) => [
      key, { ...change, attempts: [...new Set([...(change.attempts ?? []), change.mutation])] },
    ])),
  };
}
export function reconcile(j: Journal, fields: Fields, sent: Record<string, Change>, migrationId?: string): Journal {
  // Another tab can persist a newer revision before this response is applied.
  fields = { ...fields };
  for (const [key, known] of Object.entries(j.cloud)) {
    if (known.revision > (fields[key]?.revision ?? 0)) fields[key] = known;
  }
  const pending = { ...j.pending };
  const superseded = { ...j.superseded };
  for (const [key, change] of Object.entries(pending)) {
    const cloud = fields[key];
    if (!cloud) continue;
    if (cloud.mutation === change.mutation || equal(cloud.value, change.value)) {
      delete pending[key];
    } else if (cloud.mutation === sent[key]?.mutation || cloud.mutation === migrationId || change.attempts?.includes(cloud.mutation)) {
      // Keep newer edits made while a request was in flight.
      pending[key] = { value: change.value, mutation: change.mutation, base: cloud.revision };
    } else if (cloud.revision !== change.base) {
      // The server-confirmed revision wins overlap. Keep the offline version in
      // the downloadable backup, including deletions and unsuccessful board merges.
      superseded[key + ':' + change.mutation] = { key, local: change, cloud };
      const previous = j.cloud[key];
      const shared = previous?.revision === change.base ? previous : undefined;
      // Only one confirmed remote transition can be compared with a shared base.
      // A revision gap can conceal a clear, and canonical answers stay atomic.
      const mergeable = cloud.revision === change.base + 1 && (shared || change.base === 0) &&
        isRecord(change.value) && isRecord(cloud.value) && !key.startsWith('answers:@sync/');
      let value = mergeable ? merge(change.value, cloud.value, shared?.value) : cloud.value;
      if (key === `answers:${agencyKey}`) {
        try { readAgency(value); } catch { value = cloud.value; }
      }
      if (equal(value, cloud.value)) delete pending[key];
      else pending[key] = { value: value ?? null, base: cloud.revision, mutation: crypto.randomUUID() };
    }
  }
  const values = Object.fromEntries(Object.entries(fields).map(([key, f]) => [key, f.value]));
  for (const [key, change] of Object.entries(pending)) values[key] = change.value;
  return { ...j, cloud: fields, pending, superseded, state: expand(values), migration: null, migrated: j.migrated || !!migrationId };
}
// Convert the previous format using its confirmed cloud baseline. Only the
// differences become pending, so an old lesson snapshot cannot resend every answer.
export function upgradeFields(journal: Journal): Journal {
  const cloud = Object.fromEntries(Object.entries(journal.cloud).flatMap(([key, field]) =>
    splitField(key, field.value).map(([path, value]) => [path, { ...field, value }])));
  const pending = upgradeChanges(journal.pending, journal.cloud);
  const migration = journal.migration && {
    ...journal.migration,
    fields: Object.fromEntries(Object.entries(journal.migration.fields).flatMap(([key, value]) => splitField(key, value))),
  };
  return { ...journal, cloud, pending, migration };
}

export function upgradeChanges(changes: Record<string, Change>, cloud: Fields): Record<string, Change> {
  return Object.fromEntries(Object.entries(changes).flatMap(([key, change]) => {
    const before = cloud[key] ? Object.fromEntries(splitField(key, cloud[key].value)) : {};
    const after = Object.fromEntries(splitField(key, change.value));
    if ((key in after && (!cloud[key] || key in before))) return [[key, change]];
    return [...new Set([...Object.keys(before), ...Object.keys(after)])]
      .filter(path => !equal(before[path], after[path]))
      .filter(path => path !== key || change.value !== null)
      .map(path => [path, { ...change, value: after[path] ?? null, base: path in before ? change.base : 0 }]);
  }));
}
