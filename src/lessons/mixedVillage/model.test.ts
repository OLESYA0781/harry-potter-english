import { expect, it } from 'vitest';
import { initial } from '../../data';
import type { LessonState } from '../../data';
import { lessonKey, readLesson, updateLesson } from '../progress';
import { villageLesson } from '../registry';
import { residents } from './data';
import { editVillage, readVillage, villageSummary } from './model';
import { profiles } from './teacherData';

it('keeps one plaque per house and unlocks each stage in order', () => {
  const moveEmma = { type: 'move', name: 'Emma', house: 5 } as const;
  let state = editVillage(initial, moveEmma);
  expect(state).toBe(initial);
  state = editVillage(state, { type: 'interview', name: 'Emma' });
  state = editVillage(state, moveEmma);
  state = editVillage(state, { type: 'interview', name: 'Jane' });
  expect(editVillage(state, { type: 'move', name: 'Jane', house: 5 })).toBe(state);
  expect(editVillage(state, { type: 'confirmArticles', name: 'Emma' })).toBe(state);

  state = editVillage(state, { type: 'move', name: 'Emma', house: 4 });
  state = editVillage(state, { type: 'confirmPlacement', name: 'Emma' });
  expect(editVillage(state, moveEmma)).toBe(state);
  state = editVillage(state, { type: 'confirmArticles', name: 'Emma' });
  expect(readVillage(state).interviewed.Emma).toEqual({ house: 4, placed: true, articles: true });
  expect(villageSummary(state)).toEqual({ percent: 17, status: 'in-progress', detail: '1 из 8 жителей дома' });

  state = editVillage(state, { type: 'resetPlacement', name: 'Emma' });
  expect(readVillage(state).interviewed).toEqual({ Emma: {}, Jane: {} });
  expect(editVillage(state, moveEmma)).not.toBe(state);
});

it('restores all milestones and resets only the village within the lesson record', () => {
  const root = { ...initial, answers: { 'homework-1/notebook': true, '@vika/lesson/lesson-2': { version: 1, data: initial } } };
  let state: LessonState = root;
  for (const { name } of residents) {
    state = updateLesson(state, villageLesson, village => {
      village = editVillage(village, { type: 'interview', name });
      village = editVillage(village, { type: 'move', name, house: profiles[name].house });
      village = editVillage(village, { type: 'confirmPlacement', name });
      return editVillage(village, { type: 'confirmArticles', name });
    });
  }
  const restored = JSON.parse(JSON.stringify(state));
  expect(villageSummary(readLesson(restored, villageLesson))).toMatchObject({ percent: 100, status: 'completed' });
  const reset = updateLesson(restored, villageLesson, village => editVillage(village, { type: 'reset' }));
  const { [lessonKey(villageLesson.id)]: _, ...otherAnswers } = reset.answers;
  expect(otherAnswers).toEqual(root.answers);
  expect(villageSummary(readLesson(reset, villageLesson))).toMatchObject({ percent: 0, status: 'not-started' });
});
