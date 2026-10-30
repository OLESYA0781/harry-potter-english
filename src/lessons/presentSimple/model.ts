import type { LessonState } from '../../data';
import { lesson1Materials as materials } from './materials';
import type { BookExercise } from './materials';
export const stageTitles = ['Welcome to Hogwarts!', "Professor’s Grammar Room", 'Exercise 3', 'Exercise 4', 'Exercise 5', 'Exercise 6', 'Exercise 7', 'Exercise 8', 'Exercise 9'];
export const slideTitles = ['When do we use Present Simple?', 'Signal Words', 'Affirmative Sentences', 'Negative Sentences', 'Questions', 'Grammar Cheat Sheet'];
export function exerciseDone(state: LessonState, key: string, exercise: BookExercise | null): boolean {
  return !!exercise?.instruction.trim() && exercise.items.length > 0 && exercise.items.every(item => typeof state.answers[`${key}:${item.id}`] === 'string' && !!(state.answers[`${key}:${item.id}`] as string).trim());
}
export function grammarSeen(state: LessonState): number[] {
  return Array.from({length:6},(_,i)=>i).filter(i=>state.answers[`grammarSeen${i}`] === true);
}
export function lesson1Summary(state: LessonState) {
  const intro = !!materials.introduction?.dialogue.trim() && exerciseDone(state,'intro',materials.introduction.comprehension);
  const done = grammarSeen(state).length + Number(intro) + [3,4,5,6,7,8,9].filter(n=>exerciseDone(state,`exercise${n}`,materials.exercises[n])).length;
  const percent = Math.round(done / 14 * 100);
  const missing = !materials.introduction || [3,4,5,6,7,8,9].some(n=>!materials.exercises[n]);
  return { percent, status: done === 14 ? 'completed' as const : state.step > 0 || Object.keys(state.answers).length ? 'in-progress' as const : 'not-started' as const, detail: `${done} из 14 частей${missing ? ' · оригиналы учебника ожидаются' : ''}` };
}
