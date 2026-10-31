import type { LessonState } from '../../data';
import { allTasks, pages, topics } from './course';
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
export const pageIndex=(course:Course)=>Math.max(0,pages.findIndex(page=>page.id===course.activePage));
export function legacyResponses(state:LessonState):[string,string][] {
 return Object.entries(state.answers).filter(([key])=>key!==courseKey).flatMap(([key,value])=>{
  if(typeof value==='string' && value.trim())return [[key,value]];
  if(Array.isArray(value) && value.every(item=>typeof item==='string') && value.length)return [[key,value.join(', ')]];
  return [];
 });
}
export function lesson1Summary(state:LessonState){
 const course=readCourse(state);
 const filled=(id:string)=>!!course.responses[id]?.trim();
 const answersDone=allTasks.filter(task=>filled(task.id)).length;
 const viewed=topics.filter(topic=>course.seen.includes(topic.id)).length;
 const completed=topics.filter(topic=>course.seen.includes(topic.id) && topic.units.every(unit=>(unit.tasks||[]).every(task=>filled(task.id)))).length;
 const total=allTasks.length+topics.length;
 return {percent:Math.round((answersDone+viewed)/total*100),status:completed===topics.length?'completed' as const:answersDone+viewed>0 || Object.keys(state.answers).length>0?'in-progress' as const:'not-started' as const,detail:`${completed} из ${topics.length} тем · ${answersDone} из ${allTasks.length} ответов`};
}
