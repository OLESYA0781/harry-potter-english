import {expect,it} from 'vitest';
import {initial} from '../../data';
import {lesson1Summary,exerciseDone} from './model';
import {presentSimpleLesson,lessons,trialLesson} from '../registry';
import {readLesson,updateLesson} from '../progress';
it('only counts real viewed grammar and never completes missing originals',()=>{
  expect(lessons.map(l=>l.id)).toEqual(['lesson-1','trial']);
  const state={...initial,step:8,answers:Object.fromEntries(Array.from({length:6},(_,i)=>[`grammarSeen${i}`,true]))};
  expect(lesson1Summary(state)).toMatchObject({percent:43,status:'in-progress'});
  expect(lesson1Summary(initial)).toMatchObject({percent:0,status:'not-started'});
  expect(exerciseDone({...initial,answers:{'exercise3:a':'  my errors!  '}},'exercise3',{instruction:'Original supplied instruction',items:[{id:'a',prompt:'Original supplied question'}]})).toBe(true);
  expect(exerciseDone({...initial,answers:{'exercise3:a':'\n '}},'exercise3',{instruction:'Original supplied instruction',items:[{id:'a',prompt:'Original supplied question'}]})).toBe(false);
});
it('preserves Trial and Homework when the real new lesson is updated',()=>{
 const old={...structuredClone(initial),answers:{diary:'Keep original','@vika/lesson/trial-homework/day':'Old homework'}};
 const next=updateLesson(old,presentSimpleLesson,s=>({...s,answers:{grammarNotes:'  I has.\n'}}));
 expect(readLesson(next,trialLesson).answers.diary).toBe('Keep original');
 expect(next.answers['@vika/lesson/trial-homework/day']).toBe('Old homework');
 expect(readLesson(next,presentSimpleLesson).answers.grammarNotes).toBe('  I has.\n');
});
