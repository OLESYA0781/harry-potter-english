import {expect,it} from 'vitest';
import {initial} from '../../data';
import {toBeBlocks,toBeBlockIndex,affirmativeItems,shortAnswerItems,completeItems,mixedItems,mistakeItems,toBeSummary,previousNegativeItems,negativeItems,questionItems,legacyTransformationItems,legacyAffirmativeItems,legacyShortAnswerItems} from './data';
import {toBeLesson,trialLesson,presentSimpleLesson} from '../registry';
import {readLesson,updateLesson} from '../progress';
it('counts filled work and viewed theory without judging grammar, including the correction task',()=>{
 const answers:Record<string,unknown>={};for(const n of [0,1,2,3,4,12])answers[`seen:${n}`]=true;
 expect(toBeSummary({...initial,answers})).toMatchObject({percent:43,status:'in-progress'});
 for(const [key,items] of [['affirmative',affirmativeItems],['short',shortAnswerItems],['complete',completeItems],['negative',negativeItems],['question',questionItems],['mixed',mixedItems]] as const) for(const item of items)answers[`${key}:${item.id}`]='  I is?\n ';
 for(const item of mistakeItems)answers[`mistake:${item.id}`]='  incorrect original text!  ';
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

it('requires all twelve nonblank correction responses, not correctness',()=>{
 const answers:Record<string,unknown>={};
 for(const item of mistakeItems.slice(0,11))answers[`mistake:${item.id}`]='wrong';
 expect(toBeSummary({...initial,answers}).percent).toBe(0);
 answers['mistake:12']='   ';expect(toBeSummary({...initial,answers}).percent).toBe(0);
 answers['mistake:12']='my own mistake';expect(toBeSummary({...initial,answers}).percent).toBe(7);
 expect(mistakeItems).toHaveLength(12);
});

it('maps every legacy position into exactly one stable topic and preserves earned theory flags',()=>{
 const expected=[0,1,2,3,4,0,2,3,5,5,5,6,6];
 expected.forEach((index,step)=>expect(toBeBlockIndex({...initial,step})).toBe(index));
 expect(toBeBlocks.flatMap(block=>block.parts).slice().sort((a,b)=>a-b)).toEqual(Array.from({length:15},(_,i)=>i).filter(i=>i!==11));
 expect(new Set(toBeBlocks.map(block=>block.id)).size).toBe(7);
 expect(toBeBlockIndex({...initial,step:12,answers:{toBeActiveBlock:'summary'}})).toBe(6);
 // An old client may change only numeric step, leaving a stale new-client marker.
 expect(toBeBlockIndex({...initial,step:6,answers:{toBeActiveBlock:'summary'}})).toBe(2);
});

it('retains completion of retired prompts and hides the removed profile without erasing responses',()=>{
 const answers:Record<string,unknown>={'profile:0':'Keep personal draft',toBeActiveBlock:'profile'};
 for(const [prefix,items] of [['affirmative',legacyAffirmativeItems],['short',legacyShortAnswerItems],['negative',legacyTransformationItems],['question',legacyTransformationItems]] as const)for(const item of items)answers[`${prefix}:${item.id}`]='Previously completed';
 expect(toBeSummary({...initial,answers}).percent).toBe(29);
 expect(toBeBlockIndex({...initial,step:11,answers})).toBe(6);
 expect(answers['profile:0']).toBe('Keep personal draft');
 expect(toBeBlocks.some(block=>block.id==='profile')).toBe(false);
});
it('visible practice uses distinct source IDs and sentence contexts',()=>{
 const lists=[completeItems,affirmativeItems,negativeItems,questionItems,shortAnswerItems,mixedItems];
 const items=lists.flat();expect(new Set(items.map(item=>item.id)).size).toBe(items.length);
 const stems=items.map(item=>item.text.toLowerCase().replace(/\b(am|is|are)\b|\.\.\./g,'').replace(/[^a-zа-яё0-9 ]/g,'').replace(/\s+/g,' ').trim());
 expect(new Set(stems).size).toBe(items.length);
});

it('negative practice has six sentences with two examples of each to be form',()=>{
 expect(negativeItems).toHaveLength(6);
 for(const form of ['am','is','are'])expect(negativeItems.filter(item=>item.text.split(' ').includes(form))).toHaveLength(2);
});

it('preserves completion and responses from the previous negative practice',()=>{
 const answers=Object.fromEntries(previousNegativeItems.map(item=>[`negative:${item.id}`,'  saved draft  ']));
 const state={...initial,answers};
 expect(toBeSummary(state).detail).toBe('1 из 14 частей');
 expect(state.answers['negative:gg3-p5-park']).toBe('  saved draft  ');
 expect(state.answers['negative:gg3-p5-i-park']).toBeUndefined();
});
