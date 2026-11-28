import type { LessonState } from '../../data';
import { finalQuestions, neighbours, noteColumns, prompts } from './data';
// Flat scalar keys let the existing answer-level splitter/revision RPC sync
// independent fields; never store the investigation as one composite answer.
export const prefix = 'lost-bag/v1/';
export const key = (id: string) => prefix + id;
export const questionId = (person: string, prompt: string) => `question/${person}/${prompt}`;
export const replyId = (person: string, prompt: string) => `reply/${person}/${prompt}`;
export const noteId = (person: string, column: string) => `note/${person}/${column}`;
export function progress(answers: Record<string, unknown>) {
  const filled = (id: string) => typeof answers[key(id)] === 'string' && (answers[key(id)] as string).trim().length > 0;
  const interviews = neighbours.reduce((total, person) => total + prompts.filter(prompt =>
    filled(questionId(person.id, prompt.id)) && answers[key(replyId(person.id, prompt.id))] === true).length, 0);
  const notes = neighbours.reduce((total, person) => total + noteColumns.filter(column => filled(noteId(person.id, column.id))).length, 0);
  const final = finalQuestions.filter(question => filled('final/' + question.id)).length + Number(filled('final/description'));
  const total = neighbours.length * prompts.length + neighbours.length * noteColumns.length + finalQuestions.length + 1;
  return { interviews, notes, final, done: interviews + notes + final, total };
}
export function lostBagSummary(state: LessonState) {
  const { done, total } = progress(state.answers);
  const started = Object.keys(state.answers).some(id => id.startsWith(prefix));
  return {
    percent: Math.round(done / total * 100),
    status: done === total ? 'completed' as const : started ? 'in-progress' as const : 'not-started' as const,
    detail: `${done} / ${total} saved entries`,
  };
}
