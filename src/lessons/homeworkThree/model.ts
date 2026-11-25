import { articles, people, tableRows } from './data';

// Separate answer keys share the existing root journal, outbox and Supabase sync.
export const prefix = '@vika/homework/lesson-3/';
export const key = (id: string) => prefix + id;
export const articleId = (sentence: number, gap: number) => `articles/${sentence + 1}/${gap + 1}`;
export const cellId = (row: number, person: number) => `listening/table/${row}/${person}`;
export const notebookIds = ['1b', '2', '3', '5'] as const;
export function completion(answers: Record<string, unknown>) {
  const filled = (id: string) => typeof answers[key(id)] === 'string' && (answers[key(id)] as string).trim() !== '';
  return [
    articles.every((sentence, i) => sentence.split('___').slice(1).every((_, gap) => filled(articleId(i, gap)))),
    answers[key('notebook/1b')] === true,
    answers[key('notebook/2')] === true,
    answers[key('notebook/3')] === true,
    people.every(person => filled(`listening/match/${person}`)),
    tableRows.every((_, row) => people.every((_, person) => filled(cellId(row, person)))),
    Array.from({ length: 6 }, (_, i) => filled(`listening/true-false/${i + 1}`)).every(Boolean),
    answers[key('notebook/5')] === true,
  ];
}
/** Moving a word clears its former cell in the same atomic journal update. */
export function placeWord(answers: Record<string, unknown>, word: string, target: string) {
  const updates: Record<string, string> = {};
  tableRows.forEach((_, row) => people.forEach((_, person) => {
    const id = cellId(row, person);
    if (answers[key(id)] === word) updates[id] = '';
  }));
  updates[target] = word;
  return updates;
}
