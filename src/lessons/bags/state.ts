import type { LessonState } from '../../data';
import { villageSummary } from '../mixedVillage/model';

export const bagPrefix = 'bag-lesson/v1/';
const milestones = [
  'intro-a-seen','intro-b-seen','learn','match/done','listen/done','missing/done','word-speaking',
  'street/done','articles/done','plural/done','have/done','bank-a/done','bank-p/done','bank-pictures/done',
  'describe-a','describe-b','same/done','same-speaking','difference','questions-speaking',
  'writing-first/done','post-done','message-done','writing-match/done','final-vocab/done','final-grammar/done','final-speaking',
];

export function bagSummary(state: LessonState) {
  const village = villageSummary(state);
  const done = milestones.filter(key => state.answers[bagPrefix + key] === true).length;
  const started = village.status !== 'not-started' || Object.keys(state.answers).some(key => key.startsWith(bagPrefix));
  return {
    percent: Math.round((done + village.percent / 100) / (milestones.length + 1) * 100),
    status: done === milestones.length && village.status === 'completed' ? 'completed' as const
      : started ? 'in-progress' as const : 'not-started' as const,
    detail: `${done + Number(village.status === 'completed')} из ${milestones.length + 1} этапов`,
  };
}
