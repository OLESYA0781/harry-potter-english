import { expect, test } from 'vitest';
import { gapKey, gapTasks, homeworkZeroPrefix, translationDialogues, translationSentences, writtenKey } from './data';
test('Homework 0 has exactly 25 independent stable gap keys and the written translation tasks', () => {
  const keys = gapTasks.flatMap(task => task.sentences.flatMap(sentence =>
    sentence.text.split('___').slice(1).map((_, gap) => gapKey(task.id, sentence.id, gap))));
  expect(gapTasks[0].sentences).toHaveLength(10);
  expect(gapTasks[1].sentences).toHaveLength(6);
  expect(keys).toHaveLength(25);
  expect(new Set(keys).size).toBe(25);
  expect(keys.every(key => key.startsWith(homeworkZeroPrefix))).toBe(true);
  expect(translationSentences).toHaveLength(10);
  expect(translationSentences.map(item => item.text).join(' ')).not.toMatch(/\bnear(?: to)?\b/i);
  expect(translationSentences[9].text).toBe('Она пишет письма друзьям после школы.');
  expect(translationDialogues).toHaveLength(5);
  const written = [
    ...translationSentences.map(item => writtenKey('translations', item.id)),
    ...translationDialogues.map(item => writtenKey('dialogues', item.id)),
    writtenKey('profile'),
  ];
  expect(new Set(written).size).toBe(16);
  expect(new Set([...keys, ...written]).size).toBe(41);
  expect(gapKey('magic-sentences', 'books', 1)).not.toBe(gapKey('mystery', 'books', 1));
});
