import type { ComponentType, Dispatch, SetStateAction } from 'react';
import type { LessonState } from '../data';

export type LessonProps = {
  state: LessonState;
  setState: Dispatch<SetStateAction<LessonState>>;
};
export type LessonSummary = {
  status: 'not-started' | 'in-progress' | 'completed';
  percent: number;
  detail: string;
};
export type LessonDefinition = {
  id: string;
  title: string;
  subtitle: string;
  addedAt: string;
  description: string;
  initialState: LessonState;
  Component: ComponentType<LessonProps>;
  summarize: (state: LessonState) => LessonSummary;
};
export const statusLabels: Record<LessonSummary['status'], string> = {
  'not-started': 'Ещё не начат',
  'in-progress': 'В процессе',
  completed: 'Завершён',
};
