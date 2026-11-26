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
it('migrates only the edited answers from an old whole-lesson outbox', () => {
  const local = storage();
  const lesson = 'answers:@vika/lesson/lesson-1';
  const response = 'answers:@sync/lesson-1/responses/question~11~0';
  const record = (answer: string) => ({ version: 1, data: { ...initial, answers: {
    'present-simple:v2': { schemaVersion: 2, activePage: 'first', seen: [], responses: { 'question/1~': answer, archived: 'keep' } },
  } } });
  const journal = bind(newJournal(initial), 'learner');
  local.setItem(journalKey, JSON.stringify({ ...journal, cloud: { [lesson]: { value: record('Before'), revision: 9, mutation: 'old' } } }));
  local.setItem('hogwarts-outbox:old', JSON.stringify({ owner: 'learner', time: 1, changes: {
    [lesson]: { value: record('After'), base: 9, mutation: 'pending' },
  } }));
  const recovered = readDurable(local).journal;
  expect(recovered.pending).toEqual({ [response]: { value: 'After', base: 9, mutation: 'pending' } });
  expect(recovered.cloud[response].value).toBe('Before');
  expect(recovered.cloud['answers:@sync/lesson-1/responses/archived'].value).toBe('keep');
});
