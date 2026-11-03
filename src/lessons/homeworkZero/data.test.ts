import { expect, test } from 'vitest';
import { gapKey, gapTasks, homeworkZeroPrefix, translationDialogues, translationSentences } from './data';
test('Homework 0 has exactly 24 independent stable gap keys and the requested notebook tasks', () => {
  const keys = gapTasks.flatMap(task => task.sentences.flatMap(sentence =>
    sentence.text.split('___').slice(1).map((_, gap) => gapKey(task.id, sentence.id, gap))));
  expect(gapTasks[0].sentences).toHaveLength(10);
  expect(gapTasks[1].sentences).toHaveLength(6);
  expect(keys).toHaveLength(24);
  expect(new Set(keys).size).toBe(24);
  expect(keys.every(key => key.startsWith(homeworkZeroPrefix))).toBe(true);
  expect(translationSentences).toHaveLength(10);
  expect(translationSentences.join(' ')).not.toMatch(/\bnear(?: to)?\b/i);
  expect(translationSentences[9]).toBe('Она пишет письма друзьям после школы.');
  expect(translationDialogues).toHaveLength(5);
  expect(gapKey('magic-sentences', 'books', 1)).not.toBe(gapKey('mystery', 'books', 1));
});
