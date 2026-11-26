import { edit, equal, expand, expandLegacy, flatten, flattenLegacy, journalKey, loadLegacy, newJournal, upgradeJournal } from './progress';
import { isLessonRecordKey } from './progressFields';
import type { Change, Journal } from './progress';
import type { LessonState } from './data';
const prefix = 'hogwarts-outbox:';
type Operation = { version?: 2; owner: string | null; time: number; changes: Record<string, Change> };
let lastTime = 0;
// A synchronous write-ahead record makes even an immediate reload safe while
// another tab holds the Web Lock used to consolidate the shared journal.
export function writeOperation(storage: Storage, j: Journal, state: LessonState) {
  const next = edit(j, state), before = flatten(j.state), after = flatten(state);
  const changes: Record<string, Change> = {};
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (!equal(before[key], after[key])) changes[key] = next.pending[key] || {
      value: after[key] ?? null, base: 0, mutation: crypto.randomUUID(),
    };
  }
  if (!Object.keys(changes).length) return j;
  lastTime = Math.max(Date.now(), lastTime + 0.01);
  const operation: Operation = { version: 2, owner: j.owner, time: lastTime, changes };
  storage.setItem(prefix + crypto.randomUUID(), JSON.stringify(operation));
  return next;
}
export function readDurable(storage: Storage): { journal: Journal; operations: string[] } {
  const raw = storage.getItem(journalKey);
  let j: Journal = raw ? JSON.parse(raw) : newJournal(loadLegacy(storage));
  if (![1, 2].includes(j.version) || !j.state || !j.cloud || !j.pending) throw new Error('Не удалось прочитать очередь сохранения. Не очищайте данные браузера; сохраните резервную копию.');
  const operations: [string, Operation][] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)!;
    if (key.startsWith(prefix)) operations.push([key, JSON.parse(storage.getItem(key)!)]);
  }
  operations.sort((a, b) => (a[1].version ?? 1) - (b[1].version ?? 1) ||
    a[1].time - b[1].time || a[0].localeCompare(b[0]));
  if (!raw && operations.some(([, op]) => !op.version)) j.version = 1;
  for (const [, op] of operations) {
    if (op.owner && op.owner !== j.owner) throw new Error('В очереди есть данные другой учётной записи. Не очищайте хранилище браузера.');
    if (op.version === 2) j = upgradeJournal(j);
    const values = j.version === 1 ? flattenLegacy(j.state) : flatten(j.state);
    const pending = { ...j.pending };
    const legacyPending = { ...j.legacyPending };
    for (const [key, change] of Object.entries(op.changes)) {
      if (!op.version && j.version === 2 && isLessonRecordKey(key)) {
        // An old tab can still write an aggregate operation during rollout.
        // Retain the draft in the backup without applying an unversioned snapshot.
        legacyPending[`${key}:${change.mutation}`] = change;
        continue;
      }
      if (j.cloud[key]?.mutation === change.mutation) continue;
      values[key] = change.value;
      if (j.owner) pending[key] = change;
    }
    j = { ...j, state: j.version === 1 ? expandLegacy(values) : expand(values), pending,
      legacyPending: Object.keys(legacyPending).length ? legacyPending : undefined };
  }
  return { journal: upgradeJournal(j), operations: operations.map(([key]) => key) };
}
