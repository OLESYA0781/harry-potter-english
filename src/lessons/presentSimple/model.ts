import {responseComplete} from './jobActivities';
import type { LessonState } from '../../data';
import { allTasks, pages, topics as allTopics } from './course';
export const courseKey='present-simple:v2';
export type Course={schemaVersion:2;activePage:string;seen:string[];responses:Record<string,string>};
export const freshCourse=():Course=>({schemaVersion:2,activePage:pages[0].id,seen:[],responses:{}});
export function readCourse(state:LessonState):Course {
 const value=state.answers[courseKey];
 if(value===undefined)return freshCourse();
 const saved=value as Partial<Course>|null;
 if(!saved || saved.schemaVersion!==2 || typeof saved.activePage!=='string' || !Array.isArray(saved.seen) || saved.seen.some(id=>typeof id!=='string') || !saved.responses || typeof saved.responses!=='object' || Array.isArray(saved.responses) || Object.values(saved.responses).some(value=>typeof value!=='string'))throw new Error('Не удалось прочитать версию Lesson 1. Сохранённые данные не изменены. Обратитесь к преподавателю.');
 return saved as Course;
}
export function updateCourse(state:LessonState,action:(course:Course)=>Course):LessonState {
 return {...state,answers:{...state.answers,[courseKey]:action(readCourse(state))}};
}
export function pageIndex(course:Course){
 const exact=pages.findIndex(page=>page.id===course.activePage);
 if(exact>=0)return exact;
 const explanation=course.activePage.match(/^questions\/(qw-(?:what|where|when|who|how))\//);
 if(explanation)return pages.findIndex(page=>page.unit.id===explanation[1]);
 if(course.activePage.startsWith('frequency/jobs-frequency/'))return pages.findIndex(page=>page.topicId==='question-words');
 if(course.activePage==='jobs-lab'||course.activePage.startsWith('jobs-lab/'))return pages.findIndex(page=>page.topicId==='question-machine');
 if(/^(final|vocabulary)(\/|$)/.test(course.activePage))return pages.findIndex(page=>page.topicId==='to-be');
 // Every retired Places screen resumes at the next retained topic.
 if(course.activePage==='places' || course.activePage.startsWith('places/'))return pages.findIndex(page=>page.topicId==='affirmative');
 if(course.activePage.startsWith('transport/transport-gaps') || course.activePage.startsWith('transport/transport-write'))return pages.findIndex(page=>page.unit.id==='journey-frequency');
 if(course.activePage.startsWith('transport/transport-match/'))return pages.findIndex(page=>page.unit.id==='transport-match');
 if(course.activePage.startsWith('transport/transport-cards'))return pages.findIndex(page=>page.topicId==='transport');
 if(course.activePage.startsWith('short-answers/jobs-short/'))return pages.findIndex(page=>page.topicId==='to-be');
 if(course.activePage.startsWith('negative/jobs-negatives/'))return pages.findIndex(page=>page.topicId==='questions');
 if(course.activePage.startsWith('affirmative/jobs-affirmative/'))return pages.findIndex(page=>page.unit.id==='affirm-write');
 if(course.activePage.startsWith('affirmative/affirm-write/'))return pages.findIndex(page=>page.unit.id==='affirm-write');
 if(course.activePage.startsWith('word-order/'))return pages.findIndex(page=>page.topicId==='affirmative');
 return 0;
}
export function legacyResponses(state:LessonState):[string,string][] {
 return Object.entries(state.answers).filter(([key])=>key!==courseKey).flatMap(([key,value])=>{
  if(typeof value==='string' && value.trim())return [[key,value]];
  if(Array.isArray(value) && value.every(item=>typeof item==='string') && value.length)return [[key,value.join(', ')]];
  return [];
 });
}
export function lesson1Summary(state:LessonState){
 const moved=['question-words','question-machine','journeys'];
 const topics=allTopics.filter(t=>!moved.includes(t.id));
 const allTasks=topics.flatMap(t=>t.units.flatMap(u=>(u.tasks||[]).filter(t=>!t.optional)));
 const course=readCourse(state);
 const filled=(task:typeof allTasks[number])=>responseComplete(task,course.responses[task.id]);
 const answersDone=allTasks.filter(task=>filled(task)).length;
 const viewed=topics.filter(topic=>course.seen.includes(topic.id)).length;
 const completed=topics.filter(topic=>course.seen.includes(topic.id) && topic.units.every(unit=>(unit.tasks||[]).filter(task=>!task.optional).every(task=>filled(task)))).length;
 const total=allTasks.length+topics.length;
 return {percent:Math.min(completed===topics.length?100:99,Math.round((answersDone+viewed)/total*100)),status:completed===topics.length?'completed' as const:answersDone+viewed>0 || Object.keys(state.answers).length>0?'in-progress' as const:'not-started' as const,detail:`${completed} из ${topics.length} тем · ${answersDone} из ${allTasks.length} ответов`};
}
