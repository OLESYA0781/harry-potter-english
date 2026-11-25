import { describe, expect, it } from 'vitest';
import { articles, plurals, wordOrder, mistakes, questionPrompts, listeningStatements, people, tableRows, wordBank } from './data';
import { articleKeys, pluralKeys, wordOrderKeys, mistakeKeys, possibleQuestions } from './answerKey';
import { articleId, cellId, completion, key, notebookIds, placeWord } from './model';
import { homeworks } from '../homeworkCatalog';
import { edit, flatten, newJournal, expand } from '../../progress';
import { initial } from '../../data';

describe('Lesson 3 homework', () => {
  it('preserves all 52 items in Parts 1–3, both gaps in sentence 14, and all remaining tasks', () => {
    expect([articles.length, plurals.length, wordOrder.length, mistakes.length]).toEqual([15, 10, 12, 15]);
    expect(articles.flatMap(sentence => sentence.split('___').slice(1))).toHaveLength(16);
    expect(articles[13]).toBe('I have ___ orange and ___ sandwich.');
    expect([articleKeys.length, pluralKeys.length, wordOrderKeys.length, mistakeKeys.length]).toEqual([15, 10, 12, 15]);
    expect(questionPrompts).toHaveLength(15); expect(possibleQuestions).toHaveLength(15);
    expect(possibleQuestions.every(questions => questions.length === 3)).toBe(true);
    expect(listeningStatements).toHaveLength(6); expect(wordBank).toHaveLength(8);
    expect(mistakes[10]).toBe('She has three childs.');
    expect(mistakes[14]).toBe('There are two countrys on the map.');
    expect(homeworks[0].id).toBe('homework-3');
  });
  it('counts filled choices and four separate notebook marks without grading', () => {
    const answers: Record<string, unknown> = {};
    expect(completion(answers)).toEqual(Array(8).fill(false));
    articles.forEach((sentence, i) => sentence.split('___').slice(1).forEach((_, gap) => { answers[key(articleId(i, gap))] = '—'; }));
    notebookIds.forEach(id => { answers[key('notebook/' + id)] = true; });
    people.forEach(person => { answers[key('listening/match/' + person)] = 'A'; });
    tableRows.forEach((_, r) => people.forEach((_, p) => { answers[key(cellId(r, p))] = 'London'; }));
    for (let i = 1; i <= 6; i++) answers[key('listening/true-false/' + i)] = 'False';
    expect(completion(answers)).toEqual(Array(8).fill(true));
    answers[key('notebook/2')] = false; expect(completion(answers)[2]).toBe(false);
    answers[key(articleId(13, 1))] = ''; expect(completion(answers)[0]).toBe(false);
    expect(completion(answers)[1]).toBe(true);
  });
  it('moves a table word without deleting other answers and round-trips through the existing journal', () => {
    const answers = { 'old-homework-answer': 'keep me', [key(cellId(0, 0))]: 'British', [key(cellId(1, 0))]: 'London' };
    const patch = placeWord(answers, 'British', cellId(0, 1));
    expect(patch).toEqual({ [cellId(0, 0)]: '', [cellId(0, 1)]: 'British' });
    const next = { ...initial, answers: { ...answers, ...Object.fromEntries(Object.entries(patch).map(([id, value]) => [key(id), value])) } };
    const journal = edit(newJournal({ ...initial, answers }), next);
    const restored = expand(flatten(JSON.parse(JSON.stringify(journal)).state));
    expect(restored.answers).toEqual(next.answers);
    expect(restored.answers['old-homework-answer']).toBe('keep me');
    expect(restored.answers[key(cellId(1, 0))]).toBe('London');
  });
});
