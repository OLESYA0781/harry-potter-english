import { diagnose, initial } from '../data';
import { readGrammarProgress } from '../grammarChallenges';
import TrialLesson from './TrialLesson';
import type { LessonDefinition } from './types';
import { TRIAL_ID } from './progress';

export const trialLesson: LessonDefinition = {
  id: TRIAL_ID,
  title: 'Пробное занятие',
  subtitle: 'Trial Lesson',
  addedAt: '2026-10-24T00:00:00Z',
  description: 'Приключение в Хогвартсе: истории, игры, чтение и разговорная практика. Все 15 глав, включая грамматику A2 и B1.',
  initialState: initial,
  Component: TrialLesson,
  summarize(state) {
    const metrics = diagnose(state).metrics;
    const baseDone = metrics.reduce((sum, m) => sum + Math.min(m.done, m.total), 0);
    const baseTotal = metrics.reduce((sum, m) => sum + m.total, 0);
    const challenges = ['grammarA2', 'grammarB1'].map(key => readGrammarProgress(state.answers[key]));
    const grammarDone = challenges.reduce((sum, p) => sum + p.entries.filter(e => e.attempts.length > 0).length, 0);
    const differences = Array.isArray(state.answers.differencesFound) ? Math.min(state.answers.differencesFound.length, 6) : 0;
    const percent = Math.round((baseDone + grammarDone + differences) / (baseTotal + 20 + 6) * 100);
    const started = state.step > 0 || !!state.name || Object.keys(state.answers).length > 0 || Object.keys(state.scores).length > 0 || Object.keys(state.ratings).length > 0;
    return {
      percent,
      status: percent === 100 ? 'completed' : started ? 'in-progress' : 'not-started',
      detail: `${baseDone + grammarDone + differences} из ${baseTotal + 20 + 6} заданий и оценок`,
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
