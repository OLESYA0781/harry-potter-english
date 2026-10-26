import { diagnose, initial } from '../data';
import TrialLesson from './TrialLesson';
import type { LessonDefinition } from './types';
import { TRIAL_ID } from './progress';

export const trialLesson: LessonDefinition = {
  id: TRIAL_ID,
  title: 'Trial Lesson',
  subtitle: 'Пробное занятие',
  addedAt: '2026-10-24T00:00:00Z',
  description: 'Приключение в Хогвартсе: истории, игры, чтение и разговорная практика. 12 глав с интерактивными заданиями и диагностикой.',
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
// Add a new module here. Both menus and the dashboard use this one registry.
export const lessons = sortLessons([trialLesson]);
