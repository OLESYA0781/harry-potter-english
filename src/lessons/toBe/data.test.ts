import {expect,it} from 'vitest';
import {initial} from '../../data';
import {completeItems,mixedItems,toBeSummary,transformationItems} from './data';
import {toBeLesson,trialLesson,presentSimpleLesson} from '../registry';
import {readLesson,updateLesson} from '../progress';
it('counts filled work and viewed theory without judging grammar or counting the absent task',()=>{
 const answers:Record<string,unknown>={};for(const n of [0,1,2,3,4,12])answers[`seen:${n}`]=true;
 expect(toBeSummary({...initial,answers})).toMatchObject({percent:50,status:'in-progress'});
 for(const [key,items] of [['complete',completeItems],['negative',transformationItems],['question',transformationItems],['mixed',mixedItems]] as const) for(const item of items)answers[`${key}:${item.id}`]='  I is?\n ';
 for(let i=0;i<8;i++)answers[`reading:${i}`]='wrong';for(let i=0;i<7;i++)answers[`profile:${i}`]='own text';
 expect(toBeSummary({...initial,answers})).toMatchObject({percent:100,status:'completed'});
 answers['complete:157-5']=' \n ';expect(toBeSummary({...initial,answers}).status).toBe('in-progress');
});
it('updating Lesson 0 preserves all other lesson records and original answers',()=>{
 let root=updateLesson(initial,presentSimpleLesson,s=>({...s,answers:{grammarNotes:'Lesson1'}}));
 root={...root,answers:{...root.answers,diary:'Trial','@vika/lesson/trial-homework/day':'Homework'}};
 const updated=updateLesson(root,toBeLesson,s=>({...s,step:11,answers:{'profile:0':'  I is.\n '}}));
 expect(readLesson(updated,toBeLesson).answers['profile:0']).toBe('  I is.\n ');
 expect(readLesson(updated,presentSimpleLesson).answers.grammarNotes).toBe('Lesson1');expect(readLesson(updated,trialLesson).answers.diary).toBe('Trial');expect(updated.answers['@vika/lesson/trial-homework/day']).toBe('Homework');
});
