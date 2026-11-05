import {expect,it} from 'vitest';
import {initial} from '../../data';
import {allTasks,pages,places,topics,transport} from './course';
import {courseKey,freshCourse,legacyResponses,lesson1Summary,pageIndex,readCourse,updateCourse} from './model';
import {presentSimpleLesson,lessons,toBeLesson,trialLesson} from '../registry';
import {readLesson,updateLesson} from '../progress';

it('has the requested topics after removing Word Order, exact book vocabulary, and unique stable response/page IDs',()=>{
 expect(topics.map(topic=>topic.id)).toEqual(['jobs','welcome','uses','affirmative','transport','negative','questions','frequency','short-answers','to-be','jobs-lab']);
 expect(places.map(word=>word.en)).toEqual(['bank','café','cinema','hospital','hotel','museum','park','restaurant','stadium','theatre']);
 expect(transport.map(word=>word.en)).toEqual(['bike','boat','bus','car','motorbike','plane','taxi','train','tram','underground']);
 expect(new Set(allTasks.map(task=>task.id)).size).toBe(allTasks.length);
 expect(new Set(pages.map(page=>page.id)).size).toBe(pages.length);
 expect(pages.flatMap(page=>page.tasks.filter(task=>!task.optional).map(task=>task.id))).toEqual(allTasks.map(task=>task.id));
 expect(pages.every(page=>page.tasks.length<=4||page.unit.jobInterview)).toBe(true);
 const counts=Object.fromEntries(topics.map(topic=>[topic.id,topic.units.flatMap(unit=>(unit.tasks||[]).filter(task=>!task.optional)).length]));
 expect(counts).toEqual({jobs:0,welcome:0,uses:8,affirmative:37,transport:0,negative:27,questions:39,'short-answers':13,frequency:28,'to-be':8,'jobs-lab':56});
 expect(topics.find(topic=>topic.id==='uses')!.units.map(unit=>unit.title)).not.toContain('Permanent situations');
 expect(allTasks.filter(task=>!task.options).length).toBeGreaterThan(80);
 expect(lessons.map(lesson=>lesson.id)).toEqual(['lesson-1','lesson-0','trial']);
});
it('requires every nonblank response and viewed topic but never judges grammar',()=>{
 expect(lesson1Summary(initial)).toMatchObject({percent:0,status:'not-started'});
 const state=updateCourse(initial,course=>({...course,seen:topics.map(topic=>topic.id),responses:Object.fromEntries(allTasks.map(task=>[task.id,task.categories?JSON.stringify([task.categories[0]]):task.chunks?JSON.stringify(task.chunks.map((_,i)=>task.chunks!.length-1-i)):'  my own wrong answer!\n ']))}));
 expect(lesson1Summary(state)).toMatchObject({percent:100,status:'completed'});
 const missing=updateCourse(state,course=>({...course,responses:{...course.responses,'compare-01':' \n '}}));
 expect(lesson1Summary(missing).status).toBe('in-progress');
 expect(lesson1Summary(missing).percent).toBeLessThan(100);
 expect(readCourse(state).responses['compare-01']).toBe('  my own wrong answer!\n ');
});
it('never maps old slide indices or textbook responses to new tasks, and preserves the complete old record',()=>{
 const old={...structuredClone(initial),step:8,name:'Vika',answers:{grammarNotes:'  Keep notes\n ',grammarSlide:5,grammarSeen5:true,'exercise3:p5-3-2':'Old answer','exercise3:busy-days':['Monday']},scores:{old:{correct:true,first:true,latest:true,skill:'Grammar' as const}},ratings:{old:2}};
 const before=structuredClone(old);
 expect(readCourse(old)).toEqual(freshCourse());expect(lesson1Summary(old).percent).toBe(0);
 const next=updateCourse(old,course=>({...course,activePage:pages.find(page=>page.topicId==='negative')!.id,responses:{negative:'New draft'}}));
 expect({...next,answers:Object.fromEntries(Object.entries(next.answers).filter(([key])=>key!==courseKey))}).toEqual(before);
 expect(legacyResponses(next)).toContainEqual(['exercise3:p5-3-2','Old answer']);
 expect(legacyResponses(next)).toContainEqual(['exercise3:busy-days','Monday']);
 expect(readCourse(next).responses['affirm-gap-01']).toBeUndefined();
 expect(pages[pageIndex(readCourse(next))].topicId).toBe('negative');
 expect(old).toEqual(before);
});
it('writes the v2 course inside the existing lesson record and preserves all other lessons',()=>{
 let root={...structuredClone(initial),answers:{diary:'Trial draft','@vika/lesson/trial-homework/day':'Homework'}};
 root=updateLesson(root,toBeLesson,state=>({...state,answers:{'mistake:01':'Lesson 0'}})) as typeof root;
 root=updateLesson(root,presentSimpleLesson,state=>({...state,answers:{grammarNotes:'Old notes'}})) as typeof root;
 const next=updateLesson(root,presentSimpleLesson,state=>updateCourse(state,course=>({...course,responses:{'final-story':'New story'}})));
 expect(readCourse(readLesson(next,presentSimpleLesson)).responses['final-story']).toBe('New story');
 expect(readLesson(next,presentSimpleLesson).answers.grammarNotes).toBe('Old notes');
 expect(readLesson(next,toBeLesson).answers['mistake:01']).toBe('Lesson 0');
 expect(readLesson(next,trialLesson).answers.diary).toBe('Trial draft');
 expect(next.answers['@vika/lesson/trial-homework/day']).toBe('Homework');
});
it('fails closed on an unknown course schema without erasing it',()=>{
 const state={...initial,answers:{[courseKey]:{schemaVersion:99,original:'preserved'}}};
 expect(()=>readCourse(state)).toThrow('Сохранённые данные не изменены');
 expect(()=>updateCourse(state,course=>course)).toThrow();
 expect(state.answers[courseKey]).toEqual({schemaVersion:99,original:'preserved'});
});

it('all retired Places screens resume at Affirmative and preserve historical answers',()=>{
 for(const activePage of ['places/places-cards','places/places-match/place-match-bank','places/places-gaps/place-gap-01','places/town-museum/town-museum-01','places/hogwarts-town/town-01']){
  const old=updateCourse(initial,course=>({...course,activePage,seen:['places'],responses:{'place-match-bank':'банк','place-gap-01':'cinema','town-museum-01':'Hermione is at the museum.'}}));
  expect(pages[pageIndex(readCourse(old))].topicId).toBe('affirmative');
  const next=updateCourse(old,course=>({...course,activePage:pages[pageIndex(course)].id}));
  expect(readCourse(next).responses).toEqual(readCourse(old).responses);
  expect(lesson1Summary(old).percent).toBe(0);
 }
 expect(topics.some(topic=>topic.id==='places')).toBe(false);
 expect(pages.some(page=>page.topicId==='places')).toBe(false);
 expect(allTasks).toHaveLength(216);
});

it('Word Order positions also resume at Affirmative without dropping historical responses',()=>{
 const course={...freshCourse(),activePage:'word-order/order-practice/order-01',responses:{'order-01':'Old sentence','town-01':'Old place name'}};
 expect(pages[pageIndex(course)].topicId).toBe('affirmative');
 expect(allTasks.some(task=>task.id==='town-01' || task.id==='order-01' || task.id.startsWith('place-gap-') || task.id.startsWith('town-museum-'))).toBe(false);
 expect(course.responses['town-01']).toBe('Old place name');
});

it('moves journeys to frequency block seven and safely resolves every retired transport/translation position',()=>{
 expect(topics[7].id).toBe('frequency');
 expect(topics.find(t=>t.id==='transport')!.units.map(u=>u.id)).toEqual(['travel-rule','transport-match']);
 for(const activePage of ['transport/transport-gaps/transport-gap-01','transport/transport-write/transport-write-01'])expect(pages[pageIndex({...freshCourse(),activePage})].unit.id).toBe('journey-frequency');
 expect(pages[pageIndex({...freshCourse(),activePage:'transport/transport-cards'})].unit.id).toBe('travel-rule');
 expect(pages[pageIndex({...freshCourse(),activePage:'transport/transport-match/transport-match-bike'})].unit.id).toBe('transport-match');
 expect(pages[pageIndex({...freshCourse(),activePage:'affirmative/affirm-write/affirm-write-01'})].unit.id).toBe('affirm-write');
 expect(allTasks.filter(t=>t.id.startsWith('journey-frequency-'))).toHaveLength(10);
 expect(allTasks.some(t=>t.id.startsWith('affirm-write-')||t.id.startsWith('transport-gap-')||t.id.startsWith('transport-match-')||t.id.startsWith('transport-write-'))).toBe(false);
});

it('retires the final challenge and standalone dictionary without deleting saved work',()=>{
 for(const activePage of ['final/final-story/final-story','vocabulary/all-words']){
  const saved={...freshCourse(),activePage,responses:{'final-story':'My old story'}};
  expect(pages[pageIndex(saved)].topicId).toBe('to-be');
  expect(saved.responses['final-story']).toBe('My old story');
 }
 expect(topics.some(topic=>['final','vocabulary'].includes(topic.id))).toBe(false);
});

it('places all six translations at the end of block three with stable IDs',()=>{
 const last=pages.filter(page=>page.unit.id==='affirm-write');
 expect(pages.filter(page=>page.topicId==='affirmative').slice(-last.length)).toEqual(last);
 expect(topics[3].units.at(-1)?.id).toBe('affirm-write');
 expect(last[0].id).toBe('affirmative/affirm-write/affirm-translate-01');
 expect(last.every(page=>page.topicId==='affirmative')).toBe(true);
});
