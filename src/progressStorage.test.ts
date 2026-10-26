import { expect, it } from 'vitest';
import { initial } from './data';
import { bind, journalKey, newJournal } from './progress';
import { readDurable, writeOperation } from './progressStorage';
function storage(): Storage {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v); }, removeItem: k => { values.delete(k); }, key: i => [...values.keys()][i] ?? null, clear: () => values.clear() };
}
it('restores an edit before asynchronous consolidation has run', () => {
  const local = storage(), j = bind(newJournal(structuredClone(initial)), 'learner');
  local.setItem(journalKey, JSON.stringify(j));
  writeOperation(local, j, { ...initial, name: 'Immediate reload' });
  const recovered = readDurable(local);
  expect(recovered.journal.state.name).toBe('Immediate reload');
  expect(recovered.journal.pending.name.value).toBe('Immediate reload');
  expect(recovered.operations).toHaveLength(1);
});
it('combines independent durable operations from different tabs', () => {
  const local = storage(), j = bind(newJournal(structuredClone(initial)), 'learner');
  local.setItem(journalKey, JSON.stringify(j));
  writeOperation(local, j, { ...initial, name: 'Tab A' });
  writeOperation(local, j, { ...initial, ratings: { reading: 2 } });
  expect(readDurable(local).journal.state).toMatchObject({ name: 'Tab A', ratings: { reading: 2 } });
});
