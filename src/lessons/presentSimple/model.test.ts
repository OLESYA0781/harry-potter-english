import {expect,it} from 'vitest';
import {initial} from '../../data';
import {allTasks,pages,places,topics,transport} from './course';
import {courseKey,freshCourse,legacyResponses,lesson1Summary,pageIndex,readCourse,updateCourse} from './model';
import {presentSimpleLesson,lessons,toBeLesson,trialLesson} from '../registry';
import {readLesson,updateLesson} from '../progress';

it('has the requested topics after removing Word Order, exact book vocabulary, and unique stable response/page IDs',()=>{
 expect(topics.map(topic=>topic.id)).toEqual(['welcome','uses','places','affirmative','transport','negative','questions','short-answers','frequency','to-be','final','vocabulary']);
 expect(places.map(word=>word.en)).toEqual(['bank','café','cinema','hospital','hotel','museum','park','restaurant','stadium','theatre']);
 expect(transport.map(word=>word.en)).toEqual(['bike','boat','bus','car','motorbike','plane','taxi','train','tram','underground']);
 expect(new Set(allTasks.map(task=>task.id)).size).toBe(allTasks.length);
 expect(new Set(pages.map(page=>page.id)).size).toBe(pages.length);
 expect(pages.flatMap(page=>page.tasks.map(task=>task.id))).toEqual(allTasks.map(task=>task.id));
 expect(pages.every(page=>page.tasks.length<=4)).toBe(true);
 const counts=Object.fromEntries(topics.map(topic=>[topic.id,topic.units.flatMap(unit=>unit.tasks||[]).length]));
 expect(counts).toEqual({welcome:0,uses:8,places:23,affirmative:22,transport:23,negative:12,questions:14,'short-answers':8,frequency:13,'to-be':8,final:17,vocabulary:0});
 expect(topics.find(topic=>topic.id==='uses')!.units.map(unit=>unit.title)).not.toContain('Permanent situations');
 expect(allTasks.filter(task=>!task.options).length).toBeGreaterThan(100);
 expect(lessons.map(lesson=>lesson.id)).toEqual(['lesson-1','lesson-0','trial']);
});
it('requires every nonblank response and viewed topic but never judges grammar',()=>{
 expect(lesson1Summary(initial)).toMatchObject({percent:0,status:'not-started'});
 const state=updateCourse(initial,course=>({...course,seen:topics.map(topic=>topic.id),responses:Object.fromEntries(allTasks.map(task=>[task.id,'  my own wrong answer!\n ']))}));
 expect(lesson1Summary(state)).toMatchObject({percent:100,status:'completed'});
 const missing=updateCourse(state,course=>({...course,responses:{...course.responses,'final-story':' \n '}}));
 expect(lesson1Summary(missing).status).toBe('in-progress');
 expect(readCourse(state).responses['final-story']).toBe('  my own wrong answer!\n ');
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

it('retired Places pages resume at Where do we go and keep their historical matching answers',()=>{
 for(const activePage of ['places/places-cards','places/places-match/place-match-bank']){
  const old=updateCourse(initial,course=>({...course,activePage,responses:{'place-match-bank':'банк'}}));
  expect(pages[pageIndex(readCourse(old))].unit.title).toBe('Where do we go?');
  const next=updateCourse(old,course=>({...course,responses:{...course.responses,'place-gap-01':'cinema'}}));
  expect(readCourse(next).responses['place-match-bank']).toBe('банк');
  expect(readCourse(next).responses['place-gap-01']).toBe('cinema');
 }
 expect(topics.find(topic=>topic.id==='places')!.units.map(unit=>unit.title)).toEqual(['Where do we go?','Hogwarts Town — Museum','Hogwarts Town — Café','Hogwarts Town — Cinema','Hogwarts Town — Theatre','Hogwarts Town — Stadium']);
});

it('new illustrated town prompts use fresh IDs and removed Word Order positions resume at Affirmative',()=>{
 const course={...freshCourse(),activePage:'word-order/order-practice/order-01',responses:{'order-01':'Old sentence','town-01':'Old place name'}};
 expect(pages[pageIndex(course)].topicId).toBe('affirmative');
 expect(pages[pageIndex({...course,activePage:'places/hogwarts-town/town-01'})].unit.id).toBe('town-museum');
 expect(allTasks.some(task=>task.id==='town-01' || task.id==='order-01')).toBe(false);
 const towns=topics.find(topic=>topic.id==='places')!.units.filter(unit=>unit.townScene);
 expect(towns).toHaveLength(5);expect(towns.every(unit=>unit.tasks?.length===3)).toBe(true);
 expect(towns[0].teacherHints).toContain('Hermione likes the museum.');
 expect(towns[0].townScene?.opens).toBe('09:00');expect(course.responses['town-01']).toBe('Old place name');
});
