import { diagnose, initial } from '../data';
import TrialLesson from './TrialLesson';
import ToBeLesson from './ToBeLesson';
import { toBeSummary } from './toBe/data';
import PresentSimpleLesson from './presentSimple/PresentSimpleLesson';
import LessonTwo from './articles/Articles';
import {articleSummary} from './articles/data';
import { lesson1Summary } from './presentSimple/model';
import type { LessonDefinition } from './types';
import { TRIAL_ID } from './progress';

export const trialLesson: LessonDefinition = {
  id: TRIAL_ID,
  title: 'Trial Lesson',
  subtitle: 'Пробное занятие',
  addedAt: '2026-10-24T00:00:00Z',
  description: '',
  initialState: initial,
  Component: TrialLesson,
  summarize(state) {
    const metrics = diagnose(state).metrics;
    const baseDone = metrics.reduce((sum, m) => sum + Math.min(m.done, m.total), 0);
    const baseTotal = metrics.reduce((sum, m) => sum + m.total, 0);
    const differences = Array.isArray(state.answers.differencesFound) ? Math.min(state.answers.differencesFound.length, 6) : 0;
    const percent = Math.round((baseDone + differences) / (baseTotal + 6) * 100);
    const started = state.step > 0 || !!state.name || Object.keys(state.answers).length > 0 || Object.keys(state.scores).length > 0 || Object.keys(state.ratings).length > 0;
    return {
      percent,
      status: percent === 100 ? 'completed' : started ? 'in-progress' : 'not-started',
      detail: `${baseDone + differences} из ${baseTotal + 6} заданий и оценок`,
    };
  },
};
export function sortLessons(lessons: readonly LessonDefinition[]): LessonDefinition[] {
  const ids = new Set<string>();
  for (const lesson of lessons) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(lesson.id) || ids.has(lesson.id) || !Number.isFinite(Date.parse(lesson.addedAt))) {
      throw new Error(`Некорректная запись урока: ${lesson.id}`);
    }
    ids.add(lesson.id);
  }
  return [...lessons].sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt) || a.id.localeCompare(b.id));
}
export const presentSimpleLesson: LessonDefinition = {
  id: 'lesson-1', title: 'Lesson 1 — Present Simple', subtitle: 'Урок 1 — Настоящее простое время',
  addedAt: '2026-10-30T00:00:00Z', description: '', initialState: structuredClone(initial),
  Component: PresentSimpleLesson, summarize: lesson1Summary,
};
export const toBeLesson: LessonDefinition = {
  id: 'lesson-0', title: 'Lesson 0 — To Be', subtitle: 'Урок 0 — Глагол to be',
  addedAt: '2026-10-31T00:00:00Z', description: '', initialState: structuredClone(initial),
  Component: ToBeLesson,
  summarize: toBeSummary,
};
export const mysteryLesson: LessonDefinition = {
 id:'lesson-2', title:'Lesson 2 — The Hogwarts Mystery: Questions & Articles', subtitle:'Урок 2 — Тайна Хогвартса', addedAt:'2026-11-14T00:00:00Z', description:'', initialState:structuredClone(initial), Component:LessonTwo, summarize:articleSummary,
};
// Explicit display order shared by the main menu and lesson picker.
// Keep Trial Lesson last; publication dates do not determine the teaching order.
export const lessons: LessonDefinition[] = [mysteryLesson, presentSimpleLesson, toBeLesson, trialLesson];
