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

it('recovers an old whole-lesson outbox as only the changed and cleared responses', () => {
  const local = storage();
  const key = 'answers:@vika/lesson/lesson-1';
  const saved = (responses: Record<string, string>) => ({
    version: 1, data: { ...initial, answers: {
      'present-simple:v2': { schemaVersion: 2, activePage: 'page', seen: [], responses },
    } },
  });
  const original = saved({ 'task/A': 'First', 'task/B': 'Second', 'task/C': 'Clear me' });
  const next = saved({ 'task/A': 'Offline edit', 'task/B': 'Second' });
  const journal = {
    ...newJournal({ ...initial, answers: { '@vika/lesson/lesson-1': original } }),
    owner: 'learner', cloud: { [key]: { value: original, revision: 5, mutation: 'remote' } },
  };
  local.setItem(journalKey, JSON.stringify(journal));
  local.setItem('hogwarts-outbox:old', JSON.stringify({
    owner: 'learner', time: 1, changes: { [key]: { value: next, base: 5, mutation: 'legacy-local' } },
  }));
  expect(readDurable(local).journal.pending).toEqual({
    'answers:@sync/lesson-1/answers/present-simple:v2/responses/task~1A': { value: 'Offline edit', base: 5, mutation: 'legacy-local' },
    'answers:@sync/lesson-1/answers/present-simple:v2/responses/task~1C': { value: null, base: 5, mutation: 'legacy-local' },
  });
});

it('leaves an unsupported local snapshot intact', () => {
  const local = storage();
  const key = 'hogwarts-english-v1';
  const original = '{"version":99,"data":{"answers":{"draft":"still here"}}}';
  local.setItem(key, original);
  expect(() => readDurable(local)).toThrow('прежний прогресс');
  expect(local.getItem(key)).toBe(original);
  expect(local.getItem(journalKey)).toBeNull();
});
