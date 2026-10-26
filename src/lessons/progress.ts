import type { SetStateAction } from 'react';
import type { LessonState } from '../data';
import type { LessonDefinition } from './types';

export const TRIAL_ID = 'trial';
// Existing root fields belong to Trial Lesson forever. Additional lessons use
// distinct answer keys accepted by the existing versioned RPC and local outbox.
export const lessonPrefix = '@vika/lesson/';
export const lessonKey = (id: string) => `${lessonPrefix}${id}`;
export function readLesson(root: LessonState, lesson: LessonDefinition): LessonState {
  if (lesson.id === TRIAL_ID) return {
    ...root,
    answers: Object.fromEntries(Object.entries(root.answers).filter(([key]) => !key.startsWith(lessonPrefix))),
  };
  const saved = root.answers[lessonKey(lesson.id)];
  if (saved === undefined || saved === null) return structuredClone(lesson.initialState);
  const record = saved as { version?: number; data?: LessonState };
  if (record.version !== 1 || !record.data || typeof record.data.name !== 'string' ||
      !Number.isInteger(record.data.step) || record.data.step < 0 || !record.data.answers || !record.data.scores || !record.data.ratings) {
    // Never turn unrecognized stored data into an empty editable lesson.
    throw new Error(`Не удалось открыть сохранение урока «${lesson.title}». Его данные сохранены. Обратитесь к преподавателю.`);
  }
  return record.data;
}
export function updateLesson(root: LessonState, lesson: LessonDefinition, action: SetStateAction<LessonState>): LessonState {
  const previous = readLesson(root, lesson);
  const next = typeof action === 'function' ? action(previous) : action;
  if (lesson.id === TRIAL_ID) {
    const others = Object.fromEntries(Object.entries(root.answers).filter(([key]) => key.startsWith(lessonPrefix)));
    const own = Object.fromEntries(Object.entries(next.answers).filter(([key]) => !key.startsWith(lessonPrefix)));
    return { ...next, answers: { ...own, ...others } };
  }
  return { ...root, answers: { ...root.answers, [lessonKey(lesson.id)]: { version: 1, data: next } } };
}
