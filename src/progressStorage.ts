import { edit, equal, expand, flatten, journalKey, loadLegacy, newJournal } from './progress';
import type { Change, Journal } from './progress';
import type { LessonState } from './data';
const prefix = 'hogwarts-outbox:';
type Operation = { owner: string | null; time: number; changes: Record<string, Change> };
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
  lastTime = Math.max(Date.now(), lastTime + 0.01);
  const operation: Operation = { owner: j.owner, time: lastTime, changes };
  storage.setItem(prefix + crypto.randomUUID(), JSON.stringify(operation));
  return next;
}
export function readDurable(storage: Storage): { journal: Journal; operations: string[] } {
  const raw = storage.getItem(journalKey);
  let j: Journal = raw ? JSON.parse(raw) : newJournal(loadLegacy(storage));
  if (j.version !== 1 || !j.state || !j.cloud || !j.pending) throw new Error('Не удалось прочитать очередь сохранения. Не очищайте данные браузера; сохраните резервную копию.');
  const operations: [string, Operation][] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)!;
    if (key.startsWith(prefix)) operations.push([key, JSON.parse(storage.getItem(key)!)]);
  }
  operations.sort((a, b) => a[1].time - b[1].time || a[0].localeCompare(b[0]));
  for (const [, op] of operations) {
    if (op.owner && op.owner !== j.owner) throw new Error('В очереди есть данные другой учётной записи. Не очищайте хранилище браузера.');
    const values = flatten(j.state), pending = { ...j.pending };
    for (const [key, change] of Object.entries(op.changes)) {
      if (j.cloud[key]?.mutation === change.mutation) continue;
      values[key] = change.value;
      if (j.owner) pending[key] = change;
    }
    j = { ...j, state: expand(values), pending };
  }
  return { journal: j, operations: operations.map(([key]) => key) };
}
