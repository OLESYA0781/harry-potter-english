import {lesson1Materials as materials} from './materials';
import {expect,it} from 'vitest';
import {initial} from '../../data';
import {lesson1Summary,exerciseDone} from './model';
import {presentSimpleLesson,lessons,trialLesson} from '../registry';
import {readLesson,updateLesson} from '../progress';
it('counts viewed grammar separately from unanswered textbook tasks',()=>{
  expect(lessons.map(l=>l.id)).toEqual(['lesson-1','lesson-0','trial']);
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

it('requires original response fields and calendar, but never correct answers or prefilled examples',()=>{
 const answers:Record<string,unknown>=Object.fromEntries(Array.from({length:6},(_,i)=>[`grammarSeen${i}`,true]));
 for(const [key,book] of [['intro',materials.introduction.comprehension],...Object.entries(materials.exercises).map(([n,book])=>[`exercise${n}`,book])] as [string,typeof materials.exercises[number]][]){
  for(const item of book.items.filter(item=>!item.example))answers[`${key}:${item.id}`]='  My draft, even if incorrect.\n ';
 }
 expect(lesson1Summary({...initial,answers}).status).toBe('in-progress');
 answers['exercise3:busy-days']=['Monday','Thursday'];
 expect(lesson1Summary({...initial,answers})).toMatchObject({percent:100,status:'completed',detail:'14 из 14 частей'});
 answers['exercise9:p5-9-5']='  ';expect(lesson1Summary({...initial,answers}).status).toBe('in-progress');
 expect(materials.exercises[3].items.filter(item=>!item.example)).toHaveLength(5);
 expect(materials.exercises[5].items.filter(item=>!item.example)).toHaveLength(4);
});
